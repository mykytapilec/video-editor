"use client";

import { useRef, useMemo } from "react";
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

  const currentVideoSrc = useEditorStore((s) => s.currentVideoSrc);

  const isActive = selectedGroupId === group.id;

  const dragStartX = useRef(0);
  const startAtDrag = useRef(0);

  const resizeStartX = useRef(0);
  const startAtResize = useRef(0);
  const endAtResize = useRef(0);

  const visibleStart = Math.max(0, group.start);
  const visibleEnd = Math.min(group.end, videoDuration);
  if (visibleEnd - visibleStart <= 0) return null;

  const widthPx = (group.end - group.start) * pixelsPerSecond;

  const thumbsCount = Math.max(1, Math.floor(widthPx / 120));

  const times = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < thumbsCount; i++) {
      const t =
        group.start +
        (i / Math.max(1, thumbsCount - 1)) * (group.end - group.start);
      arr.push(t);
    }
    return arr;
  }, [group.start, group.end, thumbsCount]);

  const { thumbs } = useThumbnails(
    isActive ? group.id : undefined,
    currentVideoSrc,
    times,
    {
      width: 120,
      height,
      maxThumbs: 12,
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
      className="absolute top-0 rounded select-none cursor-grab"
      style={{
        left: group.start * pixelsPerSecond,
        width: widthPx,
        height,
        backgroundColor: isActive ? "transparent" : "rgba(96,165,250,0.25)",
        border: isActive ? "1px solid rgba(255,255,255,0.9)" : "none",
        zIndex: isActive ? 30 : 10,
      }}
    >
      {isActive && thumbs && thumbs.length > 0 && (
        <div className="absolute inset-0 flex h-full z-10 pointer-events-none">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover"
                style={{ width: `${100 / thumbs.length}%`, height: "100%" }}
                draggable={false}
              />
            ) : (
              <div key={i} className="flex-1 bg-gray-800" />
            )
          )}
        </div>
      )}
      {isActive && (
        <>
          <div
            onMouseDown={onResizeLeft}
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize
                       bg-black/40 z-30"
          />
          <div
            onMouseDown={onResizeRight}
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize
                       bg-black/40 z-30"
          />
        </>
      )}
    </div>
  );
}
