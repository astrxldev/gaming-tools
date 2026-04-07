import { Character, Team } from "@/models";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SimulatorState = {
  team: Team;
  members: Character[];
};

const initialState: SimulatorState = {
  team: new Team(),
  members: [],
};

export const useSimulatorStore = create<SimulatorState>()(immer(() => initialState));

// export const useShallowSimulatorStore = <T>(selector: (state: SimulatorState) => T) => {
//   return useSimulatorStore(useShallow(selector));
// };
