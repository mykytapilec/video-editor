"use client";

import { useEffect } from "react";
import { useEditorStore } from "../store/use-editor-store";
import useTimelineStore from "../store/use-store";
import { mapApiGroupsToTimeline } from "./mapGroups";

export default function Groups() {
  const fetchGroups = useEditorStore((s) => s.fetchGroups);
  const apiGroups = useEditorStore((s) => s.groups);

  const setTimelineGroups = useTimelineStore((s) => s.setGroups);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    setTimelineGroups(mapApiGroupsToTimeline(apiGroups));
  }, [apiGroups, setTimelineGroups]);

  return (
    <div className="p-3 text-xs text-muted-foreground">
      Groups loaded: {apiGroups.length}
    </div>
  );
}
