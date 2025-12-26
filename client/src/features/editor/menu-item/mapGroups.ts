import { TimelineGroup } from "@/types";
import { GroupItem } from "../store/use-editor-store";

export function mapApiGroupsToTimeline(
  apiGroups: GroupItem[]
): TimelineGroup[] {
  return apiGroups.map((g) => ({
    id: String(g.id),
    sourceId: g.id,
    start: g.start,
    end: g.end,
    text: g.text,
    name: g.text || `Group ${g.idx}`,
    dirty: false,
  }));
}
