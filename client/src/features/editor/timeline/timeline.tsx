"use client";

import React, { useRef, useState } from "react";
import { VideoTrackItem } from "@/types";
import TimelineBlock from "./timeline-block";
import useStore from "../store/use-store";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const { trackItemsMap } = useStore();

  const pixelsPerSecond = 80 * zoom;
  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item.type === "video" && !!item.src
  );

  const maxEndSec = Math.max(...videoItems.map((v) => v.duration ?? 10), 10);

  const gridLines: number[] = [];
  for (let t = 0; t <= maxEndSec; t += GRID_STEP) gridLines.push(t);

  return (
    <div className="relative w-full h-[220px] bg-gray-900 rounded-lg overflow-hidden p-3">
      {/* Background full-length track(s) (visual only) */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        {videoItems.map((item) => (
          <div
            key={item.id}
            className="absolute top-1/2 -translate-y-1/2 bg-gray-700 rounded-sm"
            style={{
              left: 0,
              width: (item.duration ?? 10) * pixelsPerSecond,
              height: 48,
            }}
          />
        ))}
      </div>

      {/* Grid (seconds labelled) */}
      <div className="absolute inset-0 pointer-events-none">
        {gridLines.map((t) => (
          <div key={t} className="absolute top-0 bottom-0" style={{ left: t * pixelsPerSecond }}>
            <div
              className="border-l border-gray-600"
              style={{ opacity: t % 1 === 0 ? 0.45 : 0.12, height: "100%" }}
            />
            {t % 1 === 0 && (
              <div className="absolute top-1 left-1 text-gray-300 text-[10px] select-none">
                {t}s
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blocks (interactive; handles + drag are in block) */}
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

      {/* Zoom */}
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
