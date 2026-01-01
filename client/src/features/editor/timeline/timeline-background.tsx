"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import useTimelineStore from "../store/use-timeline-store";
import useThumbnails from "../hooks/use-thumbnails";
import { useEditorStore } from "../store/use-editor-store";

interface Props {
  pixelsPerSecond: number;
  height: number;
}

export default function TimelineBackground({ pixelsPerSecond, height }: Props) {
  const currentVideoSrc = useEditorStore((s) => s.currentVideoSrc);
  const videoDuration = useTimelineStore((s) => s.videoDuration);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);

  const thumbWidthPx = 120;
  const maxThumbs = 30;

  useEffect(() => {
    const handle = () => {
      if (!scrollRef.current) return;
      setVisibleStart(scrollRef.current.scrollLeft / pixelsPerSecond);
      setVisibleWidth(scrollRef.current.clientWidth || 1);
    };

    handle();
    window.addEventListener("resize", handle);
    scrollRef.current?.addEventListener("scroll", handle);

    return () => {
      window.removeEventListener("resize", handle);
      scrollRef.current?.removeEventListener("scroll", handle);
    };
  }, [pixelsPerSecond]);

  const thumbsCount = useMemo(() => {
    if (!visibleWidth) return 1;
    return Math.min(
      Math.max(1, Math.ceil(visibleWidth / thumbWidthPx)),
      maxThumbs
    );
  }, [visibleWidth]);

  const times = useMemo(() => {
    if (!videoDuration || !thumbsCount) return [];
    const arr: number[] = [];

    for (let i = 0; i < thumbsCount; i++) {
      const t =
        visibleStart +
        (i / Math.max(1, thumbsCount - 1)) *
          (visibleWidth / pixelsPerSecond);

      arr.push(Math.min(t, videoDuration));
    }

    return arr;
  }, [
    visibleStart,
    visibleWidth,
    thumbsCount,
    pixelsPerSecond,
    videoDuration,
  ]);

  const { thumbs, loading } = useThumbnails(
    videoDuration ? "background" : undefined,
    currentVideoSrc,
    times,
    {
      width: thumbWidthPx,
      height,
      maxThumbs,
      crossOrigin: "anonymous",
    }
  );

  const width = (videoDuration || 1) * pixelsPerSecond;

  return (
    <div
      ref={scrollRef}
      className="relative w-full h-full bg-black overflow-x-auto select-none"
      style={{ width, height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          Loading timeline preview…
        </div>
      )}

      {!loading && thumbs && thumbs.length > 0 && (
        <div className="absolute inset-0 flex h-full">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover grayscale"
                style={{ width: `${100 / thumbs.length}%`, height: "100%" }}
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
