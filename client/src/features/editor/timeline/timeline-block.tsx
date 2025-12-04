// timeline-block.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { VideoTrackItem, TrackItem } from "@/types";
import useStore from "../store/use-store";

interface Props {
  item: TrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

export const TimelineBlock: React.FC<Props> = ({ item, pixelsPerSecond, snapStep }) => {
  if (item.type !== "video") return null;

  const videoItem = item as VideoTrackItem;
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const suspendRef = useRef(false);
  const pendingGenRef = useRef<number | null>(null);

  const trim = videoItem.trim ?? { start: videoItem.start, end: videoItem.end ?? videoItem.start + 5 };
  const duration = trim.end - trim.start;
  const width = Math.max(1, duration * pixelsPerSecond);
  const left = (videoItem.timelineStart ?? 0) * pixelsPerSecond;

  const snap = (value: number) => Math.round(value / snapStep) * snapStep;

  const generateThumbnailsNow = useCallback(async () => {
    const videoSrc = videoItem.src;
    if (!videoSrc || duration <= 0) {
      setThumbs([]);
      return;
    }

    const times = [trim.start, Math.max(trim.start + 0.001, trim.end)];

    try {
      const video = document.createElement("video");
      video.src = videoSrc;
      video.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        let done = false;
        const onLoad = () => {
          if (done) return;
          done = true;
          res();
        };
        video.addEventListener("loadedmetadata", onLoad, { once: true });
        setTimeout(() => {
          if (!done) res();
        }, 2500);
      });

      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setThumbs([]);
        return;
      }

      const results: string[] = [];

      for (const t of times) {
        try {
          video.currentTime = Math.min(Math.max(0, t), video.duration || t);
        } catch {}

        await new Promise<void>((res) => {
          let called = false;
          const onSeek = () => {
            if (called) return;
            called = true;
            try {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              results.push(canvas.toDataURL("image/jpeg"));
            } catch {
              results.push("");
            }
            res();
          };
          video.addEventListener("seeked", onSeek, { once: true });
          setTimeout(() => {
            if (!called) {
              results.push("");
              res();
            }
          }, 1200);
        });
      }

      setThumbs(results);
    } catch {
      setThumbs([]);
    }
  }, [videoItem.src, trim.start, trim.end, duration]);

  useEffect(() => {
    if (!videoItem.src || duration <= 0) {
      setThumbs([]);
      return;
    }

    if (suspendRef.current) {
      if (pendingGenRef.current == null) pendingGenRef.current = 1;
      return;
    }

    const id = window.setTimeout(() => {
      generateThumbnailsNow();
      pendingGenRef.current = null;
    }, 180);

    return () => clearTimeout(id);
  }, [videoItem.src, trim.start, trim.end, duration, generateThumbnailsNow]);

  const handleMouseMove = (e: MouseEvent) => {
    const deltaSec = e.movementX / pixelsPerSecond;

    if (isLeftResize && videoItem.trim) {
      const newStart = snap(Math.max(0, videoItem.trim.start + deltaSec));
      const shift = newStart - videoItem.trim.start;
      updateTrackItem(videoItem.id, {
        trim: { ...videoItem.trim, start: newStart },
        timelineStart: (videoItem.timelineStart ?? 0) + shift,
      });
    }

    if (isRightResize && videoItem.trim) {
      const newEnd = snap(Math.max(videoItem.trim.start + 0.1, videoItem.trim.end + deltaSec));
      updateTrackItem(videoItem.id, { trim: { ...videoItem.trim, end: newEnd } });
    }

    if (isDragging) {
      const newPos = snap(Math.max(0, (videoItem.timelineStart ?? 0) + deltaSec));
      updateTrackItem(videoItem.id, { timelineStart: newPos });
    }
  };

  const stopActions = () => {
    setIsDragging(false);
    setIsLeftResize(false);
    setIsRightResize(false);

    suspendRef.current = false;
    if (pendingGenRef.current != null) {
      pendingGenRef.current = null;
      setTimeout(() => generateThumbnailsNow(), 50);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  });

  const onStartDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    suspendRef.current = true;
    pendingGenRef.current = null;
    setIsDragging(true);
  };

  const onStartLeftResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    suspendRef.current = true;
    pendingGenRef.current = null;
    setIsLeftResize(true);
  };

  const onStartRightResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    suspendRef.current = true;
    pendingGenRef.current = null;
    setIsRightResize(true);
  };

  return (
    <div
      ref={blockRef}
      className="absolute bg-gray-800 rounded-sm overflow-hidden select-none"
      style={{
        left,
        width,
        height: 100,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={onStartDrag}
    >
      <div className="flex h-full w-full">
        {thumbs.length > 0 ? (
          thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover border-r border-gray-700"
                style={{ width: `${100 / thumbs.length}%` }}
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
            Loading...
          </div>
        )}
      </div>

      <div
        data-handle="left"
        onMouseDown={onStartLeftResize}
        className="absolute left-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />
      <div
        data-handle="right"
        onMouseDown={onStartRightResize}
        className="absolute right-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />

      <div className="absolute bottom-0 right-0 px-1 text-white text-xs bg-black/40">
        {Math.round(duration * 100) / 100}s
      </div>
    </div>
  );
};
