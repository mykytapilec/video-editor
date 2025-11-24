// /client/src/features/editor/store/use-store.ts
import { create } from "zustand";
import { TrackItem, VideoTrackItem } from "@/types";

interface IEditorStore {
  trackItemsMap: Record<number, TrackItem>;
  activeIds: number[];
  currentVideoSrc: string | null;
  currentTime: number;

  // Timeline methods
  setActiveIds: (ids: number[]) => void;
  addVideoTrackItem: (src: string, options?: Partial<VideoTrackItem>) => number;

  // Scene / player
  setCurrentVideoSrc: (src: string | null) => void;
  setCurrentTime: (time: number) => void;
}

const useStore = create<IEditorStore>((set, get) => ({
  trackItemsMap: {},
  activeIds: [],
  currentVideoSrc: null,
  currentTime: 0,

  setActiveIds: (ids: number[]) => {
    set({ activeIds: ids });
    if (ids.length > 0) {
      const id = ids[0];
      const item = get().trackItemsMap[id];
      if (item && item.type === "video" && item.src) {
        set({ currentVideoSrc: item.src });
      }
    }
  },

  addVideoTrackItem: (src, options) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const trim = options?.trim || { start: 0, end: 5 };
    const start = trim.start;
    const end = trim.end;

    const newItem: VideoTrackItem = {
      id,
      src,
      type: "video",
      name: options?.name ?? `Video ${id}`,
      trim,
      start,
      end,
    };

    set((state) => ({
      trackItemsMap: {
        ...state.trackItemsMap,
        [id]: newItem,
      },
    }));

    return id;
  },

  setCurrentVideoSrc: (src: string | null) => set({ currentVideoSrc: src }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
}));

export default useStore;
