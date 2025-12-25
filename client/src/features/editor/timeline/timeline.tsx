"use client";

import React, { useEffect, useRef } from "react";
import useTimelineStore from "@/features/editor/store/use-store";

import TimelineRuler from "./timeline-ruler";
import TimelineBackground from "./timeline-background";
import TimelineContainer from "./timeline-container";

const BASE_PX_PER_SECOND = 100;

export default function Timeline() {
  const duration = useTimelineStore((s) => s.videoDuration);

  return (
    <div className="relative w-full h-full bg-black">
      <TimelineContainerWrapper duration={duration} />
    </div>
  );
}

function TimelineContainerWrapper({ duration }: { duration: number }) {
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const currentTime = useTimelineStore((s) => s.currentTime);

  const containerRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = BASE_PX_PER_SECOND * zoom;
  const width = duration ? duration * pixelsPerSecond : 500; 
  const height = 100;

  useEffect(() => {
    if (!containerRef.current || !duration) return;

    const viewportWidth = containerRef.current.clientWidth;
    const fitZoom = viewportWidth / (duration * BASE_PX_PER_SECOND);

    setZoom(fitZoom);
    containerRef.current.scrollLeft = 0;
  }, [duration, setZoom]);

  const minZoom = containerRef.current
    ? containerRef.current.clientWidth / (duration ? duration * BASE_PX_PER_SECOND : 500)
    : zoom;

  const zoomIn = () => setZoom(Math.min(zoom * 1.25, 10));
  const zoomOut = () => setZoom(Math.max(zoom / 1.25, minZoom));

  useEffect(() => {
    if (!containerRef.current || !duration) return;
    const el = containerRef.current;
    const viewportWidth = el.clientWidth;
    const playheadX = currentTime * pixelsPerSecond;
    el.scrollLeft = Math.max(playheadX - viewportWidth / 2, 0);
  }, [currentTime, pixelsPerSecond, duration]);

  return (
    <>
      {/* Zoom */}
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        <button
          onClick={zoomOut}
          disabled={zoom <= minZoom}
          className="px-2 py-1 bg-neutral-700 rounded disabled:opacity-40"
        >
          −
        </button>
        <button
          onClick={zoomIn}
          className="px-2 py-1 bg-neutral-700 rounded"
        >
          +
        </button>
      </div>

      <TimelineContainer ref={containerRef} width={width} height={height}>
        <TimelineRuler
          width={width}
          pixelsPerSecond={pixelsPerSecond}
          totalSeconds={duration || 60}
        />

        <TimelineBackground
          pixelsPerSecond={pixelsPerSecond}
          height={height}
        />
      </TimelineContainer>
    </>
  );
}
