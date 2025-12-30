"use client";

import { useEditorStore } from "../store/use-editor-store";
import useTimelineStore from "../store/use-store";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GroupsList() {
  const groups = useEditorStore((s) => s.groups);

  const setSelectedGroupId = useTimelineStore(
    (s) => s.setSelectedGroupId
  );
  const playGroup = useTimelineStore((s) => s.playGroup);

  if (!groups || groups.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No groups
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs">
      {groups.map((g) => {
        const duration = g.end - g.start;

        return (
          <div
            key={g.id}
            className="relative p-3 border rounded-md bg-muted/30 hover:bg-muted/50"
          >
            {/* ID */}
            <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">
              #{g.id}
            </div>

            {/* TEXT */}
            <div className="whitespace-normal break-words leading-snug mb-2">
              {g.text || "—"}
            </div>

            {/* TIMES */}
            <div className="space-y-0.5 text-muted-foreground mb-2">
              <div>start: {formatTime(g.start)}</div>
              <div>end: {formatTime(g.end)}</div>
              <div>duration: {formatTime(duration)}</div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center">
              <button
                className="hover:text-white"
                onClick={() => {
                  setSelectedGroupId(String(g.id));
                  playGroup(String(g.id));
                }}
              >
                ▶ Play
              </button>

              <button
                className="hover:text-white"
                onClick={() => {
                  setSelectedGroupId(String(g.id));
                }}
              >
                ✏ Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
