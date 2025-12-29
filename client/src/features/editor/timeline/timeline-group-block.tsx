"use client";

import { useRef } from "react";
import { TimelineGroup } from "@/types";
import useStore from "../store/use-store";

type Props = {
  group: TimelineGroup;
  pixelsPerSecond: number;
  height: number;
};

export function TimelineGroupBlock({ group, pixelsPerSecond, height }: Props) {
  const videoDuration = useStore((s) => s.videoDuration);

  const dragStartX = useRef(0);
  const startAtDrag = useRef(0);

  const resizeStartX = useRef(0);
  const startAtResize = useRef(0);
  const endAtResize = useRef(0);

  const drag = useStore((s) => s.updateGroupDrag);
  const resizeLeft = useStore((s) => s.updateGroupResizeLeft);
  const resizeRight = useStore((s) => s.updateGroupResizeRight);
  const selectedGroupId = useStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useStore((s) => s.setSelectedGroupId);

  const isSelected = selectedGroupId === group.id;

  /* ===== UI CLIPPING ===== */
  const visibleStart = Math.max(0, group.start);
  const visibleEnd = Math.min(group.end, videoDuration);
  const visibleDuration = visibleEnd - visibleStart;

  if (visibleDuration <= 0) return null;

  const onDragStart = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    startAtDrag.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartX.current;
      drag(group.id, startAtDrag.current + dx / pixelsPerSecond);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeStartX.current = e.clientX;
    startAtResize.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartX.current;
      resizeLeft(group.id, startAtResize.current + dx / pixelsPerSecond);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeStartX.current = e.clientX;
    endAtResize.current = group.end;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartX.current;
      resizeRight(group.id, endAtResize.current + dx / pixelsPerSecond);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      className={
        "absolute top-0 h-full rounded cursor-grab select-none " +
        (isSelected
          ? "bg-blue-600 ring-2 ring-white z-20"
          : "bg-blue-500/70 z-10")
      }
      style={{
        left: group.start * pixelsPerSecond,
        width: (group.end - group.start) * pixelsPerSecond,
        height,
      }}
      onMouseDown={(e) => {
        setSelectedGroupId(group.id);
        onDragStart(e);
      }}
    >
      {/* resize left */}
      <div
        onMouseDown={onResizeLeft}
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
      />

      {/* resize right */}
      <div
        onMouseDown={onResizeRight}
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
      />
    </div>
  );
}
