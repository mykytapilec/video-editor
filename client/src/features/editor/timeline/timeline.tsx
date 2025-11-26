"use client";

import React, { useRef, useState } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem } from "@/types";

interface VideoThumbnailProps {
  src: string;
  width: number;
  height: number;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ src, width, height }) => {
  return <video src={src} className="object-cover" style={{ width, height }} muted controls={false} preload="metadata" />;
};

interface TimelineBlockProps {
  item: VideoTrackItem;
  pixelsPerSecond: number;
}

const TimelineBlock: React.FC<TimelineBlockProps> = ({ item, pixelsPerSecond }) => {
  const width = (item.end - item.start) * pixelsPerSecond;

  return (
    <div
      className="absolute top-0 h-full bg-blue-500/60 rounded"
      style={{
        left: item.start * pixelsPerSecond,
        width,
      }}
    >
      <span className="text-xs text-white ml-1">{item.name}</span>
    </div>
  );
};

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const { trackItemsMap } = useStore();

  const pixelsPerSecond = 50;
  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item?.type === "video" && !!item.src
  );

  return (
    <div className="relative w-full h-[220px] bg-gray-900 rounded-lg overflow-hidden p-3">
      <div
        className="absolute inset-0 flex items-end gap-1 overflow-x-auto"
        style={{ transform: `scaleX(${zoom})` }}
        ref={containerRef}
      >
        {videoItems.map((item) => (
          <VideoThumbnail key={item.id} src={item.src!} width={80} height={60} />
        ))}
      </div>

      <div className="absolute inset-0 px-2">
        {videoItems.map((item) => (
          <TimelineBlock key={item.id} item={item} pixelsPerSecond={pixelsPerSecond} />
        ))}
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button onClick={() => setZoom((z) => Math.max(0.5, Math.min(3, z - 0.2)))} className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600">
          -
        </button>
        <button onClick={() => setZoom((z) => Math.max(0.5, Math.min(3, z + 0.2)))} className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600">
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
