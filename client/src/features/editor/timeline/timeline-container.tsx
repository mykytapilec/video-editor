"use client";

import React from "react";

interface TimelineContainerProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  width,
  height,
  children,
}) => {
  return (
    <div
      className="relative select-none"
      style={{
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};
