"use client";

import useTimelineStore from "../store/use-timeline-store";
import { TimelineGroupBlock } from "./timeline-group-block";

type Props = {
  pixelsPerSecond: number;
  height: number;
};

export default function TimelineGroups({
  pixelsPerSecond,
  height,
}: Props) {
  const groups = useTimelineStore((s) => s.groups);
  const videoDuration = useTimelineStore((s) => s.videoDuration);
  const selectGroup = useTimelineStore((s) => s.selectGroup);

  if (!groups.length || !videoDuration) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {groups.map((group) => (
        <div
          key={group.id}
          className="pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            selectGroup(Number(group.id));
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
