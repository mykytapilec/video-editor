// client/src/features/editor/timeline/IntervalLayer.tsx
import React from "react";
import useStore from "@/features/editor/store/use-store";


export const IntervalLayer: React.FC = () => {
  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const duration = useStore((s) => s.videoDuration) || 0;

  if (duration <= 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center text-xs text-muted-foreground">
        No duration available
      </div>
    );
  }

  const itemStart = Math.max(0, trackItemsMap?.start ?? 0);
  const itemEnd = Math.max(itemStart + 0.01, trackItemsMap?.end ?? itemStart + 0.01);
  const leftPercent = Math.max(0, (itemStart / duration) * 100);
  const widthPercent = Math.max(0.1, ((itemEnd - itemStart) / duration) * 100);

  return (
    <div className="relative h-full w-full">
      <div
        key={trackItemsMap?.id}
        className="absolute bg-blue-500/60 hover:bg-blue-400 text-xs text-white flex items-center justify-center rounded-md"
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          height: "60%",
          top: "20%",
        }}
        title={trackItemsMap?.name || String(trackItemsMap?.id)}
      >
        <div className="truncate px-2">{trackItemsMap?.name ?? ""}</div>
      </div>
    </div>
  );
};

export default IntervalLayer;
