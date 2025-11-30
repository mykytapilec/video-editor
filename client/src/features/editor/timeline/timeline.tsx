"use client";

import React, { useRef, useState } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem } from "@/types";
import { TimelineBlock } from "./timeline-block";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const { trackItemsMap } = useStore();

  const pixelsPerSecond = 80 * zoom;
  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item?.type === "video" && !!item.src
  );

  const maxEndSec = Math.max(
    ...videoItems.map((v) =>
      v.timelineStart && v.trim
        ? v.timelineStart + (v.trim.end - v.trim.start)
        : 10
    ),
    10
  );

  const gridLines = [];
  for (let t = 0; t <= maxEndSec; t += GRID_STEP) {
    gridLines.push(t);
  }

  return (
    <div className="relative w-full h-[200px] bg-gray-900 rounded-lg overflow-hidden p-3">
      <div className="absolute inset-0 pointer-events-none">
        {gridLines.map((t) => (
          <div
            key={t}
            className="absolute top-0 bottom-0 border-l border-gray-700"
            style={{
              left: t * pixelsPerSecond,
              opacity: t % 1 === 0 ? 0.3 : 0.1,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 px-2">
        {videoItems.map((item) => (
          <TimelineBlock
            key={item.id}
            item={item}
            pixelsPerSecond={pixelsPerSecond}
            snapStep={GRID_STEP}
          />
        ))}
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          -
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
