"use client";

import React from "react";
import useTimelineStore from "@/features/editor/store/use-store";
import clsx from "clsx";

type Props = {
  pixelsPerSecond: number;
  height: number;
};

export default function TimelineGroups({
  pixelsPerSecond,
  height,
}: Props) {
  const groups = useTimelineStore((s) => s.groups);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useTimelineStore(
    (s) => s.setSelectedGroupId
  );

  if (!groups || groups.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 h-full w-full pointer-events-auto">
      {groups.map((group) => {
        const left = group.start * pixelsPerSecond;
        const width =
          Math.max(group.end - group.start, 0.1) *
          pixelsPerSecond;

        return (
          <div
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={clsx(
              "absolute top-2 rounded-md cursor-pointer transition",
              selectedGroupId === group.id
                ? "ring-2 ring-white"
                : "opacity-90 hover:opacity-100"
            )}
            style={{
              left,
              width,
              height: height - 16,
              backgroundColor: "#4f46e5",
            }}
          >
            <div className="px-2 py-1 text-xs text-white truncate">
              {group.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
