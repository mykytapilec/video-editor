"use client";

import React, { useState, useRef, useEffect } from "react";
import { TimelineContainer } from "../timeline/timeline-container";
import { IntervalLayer } from "../timeline/IntervalLayer";

export interface TimelineProps {
  stateManager: any;
}

const Timeline: React.FC<TimelineProps> = ({ stateManager }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoom((z) => Math.min(Math.max(z + delta, 0.5), 4));
  };

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

      <TimelineContainer zoom={zoom}>
        <IntervalLayer />
      </TimelineContainer>
    </div>
  );
};

export default Timeline;
