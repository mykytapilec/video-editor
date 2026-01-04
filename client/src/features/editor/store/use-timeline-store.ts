import { create } from "zustand";
import { TimelineGroup } from "@/types";
import React from "react";

export interface DraftGroup {
  start?: number;
  end?: number;
  text?: string;
}

export interface ITimelineStore {
  playerRef: React.RefObject<HTMLVideoElement | null> | null;
  setPlayerRef: (ref: React.RefObject<HTMLVideoElement | null> | null) => void;

  fps: number;

  groups: TimelineGroup[];
  originalGroups: TimelineGroup[];

  setGroups: (groups: TimelineGroup[]) => void;
  markGroupsAsOriginal: () => void;

  updateGroup: (id: number, patch: Partial<TimelineGroup>) => void;
  revertGroup: (id: number) => void;
  isGroupDirty: (id: number) => boolean;
  getGroupPatch: (id: number) => Partial<TimelineGroup> | null;

  selectedGroupId: number | null;
  selectGroup: (id: number | null) => void;

  currentTime: number;
  setCurrentTime: (t: number) => void;

  videoDuration: number;
  setVideoDuration: (d: number) => void;

  zoom: number;
  setZoom: (z: number) => void;

  updateGroupDrag: (id: number, wantedStart: number) => void;
  updateGroupResizeLeft: (id: number, wantedStart: number) => void;
  updateGroupResizeRight: (id: number, wantedEnd: number) => void;

  seekToGroup: (groupId: number) => void;
  playGroup: (groupId: number) => void;

  draftGroup: DraftGroup | null;
  setDraftGroup: (dg: DraftGroup | null) => void;
  commitDraftGroup: () => void;
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
        Number(g.id) === id ? { ...g, ...patch } : g
      ),
    })),

  revertGroup: (id) =>
    set((state) => {
      const original = state.originalGroups.find(
        (g) => Number(g.id) === id
      );
      if (!original) return {};

      return {
        groups: state.groups.map((g) =>
          Number(g.id) === id ? structuredClone(original) : g
        ),
      };
    }),

  isGroupDirty: (id) => {
    const { groups, originalGroups } = get();
    const g = groups.find((g) => Number(g.id) === id);
    const o = originalGroups.find((g) => Number(g.id) === id);
    if (!g || !o) return false;
    return JSON.stringify(g) !== JSON.stringify(o);
  },

  getGroupPatch: (id) => {
    const { groups, originalGroups } = get();
    const g = groups.find((g) => Number(g.id) === id);
    const o = originalGroups.find((g) => Number(g.id) === id);
    if (!g || !o) return null;

    const patch: Partial<TimelineGroup> = {};
    (["start", "end", "text"] as const).forEach((key) => {
      if (g[key] !== o[key]) {
        (patch as any)[key] = g[key];
      }
    });

    return Object.keys(patch).length ? patch : null;
  },

  selectedGroupId: null,
  selectGroup: (id) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => Number(g.id) === id);

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
      const index = groups.findIndex((g) => Number(g.id) === id);
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
          Number(g.id) === id
            ? { ...g, start, end: start + duration }
            : g
        ),
      };
    }),

  updateGroupResizeLeft: (id, wantedStart) =>
    set((state) => {
      const MIN_DURATION = 0.2;
      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => Number(g.id) === id);
      if (index === -1) return {};

      const group = groups[index];
      const prev = groups[index - 1];

      let start = wantedStart;
      if (prev) start = Math.max(start, prev.end);
      else start = Math.max(start, 0);

      start = Math.min(start, group.end - MIN_DURATION);

      return {
        groups: state.groups.map((g) =>
          Number(g.id) === id ? { ...g, start } : g
        ),
      };
    }),

  updateGroupResizeRight: (id, wantedEnd) =>
    set((state) => {
      const MIN_DURATION = 0.2;
      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => Number(g.id) === id);
      if (index === -1) return {};

      const group = groups[index];
      const next = groups[index + 1];

      let end = wantedEnd;
      if (next) end = Math.min(end, next.start);
      else end = Math.min(end, state.videoDuration);

      end = Math.max(end, group.start + MIN_DURATION);

      return {
        groups: state.groups.map((g) =>
          Number(g.id) === id ? { ...g, end } : g
        ),
      };
    }),

  seekToGroup: (groupId) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => Number(g.id) === groupId);
    if (!group || !playerRef?.current) return;
    playerRef.current.currentTime = group.start;
  },

  playGroup: (groupId) => {
    const { groups, playerRef } = get();
    const group = groups.find((g) => Number(g.id) === groupId);
    if (!group || !playerRef?.current) return;
    playerRef.current.currentTime = group.start;
    playerRef.current.play();
  },

  draftGroup: null,
  setDraftGroup: (dg) => set({ draftGroup: dg }),

  commitDraftGroup: () =>
    set((state) => {
      if (!state.draftGroup) return {};

      const lastId =
        state.groups.length > 0
          ? Math.max(...state.groups.map((g) => Number(g.id)))
          : 0;

      const nextId = lastId + 1;

      const newGroup: TimelineGroup = {
        id: String(nextId),
        start: state.draftGroup.start ?? 0,
        end: state.draftGroup.end ?? 1,
        text: state.draftGroup.text ?? "",
        sourceId: 0,
        name: state.draftGroup.text ?? `Group ${nextId}`,
      };

      return {
        groups: [...state.groups, newGroup],
        draftGroup: null,
      };
    }),
}));

export default useTimelineStore;
