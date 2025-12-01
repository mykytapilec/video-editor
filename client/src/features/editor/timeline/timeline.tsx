"use client";

import React, { useRef, useState } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem } from "@/types";
import { TimelineBlock } from "./timeline-block";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const { trackItemsMap, videoDuration } = useStore();

  const pixelsPerSecond = 80 * zoom;

  const totalDuration = videoDuration ?? 10;

  const gridLines: number[] = [];
  for (let t = 0; t <= totalDuration; t += GRID_STEP) gridLines.push(t);

  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item.type === "video" && !!item.src
  );

  return (
    <div className="relative w-full h-[200px] bg-gray-900 rounded-lg overflow-hidden p-3">

      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div
          className="absolute top-1/2 -translate-y-1/2 bg-gray-700 rounded-sm"
          style={{
            left: 0,
            width: totalDuration * pixelsPerSecond,
            height: 20,
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {gridLines.map((t) => (
          <div key={t} className="absolute top-0 bottom-0" style={{ left: t * pixelsPerSecond }}>
            <div
              className="border-l border-gray-600"
              style={{ opacity: t % 1 === 0 ? 0.4 : 0.1, height: "100%" }}
            />
            {t % 1 === 0 && (
              <div className="absolute top-0 left-0 text-gray-300 text-[10px]">{t}s</div>
            )}
          </div>
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
