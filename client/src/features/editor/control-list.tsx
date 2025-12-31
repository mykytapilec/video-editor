import { useEffect, useState } from "react";
import useTimelineStore from "./store/use-timeline-store";

export default function ControlList() {
  const selectedGroupId = useTimelineStore((s) => s.selectedGroupId);
  const groups = useTimelineStore((s) => s.groups);

  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    setHasSelection(
      Boolean(selectedGroupId && groups.find(g => g.id === selectedGroupId))
    );
  }, [selectedGroupId, groups]);

  if (!hasSelection) return null;

  return null;
}
