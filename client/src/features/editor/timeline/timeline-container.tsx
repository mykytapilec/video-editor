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
    <div className="relative w-full overflow-x-auto overflow-y-hidden">
      <div
        className="relative select-none"
        style={{
          width,
          height: 100,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TimelineContainer;
