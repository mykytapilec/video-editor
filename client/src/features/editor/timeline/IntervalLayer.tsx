// client/src/features/editor/timeline/IntervalLayer.tsx
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
        Видео не загружено — нет длительности (нет интервалов)
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {trackItems.map((item) => {
        const itemStart = Math.max(0, item.start ?? 0);
        const itemEnd = Math.max(itemStart + 0.01, item.end ?? itemStart + 0.01);
        const leftPercent = Math.max(0, (itemStart / duration) * 100);
        const widthPercent = Math.max(0.1, ((itemEnd - itemStart) / duration) * 100);

        return (
          <div
            key={item.id}
            className="absolute bg-blue-500/60 hover:bg-blue-400 text-xs text-white flex items-center justify-center rounded-md"
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              height: "60%",
              top: "20%",
            }}
            title={item.name || String(item.id)}
          >
            <div className="truncate px-2">{item.name ?? ""}</div>
          </div>
        );
      })}
    </div>
  );
};

export default IntervalLayer;
