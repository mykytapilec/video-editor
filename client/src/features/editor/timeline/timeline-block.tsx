"use client";

import React from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";

const PREVIEW_WIDTH = 120;
const MIN_BLOCK_WIDTH = 40;

export default function TimelineBlock({ item }: { item: VideoTrackItem }) {
  const zoom = useStore((s) => s.zoom);
  const thumbnails = item.thumbnails ?? [];

  const fullWidth = Math.max((item.duration || 0) * zoom, MIN_BLOCK_WIDTH);
  const count = Math.ceil(fullWidth / PREVIEW_WIDTH);

  return (
    <div
      className="absolute top-4 h-16 flex overflow-hidden rounded bg-neutral-800 border border-neutral-700"
      style={{
        left: (item.timelineStart ?? 0) * zoom,
        width: fullWidth,
      }}
    >
      {thumbnails.length > 0 ? (
        thumbnails.slice(0, count).map((thumb, i) => (
          <img
            key={i}
            src={thumb.src}
            className="h-full object-cover"
            style={{ width: PREVIEW_WIDTH }}
            draggable={false}
          />
        ))
      ) : (
        <div className="h-full w-full bg-neutral-700 flex items-center justify-center text-xs text-gray-400">
          loading preview…
        </div>
      )}
    </div>
  );
}
