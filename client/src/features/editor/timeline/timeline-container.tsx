// client/src/features/editor/timeline/timeline-container.tsx
"use client";

import React, { forwardRef } from "react";

interface TimelineContainerProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const TimelineContainer = forwardRef<HTMLDivElement, TimelineContainerProps>(
  ({ width, height, children }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full overflow-x-auto overflow-y-hidden"
      >
        <div
          className="relative select-none"
          style={{ width, height }}
        >
          {children}
        </div>
      </div>
    );
  }
);

TimelineContainer.displayName = "TimelineContainer";

export default TimelineContainer;
