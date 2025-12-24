"use client";

import React, { useMemo } from "react";
import useTimelineStore from "@/features/editor/store/use-store";

type Props = {
  pixelsPerSecond: number;
  height: number;
};

export default function TimelineBackground({ pixelsPerSecond, height }: Props) {
  const videoDuration = useTimelineStore((s) => s.videoDuration);
  const videoSrc = useTimelineStore((s) => s.currentVideoSrc);

  const segments = 10; // визуальное разбиение фона

  const segmentWidth = useMemo(() => {
    if (!videoDuration) return 0;
    return (videoDuration * pixelsPerSecond) / segments;
  }, [videoDuration, pixelsPerSecond]);

  if (!videoSrc || !videoDuration) return null;

  return (
    <div
      className="absolute top-0 left-0 flex"
      style={{
        height,
        width: videoDuration * pixelsPerSecond,
        filter: "grayscale(100%)",
        opacity: 0.35,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="relative border-r border-white/10"
          style={{
            width: segmentWidth,
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
            –
          </div>
        </div>
      ))}
    </div>
  );
}
