import React from "react";

type Props = {
  width: number; 
  pixelsPerSecond: number;
};

export default function TimelineRuler({ width, pixelsPerSecond }: Props) {
  const seconds = Math.ceil(width / pixelsPerSecond);
  const ticks: number[] = [];
  const approxPxPerTick = 80;
  const stepSec = Math.max(1, Math.round(approxPxPerTick / Math.max(1, pixelsPerSecond)));

  for (let s = 0; s <= seconds + stepSec; s += stepSec) ticks.push(s);

  return (
    <div className="w-full h-6 relative">
      <div className="absolute inset-0 flex items-end">
        <div style={{ width, height: 24, position: "relative" }}>
          {ticks.map((t) => {
            const left = t * pixelsPerSecond;
            return (
              <div key={t} style={{ position: "absolute", left }}>
                <div style={{ height: 8, borderLeft: "1px solid rgba(255,255,255,0.12)" }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, transform: "translateX(-50%)" }}>
                  {new Date(t * 1000).toISOString().substr(14, 5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
