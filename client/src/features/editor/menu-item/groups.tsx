"use client";

import { useEffect } from "react";
import { useEditorStore } from "../store/use-editor-store";
import useTimelineStore from "../store/use-store";
import { mapApiGroupsToTimeline } from "./mapGroups";
import GroupsList from "./GroupsList";

export default function Groups() {
  const fetchGroups = useEditorStore((s) => s.fetchGroups);
  const apiGroups = useEditorStore((s) => s.groups);

  const setTimelineGroups = useTimelineStore((s) => s.setGroups);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (apiGroups && apiGroups.length > 0) {
      const mapped = mapApiGroupsToTimeline(apiGroups).filter(
        (g) =>
          g &&
          typeof g.start === "number" &&
          typeof g.end === "number" &&
          g.end > g.start
      );

      setTimelineGroups(mapped);
    }
  }, [apiGroups, setTimelineGroups]);

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="text-xs text-muted-foreground">
        Groups loaded: {apiGroups?.length || 0}
      </div>

      <GroupsList />
    </div>
  );
}
