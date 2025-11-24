"use client";

import React, { useRef, useState, useEffect } from "react";
import { VideoThumbnail } from "../components/VideoThumbnail";
import useStore from "../store/use-store";
import useUploadStore from "../store/use-upload-store";
import { TimelineBlock } from "./timeline-block";
import useLayoutStore from "../store/use-layout-store";
import { VideoTrackItem } from "@/types";

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const { pixelsPerSecond } = useLayoutStore();
  const { trackItemsMap, addVideoTrackItem } = useStore();
  const { files } = useUploadStore();

  const videoFiles = files.filter(
    (f) => f.url || f.file?.type?.startsWith("video/")
  );

  useEffect(() => {
    videoFiles.forEach((f) => {
      if (f.url) {
        const exists = Object.values(trackItemsMap).some(
          (item): item is VideoTrackItem => item?.type === "video" && item.src === f.url
        );
        if (!exists) {
          addVideoTrackItem(f.url, { name: f.name ?? "External Video" });
        }
      }
    });
  }, [videoFiles, trackItemsMap, addVideoTrackItem]);

  const videoItems = Object.values(trackItemsMap).filter(
    (item): item is VideoTrackItem => item?.type === "video"
  );

  return (
    <div className="relative w-full h-[220px] bg-gray-900 rounded-lg overflow-hidden p-3">
      {/* timeline video thumbnails */}
      <div
        className="absolute inset-0 flex items-end gap-1 overflow-x-hidden"
        style={{ transform: `scaleX(${zoom})` }}
      >
        {videoItems.map((item) => (
          <VideoThumbnail
            key={item.id}
            src={item.src!}
            currentTime={0}
            width={80}
            height={60}
          />
        ))}
      </div>

      {/* group blocks */}
      <div className="absolute inset-0 px-2">
        {videoItems.map((g) => (
          <TimelineBlock
            key={g.id}
            item={g}
            pixelsPerSecond={pixelsPerSecond}
          />
        ))}
      </div>

      {/* zoom controls */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, Math.min(3, z - 0.2)))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          -
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, Math.min(3, z + 0.2)))}
          className="px-2 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Timeline;
