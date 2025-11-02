"use client";

import React from "react";

interface TimelineContainerProps {
  zoom: number;
  children: React.ReactNode;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  zoom,
  children,
}) => {
  return (
    <div
      className="relative h-full flex items-center"
      style={{
        width: `${100 * zoom}%`,
        transition: "width 0.2s ease",
      }}
    >
      <div className="absolute inset-0 bg-neutral-700 opacity-60" />
      {children}
    </div>
  );
};
