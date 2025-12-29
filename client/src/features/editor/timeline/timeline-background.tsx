"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);

  const thumbWidthPx = 120;
  const maxThumbs = 30;

  useEffect(() => {
    const handle = () => {
      if (scrollRef.current) {
        setVisibleStart(scrollRef.current.scrollLeft / pixelsPerSecond);
        setVisibleWidth(scrollRef.current.clientWidth);
      }
    };

    handle();
    window.addEventListener("resize", handle);
    if (scrollRef.current) scrollRef.current.addEventListener("scroll", handle);

    return () => {
      window.removeEventListener("resize", handle);
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", handle);
    };
  }, [pixelsPerSecond]);

  const thumbsCount = Math.min(
    Math.ceil(visibleWidth / thumbWidthPx),
    maxThumbs
  );

  const times = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < thumbsCount; i++) {
      const t =
        visibleStart +
        (i / Math.max(1, thumbsCount - 1)) * (visibleWidth / pixelsPerSecond);
      arr.push(Math.min(t, videoDuration));
    }
    return arr;
  }, [visibleStart, visibleWidth, thumbsCount, pixelsPerSecond, videoDuration]);

  const { thumbs, loading } = useThumbnails("background", currentVideoSrc, times, {
    width: thumbWidthPx,
    height,
    maxThumbs,
    crossOrigin: "anonymous",
  });

  const width = videoDuration * pixelsPerSecond;

  return (
    <div
      ref={scrollRef}
      className="relative w-full h-full bg-black overflow-x-auto select-none"
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
              <div key={i} className="flex-1 bg-black" />
            )
          )}
        </div>
      )}
    </div>
  );
}
