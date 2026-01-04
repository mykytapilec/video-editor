import { create } from "zustand";
import { TimelineGroup } from "@/types";
import React from "react";

export type CreateMode = "idle" | "selectingStart" | "selectingEnd";

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

  /* CREATE GROUP */
  draftGroup: DraftGroup | null;
  createMode: CreateMode;
  createError: string | null;
  tempStart: number | null;
  tempEnd: number | null;

  setDraftGroup: (dg: DraftGroup | null) => void;
  setCreateMode: (m: CreateMode) => void;
  setCreateError: (e: string | null) => void;

  selectDraftStart: (time: number) => void;
  selectDraftEnd: (time: number) => void;

  commitDraftGroup: () => void;
}

const overlaps = (time: number, groups: TimelineGroup[]) =>
  groups.some((g) => time > g.start && time < g.end);

const hasGroupBetween = (
  start: number,
  end: number,
  groups: TimelineGroup[]
) =>
  groups.some((g) => g.start >= start && g.end <= end);

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

    const patch = {} as Partial<TimelineGroup>;

    if (g.start !== o.start) patch.start = g.start;
    if (g.end !== o.end) patch.end = g.end;
    if (g.text !== o.text) patch.text = g.text;

    return Object.keys(patch).length ? patch : null;
  },

  selectedGroupId: null,
  selectGroup: (id) => {
    const { groups, playerRef, createMode } = get();

    if (createMode !== "idle") {
      set({
        createError:
          "You cannot select an existing group while creating a new one.",
      });
      return;
    }

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
      const MIN = 0.2;
      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => Number(g.id) === id);
      if (index === -1) return {};

      const prev = groups[index - 1];
      const group = groups[index];

      let start = wantedStart;
      if (prev) start = Math.max(start, prev.end);
      else start = Math.max(start, 0);

      start = Math.min(start, group.end - MIN);

      return {
        groups: state.groups.map((g) =>
          Number(g.id) === id ? { ...g, start } : g
        ),
      };
    }),

  updateGroupResizeRight: (id, wantedEnd) =>
    set((state) => {
      const MIN = 0.2;
      const groups = [...state.groups].sort((a, b) => a.start - b.start);
      const index = groups.findIndex((g) => Number(g.id) === id);
      if (index === -1) return {};

      const group = groups[index];
      const next = groups[index + 1];

      let end = wantedEnd;
      if (next) end = Math.min(end, next.start);
      else end = Math.min(end, state.videoDuration);

      end = Math.max(end, group.start + MIN);

      return {
        groups: state.groups.map((g) =>
          Number(g.id) === id ? { ...g, end } : g
        ),
      };
    }),

  seekToGroup: (id) => {
    const { groups, playerRef } = get();
    const g = groups.find((g) => Number(g.id) === id);
    if (g && playerRef?.current) playerRef.current.currentTime = g.start;
  },

  playGroup: (id) => {
    const { groups, playerRef } = get();
    const g = groups.find((g) => Number(g.id) === id);
    if (!g || !playerRef?.current) return;
    playerRef.current.currentTime = g.start;
    playerRef.current.play();
  },

  /* ---------- CREATE GROUP ---------- */

  draftGroup: null,
  createMode: "idle",
  createError: null,
  tempStart: null,
  tempEnd: null,

  setDraftGroup: (dg) =>
    set({
      draftGroup: dg,
      createError: null,
      tempStart: null,
      tempEnd: null,
      createMode: "idle",
    }),

  setCreateMode: (m) => set({ createMode: m }),
  setCreateError: (e) => set({ createError: e }),

  selectDraftStart: (time) => {
    const { groups, draftGroup } = get();
    if (!draftGroup) return;

    if (overlaps(time, groups)) {
      set({
        createError:
          "Start point overlaps an existing group. Choose another point.",
      });
      return;
    }

    set({
      draftGroup: { ...draftGroup, start: time },
      tempStart: time,
      createMode: "selectingEnd",
      createError: null,
    });
  },

  selectDraftEnd: (time) => {
    const { draftGroup, groups } = get();
    if (!draftGroup?.start) return;

    if (time <= draftGroup.start) {
      set({
        createError: "End point must be after the start point.",
      });
      return;
    }

    if (overlaps(time, groups)) {
      set({
        createError:
          "End point overlaps an existing group. Choose another point.",
      });
      return;
    }

    if (hasGroupBetween(draftGroup.start, time, groups)) {
      set({
        createError:
          "Another group exists between start and end points.",
      });
      return;
    }

    set({
      draftGroup: { ...draftGroup, end: time },
      tempEnd: time,
      createMode: "idle",
      createError: null,
    });
  },

  commitDraftGroup: () =>
    set((state) => {
      if (
        !state.draftGroup?.text ||
        state.draftGroup.start == null ||
        state.draftGroup.end == null
      )
        return {};

      const lastId =
        state.groups.length > 0
          ? Math.max(...state.groups.map((g) => Number(g.id)))
          : 0;

      const id = lastId + 1;

      const newGroup: TimelineGroup = {
        id: String(id),
        start: state.draftGroup.start,
        end: state.draftGroup.end,
        text: state.draftGroup.text,
        sourceId: id,
        name: state.draftGroup.text,
      };

      return {
        groups: [...state.groups, newGroup],
        draftGroup: null,
        createMode: "idle",
        tempStart: null,
        tempEnd: null,
        createError: null,
      };
    }),
}));

export default useTimelineStore;
