import { Object_ } from "ron-utils";

import { useShallowCalcStore } from "@Store/calculator";
import { copyArtifacts } from "@Store/calculator/actions";

import { CopySection } from "@/screens/Calculator/components/CopySection";

type Option = {
  value: number;
  label: string;
};

export function CopySelect() {
  const { setupManagers, setupsById } = useShallowCalcStore((state: any) =>
    Object_.extract(state, ["setupManagers", "setupsById"])
  );

  const copyOptions = setupManagers.reduce((results: Option[], manager: any) => {
    const { pieces } = setupsById[manager.ID].main.atfGear;

    if (Array.from(pieces).length) {
      results.push({
        label: manager.name,
        value: manager.ID,
      });
    }

    return results;
  }, []);

  return (
    copyOptions.length !== 0 && (
      <CopySection
        className="mb-4 px-4"
        options={copyOptions}
        onClickCopy={({ value }: Option) => copyArtifacts(value)}
      />
    )
  );
}
