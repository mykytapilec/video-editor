"use client";

import React, { useEffect, useRef } from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";

interface Props {
  item: VideoTrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 10;
const MIN_LEN = 0.5;

const formatTime = (sec: number) => {
  if (!Number.isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const TimelineBlock: React.FC<Props> = ({ item, pixelsPerSecond, snapStep }) => {
  const updateTrackItem = useStore((s) => s.updateTrackItem);
  const videoDuration = useStore((s) => s.videoDuration) || 1;

  const modeRef = useRef<"drag" | "left" | "right" | null>(null);
  const lastX = useRef(0);

  const trim = item.trim ?? { start: 0, end: videoDuration };
  const timelineStart = item.timelineStart ?? 0;
  const duration = Math.max(MIN_LEN, trim.end - trim.start);

  const left = timelineStart * pixelsPerSecond;
  const width = duration * pixelsPerSecond;

  const snap = (v: number) => Math.round(v / snapStep) * snapStep;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!modeRef.current) return;

      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      const deltaSec = dx / pixelsPerSecond;

      if (modeRef.current === "drag") {
        let nextStart = snap(timelineStart + deltaSec);
        nextStart = Math.max(0, Math.min(videoDuration - duration, nextStart));
        updateTrackItem(item.id, { timelineStart: nextStart });
      }

      if (modeRef.current === "left") {
        let newStart = snap(trim.start + deltaSec);
        newStart = Math.max(0, Math.min(trim.end - MIN_LEN, newStart));
        updateTrackItem(item.id, {
          trim: { start: newStart, end: trim.end },
          timelineStart: timelineStart + (newStart - trim.start),
        });
      }

      if (modeRef.current === "right") {
        let newEnd = snap(trim.end + deltaSec);
        newEnd = Math.min(videoDuration, Math.max(trim.start + MIN_LEN, newEnd));
        updateTrackItem(item.id, { trim: { start: trim.start, end: newEnd } });
      }
    };

    const onUp = () => {
      modeRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [item.id, pixelsPerSecond, snapStep, timelineStart, trim, duration, videoDuration, updateTrackItem]);

  const start = (mode: "drag" | "left" | "right", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    modeRef.current = mode;
    lastX.current = e.clientX;
  };

  return (
    <div
      className="absolute z-20 pointer-events-auto bg-gray-800 rounded-sm"
      style={{ left, width, height: 96, cursor: "grab" }}
      onMouseDown={(e) => start("drag", e)}
    >
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
        Video block
      </div>

      {/* Длительность */}
      <div className="absolute bottom-1 right-1 px-1 bg-black/70 text-white text-xs rounded">
        {formatTime(duration)}
      </div>

      {/* LEFT HANDLE */}
      <div
        className="absolute left-0 top-0 h-full bg-blue-500 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
        onMouseDown={(e) => start("left", e)}
      />

      {/* RIGHT HANDLE */}
      <div
        className="absolute right-0 top-0 h-full bg-blue-500 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
        onMouseDown={(e) => start("right", e)}
      />
    </div>
  );
};

export default TimelineBlock;
