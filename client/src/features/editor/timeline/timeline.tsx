"use client";

import React, { useState, useRef, useEffect } from "react";
import { TimelineContainer } from "./timeline-container";
import TimelineRuler from "./timeline-ruler";

const Timeline: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [baseWidth, setBaseWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoom((z) => Math.min(Math.max(z + delta, 0.25), 4));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      setBaseWidth(containerRef.current!.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const width = baseWidth * zoom;
  const pixelsPerSecond = 100 * zoom;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-40 bg-neutral-800 rounded-xl overflow-hidden select-none"
    >
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={() => handleZoom(0.25)}
          className="bg-neutral-700 px-2 py-1 rounded hover:bg-neutral-600"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.25)}
          className="bg-neutral-700 px-2 py-1 rounded hover:bg-neutral-600"
        >
          −
        </button>
      </div>

      <TimelineContainer width={width}>
        <TimelineRuler width={width} pixelsPerSecond={pixelsPerSecond} />
      </TimelineContainer>
    </div>
  );
};

export default Timeline;
