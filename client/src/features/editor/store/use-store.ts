import { create } from "zustand";
import {
  ITimelineStore,
  ExtendedVideoDetails,
} from "@/types";

import {
  clamp,
  getNeighborBounds,
  MIN_GROUP_DURATION,
} from "../utils/groupConstraints";

const defaultVideoDetails: ExtendedVideoDetails = {
  volume: 100,
  opacity: 100,
  borderRadius: 0,
  borderWidth: 0,
  borderColor: "#000000",
  boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
};

export default create<ITimelineStore>((set, get) => ({
  /* ===== player ===== */
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

  /* ===== GROUP MANIPULATION (with constraints) ===== */

  /**
   * Drag whole group (move)
   */
  updateGroupDrag: (id: string, wantedStart: number) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const duration = group.end - group.start;

    const { minStart, maxEnd } = getNeighborBounds(
      groups,
      id,
      videoDuration
    );

    const start = clamp(
      wantedStart,
      minStart,
      maxEnd - duration
    );

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id
          ? {
              ...g,
              start,
              end: start + duration,
              dirty: true,
            }
          : g
      ),
    }));
  },

  /**
   * Resize left edge
   */
  updateGroupResizeLeft: (id: string, wantedStart: number) => {
    const { groups } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const { minStart } = getNeighborBounds(
      groups,
      id,
      get().videoDuration
    );

    const start = clamp(
      wantedStart,
      minStart,
      group.end - MIN_GROUP_DURATION
    );

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id
          ? {
              ...g,
              start,
              dirty: true,
            }
          : g
      ),
    }));
  },

  /**
   * Resize right edge
   */
  updateGroupResizeRight: (id: string, wantedEnd: number) => {
    const { groups } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const { maxEnd } = getNeighborBounds(
      groups,
      id,
      get().videoDuration
    );

    const end = clamp(
      wantedEnd,
      group.start + MIN_GROUP_DURATION,
      maxEnd
    );

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id
          ? {
              ...g,
              end,
              dirty: true,
            }
          : g
      ),
    }));
  },

  /* ===== playback ===== */
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  videoDuration: 0,
  setVideoDuration: (d) => set({ videoDuration: d }),

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  setState: (partial) => set(partial),
}));
