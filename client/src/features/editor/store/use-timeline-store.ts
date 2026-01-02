import { create } from "zustand";
import { TimelineGroup } from "@/types";
import React from "react";

export interface ITimelineStore {
  playerRef: React.RefObject<HTMLVideoElement | null> | null;
  setPlayerRef: (
    ref: React.RefObject<HTMLVideoElement | null> | null
  ) => void;

  fps: number;

  groups: TimelineGroup[];
  originalGroups: TimelineGroup[];

  setGroups: (groups: TimelineGroup[]) => void;
  markGroupsAsOriginal: () => void;

  updateGroup: (id: string, patch: Partial<TimelineGroup>) => void;

  isGroupDirty: (id: string) => boolean;
  getGroupPatch: (id: string) => Partial<TimelineGroup> | null;

  selectedGroupId: string | null;
  selectGroup: (id: string | null) => void;

  currentTime: number;
  setCurrentTime: (t: number) => void;

  videoDuration: number;
  setVideoDuration: (d: number) => void;

  zoom: number;
  setZoom: (z: number) => void;

  updateGroupDrag: (id: string, wantedStart: number) => void;
  updateGroupResizeLeft: (id: string, wantedStart: number) => void;
  updateGroupResizeRight: (id: string, wantedEnd: number) => void;

  seekToGroup: (groupId: string) => void;
  playGroup: (groupId: string) => void;
}

const useTimelineStore = create<ITimelineStore>((set, get) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  fps: 30,

  groups: [],
  originalGroups: [],

  setGroups: (groups) =>
    set({
      groups,
      originalGroups: structuredClone(groups),
    }),

  markGroupsAsOriginal: () =>
    set((state) => ({
      originalGroups: structuredClone(state.groups),
    })),

  updateGroup: (id, patch) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...patch } : g
      ),
    })),

  isGroupDirty: (id) => {
    const { groups, originalGroups } = get();
    const g = groups.find((x) => x.id === id);
    const o = originalGroups.find((x) => x.id === id);
    if (!g || !o) return false;

    return (
      g.start !== o.start ||
      g.end !== o.end ||
      g.text !== o.text
    );
  },

  getGroupPatch: (id) => {
    const { groups, originalGroups } = get();
    const g = groups.find((x) => x.id === id);
    const o = originalGroups.find((x) => x.id === id);
    if (!g || !o) return null;

    const patch: Partial<TimelineGroup> = {};
    if (g.start !== o.start) patch.start = g.start;
    if (g.end !== o.end) patch.end = g.end;
    if (g.text !== o.text) patch.text = g.text;

    return Object.keys(patch).length ? patch : null;
  },

  selectedGroupId: null,
  selectGroup: (id) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => g.id === id);

    if (group && playerRef?.current) {
      playerRef.current.currentTime = group.start;
    }

    set({ selectedGroupId: id });
  },

  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  videoDuration: 0,
  setVideoDuration: (d) => set({ videoDuration: d }),

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  updateGroupDrag: (id, wantedStart) =>
    set((state) => {
      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) return {};

      const group = groups[index];
      const duration = group.end - group.start;

      const prev = groups[index - 1];
      const next = groups[index + 1];

      let start = wantedStart;

      if (prev) start = Math.max(start, prev.end);
      else start = Math.max(start, 0);

      if (next) start = Math.min(start, next.start - duration);
      else start = Math.min(start, state.videoDuration - duration);

      return {
        groups: state.groups.map((g) =>
          g.id === id ? { ...g, start, end: start + duration } : g
        ),
      };
    }),

  updateGroupResizeLeft: (id, wantedStart) =>
    set((state) => {
      const MIN = 0.2;

      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) return {};

      const group = groups[index];
      const prev = groups[index - 1];

      let start = wantedStart;

      if (prev) start = Math.max(start, prev.end);
      else start = Math.max(start, 0);

      start = Math.min(start, group.end - MIN);

      return {
        groups: state.groups.map((g) =>
          g.id === id ? { ...g, start } : g
        ),
      };
    }),

  updateGroupResizeRight: (id, wantedEnd) =>
    set((state) => {
      const MIN = 0.2;

      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) return {};

      const group = groups[index];
      const next = groups[index + 1];

      let end = wantedEnd;

      if (next) end = Math.min(end, next.start);
      else end = Math.min(end, state.videoDuration);

      end = Math.max(end, group.start + MIN);

      return {
        groups: state.groups.map((g) =>
          g.id === id ? { ...g, end } : g
        ),
      };
    }),

  seekToGroup: (groupId) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => g.id === groupId);
    if (!group || !playerRef?.current) return;

    playerRef.current.currentTime = group.start;
  },

  playGroup: (groupId) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => g.id === groupId);
    if (!group || !playerRef?.current) return;

    playerRef.current.currentTime = group.start;
    playerRef.current.play();
  },
}));

export default useTimelineStore;
