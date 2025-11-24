import React, { useRef, useState } from "react";
import useStore from "../store/use-store";

interface Props {
  item: any; // ITrackItem
  pixelsPerSecond: number;
  onClick?: () => void;
}

const HANDLE_WIDTH = 6;

export const TimelineBlock = ({ item, pixelsPerSecond }: Props) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isLeftDragging, setIsLeftDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);

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

    const deltaPx = e.movementX;
    const deltaSec = deltaPx / pixelsPerSecond;

    if (isLeftDragging) {
      const newStart = Math.max(0, item.trim.start + deltaSec);
      const shift = newStart - item.trim.start;

      updateTrackItem(item.id, {
        trim: {
          ...item.trim,
          start: newStart,
        },
        timelineStart: item.timelineStart + shift,
      });
    }

    if (isRightDragging) {
      const newEnd = Math.max(item.trim.start + 0.1, item.trim.end + deltaSec);
      updateTrackItem(item.id, {
        trim: {
          ...item.trim,
          end: newEnd,
        },
      });
    }
  };

  const stop = () => {
    setIsLeftDragging(false);
    setIsRightDragging(false);
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
    };
  });

  const width =
    (item.trim.end - item.trim.start) * pixelsPerSecond;

  const left = item.timelineStart * pixelsPerSecond;

  return (
    <div
      ref={blockRef}
      className="relative bg-sky-400 rounded-sm"
      style={{
        position: "absolute",
        left,
        width,
        height: 32,
      }}
    >
      {/* LEFT HANDLE */}
      <div
        onMouseDown={onLeftDown}
        className="absolute left-0 top-0 h-full bg-blue-900 cursor-ew-resize"
        style={{ width: HANDLE_WIDTH }}
      />

      {/* RIGHT HANDLE */}
      <div
        onMouseDown={onRightDown}
        className="absolute right-0 top-0 h-full bg-blue-900 cursor-ew-resize"
        style={{ width: HANDLE_WIDTH }}
      />

      {/* label */}
      <div className="text-xs text-white px-2">
        {item.type} • {Math.round((item.trim.end - item.trim.start) * 1000) / 1000}s
      </div>
    </div>
  );
};
