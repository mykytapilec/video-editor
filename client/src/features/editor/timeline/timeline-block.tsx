"use client";

import React from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";

const PREVIEW_WIDTH = 120;

export default function TimelineBlock({ item }: { item: VideoTrackItem }) {
  const zoom = useStore((s) => s.zoom);
  const thumbnails = item.thumbnails ?? [];

  const fullWidth = (item.duration || 0) * zoom;

  const count = Math.ceil(fullWidth / PREVIEW_WIDTH);

  return (
    <div
      className="absolute top-4 h-16 flex overflow-hidden rounded bg-neutral-800"
      style={{
        left: (item.timelineStart ?? 0) * zoom,
        width: fullWidth,
      }}
    >
      {thumbnails.slice(0, count).map((thumb, i) => (
        <img
          key={i}
          src={thumb.src}
          className="h-full object-cover"
          style={{ width: PREVIEW_WIDTH }}
          draggable={false}
        />
      ))}
    </div>
  );
}
