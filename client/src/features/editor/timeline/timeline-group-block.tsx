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
  const groupId = Number(group.id);

  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const selectGroup = useTimelineStore((s) => s.selectGroup);

  const updateDrag = useTimelineStore((s) => s.updateGroupDrag);
  const resizeLeft = useTimelineStore((s) => s.updateGroupResizeLeft);
  const resizeRight = useTimelineStore((s) => s.updateGroupResizeRight);

  const videoSrc = useEditorStore((s) => s.currentVideoSrc);
  const videoDuration = useTimelineStore((s) => s.videoDuration);

  const isActive = selectedGroupId === groupId;

  const dragStartX = useRef(0);
  const startAtDrag = useRef(0);

  const resizeStartX = useRef(0);
  const startAtResize = useRef(0);
  const endAtResize = useRef(0);

  const visibleStart = Math.max(0, group.start);
  const visibleEnd = Math.min(group.end, videoDuration);
  if (visibleEnd <= visibleStart) return null;

  const thumbsCount = Math.max(
    1,
    Math.floor(
      ((group.end - group.start) * pixelsPerSecond) / 140
    )
  );

  const times = useMemo(() => {
    if (!isActive) return [];
    return Array.from({ length: thumbsCount }, (_, i) =>
      group.start +
      (i / Math.max(1, thumbsCount - 1)) *
        (group.end - group.start)
    );
  }, [isActive, thumbsCount, group.start, group.end]);

  const { thumbs } = useThumbnails(
    isActive ? group.id : undefined,
    isActive ? videoSrc : null,
    times,
    { height, width: 160 }
  );

  const onDragStart = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();

    dragStartX.current = e.clientX;
    startAtDrag.current = group.start;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartX.current;
      updateDrag(groupId, startAtDrag.current + dx / pixelsPerSecond);
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
        selectGroup(groupId);
      }}
      className={`absolute top-0 rounded overflow-hidden ${
        isActive
          ? "ring-2 ring-white z-30"
          : "bg-blue-500/40 z-10"
      }`}
      style={{
        left: group.start * pixelsPerSecond,
        width: (group.end - group.start) * pixelsPerSecond,
        height,
      }}
    >
      {isActive && (
        <div
          onMouseDown={onDragStart}
          className="absolute inset-y-0 left-2 right-2 cursor-grab z-30"
        />
      )}

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
            ) : null
          )}
        </div>
      )}

      {isActive && (
        <>
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              resizeStartX.current = e.clientX;
              startAtResize.current = group.start;

              const move = (ev: MouseEvent) => {
                resizeLeft(
                  groupId,
                  startAtResize.current +
                    (ev.clientX - resizeStartX.current) /
                      pixelsPerSecond
                );
              };

              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };

              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-40"
          />

          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              resizeStartX.current = e.clientX;
              endAtResize.current = group.end;

              const move = (ev: MouseEvent) => {
                resizeRight(
                  groupId,
                  endAtResize.current +
                    (ev.clientX - resizeStartX.current) /
                      pixelsPerSecond
                );
              };

              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };

              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-40"
          />
        </>
      )}
    </div>
  );
}
