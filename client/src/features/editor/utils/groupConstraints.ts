import { TimelineGroup } from "@/types";

export const MIN_GROUP_DURATION = 0.2;

export function clamp(
  value: number,
  min: number,
  max: number
) {
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
