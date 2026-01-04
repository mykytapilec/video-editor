"use client";

import { useState } from "react";
import { TimelineGroup } from "@/types";
import { useApiModalStore } from "../store/use-api-modal-store";
import { updateGroupApi, deleteGroupApi } from "@/app/api/groups/groups.api";
import useTimelineStore from "../store/use-timeline-store";
import { formatTime } from "@/utils/format-time";

interface Props {
  group: TimelineGroup;
  index: number;
}

export default function GroupItem({ group, index }: Props) {
  const selectGroup = useTimelineStore((s) => s.selectGroup);
  const isGroupDirty = useTimelineStore((s) => s.isGroupDirty);
  const getGroupPatch = useTimelineStore((s) => s.getGroupPatch);
  const updateGroup = useTimelineStore((s) => s.updateGroup);
  const revertGroup = useTimelineStore((s) => s.revertGroup);
  const deleteGroup = useTimelineStore((s) => s.deleteGroup);

  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);

  const openApiModal = useApiModalStore((s) => s.open);

  const [editingText, setEditingText] = useState(false);

  const handleDelete = () => {
    openApiModal({
      title: "Delete group",
      description: `Are you sure you want to delete group #${index + 1}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        await deleteGroupApi(group.id);
        deleteGroup(Number(group.id));
      },
    });
  };

  const handleUpdate = () => {
    const patch = getGroupPatch(Number(group.id));
    if (!patch) return;

    openApiModal({
      title: "Update group",
      description: `Update group #${index + 1}?`,
      confirmText: "Update",
      cancelText: "Cancel",
      onConfirm: async () => {
        await updateGroupApi(String(group.id), patch);
        updateGroup(Number(group.id), patch);
      },
      onCancel: () => {
        revertGroup(Number(group.id));
      },
    });
  };

  const dirty = isGroupDirty(Number(group.id));

  return (
    <div
      onClick={() => selectGroup(Number(group.id))}
      className={`rounded border p-2 cursor-pointer ${
        selectedGroupId === Number(group.id)
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
            updateGroup(Number(group.id), { text: e.target.value })
          }
          onBlur={() => setEditingText(false)}
          autoFocus
        />
      ) : (
        <div
          className="text-sm line-clamp-3 mb-2 relative"
          onDoubleClick={() => setEditingText(true)}
        >
          {group.text}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingText(true);
            }}
            className="text-xs text-blue-400 absolute bottom-0 right-0"
          >
            Edit
          </button>
        </div>
      )}

      <div className="text-xs text-muted-foreground flex gap-3 mb-2">
        <span>start: {formatTime(group.start)}</span>
        <span>end: {formatTime(group.end)}</span>
        <span>duration: {formatTime(group.end - group.start)}</span>
      </div>

      <div className="flex gap-2">
        {dirty && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdate();
            }}
            className="text-xs text-green-400"
          >
            Update
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-xs text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
