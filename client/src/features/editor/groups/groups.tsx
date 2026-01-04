"use client";

import { useState } from "react";
import useTimelineStore from "../store/use-timeline-store";
import GroupsList from "./GroupsList";
import { EditorBootstrap } from "./EditorBootstrap";
import ApiModal from "@/components/api-modal";

export default function Groups() {
  const [creating, setCreating] = useState(false);

  const groups = useTimelineStore((s) => s.groups);
  const setGroups = useTimelineStore((s) => s.setGroups);

  const draftGroup = useTimelineStore((s) => s.draftGroup);
  const setDraftGroup = useTimelineStore((s) => s.setDraftGroup);
  const commitDraftGroup = useTimelineStore((s) => s.commitDraftGroup);

  const handleCreateClick = () => {
    const lastGroup = groups[groups.length - 1];
    const start = lastGroup ? lastGroup.end : 0;
    const end = start + 1;

    setDraftGroup({
      start,
      end,
      text: "",
    });

    setCreating(true);
  };

  const handleCancel = () => {
    setCreating(false);
    setDraftGroup(null);
  };

  const handleSubmit = () => {
    commitDraftGroup();
    setCreating(false);
  };

  return (
    <div className="p-3 flex flex-col gap-2">
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded w-fit"
        onClick={handleCreateClick}
      >
        Create New Group
      </button>

      {creating && draftGroup && (
        <div className="p-3 border rounded bg-gray-800 mt-2 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Group text"
            className="w-full p-1 rounded"
            value={draftGroup.text}
            onChange={(e) =>
              setDraftGroup({ ...draftGroup, text: e.target.value })
            }
          />

          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-green-500 text-white rounded"
              onClick={handleSubmit}
            >
              Create
            </button>
            <button
              className="px-2 py-1 bg-red-500 text-white rounded"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <GroupsList />
      <EditorBootstrap />
      <ApiModal />
    </div>
  );
}
