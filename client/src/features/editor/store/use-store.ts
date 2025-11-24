// /src/features/editor/store/use-store.ts
import { create } from "zustand";
import { ITimelineStore, VideoTrackItem, TrackItem } from "@/types";

const useStore = create<ITimelineStore>((set, get) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  sceneMoveableRef: null,
  setSceneMoveableRef: (ref) => set({ sceneMoveableRef: ref }),

  fps: 30,
  duration: 0,
  size: { width: 1080, height: 1920 },
  background: { type: "color", value: "#000000" },

  groups: [],
  groupsLoaded: false,
  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  trackItemsMap: {},
  trackItemIds: [],
  activeIds: [],

  // setter for active ids
  setActiveIds: (ids: number[]) => set({ activeIds: ids }),

  currentVideoSrc: null,
  setCurrentVideoSrc: (src: string | null) => set({ currentVideoSrc: src }),

  currentTime: 0,
  setCurrentTime: (t: number) => set({ currentTime: t }),

  setState: (partial) =>
    set((prev) => ({
      ...prev,
      ...(partial as Partial<ITimelineStore>),
    })),

  addVideoTrackItem: (src: string, opts?: Partial<VideoTrackItem>) => {
    const id = Date.now();
    const defaultItem: VideoTrackItem = {
      id,
      name: opts?.name ?? `Video ${id}`,
      start: opts?.start ?? 0,
      end: opts?.end ?? 5,
      duration: opts?.duration ?? 5,
      type: "video",
      src,
    };
    set((prev) => ({
      trackItemsMap: { ...prev.trackItemsMap, [id]: defaultItem },
      trackItemIds: [...prev.trackItemIds, id],
    }));
    return id;
  },

  updateTrackItem(id: number, patch: Partial<TrackItem>) {
    set((state) => ({
      ...state,
      trackItemsMap: {
        ...state.trackItemsMap,
        [id]: {
          ...state.trackItemsMap[id],
          ...patch,
        } as TrackItem,
      },
    }));
  },
}));

export default useStore;
