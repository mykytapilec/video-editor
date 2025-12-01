import React, { useRef, useState, useEffect } from "react";
import { VideoTrackItem, TrackItem } from "@/types";
import useStore from "../store/use-store";

interface Props {
  item: TrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

export const TimelineBlock: React.FC<Props> = ({ item, pixelsPerSecond, snapStep }) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  const isVideo = (i: TrackItem): i is VideoTrackItem => i.type === "video";
  if (!isVideo(item)) return null;

  const duration = item.trim ? item.trim.end - item.trim.start : item.duration ?? 0;
  const width = duration * pixelsPerSecond;
  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  const snap = (value: number) => Math.round(value / snapStep) * snapStep;

  useEffect(() => {
    if (!item.src || duration <= 0) return;

    const video = document.createElement("video");
    video.src = item.src;
    video.crossOrigin = "anonymous";

    const frameCount = Math.max(3, Math.floor(width / 80));
    const times = Array.from({ length: frameCount }, (_, i) =>
      (item.trim?.start ?? 0) + (i / (frameCount - 1)) * duration
    );

    const loadFrames = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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
  }, [item.src, duration, item.trim?.start, item.trim?.end, width]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isVideo(item)) return;
    const deltaPx = e.movementX;
    const deltaSec = deltaPx / pixelsPerSecond;

    if (isLeftResize && item.trim) {
      const newStart = snap(Math.max(0, item.trim.start + deltaSec));
      const shift = newStart - item.trim.start;
      updateTrackItem(item.id, {
        trim: { ...item.trim, start: newStart },
        timelineStart: (item.timelineStart ?? 0) + shift,
      });
    }

    if (isRightResize && item.trim) {
      const newEnd = snap(Math.max(item.trim.start + 0.1, item.trim.end + deltaSec));
      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }

    if (isDragging) {
      const newPos = snap(Math.max(0, (item.timelineStart ?? 0) + deltaSec));
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
        height: 100,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        setIsDragging(true);
      }}
    >
      <div className="flex h-full w-full">
        {thumbs.length > 0
          ? thumbs.map((src, i) => (
              <img
                key={i}
                src={src}
                className="object-cover border-r border-gray-700"
                style={{ width: `${100 / thumbs.length}%` }}
              />
            ))
          : <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px]">Loading...</div>}
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
