import React, { useRef, useState, useEffect } from "react";
import useStore from "../store/use-store";
import { VideoTrackItem, TrackItem } from "@/types";

interface Props {
  item: TrackItem;
  pixelsPerSecond: number;
  onClick?: () => void;
}

const HANDLE_WIDTH = 6;

export const TimelineBlock = ({ item, pixelsPerSecond }: Props) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isLeftDragging, setIsLeftDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [width, setWidth] = useState(0);

  const isVideo = (i: TrackItem): i is VideoTrackItem => i.type === "video";

  useEffect(() => {
    if (isVideo(item)) {
      const duration = item.trim ? item.trim.end - item.trim.start : item.duration ?? 0;
      setWidth(duration * pixelsPerSecond);
    } else {
      setWidth(0);
    }
  }, [item, pixelsPerSecond]);

  const onLeftDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLeftDragging(true);
  };

  const onRightDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRightDragging(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isLeftDragging && !isRightDragging) return;
    if (!isVideo(item)) return;

    const deltaPx = e.movementX;
    const deltaSec = deltaPx / pixelsPerSecond;

    if (isLeftDragging && item.trim) {
      const newStart = Math.max(0, item.trim.start + deltaSec);
      const shift = newStart - item.trim.start;

      updateTrackItem(item.id, {
        trim: { ...item.trim, start: newStart },
        timelineStart: (item.timelineStart ?? 0) + shift,
      });
    }

    if (isRightDragging && item.trim) {
      const newEnd = Math.max(item.trim.start + 0.1, item.trim.end + deltaSec);
      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }
  };

  const stop = () => {
    setIsLeftDragging(false);
    setIsRightDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
    };
  });

  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  return (
    <div
      ref={blockRef}
      className="relative bg-sky-400 rounded-sm"
      style={{ position: "absolute", left, width, height: 32 }}
    >
      {isVideo(item) && (
        <>
          <div
            onMouseDown={onLeftDown}
            className="absolute left-0 top-0 h-full bg-blue-900 cursor-ew-resize"
            style={{ width: HANDLE_WIDTH }}
          />
          <div
            onMouseDown={onRightDown}
            className="absolute right-0 top-0 h-full bg-blue-900 cursor-ew-resize"
            style={{ width: HANDLE_WIDTH }}
          />
        </>
      )}
      <div className="text-xs text-white px-2">
        {item.type} • {isVideo(item) && item.trim ? Math.round((item.trim.end - item.trim.start) * 1000) / 1000 : 0}s
      </div>
    </div>
  );
};
