// /client/src/features/editor/timeline/timeline-block.tsx
import React, { useRef, useState, useEffect } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem, TrackItem } from "@/types";

interface Props {
  item: TrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

export const TimelineBlock = ({ item, pixelsPerSecond, snapStep }: Props) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  const isVideo = (i: TrackItem): i is VideoTrackItem => i.type === "video";
  if (!isVideo(item)) return null;

  const trimStart = item.trim?.start ?? item.start;
  const trimEnd = item.trim?.end ?? item.end;
  const timelineStart = item.timelineStart ?? 0;

  const duration = trimEnd - trimStart;
  const width = duration * pixelsPerSecond;
  const left = timelineStart * pixelsPerSecond;

  const snap = (value: number) => Math.round(value / snapStep) * snapStep;

  useEffect(() => {
    if (!item.src || duration <= 0) return;

    const video = document.createElement("video");
    video.src = item.src;
    video.crossOrigin = "anonymous";

    const frameCount = Math.max(3, Math.floor(width / 80));
    const times = Array.from({ length: frameCount }, (_, i) =>
      trimStart + (i / (frameCount - 1)) * duration
    );

    const loadFrames = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 120;
      canvas.height = 60;

      const results: string[] = [];

      for (const t of times) {
        video.currentTime = t;

        await new Promise<void>((res) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            results.push(canvas.toDataURL("image/jpeg"));
            res();
          };
        });
      }

      setThumbs(results);
    };

    video.onloadeddata = () => loadFrames();
  }, [item.src, duration, trimStart, trimEnd, width]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isVideo(item)) return;

    const deltaPx = e.movementX;
    const deltaSec = deltaPx / pixelsPerSecond;

    if (isLeftResize) {
      const newStart = snap(Math.max(0, trimStart + deltaSec));
      const shift = newStart - trimStart;

      updateTrackItem(item.id, {
        trim: { ...item.trim, start: newStart },
        timelineStart: timelineStart + shift,
      });
    }

    if (isRightResize) {
      const newEnd = snap(Math.max(trimStart + 0.1, trimEnd + deltaSec));
      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }

    if (isDragging) {
      const newPos = snap(Math.max(0, timelineStart + deltaSec));
      updateTrackItem(item.id, { timelineStart: newPos });
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
  });

  return (
    <div
      ref={blockRef}
      className="absolute bg-gray-800 border border-yellow-400 rounded-sm overflow-hidden select-none"
      style={{
        left,
        width,
        height: 60,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        setIsDragging(true);
      }}
    >
      <div className="flex h-full w-full">
        {thumbs.length > 0 ? (
          thumbs.map((src, i) => (
            <img
              key={i}
              src={src}
              className="object-cover border-r border-gray-700"
              style={{ width: `${100 / thumbs.length}%` }}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px]">
            Preview
          </div>
        )}
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

      <div className="absolute bottom-0 right-0 px-1 text-white text-xs bg-black/40">
        {Math.round(duration * 100) / 100}s
      </div>
    </div>
  );
};
