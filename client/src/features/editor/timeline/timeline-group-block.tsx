"use client";

import { useRef } from "react";
import { TimelineGroup } from "@/types";
import useTimelineStore from "../store/use-timeline-store";

type Props = {
  group: TimelineGroup;
  pixelsPerSecond: number;
  height: number;
};

export function TimelineGroupBlock({
  group,
  pixelsPerSecond,
  height,
}: Props) {
  const videoDuration = useTimelineStore((s) => s.videoDuration);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const editingGroupId = useTimelineStore((s) => s.editingGroupId);

  const updateDrag = useTimelineStore((s) => s.updateGroupDrag);
  const resizeLeft = useTimelineStore((s) => s.updateGroupResizeLeft);
  const resizeRight = useTimelineStore((s) => s.updateGroupResizeRight);

  const isSelected = selectedGroupId === group.id;
  const isEditing = editingGroupId === group.id;

  const dragStartX = useRef(0);
  const startAtDrag = useRef(0);

  const resizeStartX = useRef(0);
  const startAtResize = useRef(0);
  const endAtResize = useRef(0);

  const visibleStart = Math.max(0, group.start);
  const visibleEnd = Math.min(group.end, videoDuration);
  if (visibleEnd - visibleStart <= 0) return null;

  const onDragStart = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();

    dragStartX.current = e.clientX;
    startAtDrag.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartX.current;
      const wantedStart = startAtDrag.current + dx / pixelsPerSecond;
      updateDrag(group.id, wantedStart);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeLeft = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();

    resizeStartX.current = e.clientX;
    startAtResize.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartX.current;
      const wantedStart = startAtResize.current + dx / pixelsPerSecond;
      resizeLeft(group.id, wantedStart);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeRight = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();

    resizeStartX.current = e.clientX;
    endAtResize.current = group.end;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartX.current;
      const wantedEnd = endAtResize.current + dx / pixelsPerSecond;
      resizeRight(group.id, wantedEnd);
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
      onMouseDown={onDragStart}
      className={
        "absolute top-0 rounded select-none " +
        (isEditing
          ? "bg-blue-600 ring-2 ring-white z-30 cursor-grab"
          : isSelected
          ? "bg-blue-500/80 ring-2 ring-blue-300 z-20"
          : "bg-blue-500/40 z-10")
      }
      style={{
        left: group.start * pixelsPerSecond,
        width: (group.end - group.start) * pixelsPerSecond,
        height,
      }}
    >
      {isEditing && (
        <>
          <div
            onMouseDown={onResizeLeft}
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
          />
          <div
            onMouseDown={onResizeRight}
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-black/30"
          />
        </>
      )}
    </div>
  );
}
