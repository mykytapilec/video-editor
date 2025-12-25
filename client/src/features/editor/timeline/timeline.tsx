"use client";

import React, { useEffect, useRef } from "react";
import useTimelineStore from "@/features/editor/store/use-store";

import TimelineRuler from "./timeline-ruler";
import TimelineBackground from "./timeline-background";
import TimelineGroups from "./timeline-groups";
import TimelineContainer from "./timeline-container";

export default function Timeline() {
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const duration = useTimelineStore((s) => s.videoDuration);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const scrollLeft = useTimelineStore((s) => s.scrollLeft);
  const setScrollLeft = useTimelineStore((s) => s.setScrollLeft);

  const containerRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = 100 * zoom;
  const height = 100;
  const width = duration * pixelsPerSecond;

  const zoomIn = () => setZoom(Math.min(zoom * 1.25, 5));
  const zoomOut = () => setZoom(Math.max(zoom / 1.25, 0.25));

  // Центрирование playhead
  useEffect(() => {
    if (!duration) return;
    if (!containerRef.current) return;

    const el = containerRef.current;
    const viewportWidth = el.clientWidth;
    const playheadX = currentTime * pixelsPerSecond;

    el.scrollLeft = Math.max(playheadX - viewportWidth / 2, 0);
    setScrollLeft(el.scrollLeft);
  }, [zoom, duration, currentTime, pixelsPerSecond, setScrollLeft]);

  if (!duration) return null;

  return (
    <div className="relative w-full h-full bg-black">
      {/* Zoom controls */}
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

      <TimelineContainer ref={containerRef} width={width} height={height}>
        <TimelineBackground pixelsPerSecond={pixelsPerSecond} height={height} />
        <TimelineGroups pixelsPerSecond={pixelsPerSecond} height={height} />
      </TimelineContainer>
    </div>
  );
}
