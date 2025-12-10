// /client/src/features/editor/timeline/timeline-block.tsx
import React, { useRef, useState, useEffect } from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";

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
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);

  const videoDuration = useStore.getState().videoDuration || 1;

  const snap = (val: number) => Math.round(val / snapStep) * snapStep;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaSec = e.movementX / pixelsPerSecond;

    let { start, end } = item.trim ?? { start: item.start ?? 0, end: item.end ?? videoDuration };
    let timelineStart = item.timelineStart ?? 0;

    const minLength = 1;
    // LEFT RESIZE
    if (isLeftResize) {
      let newStart = snap(start + deltaSec);
      if (newStart < 0) newStart = 0;
      if (newStart > end - minLength) newStart = end - minLength;

      timelineStart = Math.min(timelineStart + (newStart - start), videoDuration - (end - newStart));

      updateTrackItem(item.id, { trim: { ...item.trim, start: newStart }, timelineStart });
    }

    // RIGHT RESIZE
    if (isRightResize) {
      let newEnd = snap(end + deltaSec);
      if (newEnd > videoDuration) newEnd = videoDuration;
      if (newEnd < start + minLength) newEnd = start + minLength;

      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }

    // DRAG
    if (isDragging) {
      let newTimelineStart = snap(timelineStart + deltaSec);
      if (newTimelineStart < 0) newTimelineStart = 0;
      if (newTimelineStart + (end - start) > videoDuration) {
        newTimelineStart = videoDuration - (end - start);
      }
      updateTrackItem(item.id, { timelineStart: newTimelineStart });
    }
  };

  const stopActions = () => {
    setIsDragging(false);
    setIsLeftResize(false);
    setIsRightResize(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  }, [isDragging, isLeftResize, isRightResize, item]);

  const onStartDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    setIsDragging(true);
  };

  const trim = item.trim ?? { start: item.start ?? 0, end: item.end ?? videoDuration };
  const duration = Math.max(1, trim.end - trim.start);
  const width = duration * pixelsPerSecond;
  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  return (
    <div
      ref={blockRef}
      className="absolute bg-gray-800 rounded-sm overflow-hidden select-none"
      style={{ left, width, height: 100, cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={onStartDrag}
    >
      <div className="w-full h-full overflow-hidden opacity-80">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
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
