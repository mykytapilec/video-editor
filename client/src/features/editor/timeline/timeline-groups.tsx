"use client";

import React from "react";
import { TimelineGroup } from "@/types";
import { TimelineGroupBlock } from "./timeline-group-block";
import useTimelineStore from "../store/use-timeline-store";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineGroups({
  pixelsPerSecond,
  height,
}: Props) {
  const groups = useTimelineStore((s) => s.groups);
  const videoDuration = useTimelineStore((s) => s.videoDuration);
  const selectGroup = useTimelineStore((s) => s.selectGroup);

  if (!groups.length || !videoDuration) return null;

  const visibleGroups = groups.filter(
    (g) => g.end <= videoDuration
  );

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {visibleGroups.map((group: TimelineGroup) => (
        <div
          key={group.id}
          className="relative pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            selectGroup(group.id);
          }}
        >
          <TimelineGroupBlock
            group={group}
            pixelsPerSecond={pixelsPerSecond}
            height={height}
          />
        </div>
      ))}
    </div>
  );
}
