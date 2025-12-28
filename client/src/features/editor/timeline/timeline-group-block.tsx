"use client";

import { useEffect, useRef } from "react";
import Moveable from "react-moveable";
import { TimelineGroup } from "@/types";
import useTimelineStore from "../store/use-store";

type Props = {
  group: TimelineGroup;
  pixelsPerSecond: number;
  height: number;
};

const MIN_DURATION = 0.1;

export default function TimelineGroupBlock({
  group,
  pixelsPerSecond,
  height,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const updateGroup = useTimelineStore((s) => s.updateGroup);

  const startRef = useRef<{
    start: number;
    end: number;
  } | null>(null);

  const leftPx = group.start * pixelsPerSecond;
  const widthPx = Math.max(
    (group.end - group.start) * pixelsPerSecond,
    1
  );

  const commit = (start: number, end: number) => {
    const safeStart = Math.max(0, start);
    const safeEnd = Math.max(safeStart + MIN_DURATION, end);

    updateGroup(group.id, {
      start: safeStart,
      end: safeEnd,
    });
  };

  return (
    <>
      <div
        ref={ref}
        className="absolute rounded-md bg-purple-500/40 border border-white/60"
        style={{
          left: leftPx,
          width: widthPx,
          height,
          top: 0,
        }}
      />

      <Moveable
        target={ref}
        origin={false}
        draggable
        resizable
        throttleDrag={0}
        throttleResize={0}
        renderDirections={["w", "e"]}
        keepRatio={false}

        onDragStart={() => {
          startRef.current = {
            start: group.start,
            end: group.end,
          };
        }}

        onDrag={(e) => {
          if (!startRef.current) return;

          const deltaSeconds =
            e.beforeTranslate[0] / pixelsPerSecond;

          commit(
            startRef.current.start + deltaSeconds,
            startRef.current.end + deltaSeconds
          );
        }}

        onResizeStart={() => {
          startRef.current = {
            start: group.start,
            end: group.end,
          };
        }}

        onResize={(e) => {
          if (!startRef.current) return;

          const deltaSeconds =
            e.drag.beforeTranslate[0] / pixelsPerSecond;

          // LEFT
          if (e.direction[0] === -1) {
            commit(
              startRef.current.start + deltaSeconds,
              startRef.current.end
            );
          }

          // RIGHT
          if (e.direction[0] === 1) {
            const newDuration = e.width / pixelsPerSecond;
            commit(
              startRef.current.start,
              startRef.current.start + newDuration
            );
          }
        }}
      />
    </>
  );
}
