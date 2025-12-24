// /client/src/features/editor/store/use-store.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import {
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

  // ❗ trackItemsMap теперь НЕ background video
  trackItemsMap: null,
  trackItemIds: [],

  transitionsMap: {},

  activeId: "",
  setActiveId: (id) => set({ activeId: id }),

  // 🎬 background video
  currentVideoSrc: null,
  setCurrentVideoSrc: (src) => set({ currentVideoSrc: src }),

  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  setState: (partial) => set(partial),

  videoDuration: 0,

  setVideoDuration: (d) => {
    set({ videoDuration: d });
  },

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  containerWidth: 1080,
  setContainerWidth: (w) => set({ containerWidth: w }),

  // ⛔️ пока НЕ используем для background
  addVideoTrackItem: (src, opts = {}) => {
    const id = nanoid();

    const trim = opts.trim ?? { start: 0, end: 5 };
    const duration = Math.max(1, trim.end - trim.start);

    const item: VideoTrackItem = {
      id,
      type: "video",
      name: opts.name ?? `Group ${id}`,
      src,
      timelineStart: 0,
      start: trim.start,
      end: trim.end,
      duration,
      trim,
      details: {
        ...defaultVideoDetails,
        ...(opts.details ?? {}),
      },
    };

    set({
      trackItemsMap: item,
      trackItemIds: [id],
      activeId: id,
    });

    return id;
  },

  updateTrackItem: (patch) => {
    const item = get().trackItemsMap;
    if (!item) return;

    set({
      trackItemsMap: {
        ...item,
        ...(patch as Partial<VideoTrackItem>),
      },
    });
  },
}));
