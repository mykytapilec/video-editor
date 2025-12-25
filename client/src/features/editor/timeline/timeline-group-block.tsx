"use client";

import React, { useRef } from "react";
import Moveable from "react-moveable";
import useTimelineStore from "@/features/editor/store/use-store";
import { TimelineGroup } from "@/types";
import { formatDuration } from "@/utils/formatDuration";

interface TimelineGroupBlockProps {
  group: TimelineGroup;
  pixelsPerSecond: number;
  height: number;
}

const TimelineGroupBlock: React.FC<TimelineGroupBlockProps> = ({
  group,
  pixelsPerSecond,
  height,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const setState = useTimelineStore((s) => s.setState);
  const getState = useTimelineStore.getState;

  const width = (group.end - group.start) * pixelsPerSecond;
  const left = group.start * pixelsPerSecond;

  const handleDrag = (deltaX: number) => {
    const current = getState();
    const newGroups = current.groups.map((g) =>
      g.id === group.id
        ? {
            ...g,
            start: Math.max(0, g.start + deltaX / pixelsPerSecond),
            end: Math.max(0, g.end + deltaX / pixelsPerSecond),
          }
        : g
    );
    setState({ groups: newGroups });
  };

  const handleResizeLeft = (deltaX: number) => {
    const current = getState();
    const newGroups = current.groups.map((g) =>
      g.id === group.id
        ? {
            ...g,
            start: Math.max(0, g.start + deltaX / pixelsPerSecond),
          }
        : g
    );
    setState({ groups: newGroups });
  };

  const handleResizeRight = (deltaX: number) => {
    const current = getState();
    const newGroups = current.groups.map((g) =>
      g.id === group.id
        ? {
            ...g,
            end: Math.max(g.start + 0.1, g.end + deltaX / pixelsPerSecond),
          }
        : g
    );
    setState({ groups: newGroups });
  };

  return (
    <div
      ref={blockRef}
      className="absolute top-0 bg-purple-500 text-white rounded flex items-center justify-center select-none"
      style={{
        left,
        width,
        height,
        cursor: "grab",
      }}
    >
      <span className="text-xs pointer-events-none">
        {group.name} ({formatDuration(group.end - group.start)})
      </span>

      <Moveable
        target={blockRef.current}
        draggable
        throttleDrag={0}
        onDrag={({ beforeTranslate }) => {
          handleDrag(beforeTranslate[0]);
        }}
        resizable
        throttleResize={0}
        keepRatio={false}
        renderDirections={["w", "e"]}
        onResize={({ target, delta, direction }) => {
          const deltaX = delta[0];
          if (direction[0] === -1) {
            handleResizeLeft(deltaX);
          } else if (direction[0] === 1) {
            handleResizeRight(deltaX);
          }
        }}
        edge={false}
      />
    </div>
  );
};

export default TimelineGroupBlock;
