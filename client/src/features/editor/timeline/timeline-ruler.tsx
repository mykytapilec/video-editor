import React from "react";

type Props = {
  width: number; 
  pixelsPerSecond: number;
};

export default function TimelineRuler({ width, pixelsPerSecond }: Props) {
  const seconds = Math.ceil(width / pixelsPerSecond);
  const ticks: number[] = [];
  const step = 1;
  for (let s = 0; s <= seconds; s += step) ticks.push(s);

  return (
    <div className="absolute top-0 left-0 h-6 w-full pointer-events-none">
      {ticks.map((t) => {
        const left = t * pixelsPerSecond;
        return (
          <div key={t} className="absolute top-0" style={{ left }}>
            <div style={{ height: 6, borderLeft: "1px solid rgba(255,255,255,0.3)" }} />
            <div
              className="text-white text-[10px] absolute top-6 left-1/2 -translate-x-1/2 select-none"
            >
              {t}s
            </div>
          </div>
        );
      })}
    </div>
  );
}
