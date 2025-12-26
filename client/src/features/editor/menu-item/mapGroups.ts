import { nanoid } from "nanoid";
import { TimelineGroup } from "@/types";
import { GroupItem } from "../store/use-editor-store";

export function mapApiGroupsToTimeline(
  apiGroups: GroupItem[]
): TimelineGroup[] {
  return apiGroups.map((g) => ({
    id: nanoid(),
    sourceId: g.id,
    start: g.start,
    end: g.end,
    text: g.text,
    name: `Group ${g.idx}`,
    dirty: false,
  }));
}
