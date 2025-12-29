import { TimelineGroup } from "@/types";

export const MIN_GROUP_DURATION = 0.2;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getNeighborBounds(
  groups: TimelineGroup[],
  groupId: string,
  timelineDuration: number
) {
  const sorted = [...groups].sort((a, b) => a.start - b.start);
  const index = sorted.findIndex((g) => g.id === groupId);

  const prev = index > 0 ? sorted[index - 1] : null;
  const next = index < sorted.length - 1 ? sorted[index + 1] : null;

  return {
    minStart: prev ? prev.end : 0,
    maxEnd: next ? next.start : timelineDuration,
  };
}

export function constrainGroupDrag(
  groups: TimelineGroup[],
  groupId: string,
  wantedStart: number,
  timelineDuration: number
) {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return 0;

  const { minStart, maxEnd } = getNeighborBounds(groups, groupId, timelineDuration);
  const clamped = clamp(wantedStart, minStart, maxEnd - MIN_GROUP_DURATION);
  return clamped;
}

export function constrainGroupResizeLeft(
  groups: TimelineGroup[],
  groupId: string,
  wantedStart: number,
  timelineDuration: number
) {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return 0;

  const { minStart } = getNeighborBounds(groups, groupId, timelineDuration);
  const maxStart = group.end - MIN_GROUP_DURATION;

  return clamp(wantedStart, minStart, maxStart);
}

export function constrainGroupResizeRight(
  groups: TimelineGroup[],
  groupId: string,
  wantedEnd: number,
  timelineDuration: number
) {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return timelineDuration;

  const { maxEnd } = getNeighborBounds(groups, groupId, timelineDuration);
  const minEnd = group.start + MIN_GROUP_DURATION;

  return clamp(wantedEnd, minEnd, maxEnd);
}
