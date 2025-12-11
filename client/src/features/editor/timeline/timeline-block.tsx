// client/src/features/editor/timeline/timeline-block.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";
import useThumbnails from "@/features/editor/hooks/use-thumbnails";

interface Props {
  item: VideoTrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const TimelineBlock: React.FC<Props> = ({ item, pixelsPerSecond, snapStep }) => {
  const { updateTrackItem } = useStore();
  const videoDuration = useStore((s) => s.videoDuration) || 1;

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);

  const trim = item.trim ?? { start: item.start ?? 0, end: item.end ?? videoDuration };
  const duration = Math.max(1, trim.end - trim.start);
  const width = Math.max(1, duration * pixelsPerSecond);
  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  const snap = (v: number) => Math.round(v / snapStep) * snapStep;

  const thumbsCount = Math.min(8, Math.max(1, Math.floor(width / 160)));

  const times = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < thumbsCount; i++) {
      const t = trim.start + (i / Math.max(1, thumbsCount - 1)) * (trim.end - trim.start);
      arr.push(Number.isFinite(t) ? t : trim.start);
    }
    return arr;
  }, [thumbsCount, trim.start, trim.end]);

  const { thumbs, loading } = useThumbnails(item.id, item.src || null, times, {
    width: 240,
    height: 140,
    crossOrigin: "anonymous",
  });

  useEffect(() => {
    const videoDur = Math.max(1, videoDuration);
    const minLen = 1;

    const onMove = (e: MouseEvent) => {
      const deltaSec = e.movementX / pixelsPerSecond;

      const curTrim = item.trim ?? { start: item.start ?? 0, end: item.end ?? (item.start ?? 0) + duration };
      let { start, end } = curTrim;
      let timelineStart = item.timelineStart ?? 0;

      if (isLeftResize) {
        let newStart = snap(start + deltaSec);
        if (newStart < 0) newStart = 0;
        if (newStart > end - minLen) newStart = end - minLen;
        timelineStart = Math.min(Math.max(0, timelineStart + (newStart - start)), videoDur - (end - newStart));
        updateTrackItem(item.id, { trim: { ...curTrim, start: newStart }, timelineStart });
        return;
      }

      if (isRightResize) {
        let newEnd = snap(end + deltaSec);
        if (newEnd > videoDur) newEnd = videoDur;
        if (newEnd < start + minLen) newEnd = start + minLen;
        updateTrackItem(item.id, { trim: { ...curTrim, end: newEnd } });
        return;
      }

      if (isDragging) {
        let newTimelineStart = snap(timelineStart + deltaSec);
        if (newTimelineStart < 0) newTimelineStart = 0;
        if (newTimelineStart + (end - start) > videoDur) {
          newTimelineStart = videoDur - (end - start);
        }
        updateTrackItem(item.id, { timelineStart: newTimelineStart });
      }
    };

    const onUp = () => {
      setIsDragging(false);
      setIsLeftResize(false);
      setIsRightResize(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isLeftResize, isRightResize, item, pixelsPerSecond, videoDuration]);

  return (
    <div
      className="absolute bg-gray-800 rounded-sm overflow-hidden select-none"
      style={{ left, width, height: 100, cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        setIsDragging(true);
      }}
    >
      <div className="w-full h-full overflow-hidden opacity-90 flex">
        {thumbs && thumbs.length > 0 ? (
          thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover border-r border-gray-700"
                style={{ width: `${100 / thumbs.length}%`, height: "100%" }}
                alt={`thumb-${i}`}
                draggable={false}
              />
            ) : (
              <div
                key={i}
                className="flex-1 flex items-center justify-center text-gray-400 text-[12px] border-r border-gray-700"
              >
                —
              </div>
            )
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px]">
            {loading ? "Loading..." : "No preview"}
          </div>
        )}
      </div>

      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/50 rounded text-xs text-white">
        {formatTime(duration)}
      </div>

      <div
        data-handle="left"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsLeftResize(true);
        }}
        className="absolute left-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />

      <div
        data-handle="right"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsRightResize(true);
        }}
        className="absolute right-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />
    </div>
  );
};

export default TimelineBlock;
