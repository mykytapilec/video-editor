"use client";

import React, { useState, useRef, useEffect } from "react";
import { TimelineContainer } from "../timeline/timeline-container";
import { IntervalLayer } from "../timeline/IntervalLayer";
import { TimelineBlock } from "../timeline/timeline-block";
import useStore from "../store/use-store";

const Timeline: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [baseWidth, setBaseWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trackItemIds, trackItemsMap } = useStore();

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
      {/* Zoom controls */}
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
        {/* Шкала */}
        <IntervalLayer zoom={zoom} />

        {/* Блоки видео */}
        {trackItemIds.map((id) => {
          const item = trackItemsMap[id];
          if (!item) return null;

          return (
            <TimelineBlock
              key={id}
              item={item}
              pixelsPerSecond={pixelsPerSecond}
              snapStep={0.1} // шаг привязки
            />
          );
        })}
      </TimelineContainer>
    </div>
  );
};

export default Timeline;
