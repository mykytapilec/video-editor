"use client";

import { useMemo, useRef } from "react";
import { TimelineGroup } from "@/types";
import useTimelineStore from "../store/use-timeline-store";
import useThumbnails from "../hooks/use-thumbnails";
import { useEditorStore } from "../store/use-editor-store";

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
  const selectGroup = useTimelineStore((s) => s.selectGroup);

  const updateDrag = useTimelineStore((s) => s.updateGroupDrag);
  const resizeLeft = useTimelineStore((s) => s.updateGroupResizeLeft);
  const resizeRight = useTimelineStore((s) => s.updateGroupResizeRight);

  const videoSrc = useEditorStore((s) => s.currentVideoSrc);

  const isActive = selectedGroupId === group.id;

  const dragStartX = useRef(0);
  const startAtDrag = useRef(0);

  const resizeStartX = useRef(0);
  const startAtResize = useRef(0);
  const endAtResize = useRef(0);

  const visibleStart = Math.max(0, group.start);
  const visibleEnd = Math.min(group.end, videoDuration);
  if (visibleEnd <= visibleStart) return null;

  /* ===== thumbnails ONLY for active group ===== */
  const thumbsCount = Math.max(
    1,
    Math.floor(
      ((group.end - group.start) * pixelsPerSecond) / 140
    )
  );

  const times = useMemo(() => {
    if (!isActive) return [];
    const arr: number[] = [];
    for (let i = 0; i < thumbsCount; i++) {
      const t =
        group.start +
        (i / Math.max(1, thumbsCount - 1)) *
          (group.end - group.start);
      arr.push(t);
    }
    return arr;
  }, [isActive, thumbsCount, group.start, group.end]);

  const { thumbs } = useThumbnails(
    isActive ? group.id : undefined,
    isActive ? videoSrc : null,
    times,
    {
      height,
      width: 160,
      crossOrigin: "anonymous",
    }
  );

  const onDragStart = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();

    dragStartX.current = e.clientX;
    startAtDrag.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartX.current;
      updateDrag(group.id, startAtDrag.current + dx / pixelsPerSecond);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeLeft = (e: React.MouseEvent) => {
    if (!isActive) return;
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
    if (!isActive) return;
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
      onMouseDown={(e) => {
        e.stopPropagation();
        selectGroup(group.id);
        onDragStart(e);
      }}
      className={
        "absolute top-0 rounded overflow-hidden select-none " +
        (isActive
          ? "z-30 ring-2 ring-white"
          : "bg-blue-500/40 z-10")
      }
      style={{
        left: group.start * pixelsPerSecond,
        width: (group.end - group.start) * pixelsPerSecond,
        height,
        cursor: isActive ? "grab" : "pointer",
      }}
    >
      {isActive && thumbs.length > 0 && (
        <div className="absolute inset-0 flex">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover"
                style={{
                  width: `${100 / thumbs.length}%`,
                  height: "100%",
                }}
                draggable={false}
              />
            ) : (
              <div key={i} className="flex-1 bg-black" />
            )
          )}
        </div>
      )}

      {isActive && (
        <>
          <div
            onMouseDown={onResizeLeft}
            className="absolute left-0 top-0 h-full w-2 bg-black/40 cursor-ew-resize z-40"
          />
          <div
            onMouseDown={onResizeRight}
            className="absolute right-0 top-0 h-full w-2 bg-black/40 cursor-ew-resize z-40"
          />
        </>
      )}
    </div>
  );
}
