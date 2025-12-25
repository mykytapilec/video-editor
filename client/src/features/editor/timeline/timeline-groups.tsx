"use client";

import React, { useRef } from "react";
import useTimelineStore from "@/features/editor/store/use-store";
import clsx from "clsx";

type Props = {
  pixelsPerSecond: number;
  height: number;
};

const MIN_DURATION = 0.5; // секунды

export default function TimelineGroups({
  pixelsPerSecond,
  height,
}: Props) {
  const groups = useTimelineStore((s) => s.groups);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useTimelineStore(
    (s) => s.setSelectedGroupId
  );
  const setState = useTimelineStore((s) => s.setState);

  const dragRef = useRef<{
    id: string;
    type: "start" | "end";
    startX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  if (!groups || groups.length === 0) return null;

  const onMouseDown = (
    e: React.MouseEvent,
    groupId: string,
    type: "start" | "end"
  ) => {
    e.stopPropagation();

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    dragRef.current = {
      id: groupId,
      type,
      startX: e.clientX,
      initialStart: group.start,
      initialEnd: group.end,
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;

    const { id, type, startX, initialStart, initialEnd } =
      dragRef.current;

    const dx = e.clientX - startX;
    const deltaSeconds = dx / pixelsPerSecond;

    setState({
      groups: groups.map((g) => {
        if (g.id !== id) return g;

        if (type === "start") {
          const newStart = Math.min(
            initialEnd - MIN_DURATION,
            Math.max(0, initialStart + deltaSeconds)
          );
          return { ...g, start: newStart };
        }

        if (type === "end") {
          const newEnd = Math.max(
            initialStart + MIN_DURATION,
            initialEnd + deltaSeconds
          );
          return { ...g, end: newEnd };
        }

        return g;
      }),
    });
  };

  const onMouseUp = () => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full">
      {groups.map((group) => {
        const left = group.start * pixelsPerSecond;
        const width =
          Math.max(group.end - group.start, MIN_DURATION) *
          pixelsPerSecond;

        return (
          <div
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={clsx(
              "absolute top-2 rounded-md transition cursor-pointer",
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
            {/* Left resize handle */}
            <div
              onMouseDown={(e) =>
                onMouseDown(e, group.id, "start")
              }
              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
            />

            {/* Right resize handle */}
            <div
              onMouseDown={(e) =>
                onMouseDown(e, group.id, "end")
              }
              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
            />

            {/* Label */}
            <div className="px-2 py-1 text-xs text-white truncate pointer-events-none">
              {group.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
