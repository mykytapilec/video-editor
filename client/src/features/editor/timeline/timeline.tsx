"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import useStore from "@/features/editor/store/use-store";
import TimelineBlock from "./timeline-block";
import VideoThumbnailExtractor from "./video-thumbnail-extractor";

export default function Timeline() {
  const outerRef = useRef<HTMLDivElement | null>(null);

  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const trackItemIds = useStore((s) => s.trackItemIds);
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

  const items = useMemo(
    () =>
      trackItemIds
        .map((id) => trackItemsMap[id])
        .filter(
          (i): i is any =>
            !!i && i.type === "video" && (i.duration ?? 0) > 0
        ),
    [trackItemIds, trackItemsMap]
  );

  console.log(
    "🕒 Timeline render",
    "videoDuration =",
    videoDuration,
    "items =",
    items
  );

  return (
    <div className="relative w-full h-[240px] bg-gray-900 rounded-lg overflow-hidden">
      {/* thumbnails generator */}
      <VideoThumbnailExtractor />

      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700 text-white">
        <div className="text-sm font-medium">Timeline</div>

        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700"
            onClick={() =>
              useStore.getState().setZoom(Math.max(0.25, zoom - 0.25))
            }
          >
            −
          </button>

          <div className="text-xs w-12 text-center">
            {Math.round(zoom * 100)}%
          </div>

          <button
            className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700"
            onClick={() =>
              useStore.getState().setZoom(Math.min(4, zoom + 0.25))
            }
          >
            +
          </button>
        </div>
      </div>

      {/* content */}
      <div ref={outerRef} className="relative flex-1 overflow-x-auto">
        <div
          className="relative h-full"
          style={{ width: containerWidth * zoom }}
        >
          {items.map((item) => (
            <TimelineBlock key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
