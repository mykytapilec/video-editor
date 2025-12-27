"use client";

import { TimelineGroup } from "@/types";

interface Props {
  group: TimelineGroup;
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineGroupBlock({
  group,
  pixelsPerSecond,
  height,
}: Props) {
  const left = group.start * pixelsPerSecond;
  const width = Math.max(2, (group.end - group.start) * pixelsPerSecond);

  return (
    <div
      className="absolute top-1 rounded-md bg-purple-500/80 border border-purple-400 text-white text-xs px-2 py-1 overflow-hidden"
      style={{
        left,
        width,
        height: height - 6,
      }}
    >
      <div className="truncate font-medium">
        {group.name ?? "Group"}
      </div>
    </div>
  );
}
