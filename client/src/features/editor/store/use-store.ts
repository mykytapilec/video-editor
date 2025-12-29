import { create } from "zustand";
import { ITimelineStore, TimelineGroup } from "@/types";
import {
  constrainGroupDrag,
  constrainGroupResizeLeft,
  constrainGroupResizeRight,
} from "../utils/groupConstraints";

export default create<ITimelineStore>((set, get) => ({
  /* ===== PLAYER ===== */
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  fps: 30,

  /* ===== GROUPS ===== */
  groups: [],
  selectedGroupId: null,

  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  setGroups: (groups) => set({ groups }),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  updateGroup: (id, patch) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...patch, dirty: true } : g
      ),
    })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  /* ===== GROUP MANIPULATION (WITH CONSTRAINTS) ===== */
  updateGroupDrag: (id, wantedStart) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const newStart = constrainGroupDrag(
      groups,
      id,
      wantedStart,
      videoDuration
    );

    if (typeof newStart !== "number") return;

    set({
      groups: groups.map((g) =>
        g.id === id
          ? {
              ...g,
              start: newStart,
              end: newStart + (group.end - group.start),
              dirty: true,
            }
          : g
      ),
    });
  },

  updateGroupResizeLeft: (id, wantedStart) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const newStart = constrainGroupResizeLeft(
      groups,
      id,
      wantedStart,
      videoDuration
    );

    if (typeof newStart !== "number") return;

    set({
      groups: groups.map((g) =>
        g.id === id
          ? {
              ...g,
              start: newStart,
              dirty: true,
            }
          : g
      ),
    });
  },

  updateGroupResizeRight: (id, wantedEnd) => {
    const { groups, videoDuration } = get();

    const newEnd = constrainGroupResizeRight(
      groups,
      id,
      wantedEnd,
      videoDuration
    );

    if (typeof newEnd !== "number") return;

    set({
      groups: groups.map((g) =>
        g.id === id
          ? {
              ...g,
              end: newEnd,
              dirty: true,
            }
          : g
      ),
    });
  },


  /* ===== PLAYBACK ===== */
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  videoDuration: 0,
  setVideoDuration: (d) => set({ videoDuration: d }),

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  /* ===== PLAY GROUP ===== */
  playGroup: (groupId: string) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => g.id === groupId);

    if (!group) return;
    if (!playerRef || !playerRef.current) return;

    const video = playerRef.current;
    video.currentTime = group.start;
    video.play();
  },

  setState: (partial) => set(partial),
}));
