"use client";

import React, { JSX } from "react";

interface IntervalLayerProps {
  zoom: number;
}

export const IntervalLayer: React.FC<IntervalLayerProps> = ({ zoom }) => {
  const pixelsPerSecond = 100 * zoom;

  const totalWidth = 20000;

  const totalSeconds = totalWidth / pixelsPerSecond;

  let step = 1;
  if (zoom < 0.7) step = 5;
  else if (zoom < 1.0) step = 2;
  else if (zoom < 2.0) step = 1;
  else step = 0.5;

  const marks: JSX.Element[] = [];

  for (let t = 0; t < totalSeconds; t += step) {
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
