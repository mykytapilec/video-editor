import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  VideoTrackItem,
  ITimelineStore,
  ExtendedVideoDetails,
} from "@/types";

const defaultVideoDetails: ExtendedVideoDetails = {
  volume: 100,
  opacity: 100,
  borderRadius: 0,
  borderWidth: 0,
  borderColor: "#000000",
  boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
};

export default create<ITimelineStore>((set) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  fps: 30,

  /* ===== GROUPS ===== */
  groups: [],

  setGroups: (groups) => set({ groups }),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  updateGroup: (id, patch) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id
          ? {
              ...g,
              ...patch,
              dirty: true,
            }
          : g
      ),
    })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  /* ===== playback ===== */
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  videoDuration: 0,
  setVideoDuration: (d) => set({ videoDuration: d }),

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  setState: (partial) => set(partial),
}));
