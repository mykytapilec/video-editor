import { useEffect } from "react";
import { useEditorStore } from "@/features/editor/store/use-editor-store";
import useTimelineStore from "@/features/editor/store/use-timeline-store";

export function EditorBootstrap() {
  const fetchGroups = useEditorStore((s) => s.fetchGroups);
  const editorGroups = useEditorStore((s) => s.groups);

  const setGroups = useTimelineStore((s) => s.setGroups);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (editorGroups.length) {
      setGroups(
        editorGroups.map((g) => ({
          id: String(g.id),
          start: g.start,
          end: g.end,
          text: g.text,
          sourceId: g.idx,
          name: g.text,
        }))
      );
    }
  }, [editorGroups, setGroups]);

  return null;
}
