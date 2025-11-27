// /client/src/features/editor/store/use-store.ts
import { create } from "zustand";
import { TrackItem, VideoTrackItem, ITimelineStore } from "@/types";
import { nanoid } from "nanoid";

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
  setSelectedGroupId: (id: string | null) => set({ selectedGroupId: id }),

  trackItemsMap: {},
  trackItemIds: [],
  activeIds: [],
  setActiveIds: (ids: string[]) => {
    set({ activeIds: ids });
    if (ids.length === 1) {
      const id = ids[0];
      const item = get().trackItemsMap[id];
      if (item?.type === "video" && item.src) set({ currentVideoSrc: item.src });
    }
  },

  currentVideoSrc: null,
  currentTime: 0,
  setCurrentVideoSrc: (src: string | null) => set({ currentVideoSrc: src }),
  setCurrentTime: (t: number) => set({ currentTime: t }),

  setState: (partial: Partial<ITimelineStore>) => set(partial),

  addVideoTrackItem: (src: string, opts?: Partial<VideoTrackItem>) => {
    const id = nanoid();
    const trim = opts?.trim || { start: 0, end: 5 };

    const newItem: VideoTrackItem = {
      id,
      type: "video",
      src,
      name: opts?.name ?? `Video ${id}`,
      trim,
      start: trim.start,
      end: trim.end,
      timelineStart: opts?.timelineStart ?? 0,
      duration: trim.end - trim.start,
    };

    set((state) => ({
      trackItemsMap: { ...state.trackItemsMap, [id]: newItem },
      trackItemIds: [...state.trackItemIds, id],
    }));

    set({ currentVideoSrc: src });
    get().setActiveIds([id]);

    return id;
  },

  updateVideoTrackItem: (id: string, patch: Partial<VideoTrackItem>) => {
    const item = get().trackItemsMap[id];
    if (!item || item.type !== "video") return;

    const updated: VideoTrackItem = {
      ...item,
      ...patch,
      duration: patch.trim ? patch.trim.end - patch.trim.start : item.duration,
    };

    set((state) => ({
      trackItemsMap: { ...state.trackItemsMap, [id]: updated },
    }));
  },

  updateTrackItem: (id: string, patch: Partial<Omit<TrackItem, "trim">>) => {
    const item = get().trackItemsMap[id];
    if (!item || item.type === "video") return;

    const updated: TrackItem = { ...item, ...patch };

    set((state) => ({
      trackItemsMap: { ...state.trackItemsMap, [id]: updated },
    }));
  },
}));

export default useStore;
