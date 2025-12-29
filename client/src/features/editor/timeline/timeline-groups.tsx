"use client";

import React from "react";
import { TimelineGroupBlock } from "./timeline-group-block";
import useStore from "../store/use-store";
import { TimelineGroup } from "@/types";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineGroups({ pixelsPerSecond, height }: Props) {
  const groups = useStore((s) => s.groups);
  const selectedGroupId = useStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useStore((s) => s.setSelectedGroupId);
  const playGroup = useStore((s) => s.playGroup);

  if (!groups.length) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {groups.map((group: TimelineGroup) => (
        <div
          key={group.id}
          className={`relative pointer-events-auto ${
            selectedGroupId === group.id
              ? "outline outline-2 outline-white"
              : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGroupId(group.id);
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
