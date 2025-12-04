"use client";

import React from "react";

interface TimelineContainerProps {
  width: number;
  children: React.ReactNode;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  width,
  children,
}) => {
  return (
    <div
      className="relative h-full"
      style={{
        width,
        minHeight: 80,
        overflow: "visible",
      }}
    >
      {children}
    </div>
  );
};
