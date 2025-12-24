"use client";

import React from "react";
import useStore from "@/features/editor/store/use-store";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

const SEGMENTS = 10;

export default function TimelineBackground({
  pixelsPerSecond,
  height,
}: Props) {
  const duration = useStore((s) => s.videoDuration);

  if (!duration || duration <= 0) {
    return null;
  }

  const totalWidth = duration * pixelsPerSecond;
  const segmentWidth = totalWidth / SEGMENTS;

  return (
    <div
      className="flex"
      style={{
        width: totalWidth,
        height,
        backgroundColor: "#222",
        filter: "grayscale(100%)",
      }}
    >
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <div
          key={i}
          className="relative border-r border-black/30"
          style={{
            width: segmentWidth,
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-black/40 text-xs">
            –
          </div>
        </div>
      ))}
    </div>
  );
}
