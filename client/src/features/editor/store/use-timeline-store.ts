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
  setGroups: (groups: TimelineGroup[]) => void;
  updateGroup: (id: string, patch: Partial<TimelineGroup>) => void;

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
  setGroups: (groups) => set({ groups }),

  updateGroup: (id, patch) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...patch } : g
      ),
    })),

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
      const MIN_DURATION = 0.2;

      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) return {};

      const group = groups[index];
      const prev = groups[index - 1];

      let start = wantedStart;

      if (prev) start = Math.max(start, prev.end);
      else start = Math.max(start, 0);

      start = Math.min(start, group.end - MIN_DURATION);

      return {
        groups: state.groups.map((g) =>
          g.id === id ? { ...g, start } : g
        ),
      };
    }),

  updateGroupResizeRight: (id, wantedEnd) =>
    set((state) => {
      const MIN_DURATION = 0.2;

      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) return {};

      const group = groups[index];
      const next = groups[index + 1];

      let end = wantedEnd;

      if (next) end = Math.min(end, next.start);
      else end = Math.min(end, state.videoDuration);

      end = Math.max(end, group.start + MIN_DURATION);

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
