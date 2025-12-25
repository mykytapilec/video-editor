"use client";

import React from "react";

type Props = {
  pixelsPerSecond: number;
  height: number;
};

export default function TimelineBackground({
  pixelsPerSecond,
  height,
}: Props) {
  const blocks = 10;

  return (
    <div
      className="absolute top-0 left-0 flex"
      style={{
        height,
        filter: "grayscale(100%)",
      }}
    >
      {Array.from({ length: blocks }).map((_, i) => (
        <div
          key={i}
          className="relative border-r border-black/30"
          style={{
            width: 10 * pixelsPerSecond,
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
