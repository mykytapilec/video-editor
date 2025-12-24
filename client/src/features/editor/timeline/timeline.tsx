"use client";

import React from "react";
import useTimelineStore from "@/features/editor/store/use-store";
import TimelineRuler from "./timeline-ruler";
import TimelineBackground from "./timeline-background";
import TimelineContainer from "./timeline-container";

export default function Timeline() {
  const zoom = useTimelineStore((s) => s.zoom);
  const duration = useTimelineStore((s) => s.videoDuration);

  const pixelsPerSecond = 100 * zoom;
  const height = 80;

  if (!duration) return null;

  const width = duration * pixelsPerSecond;

  return (
    <div className="relative w-full h-full bg-black">
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
      </TimelineContainer>
    </div>
  );
}
