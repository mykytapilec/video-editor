// /client/src/features/editor/store/use-store.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  TrackItem,
  VideoTrackItem,
  ITimelineStore,
  ExtendedVideoDetails,
} from "@/types";

const defaultVideoDetails: ExtendedVideoDetails = {
  volume: 100,
  opacity: 100,
  borderRadius: 0,
  borderWidth: 0,
  borderColor: "#000000",
  boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
};

export default create<ITimelineStore>((set, get) => ({
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
  setActiveIds: (ids) => {
    set({ activeIds: ids });

    if (ids.length === 1) {
      const id = ids[0];
      const item = get().trackItemsMap[id];
      if (item?.type === "video" && item.src) {
        set({ currentVideoSrc: item.src });
      }
    }
  },

  currentVideoSrc: null,
  currentTime: 0,
  setCurrentVideoSrc: (src) => set({ currentVideoSrc: src }),
  setCurrentTime: (t) => set({ currentTime: t }),

  setState: (partial) => set(partial),

  addVideoTrackItem: (src, opts = {}) => {
    const id = nanoid();
    const trim = opts.trim ?? { start: 0, end: 5 };
    const duration = trim.end - trim.start;

    const item: VideoTrackItem = {
      id,
      type: "video",
      name: opts.name ?? `Video ${id}`,
      src,
      timelineStart: opts.timelineStart ?? 0,
      start: trim.start,
      end: trim.end,
      duration,
      trim,
      playbackRate: opts.playbackRate ?? 1,
      details: {
        ...defaultVideoDetails,
        ...(opts.details ?? {}),
      },
    };

    set((state) => ({
      trackItemsMap: { ...state.trackItemsMap, [id]: item },
      trackItemIds: [...state.trackItemIds, id],
    }));

    set({ currentVideoSrc: src });
    get().setActiveIds([id]);

    return id;
  },

  updateTrackItem: (id, patch) => {
    const item = get().trackItemsMap[id];
    if (!item) return;

    if (item.type === "video") {
      const currentTrim = item.trim ?? { start: item.start, end: item.end };
      const nextTrim = "trim" in patch && patch.trim ? patch.trim : currentTrim;

      const start = nextTrim.start;
      const end = nextTrim.end;
      const duration = end - start;

      const updated: VideoTrackItem = {
        ...item,
        ...(patch as Partial<VideoTrackItem>),
        start,
        end,
        duration,
        trim: nextTrim,
        details: {
          ...(item.details ?? defaultVideoDetails),
          ...("details" in patch && patch.details ? patch.details : {}),
        },
      };

      set((state) => ({
        trackItemsMap: { ...state.trackItemsMap, [id]: updated },
      }));
    } else {
      const updated: TrackItem = { ...item, ...patch };
      set((state) => ({
        trackItemsMap: { ...state.trackItemsMap, [id]: updated },
      }));
    }
  },
}));
