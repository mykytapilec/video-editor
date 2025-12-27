"use client";

import useTimelineStore from "@/features/editor/store/use-store";
import TimelineGroupBlock from "./timeline-group-block";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineGroups({ pixelsPerSecond, height }: Props) {
  const groups = useTimelineStore((s) => s.groups);

  if (!groups.length) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {groups.map((group) => (
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
