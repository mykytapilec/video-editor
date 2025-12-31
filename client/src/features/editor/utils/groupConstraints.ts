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
    prev,
    next,
    minStart: prev ? prev.end : 0,
    maxEnd: next ? next.start : timelineDuration,
  };
}

/* ===== DRAG ===== */
export function constrainGroupDrag(
  groups: TimelineGroup[],
  group: TimelineGroup,
  wantedStart: number,
  timelineDuration: number
) {
  const { prev, next } = getNeighborBounds(
    groups,
    group.id,
    timelineDuration
  );

  const duration = group.end - group.start;

  const minStart = prev ? prev.end : 0;
  const maxStart = next
    ? next.start - duration
    : timelineDuration - duration;

  return clamp(wantedStart, minStart, maxStart);
}

/* ===== RESIZE LEFT ===== */
export function constrainResizeLeft(
  groups: TimelineGroup[],
  group: TimelineGroup,
  wantedStart: number,
  timelineDuration: number
) {
  const { prev } = getNeighborBounds(
    groups,
    group.id,
    timelineDuration
  );

  const minStart = prev ? prev.end : 0;
  const maxStart = group.end - MIN_GROUP_DURATION;

  return clamp(wantedStart, minStart, maxStart);
}

/* ===== RESIZE RIGHT ===== */
export function constrainResizeRight(
  groups: TimelineGroup[],
  group: TimelineGroup,
  wantedEnd: number,
  timelineDuration: number
) {
  const { next } = getNeighborBounds(
    groups,
    group.id,
    timelineDuration
  );

  const minEnd = group.start + MIN_GROUP_DURATION;
  const maxEnd = next ? next.start : timelineDuration;

  return clamp(wantedEnd, minEnd, maxEnd);
}
