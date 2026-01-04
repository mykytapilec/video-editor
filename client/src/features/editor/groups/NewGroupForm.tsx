"use client";

import { useState } from "react";
import useTimelineStore from "../store/use-timeline-store";
import { createGroupApi } from "@/app/api/groups/groups.api";

const format = (s?: number) =>
  s == null
    ? ""
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function NewGroupForm() {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const groups = useTimelineStore((s) => s.groups);
  const setGroups = useTimelineStore((s) => s.setGroups);
  const draftGroup = useTimelineStore((s) => s.draftGroup);
  const setDraftGroup = useTimelineStore((s) => s.setDraftGroup);

  const setCreateMode = useTimelineStore((s: any) => s.setCreateMode);

  const handleCreateClick = () => {
    setDraftGroup({ text: "" });
    setCreating(true);
    setCreateError(null);
  };

  const handleCancel = () => {
    setDraftGroup(null);
    setCreating(false);
    setCreateError(null);
    setCreateMode(null);
  };

  const ready =
    draftGroup?.text &&
    draftGroup.start != null &&
    draftGroup.end != null;

  const handleCreate = async () => {
  if (!draftGroup) return;
  try {
    const nextIdx = groups.length + 1;
        const newGroup = await createGroupApi({
        start: draftGroup.start!,
        end: draftGroup.end!,
        text: draftGroup.text!,
        sourceId: 0,
        name: draftGroup.text!,
        idx: nextIdx,
    });


    setGroups([...groups, newGroup]);
    setDraftGroup(null);
    setCreating(false);
    setCreateMode(null);
    setCreateError(null);
  } catch (e: any) {
    console.error(e);
    setCreateError("Failed to create group on server");
  }
};

  return (
    <div>
      <button
        className="px-2 mb-3 py-1 bg-blue-500 text-white rounded w-fit"
        onClick={handleCreateClick}
      >
        Create New Group
      </button>

      {creating && draftGroup && (
        <div className="p-3 border rounded bg-gray-800 flex flex-col gap-2">
          <p className="text-md text-gray-300">
            {!draftGroup.text &&
              "Enter a description to create a new group."}
            {draftGroup.text &&
              draftGroup.start == null &&
              "Select a start point on the timeline."}
            {draftGroup.start != null &&
              draftGroup.end == null &&
              "Select an end point on the timeline."}
            {ready && "Group range is valid. You can create the group."}
          </p>

          <input
            placeholder="Group description"
            value={draftGroup.text}
            onChange={(e) =>
              setDraftGroup({ ...draftGroup, text: e.target.value })
            }
            className="p-1 rounded"
          />

          <div className="flex gap-2 w-full max-w-full">
            <input
                readOnly
                placeholder="Start"
                value={format(draftGroup.start)}
                onClick={() => setCreateMode("selectingStart")}
                className="flex-1 p-1 rounded cursor-pointer min-w-0"
            />
            <input
                readOnly
                placeholder="End"
                value={format(draftGroup.end)}
                onClick={() => setCreateMode("selectingEnd")}
                className="flex-1 p-1 rounded cursor-pointer min-w-0"
            />
          </div>

          {createError && (
            <p className="text-sm text-red-400">{createError}</p>
          )}

          <div className="flex gap-2">
            <button
              disabled={!ready}
              onClick={handleCreate}
              className="px-2 py-1 bg-green-500 disabled:opacity-40 rounded"
            >
              Create
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-red-500 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
