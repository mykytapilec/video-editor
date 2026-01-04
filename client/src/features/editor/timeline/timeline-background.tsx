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
  const videoDuration = useTimelineStore((s) => s.videoDuration) || 1;

  const createMode = useTimelineStore((s) => s.createMode);
  const selectDraftStart = useTimelineStore((s) => s.selectDraftStart);
  const selectDraftEnd = useTimelineStore((s) => s.selectDraftEnd);
  const tempStart = useTimelineStore((s) => s.tempStart);
  const tempEnd = useTimelineStore((s) => s.tempEnd);

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
    scrollRef.current?.addEventListener("scroll", handle);

    return () => {
      window.removeEventListener("resize", handle);
      scrollRef.current?.removeEventListener("scroll", handle);
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
        (i / Math.max(1, thumbsCount - 1)) *
          (visibleWidth / pixelsPerSecond);
      arr.push(Math.min(t, videoDuration));
    }
    return arr;
  }, [visibleStart, visibleWidth, thumbsCount, pixelsPerSecond, videoDuration]);

  const { thumbs, loading } = useThumbnails(
    "background",
    currentVideoSrc,
    times,
    {
      width: thumbWidthPx,
      height,
      maxThumbs,
      crossOrigin: "anonymous",
    }
  );

  const onClick = (e: React.MouseEvent) => {
    if (createMode === "idle") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;

    if (createMode === "selectingStart") selectDraftStart(time);
    if (createMode === "selectingEnd") selectDraftEnd(time);
  };

  const width = videoDuration * pixelsPerSecond;

  return (
    <div
      ref={scrollRef}
      onClick={onClick}
      className="relative w-full h-full bg-black overflow-x-auto select-none"
      style={{ width, height }}
    >
      {tempStart != null && (
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500 z-50"
          style={{ left: tempStart * pixelsPerSecond }}
        />
      )}

      {tempEnd != null && (
        <div
          className="absolute top-0 bottom-0 w-px bg-orange-400 z-50"
          style={{ left: tempEnd * pixelsPerSecond }}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
          Loading…
        </div>
      )}

      {!loading && thumbs.length > 0 && (
        <div className="absolute inset-0 flex h-full">
          {thumbs.map((src, i) =>
            src ? (
              <img
                key={i}
                src={src}
                className="object-cover"
                style={{
                  width: `${100 / thumbsCount}%`,
                  height: "100%",
                }}
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
