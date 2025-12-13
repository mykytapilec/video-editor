// client/src/features/editor/timeline/timeline.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem } from "@/types";
import { TimelineContainer } from "./timeline-container";
import TimelineRuler from "./timeline-ruler";
import TimelineBlock from "./timeline-block";

const Timeline: React.FC = () => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const videoDuration = useStore((s) => s.videoDuration);
  const zoom = useStore((s) => s.zoom);
  const setContainerWidth = useStore((s) => s.setContainerWidth);

  const [containerWidth, setLocalWidth] = useState(800);

  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver(() => {
      const w = outerRef.current!.clientWidth;
      setLocalWidth(w);
      setContainerWidth(w);
    });
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [setContainerWidth]);

  if (videoDuration <= 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-gray-400 bg-gray-900">
        Video not loaded — no duration
      </div>
    );
  }

  const pixelsPerSecond = (containerWidth * zoom) / videoDuration;
  const timelineWidth = Math.max(containerWidth * zoom, containerWidth);

  const items = Object.values(trackItemsMap).filter(
    (i): i is VideoTrackItem => i?.type === "video"
  );

  return (
    <div className="relative h-[240px] bg-gray-900 p-3">
      <div ref={outerRef} className="h-full overflow-x-auto">
        <TimelineContainer width={timelineWidth}>
          <TimelineRuler
            width={timelineWidth}
            pixelsPerSecond={pixelsPerSecond}
            totalSeconds={videoDuration}
          />

          {items.map((item) => (
            <TimelineBlock
              key={item.id}
              item={item}
              pixelsPerSecond={pixelsPerSecond}
              snapStep={0.5}
            />
          ))}
        </TimelineContainer>
      </div>
    </div>
  );
};

export default Timeline;
