import { create } from "zustand";
import { TimelineGroup } from "@/types";
import {
  constrainGroupDrag,
  constrainResizeLeft,
  constrainResizeRight,
} from "../utils/groupConstraints";

export interface ITimelineStore {
  playerRef: React.RefObject<any> | null;
  setPlayerRef: (ref: React.RefObject<any> | null) => void;

  fps: number;

  groups: TimelineGroup[];
  setGroups: (groups: TimelineGroup[]) => void;
  addGroup: (group: TimelineGroup) => void;
  updateGroup: (id: string, patch: Partial<TimelineGroup>) => void;
  removeGroup: (id: string) => void;
  playGroup: (groupId: string) => void;

  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;

  currentTime: number;
  setCurrentTime: (t: number) => void;

  videoDuration: number;
  setVideoDuration: (d: number) => void;

  zoom: number;
  setZoom: (z: number) => void;

  updateGroupDrag: (id: string, wantedStart: number) => void;
  updateGroupResizeLeft: (id: string, wantedStart: number) => void;
  updateGroupResizeRight: (id: string, wantedEnd: number) => void;

  setState: (partial: Partial<ITimelineStore>) => void;
}

const useTimelineStore = create<ITimelineStore>((set, get) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  fps: 30,

  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) =>
    set((s) => ({ groups: [...s.groups, group] })),
  updateGroup: (id, patch) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, ...patch } : g
      ),
    })),
  removeGroup: (id) =>
    set((s) => ({
      groups: s.groups.filter((g) => g.id !== id),
    })),

  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  videoDuration: 0,
  setVideoDuration: (d) => set({ videoDuration: d }),

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  /* ===== DRAG ===== */
  updateGroupDrag: (id, wantedStart) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const start = constrainGroupDrag(
      groups,
      group,
      wantedStart,
      videoDuration
    );

    set({
      groups: groups.map((g) =>
        g.id === id
          ? { ...g, start, end: start + (group.end - group.start) }
          : g
      ),
    });
  },

  /* ===== RESIZE LEFT ===== */
  updateGroupResizeLeft: (id, wantedStart) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const start = constrainResizeLeft(
      groups,
      group,
      wantedStart,
      videoDuration
    );

    set({
      groups: groups.map((g) =>
        g.id === id ? { ...g, start } : g
      ),
    });
  },

  /* ===== RESIZE RIGHT ===== */
  updateGroupResizeRight: (id, wantedEnd) => {
    const { groups, videoDuration } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    const end = constrainResizeRight(
      groups,
      group,
      wantedEnd,
      videoDuration
    );

    set({
      groups: groups.map((g) =>
        g.id === id ? { ...g, end } : g
      ),
    });
  },

  playGroup: (groupId: string) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => g.id === groupId);

    if (!group) return;
    if (!playerRef?.current) return;

    try {
      playerRef.current.currentTime = group.start;
      playerRef.current.play();
    } catch (e) {
      console.warn("playGroup failed", e);
    }
  },

  setState: (partial) => set(partial),
}));

export default useTimelineStore;
