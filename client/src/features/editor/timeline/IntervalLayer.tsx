"use client";

import React from "react";

const mockIntervals = [
  { id: "E1", start: 10, end: 20 },
  { id: "E2", start: 30, end: 45 },
  { id: "E3", start: 50, end: 70 },
];

export const IntervalLayer: React.FC = () => {
  return (
    <div className="relative h-full w-full">
      {mockIntervals.map((interval, index) => (
        <div
          key={interval.id}
          className="absolute bg-blue-500/60 hover:bg-blue-400 text-xs text-white flex items-center justify-center rounded-md"
          style={{
            left: `${interval.start}%`,
            width: `${interval.end - interval.start}%`,
            height: "60%",
            top: "20%",
          }}
        >
          {interval.id}
        </div>
      ))}
    </div>
  );
};
