"use client";

import React, { useEffect, useRef, useState } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem } from "@/types";

import { TimelineContainer } from "./timeline-container";
import TimelineRuler from "./timeline-ruler";
import TimelineBlock from "./timeline-block";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const outerRef = useRef<HTMLDivElement | null>(null);

  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const videoDuration = useStore((s) => s.videoDuration);
  const zoom = useStore((s) => s.zoom);
  const setContainerWidth = useStore((s) => s.setContainerWidth);

  const [containerWidth, setLocalContainerWidth] = useState(800);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth || 800;
      setLocalContainerWidth(w);
      setContainerWidth(w);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [setContainerWidth]);

  if (!videoDuration || videoDuration <= 0) {
    return (
      <div className="w-full h-[240px] bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
        Video not loaded — no duration
      </div>
    );
  }

  const duration = Math.max(1, videoDuration);
  const pixelsPerSecond = (containerWidth * zoom) / duration;
  const timelineWidth = Math.max(containerWidth * zoom, containerWidth);

  const videoItems: VideoTrackItem[] = Object.values(trackItemsMap).filter(
    (i): i is VideoTrackItem => i?.type === "video" && !!i.src
  );

  return (
    <div className="relative w-full h-[240px] bg-gray-900 rounded-lg overflow-hidden p-3">
      <div
        ref={outerRef}
        className="w-full h-full overflow-x-auto relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <TimelineContainer width={timelineWidth}>
          <TimelineRuler
            width={timelineWidth}
            pixelsPerSecond={pixelsPerSecond}
            totalSeconds={duration}
          />
          {videoItems.map((item) => {
            const safeItem: VideoTrackItem = {
              ...item,
              timelineStart: item.timelineStart ?? 0,
              trim: item.trim ?? { start: 0, end: duration },
              duration: item.duration && item.duration > 0 ? item.duration : duration,
            };

            return (
              <TimelineBlock
                key={item.id}
                item={safeItem}
                pixelsPerSecond={pixelsPerSecond}
                snapStep={GRID_STEP}
              />
            );
          })}
        </TimelineContainer>
      </div>
    </div>
  );
};

export default Timeline;
