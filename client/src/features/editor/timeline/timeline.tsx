"use client";

import React, { useRef, useState } from "react";
import { VideoThumbnail } from "../components/VideoThumbnail";
import { useEditorStore } from "../store/use-editor-store";
import useStore from "../store/use-store";

const Timeline: React.FC<{ videoSrc?: string }> = ({ videoSrc }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const groups = useEditorStore((s) => s.groups);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useEditorStore((s) => s.setSelectedGroupId);

  const { trackItemsMap, setActiveIds } = useStore();

  const handleGroupClick = (groupId: number) => {
    // try to find track item by numeric id in trackItemsMap
    const item = trackItemsMap[groupId];
    if (item && setActiveIds) {
      setActiveIds([groupId]);
    }
    setSelectedGroupId(groupId);
  };

  return (
    <div className="relative w-full h-[220px] bg-gray-900 rounded-lg overflow-hidden p-3">
      {/* timeline video thumbnails */}
      <div
        className="absolute inset-0 flex items-end gap-1 overflow-x-hidden"
        style={{ transform: `scaleX(${zoom})` }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <VideoThumbnail
            key={i}
            src={videoSrc ?? "/videos/Bridgertone.mp4"}
            currentTime={i}
            width={80}
            height={60}
          />
        ))}
      </div>

      {/* group blocks */}
      <div className="absolute inset-0 px-2">
        {groups.map((g) => (
          <div
            key={g.id}
            onClick={() => handleGroupClick(g.id)}
            className={`absolute bg-blue-500/60 border border-blue-400 text-xs text-white text-center rounded-md cursor-pointer ${
              selectedGroupId === g.id ? "ring-2 ring-yellow-400" : ""
            }`}
            style={{
              left: `${g.start * 10 * zoom}px`,
              width: `${(g.end - g.start) * 10 * zoom}px`,
              height: "60px",
              bottom: "10px",
            }}
          >
            {g.text}
          </div>
        ))}
      </div>

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
