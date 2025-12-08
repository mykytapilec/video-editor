import React from "react";

type Props = {
  width: number;
  pixelsPerSecond: number;
  totalSeconds: number;
};

export default function TimelineRuler({ width, pixelsPerSecond, totalSeconds }: Props) {
  const approxPxPerTick = 80;

  const candidates = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];

  let step = candidates[candidates.length - 1];
  for (let c of candidates) {
    if (c * pixelsPerSecond >= approxPxPerTick) {
      step = c;
      break;
    }
  }

  const ticks: number[] = [];
  for (let t = 0; t <= totalSeconds + 0.0001; t += step) ticks.push(Number(t.toFixed(3)));

  return (
    <div className="relative w-full h-6 pointer-events-none">
      <div className="absolute inset-0">
        {ticks.map((t, idx) => {
          const left = t * pixelsPerSecond;
          return (
            <div
              key={idx}
              className="absolute"
              style={{ left, transform: "translateX(-50%)" }}
            >
              <div style={{ height: 8, borderLeft: "1px solid rgba(255,255,255,0.2)" }} />
              <div style={{ fontSize: 11, marginTop: 2, color: "rgba(255,255,255,0.8)" }}>
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
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}
