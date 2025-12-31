"use client";

import useTimelineStore from "../store/use-timeline-store";

export default function GroupsList() {
  const groups = useTimelineStore((s) => s.groups);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const editingGroupId = useTimelineStore((s) => s.editingGroupId);

  const setSelectedGroupId = useTimelineStore((s) => s.setSelectedGroupId);
  const setEditingGroupId = useTimelineStore((s) => s.setEditingGroupId);
  const seekToGroup = useTimelineStore((s) => s.seekToGroup);
  const playGroup = useTimelineStore((s) => s.playGroup);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g, i) => {
        const isSelected = selectedGroupId === g.id;
        const isEditing = editingGroupId === g.id;

        return (
          <div
            key={g.id}
            onClick={() => {
              setSelectedGroupId(g.id);
              seekToGroup(g.id);
            }}
            className={`rounded border p-2 cursor-pointer ${
              isEditing
                ? "border-white bg-blue-600/40"
                : isSelected
                ? "border-blue-400 bg-blue-500/20"
                : "border-border"
            }`}
          >
            <div className="text-xs text-muted-foreground">
              #{i + 1}
            </div>

            <div className="text-sm line-clamp-3 mb-2">{g.text}</div>

            <div className="flex justify-between mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playGroup(g.id);
                }}
                className="text-xs text-green-400"
              >
                ▶ Play
              </button>

              <button
                disabled={!isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingGroupId(g.id);
                }}
                className="text-xs text-blue-400 disabled:opacity-30"
              >
                Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
