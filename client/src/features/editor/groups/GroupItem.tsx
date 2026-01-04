"use client";

import { useState } from "react";
import { TimelineGroup } from "@/types";
import useTimelineStore from "../store/use-timeline-store";
import { updateGroupApi } from "@/app/api/groups/groups.api";
import { useApiModalStore } from "../store/use-api-modal-store";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  group: TimelineGroup;
  index: number;
}

export default function GroupItem({ group, index }: Props) {
  const id = Number(group.id);

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

  const [editingText, setEditingText] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSelected = selectedGroupId === id;
  const isDirty = isGroupDirty(id);
  const duration = group.end - group.start;

  return (
    <div
      onClick={() => selectGroup(id)}
      className={`rounded border p-2 cursor-pointer ${
        isSelected
          ? "border-blue-400 bg-blue-500/20"
          : "border-border"
      }`}
    >
      <div className="text-xs text-muted-foreground mb-1">
        #{index + 1}
      </div>

      {editingText ? (
        <textarea
          className="w-full text-sm bg-black/20 border rounded p-1 mb-2"
          value={group.text}
          onChange={(e) =>
            updateGroup(id, { text: e.target.value })
          }
          onBlur={() => setEditingText(false)}
          autoFocus
        />
      ) : (
        <div
          className="text-sm line-clamp-3 mb-2"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingText(true);
          }}
        >
          {group.text}
        </div>
      )}

      <div className="text-xs text-muted-foreground flex gap-3 mb-2">
        <span>start: {formatTime(group.start)}</span>
        <span>end: {formatTime(group.end)}</span>
        <span>duration: {formatTime(duration)}</span>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingText(true);
          }}
          className="text-xs text-blue-400"
        >
          Edit text
        </button>

        {isDirty && (
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              const patch = getGroupPatch(id);
              if (!patch) return;

              openApiModal({
                title: "Update group",
                description: `Update group #${index + 1}?`,
                confirmText: "Update",
                cancelText: "Cancel",
                onConfirm: async () => {
                  try {
                    setLoading(true);
                    await updateGroupApi(String(id), patch);
                    markGroupsAsOriginal();
                  } finally {
                    setLoading(false);
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
}
