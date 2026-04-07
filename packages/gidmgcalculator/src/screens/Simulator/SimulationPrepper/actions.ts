import {
  createArtifact,
  createCharacterBasic,
  createWeapon,
  createWeaponBasic,
} from "@/logic/entity.logic";
import type { RawCharacter, RawWeapon } from "@/types";
import type { UserdbState } from "@Store/userdbSlice";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { Artifact, ArtifactGear, Character, Team, Weapon } from "@/models";
import { useSimulatorStore } from "../store";

export type TavernSelectedCharacter = {
  userData?: {
    weaponID?: number;
    artifactIDs?: number[];
  };
  data: any;
};

/** Same logic as initSessionWithCharacter */
export function switchMember(
  index: number,
  tavernCharacter: TavernSelectedCharacter,
  userDb: UserdbState
) {
  const { userData, data } = tavernCharacter;
  const { weaponID, artifactIDs } = userData ?? {};
  const { userWps, userArts } = userDb;

  const weaponBasic = weaponID
    ? parseDbWeapon(weaponID, userWps, data.weaponType)
    : createWeaponBasic({ type: data.weaponType });

  const atfGear = parseDbArtifacts(artifactIDs, userArts);
  const weapon = createWeapon(weaponBasic);

  const team = new Team();

  const member = new Character(data.code, data, weapon, {
    state: createCharacterBasic({ ...userData, code: data.code }),
    atfGear,
    team,
  });

  useSimulatorStore.setState((state) => {
    state.members[index] = member;
    (team as any).updateMembers(state.members);
    state.team = team;
  });
}

export function removeMember(name: string) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.filter((member) => member.data.name !== name);
  });
}

export function updateMember<T extends keyof RawCharacter>(
  code: number,
  key: T,
  value: RawCharacter[T]
) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.map((member: any) => {
      if (member.code === code) {
        member.state.update({ [key]: value });
        return member.clone();
      }
      return member;
    });

    if (key === "enhanced") {
      state.team = new Team(state.members as any);
    }
  });
}

export function switchWeapon(name: string, weapon: Weapon) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.map((member: any) => {
      return member.data.name === name ? member.equip(weapon).clone() : member;
    });
  });
}

export function switchArtifact(name: string, artifact: Artifact) {
  const newMembers = useSimulatorStore.getState().members.map((member: any) => {
    if (member.data.name === name) {
      const newPieces = member.atfGear.pieces.clone().set(artifact.type, artifact);
      return member.clone().equip(new ArtifactGear(newPieces));
    }

    return member;
  });

  useSimulatorStore.setState((state) => {
    state.members = newMembers;
  });
}
