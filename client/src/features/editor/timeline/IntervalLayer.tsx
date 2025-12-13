import React from "react";
import useStore from "@/features/editor/store/use-store";
import { TrackItem } from "@/types";

export const IntervalLayer: React.FC = () => {
  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const duration = useStore((s) => s.videoDuration) || 0;
  const trackItems: TrackItem[] = Object.values(trackItemsMap).filter(
    (i): i is TrackItem => i !== undefined && i !== null
  );

  if (duration <= 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center text-xs text-muted-foreground">
        Video not loaded — no duration
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {trackItems.map((item) => {
        const itemStart = Math.max(0, item.start ?? 0);
        const itemEnd = Math.max(itemStart + 0.01, item.end ?? itemStart + 0.01);
        const leftPercent = (itemStart / duration) * 100;
        const widthPercent = ((itemEnd - itemStart) / duration) * 100;

        return (
          <div
            key={item.id}
            className="absolute bg-blue-500/40 rounded-md"
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              height: "20px",
              top: "calc(50% - 10px)",
            }}
          />
        );
      })}
    </div>
  );
};

export default IntervalLayer;
