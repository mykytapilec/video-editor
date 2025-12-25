"use client";

import React from "react";
import useTimelineStore from "@/features/editor/store/use-store";

import TimelineRuler from "./timeline-ruler";
import TimelineBackground from "./timeline-background";
import TimelineGroups from "./timeline-groups";
import TimelineContainer from "./timeline-container";

export default function Timeline() {
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const duration = useTimelineStore((s) => s.videoDuration);

  if (!duration) return null;

  const pixelsPerSecond = 100 * zoom;
  const height = 100;
  const width = duration * pixelsPerSecond;

  const zoomIn = () => setZoom(Math.min(zoom * 1.25, 5));
  const zoomOut = () => setZoom(Math.max(zoom / 1.25, 0.25));

  return (
    <div className="relative w-full h-full bg-black">
      {/* 🔍 Zoom controls */}
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        <button
          onClick={zoomOut}
          className="px-2 py-1 text-sm bg-neutral-700 rounded hover:bg-neutral-600"
        >
          −
        </button>
        <button
          onClick={zoomIn}
          className="px-2 py-1 text-sm bg-neutral-700 rounded hover:bg-neutral-600"
        >
          +
        </button>
      </div>

      <TimelineRuler
        width={width}
        pixelsPerSecond={pixelsPerSecond}
        totalSeconds={duration}
      />

      <TimelineContainer width={width}>
        <TimelineBackground
          pixelsPerSecond={pixelsPerSecond}
          height={height}
        />

        <TimelineGroups
          pixelsPerSecond={pixelsPerSecond}
          height={height}
        />
      </TimelineContainer>
    </div>
  );
}
