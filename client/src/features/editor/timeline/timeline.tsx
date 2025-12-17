"use client";

import React, { useRef, useState, useEffect, use } from "react";
import { VideoTrackItem } from "@/types";
import { TimelineBlock } from "./timeline-block";
import useStore from "../store/use-store";
import { TimelineContainer } from "./timeline-container";
import TimelineRuler from "./timeline-ruler";
import { useEditorStore } from "../store/use-editor-store";

const GRID_STEP = 0.5;

const Timeline: React.FC = () => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [zoom, setZoom] = useState<number>(1);
  const { trackItemsMap, videoDuration } = useStore();

  const groups = useEditorStore((s) => s.groups);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth || 800);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!videoDuration || videoDuration <= 0) {
    return (
      <div className="relative w-full h-[240px] bg-gray-900 rounded-lg overflow-hidden p-3">
        <div className="flex w-full h-full items-center justify-center text-gray-400">
          Timeline loading...
        </div>
      </div>
    );
  }

  const dur = Math.max(1, videoDuration);
  const pixelsPerSecond = (containerWidth * zoom) / dur;
  const timelineWidth = Math.max(containerWidth * zoom, 600);

  const videoItems = Object.values(trackItemsMap).filter(
    (it): it is VideoTrackItem => it.type === "video" && !!it.src
  );

  const minZoom = 1;
  const maxZoom = 8;
  const zoomStep = 0.5;

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
            totalSeconds={dur}
          />

          {videoItems.map((item) => {
            const itemCopy: VideoTrackItem = {
              ...item,
              duration: item.duration && item.duration > 0.1 ? item.duration : videoDuration,
              trim: item.trim ?? { start: 0, end: videoDuration },
              timelineStart: item.timelineStart ?? 0,
            };

            return (
              <TimelineBlock
                key={item.id}
                item={itemCopy}
                pixelsPerSecond={pixelsPerSecond}
                snapStep={GRID_STEP}
              />
            );
          })}
        </TimelineContainer>
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(minZoom, +(z - zoomStep).toFixed(2)))}
          className={`px-2 py-1 rounded-md ${
            zoom <= minZoom ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          disabled={zoom <= minZoom}
        >
          -
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(maxZoom, +(z + zoomStep).toFixed(2)))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
