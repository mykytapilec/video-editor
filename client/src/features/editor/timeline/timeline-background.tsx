import React, { useMemo } from "react";
import useStore from "../store/use-store";
import useThumbnails from "../hooks/use-thumbnails";
import { useEditorStore } from "../store/use-editor-store";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineBackground({ pixelsPerSecond, height }: Props) {
  const currentVideoSrc = useEditorStore((s) => s.currentVideoSrc);
  const videoDuration = useStore((s) => s.videoDuration) || 1;

  const thumbsCount = 16;

  const times = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < thumbsCount; i++) {
      const t = (i / Math.max(1, thumbsCount - 1)) * videoDuration;
      arr.push(t);
    }
    return arr;
  }, [thumbsCount, videoDuration]);

  const { thumbs, loading } = useThumbnails("background", currentVideoSrc, times, {
    width: 120,
    height: 60,
    maxThumbs: thumbsCount,
    crossOrigin: "anonymous",
  });

  const width = videoDuration * pixelsPerSecond;

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden select-none"
      style={{ width, height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
          Loading...
        </div>
      )}

      {!loading && thumbs && thumbs.length > 0 && (
        <div className="absolute inset-0 flex h-full">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover filter grayscale"
                style={{ width: `${100 / thumbsCount}%`, height: "100%" }}
                alt={`thumb-${i}`}
                draggable={false}
              />
            ) : (
              <div
                key={i}
                className="flex-1 bg-black"
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
