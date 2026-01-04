"use client";

import { useState } from "react";
import useTimelineStore from "../store/use-timeline-store";

const format = (s?: number) =>
  s == null
    ? ""
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function NewGroup() {
  const [creating, setCreating] = useState(false);

  const {
    draftGroup,
    setDraftGroup,
    commitDraftGroup,
    createError,
    setCreateMode,
  } = useTimelineStore();

  const handleCreateClick = () => {
    setDraftGroup({ text: "" });
    setCreating(true);
  };

  const handleCancel = () => {
    setDraftGroup(null);
    setCreating(false);
  };

  const ready =
    draftGroup?.text &&
    draftGroup.start != null &&
    draftGroup.end != null;

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
          <p className="text-sm text-gray-300">
            {!draftGroup.text &&
              "Enter a description to create a new group."}
            {draftGroup.text &&
              draftGroup.start == null &&
              "Select a start point on the timeline."}
            {draftGroup.start != null &&
              draftGroup.end == null &&
              "Select an end point on the timeline."}
            {ready &&
              "Group range is valid. You can create the group."}
          </p>

          <input
            placeholder="Group description"
            value={draftGroup.text}
            onChange={(e) =>
              setDraftGroup({ ...draftGroup, text: e.target.value })
            }
            className="p-1 rounded"
          />

          <div className="flex gap-2">
            <input
              readOnly
              placeholder="Start"
              value={format(draftGroup.start)}
              onClick={() => setCreateMode("selectingStart")}
              className="p-1 rounded cursor-pointer"
            />
            <input
              readOnly
              placeholder="End"
              value={format(draftGroup.end)}
              onClick={() => setCreateMode("selectingEnd")}
              className="p-1 rounded cursor-pointer"
            />
          </div>

          {createError && (
            <p className="text-sm text-red-400">{createError}</p>
          )}

          <div className="flex gap-2">
            <button
              disabled={!ready}
              onClick={() => {
                commitDraftGroup();
                setCreating(false);
              }}
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
