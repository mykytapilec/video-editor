import React from "react";
import useStore from "@/features/editor/store/use-store";

export const IntervalLayer: React.FC = () => {
  const trackItemsMap = useStore((state) => state.trackItemsMap);
  const trackItems = Object.values(trackItemsMap);

  return (
    <div className="relative h-full w-full">
      {trackItems.map((item: any) => (
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
          {item.name || item.id}
        </div>
      ))}
    </div>
  );
};
