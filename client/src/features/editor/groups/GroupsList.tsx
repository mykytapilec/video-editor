"use client";

import { useState } from "react";
import useTimelineStore from "../store/use-timeline-store";
import { updateGroupApi } from "@/app/api/groups/groups.api";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GroupsList() {
  const groups = useTimelineStore((s) => s.groups);
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);

  const selectGroup = useTimelineStore((s) => s.selectGroup);
  const updateGroup = useTimelineStore((s) => s.updateGroup);
  const isGroupDirty = useTimelineStore((s) => s.isGroupDirty);
  const getGroupPatch = useTimelineStore((s) => s.getGroupPatch);
  const markGroupsAsOriginal = useTimelineStore(
    (s) => s.markGroupsAsOriginal
  );

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g, i) => {
        const isSelected = selectedGroupId === g.id;
        const isDirty = isGroupDirty(g.id);
        const isEditingText = editingTextId === g.id;

        const duration = g.end - g.start;

        return (
          <div
            key={g.id}
            onClick={() => selectGroup(g.id)}
            className={`rounded border p-2 cursor-pointer ${
              isSelected
                ? "border-blue-400 bg-blue-500/20"
                : "border-border"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1">
              #{i + 1}
            </div>

            {/* TEXT */}
            {isEditingText ? (
              <textarea
                className="w-full text-sm bg-black/20 border rounded p-1 mb-2"
                value={g.text}
                onChange={(e) =>
                  updateGroup(g.id, { text: e.target.value })
                }
                onBlur={() => setEditingTextId(null)}
                autoFocus
              />
            ) : (
              <div
                className="text-sm line-clamp-3 mb-2"
                onDoubleClick={() => setEditingTextId(g.id)}
              >
                {g.text}
              </div>
            )}

            {/* TIME INFO */}
            <div className="text-xs text-muted-foreground flex gap-3 mb-2">
              <span>start: {formatTime(g.start)}</span>
              <span>end: {formatTime(g.end)}</span>
              <span>duration: {formatTime(duration)}</span>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(g.id);
                }}
                className="text-xs text-blue-400"
              >
                Edit text
              </button>

              {isDirty && (
                <button
                  disabled={loadingId === g.id}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const patch = getGroupPatch(g.id);
                    if (!patch) return;

                    try {
                      setLoadingId(g.id);
                      await updateGroupApi(g.id, patch);
                      markGroupsAsOriginal();
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                  className="text-xs text-green-400 disabled:opacity-40"
                >
                  {loadingId === g.id ? "Updating..." : "Update"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
