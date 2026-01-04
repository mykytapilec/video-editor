"use client";

import { useState } from "react";
import useTimelineStore from "../store/use-timeline-store";
import { updateGroupApi } from "@/app/api/groups/groups.api";
import { useApiModalStore } from "../store/use-api-modal-store";

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
  const revertGroup = useTimelineStore((s) => s.revertGroup);
  const markGroupsAsOriginal = useTimelineStore(
    (s) => s.markGroupsAsOriginal
  );

  const openApiModal = useApiModalStore((s) => s.open);

  const [editingTextId, setEditingTextId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g, i) => {
        const id = Number(g.id);
        const isSelected = selectedGroupId === id;
        const isDirty = isGroupDirty(id);
        const isEditingText = editingTextId === id;
        const duration = g.end - g.start;

        return (
          <div
            key={g.id}
            onClick={() => selectGroup(id)}
            className={`rounded border p-2 cursor-pointer ${
              isSelected
                ? "border-blue-400 bg-blue-500/20"
                : "border-border"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1">
              #{i + 1}
            </div>

            {isEditingText ? (
              <textarea
                className="w-full text-sm bg-black/20 border rounded p-1 mb-2"
                value={g.text}
                onChange={(e) =>
                  updateGroup(id, { text: e.target.value })
                }
                onBlur={() => setEditingTextId(null)}
                autoFocus
              />
            ) : (
              <div
                className="text-sm line-clamp-3 mb-2"
                onDoubleClick={() => setEditingTextId(id)}
              >
                {g.text}
              </div>
            )}

            <div className="text-xs text-muted-foreground flex gap-3 mb-2">
              <span>start: {formatTime(g.start)}</span>
              <span>end: {formatTime(g.end)}</span>
              <span>duration: {formatTime(duration)}</span>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(id);
                }}
                className="text-xs text-blue-400"
              >
                Edit text
              </button>

              {isDirty && (
                <button
                  disabled={loadingId === id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const patch = getGroupPatch(id);
                    if (!patch) return;

                    openApiModal({
                      title: "Update group",
                      description: `Update group #${i + 1}?`,
                      confirmText: "Update",
                      cancelText: "Cancel",
                      onConfirm: async () => {
                        try {
                          setLoadingId(id);
                            await updateGroupApi(String(id), patch);
                          markGroupsAsOriginal();
                        } finally {
                          setLoadingId(null);
                        }
                      },
                      onCancel: () => revertGroup(id),
                    });
                  }}
                  className="text-xs text-green-400"
                >
                  Update
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
