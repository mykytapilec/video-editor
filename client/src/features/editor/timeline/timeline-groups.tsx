"use client";

import React from "react";
import { TimelineGroupBlock } from "./timeline-group-block";
import { TimelineGroup } from "@/types";
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
  const playGroup = useTimelineStore((s) => s.playGroup);

  if (!groups.length) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {groups.map((group: TimelineGroup) => (
        <div
          key={group.id}
          className="relative pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            playGroup(group.id);
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
