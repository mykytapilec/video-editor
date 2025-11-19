import { create } from "zustand";
import { ITimelineStore } from "@/types";

const useStore = create<ITimelineStore>((set) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  sceneMoveableRef: null,
  setSceneMoveableRef: (ref) => set({ sceneMoveableRef: ref }),

  fps: 30,
  duration: 0,
  size: { width: 1080, height: 1920 },
  background: { type: "color", value: "#000000" },

  groups: [],
  groupsLoaded: false,
  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  trackItemsMap: {},
  trackItemIds: [],
  activeIds: [],

  setState: (partial) =>
    set((prev) => {
      return {
        ...prev,
        ...(partial as Partial<ITimelineStore>),
      };
    }),
}));

export default useStore;
