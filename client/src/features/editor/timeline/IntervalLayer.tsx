import React from "react";
import useStore from "@/features/editor/store/use-store";
import { TrackItem } from "@/types";

export const IntervalLayer: React.FC = () => {
  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const trackItems: TrackItem[] = Object.values(trackItemsMap).filter(
    (i): i is TrackItem => i !== undefined && i !== null
  );

  return (
    <div className="relative h-full w-full">
      {trackItems.map((item) => (
        <div
          key={item.id}
          className="absolute bg-blue-500/60 hover:bg-blue-400 text-xs text-white flex items-center justify-center rounded-md"
          style={{
            left: `${item.start}%`,
            width: `${item.end - item.start}%`,
            height: "60%",
            top: "20%",
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};
