"use client";

import React, { useMemo } from "react";
import useStore from "../store/use-store";
import useThumbnails from "../hooks/use-thumbnails";
import { useEditorStore } from "../store/use-editor-store";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineBackground({ pixelsPerSecond, height }: Props) {
  const currentVideoSrc = useEditorStore((s) => s.currentVideoSrc);
  const videoDuration = useStore((s) => s.videoDuration) || 1;

  const thumbWidthPx = 120;

  const timelineWidth = videoDuration * pixelsPerSecond;
  const thumbsCount = Math.min(Math.ceil(timelineWidth / thumbWidthPx), 100);

  const times = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < thumbsCount; i++) {
      const t = parseFloat(((i / Math.max(1, thumbsCount - 1)) * videoDuration).toFixed(2));
      set.add(t);
    }
    return Array.from(set);
  }, [thumbsCount, videoDuration]);

  const { thumbs, loading } = useThumbnails("background", currentVideoSrc, times, {
    width: thumbWidthPx,
    height: 60,
    maxThumbs: thumbsCount,
    crossOrigin: "anonymous",
  });

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden select-none"
      style={{ width: timelineWidth, height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
          Loading...
        </div>
      )}

      {!loading && thumbs && thumbs.length > 0 && (
        <div className="absolute inset-0 flex h-full">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover filter grayscale"
                style={{ width: `${100 / thumbsCount}%`, height: "100%" }}
                alt={`thumb-${i}`}
                draggable={false}
              />
            ) : (
              <div key={i} className="flex-1 bg-black" />
            )
          )}
        </div>
      )}
    </div>
  );
}
