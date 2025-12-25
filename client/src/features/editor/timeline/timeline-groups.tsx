"use client";

import React from "react";
import useTimelineStore from "@/features/editor/store/use-store";
import TimelineGroupBlock from "./timeline-group-block";
import { TimelineGroup } from "@/types";

interface TimelineGroupsProps {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineGroups({ pixelsPerSecond, height }: TimelineGroupsProps) {
  const groups = useTimelineStore((s) => s.groups);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
      {groups.map((group: TimelineGroup) => (
        <TimelineGroupBlock
          key={group.id}
          group={group}
          pixelsPerSecond={pixelsPerSecond}
          height={height}
        />
      ))}
    </div>
  );
}
