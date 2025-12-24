"use client";

import React from "react";
import useStore from "@/features/editor/store/use-store";
import TimelineRuler from "./timeline-ruler";
import TimelineBackground from "./timeline-background";
import { TimelineContainer } from "./timeline-container";

const TIMELINE_HEIGHT = 100;
const BASE_PX_PER_SEC = 100;

export default function Timeline() {
  const zoom = useStore((s) => s.zoom);
  const duration = useStore((s) => s.videoDuration);

  if (!duration || duration <= 0) {
    return null;
  }

  const pixelsPerSecond = BASE_PX_PER_SEC * zoom;
  const width = duration * pixelsPerSecond;

  return (
    <div className="relative w-full h-full bg-black">
      {/* ruler */}
      <TimelineRuler
        width={width}
        pixelsPerSecond={pixelsPerSecond}
        totalSeconds={duration}
      />

      {/* scrollable timeline */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden">
        <TimelineContainer width={width} height={TIMELINE_HEIGHT}>
          <TimelineBackground
            pixelsPerSecond={pixelsPerSecond}
            height={TIMELINE_HEIGHT}
          />
        </TimelineContainer>
      </div>
    </div>
  );
}
