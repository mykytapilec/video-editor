import { TrackItem } from "@/types";
import type { ITrackItem, ITemplate, ItemStructure, IDisplay } from "@designcombo/types";

export const convertToITrackItem = (item: TrackItem | null): ITrackItem | null => {
  if (!item) return null;

  const now = Date.now();
  const duration = Math.max(0, item.end - item.start);

  const iTemplate: Partial<ITemplate> = {
    id: String(item.id),
    name: item.name ?? `Item ${item.id}`,
    type: "template",

    metadata: {
      start: item.start,
      end: item.end,
      duration,
      createdAt: now,
      updatedAt: now,
    },

    trackItemIds: [],
    trackItemsMap: {},
    transitionsMap: {},

    structure: [] as ItemStructure[],

    display: {
      from: item.start,
      to: item.end,
      width: 1080,
      height: 1920,
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
    } as IDisplay,
  };

  return iTemplate as ITrackItem;
};
