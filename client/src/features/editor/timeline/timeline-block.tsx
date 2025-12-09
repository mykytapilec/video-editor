import React, { useRef, useState, useEffect } from "react";
import { VideoTrackItem } from "@/types";
import useStore from "../store/use-store";

interface Props {
  item: VideoTrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const TimelineBlock: React.FC<Props> = ({
  item,
  pixelsPerSecond,
  snapStep,
}) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);

  const videoDuration = useStore.getState().videoDuration || 0;

  const trim = item.trim ?? {
    start: item.start ?? 0,
    end:
      item.end ??
      (item.start ?? 0) + (item.duration ?? videoDuration ?? 1)
  };

  const duration = Math.max(
    0.01,
    (trim.end - trim.start) || item.duration || videoDuration || 1
  );

  const width = Math.max(1, duration * pixelsPerSecond);
  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  const snap = (val: number) => Math.round(val / snapStep) * snapStep;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaSec = e.movementX / pixelsPerSecond;

    if (isLeftResize && item.trim) {
      const newStart = snap(Math.max(0, (item.trim.start ?? trim.start) + deltaSec));
      const shift = newStart - (item.trim.start ?? trim.start);

      updateTrackItem(item.id, {
        trim: { ...item.trim, start: newStart },
        timelineStart: (item.timelineStart ?? 0) + shift,
      });
    }

    if (isRightResize && item.trim) {
      const newEnd = snap(
        Math.max(
          (item.trim.start ?? trim.start) + 0.01,
          (item.trim.end ?? trim.end) + deltaSec
        )
      );
      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }

    if (isDragging) {
      const newPos = snap(Math.max(0, (item.timelineStart ?? 0) + deltaSec));
      updateTrackItem(item.id, { timelineStart: newPos });
    }
  };

  const stopActions = () => {
    setIsDragging(false);
    setIsLeftResize(false);
    setIsRightResize(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  }, [isDragging, isLeftResize, isRightResize, item]);

  const onStartDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    setIsDragging(true);
  };

  return (
    <div
      ref={blockRef}
      className="absolute bg-gray-800 rounded-sm overflow-hidden select-none"
      style={{
        left,
        width,
        height: 100,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={onStartDrag}
    >
      <div className="w-full h-full overflow-hidden opacity-80">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        )}
      </div>

      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/50 rounded text-xs text-white">
        {formatTime(duration)}
      </div>

      <div
        data-handle="left"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsLeftResize(true);
        }}
        className="absolute left-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />

      <div
        data-handle="right"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsRightResize(true);
        }}
        className="absolute right-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />
    </div>
  );
};
