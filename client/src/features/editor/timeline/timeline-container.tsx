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
      className="relative select-none"
      style={{
        width,
        minHeight: 120,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

export default TimelineContainer;
