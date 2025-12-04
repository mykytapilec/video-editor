import React from "react";

type Props = {
  width: number;
  pixelsPerSecond: number;
};

export default function TimelineRuler({ width, pixelsPerSecond }: Props) {
  const totalSec = Math.ceil(width / pixelsPerSecond);

  let step = 1;

  if (totalSec > 30 && totalSec <= 120) step = 5;
  else if (totalSec > 120 && totalSec <= 600) step = 15;
  else if (totalSec > 600 && totalSec <= 3600) step = 60;
  else if (totalSec > 3600) step = 300;

  const ticks: number[] = [];
  for (let t = 0; t <= totalSec; t += step) ticks.push(t);

  return (
    <div className="relative w-full h-6">
      <div className="absolute inset-0">
        {ticks.map((t) => {
          const left = t * pixelsPerSecond;
          return (
            <div
              key={t}
              className="absolute flex flex-col items-center"
              style={{ left, transform: "translateX(-50%)" }}
            >
              <div
                style={{
                  height: 8,
                  borderLeft: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {formatTime(t)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");

  return `${m}:${s}`;
}
