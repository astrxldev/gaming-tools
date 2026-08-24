#!/usr/bin/env bash

set -euo pipefail

origin_remote="origin"
upstream_remote="upstream"

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Error: run this script inside a Git repository." >&2
  exit 1
}

cd "$repo_root"

if [[ -n $(git status --porcelain) ]]; then
  echo "Error: the worktree is not clean. Commit or stash your changes before syncing." >&2
  exit 1
fi

if ! git remote get-url "$origin_remote" >/dev/null 2>&1; then
  echo "Error: remote '$origin_remote' is not configured." >&2
  exit 1
fi

if ! git remote get-url "$upstream_remote" >/dev/null 2>&1; then
  echo "Error: remote '$upstream_remote' is not configured." >&2
  exit 1
fi

echo "Fetching $origin_remote and $upstream_remote..."
git fetch --prune "$origin_remote"
git fetch --prune "$upstream_remote"

current_branch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
branch=${1:-$current_branch}

if [[ -z "$branch" ]]; then
  echo "Error: provide a branch name when running from detached HEAD." >&2
  echo "Usage: bun sync <branch-name>" >&2
  exit 1
fi

if ! git show-ref --verify --quiet "refs/remotes/$upstream_remote/$branch"; then
  echo "Error: branch '$branch' does not exist on remote '$upstream_remote'." >&2
  exit 1
fi

if [[ "$current_branch" != "$branch" ]]; then
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git switch "$branch"
  elif git show-ref --verify --quiet "refs/remotes/$origin_remote/$branch"; then
    git switch --track -c "$branch" "$origin_remote/$branch"
  else
    git switch -c "$branch" "$upstream_remote/$branch"
    echo "Created '$branch' from $upstream_remote/$branch."
    echo "This new branch does not include custom commits from '$current_branch'."
  fi
fi

safe_branch=${branch//\//-}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_branch="backup/${safe_branch}-before-upstream-${timestamp}"

git branch "$backup_branch"
echo "Created recovery branch: $backup_branch"

merge_remote_branch() {
  local remote=$1
  local remote_branch="$remote/$branch"

  echo "Merging $remote_branch into $branch..."
  if ! git merge --no-edit "$remote_branch"; then
    echo >&2
    echo "Merge conflict while merging $remote_branch." >&2
    echo "Resolve the conflicts and commit, or run 'git merge --abort'." >&2
    echo "Recovery branch: $backup_branch" >&2
    exit 1
  fi
}

if git show-ref --verify --quiet "refs/remotes/$origin_remote/$branch"; then
  merge_remote_branch "$origin_remote"
else
  echo "Skipping $origin_remote/$branch because it does not exist yet."
fi
merge_remote_branch "$upstream_remote"

echo
echo "Sync complete. Review the result, run the project checks, then push with:"
if git show-ref --verify --quiet "refs/remotes/$origin_remote/$branch"; then
  echo "  git push $origin_remote $branch"
else
  echo "  git push --set-upstream $origin_remote $branch"
fi
echo
echo "Recovery branch: $backup_branch"
