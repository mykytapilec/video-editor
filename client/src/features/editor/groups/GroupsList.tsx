"use client";

import useTimelineStore from "../store/use-timeline-store";

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function GroupsList() {
  const groups = useTimelineStore((s) => s.groups);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const selectGroup = useTimelineStore((s) => s.selectGroup);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g, i) => {
        const isSelected = selectedGroupId === g.id;
        const duration = g.end - g.start;

        return (
          <div
            key={g.id}
            onClick={() => selectGroup(g.id)}
            className={`rounded border p-2 cursor-pointer transition-colors ${
              isSelected
                ? "border-blue-400 bg-blue-500/20"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-muted-foreground">
                #{i + 1}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {formatTime(g.start)} – {formatTime(g.end)} ·{" "}
                {formatTime(duration)}
              </div>
            </div>

            <div className="text-sm line-clamp-3">
              {g.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
