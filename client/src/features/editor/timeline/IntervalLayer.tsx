"use client";

import React, { JSX } from "react";
import useStore from "../store/use-store";

interface IntervalLayerProps {
  zoom: number;
}

export const IntervalLayer: React.FC<IntervalLayerProps> = ({ zoom }) => {
  const { trackItemsMap } = useStore();

  const pixelsPerSecond = 100 * zoom;

  const maxEnd = Math.max(
    ...Object.values(trackItemsMap).map(
      (item) => (item.timelineStart ?? 0) + (item.duration ?? 0)
    ),
    10
  );

  const step = (() => {
    if (zoom < 0.5) return 5;
    if (zoom < 1.0) return 2;
    if (zoom < 2.0) return 1;
    return 0.5;
  })();

  const marks: JSX.Element[] = [];
  for (let t = 0; t <= maxEnd; t += step) {
    const left = t * pixelsPerSecond;
    marks.push(
      <div
        key={t}
        className="absolute flex flex-col items-center"
        style={{ left }}
      >
        <div className="w-px h-6 bg-neutral-700" />
        <div className="text-xs text-neutral-500 mt-1 select-none">
          {t.toFixed(step >= 1 ? 0 : 1)}s
        </div>
      </div>
    );
  }

  return <div className="relative h-full">{marks}</div>;
};
