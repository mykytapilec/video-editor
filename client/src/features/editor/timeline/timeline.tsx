"use client";

import React, { useRef, useState } from "react";
import { VideoThumbnail } from "../components/VideoThumbnail";
import StateManager from "@designcombo/state";

interface Interval {
  id: string;
  start: number;
  end: number;
  label: string;
}

interface TimelineProps {
  videoSrc?: string;
  intervals?: Interval[];
  stateManager: StateManager;
}

const Timeline: React.FC<TimelineProps> = ({
  videoSrc = "/videos/Bridgertone.mp4",
  intervals = [
    { id: "1", start: 0, end: 3, label: "E1" },
    { id: "2", start: 4, end: 7, label: "E2" },
  ],
}) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220px] bg-gray-900 rounded-lg overflow-hidden p-3 select-none"
    >
      <div
        className="absolute inset-0 flex items-end gap-1 overflow-x-hidden"
        style={{ filter: "grayscale(100%)", transform: `scaleX(${zoom})` }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <VideoThumbnail
            key={i}
            src={videoSrc}
            currentTime={i}
            width={80}
            height={60}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-end gap-2 px-2">
        {intervals.map((int) => (
          <div
            key={int.id}
            className="relative bg-blue-500/60 border border-blue-400 rounded-md text-white text-xs font-medium text-center shadow-md"
            style={{
              position: "absolute",
              left: `${int.start * 10 * zoom}px`,
              width: `${(int.end - int.start) * 10 * zoom}px`,
              height: "60px",
              bottom: "10px",
            }}
          >
            {int.label}
          </div>
        ))}
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => handleZoom(-0.2)}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          -
        </button>
        <button
          onClick={() => handleZoom(0.2)}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
