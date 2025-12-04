"use client";

import React, { useRef, useState } from "react";
import { VideoTrackItem } from "@/types";
import { TimelineBlock } from "./timeline-block";
import useStore from "../store/use-store";
import { TimelineContainer } from "./timeline-container";
import TimelineRuler from "./timeline-ruler";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const { trackItemsMap, videoDuration } = useStore();

  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item.type === "video" && !!item.src
  );

  const maxEndSec = Math.max(...videoItems.map((v) => v.duration ?? 10), 10);

  const pixelsPerSecond = 80 * zoom;
  const width = Math.max(maxEndSec * pixelsPerSecond, 600);

  return (
    <div className="relative w-full h-[240px] bg-gray-900 rounded-lg overflow-hidden p-3">
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <TimelineContainer width={width}>
          <TimelineRuler width={width} pixelsPerSecond={pixelsPerSecond} />

          {videoItems.map((item) => (
            <TimelineBlock
              key={item.id}
              item={item}
              pixelsPerSecond={pixelsPerSecond}
              snapStep={GRID_STEP}
            />
          ))}
        </TimelineContainer>
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          -
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(6, z + 0.2))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
