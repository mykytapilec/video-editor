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
  /* ================= refs ================= */
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),

  sceneMoveableRef: null,
  setSceneMoveableRef: (ref) => set({ sceneMoveableRef: ref }),

  /* ================= project ================= */
  fps: 30,
  duration: 0,
  size: { width: 1080, height: 1920 },

  background: { type: "color", value: "#000000" },

  /* ================= groups ================= */
  groups: [],
  groupsLoaded: false,

  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  /* ================= timeline ================= */
  trackItemsMap: {},
  trackItemIds: [],

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  containerWidth: 1080,
  setContainerWidth: (w) => set({ containerWidth: w }),

  /* ================= selection ================= */
  activeIds: [],
  setActiveIds: (ids) => {
    set({ activeIds: ids });

    if (ids.length === 1) {
      const item = get().trackItemsMap[ids[0]];
      if (item?.type === "video" && typeof item.src === "string") {
        set({ currentVideoSrc: item.src });
      }
    }
  },

  /* ================= playback ================= */
  currentVideoSrc: null,
  currentTime: 0,
  setCurrentVideoSrc: (src) => set({ currentVideoSrc: src }),
  setCurrentTime: (t) => set({ currentTime: t }),

  setState: (partial) => set(partial),

  /* ================= VIDEO DURATION ================= */
  videoDuration: 0,

  setVideoDuration: (d) =>
    set((state) => {
      if (!Number.isFinite(d) || d <= 0) {
        return { videoDuration: d };
      }

      const nextMap = { ...state.trackItemsMap };

      for (const id of state.trackItemIds) {
        const item = nextMap[id];
        if (item?.type !== "video") continue;

        const trim = item.trim ?? { start: 0, end: 1 };

        if (trim.end <= 1.01) {
          nextMap[id] = {
            ...item,
            trim: { start: 0, end: d },
            start: 0,
            end: d,
            duration: d,
            timelineStart: 0,
          };
        }
      }

      return {
        videoDuration: d,
        trackItemsMap: nextMap,
      };
    }),

  /* ================= ADD VIDEO ================= */
  addVideoTrackItem: (src, opts = {}) => {
    const id = nanoid();
    const videoDuration = get().videoDuration;

    const trim =
      videoDuration && videoDuration > 0.1
        ? { start: 0, end: videoDuration }
        : { start: 0, end: 1 };

    const duration = Math.max(1, trim.end - trim.start);

    const item: VideoTrackItem = {
      id,
      type: "video",
      name: (opts as Partial<VideoTrackItem>).name ?? `Video ${id}`,
      src,
      timelineStart: 0,
      start: trim.start,
      end: trim.end,
      duration,
      trim,
      playbackRate: (opts as Partial<VideoTrackItem>).playbackRate ?? 1,
      details: {
        ...defaultVideoDetails,
        ...((opts as Partial<VideoTrackItem>).details ?? {}),
      },
      thumbnails: [],
    };

    set((state) => ({
      trackItemsMap: { ...state.trackItemsMap, [id]: item },
      trackItemIds: [...state.trackItemIds, id],
      currentVideoSrc: src,
      activeIds: [id],
    }));

    return id;
  },

  /* ================= UPDATE ITEM ================= */
  updateTrackItem: (id, patch) => {
    const item = get().trackItemsMap[id];
    if (!item) return;

    const videoDuration = get().videoDuration || 1;
    const minLen = 1;

    if (item.type === "video") {
      const currentTrim = item.trim ?? {
        start: 0,
        end: Math.max(1, item.duration ?? 1),
      };

      const nextTrim =
        "trim" in patch && (patch as Partial<VideoTrackItem>).trim
          ? (patch as Partial<VideoTrackItem>).trim!
          : { ...currentTrim };

      nextTrim.start = Math.max(0, nextTrim.start);
      nextTrim.end = Math.min(
        videoDuration,
        Math.max(nextTrim.start + minLen, nextTrim.end)
      );

      const duration = Math.max(minLen, nextTrim.end - nextTrim.start);

      let timelineStart = item.timelineStart ?? 0;
      if ("timelineStart" in patch) {
        timelineStart =
          (patch as Partial<VideoTrackItem>).timelineStart ?? timelineStart;
      }

      timelineStart = Math.max(
        0,
        Math.min(videoDuration - duration, timelineStart)
      );

      const updated: VideoTrackItem = {
        ...item,
        ...(patch as Partial<VideoTrackItem>),
        trim: nextTrim,
        start: nextTrim.start,
        end: nextTrim.end,
        duration,
        timelineStart,
        thumbnails:
          "thumbnails" in patch
            ? (patch as any).thumbnails
            : item.thumbnails,
        details: {
          ...(item.details ?? defaultVideoDetails),
          ...("details" in patch && (patch as any).details
            ? (patch as any).details
            : {}),
        },
      };

      set((state) => ({
        trackItemsMap: { ...state.trackItemsMap, [id]: updated },
      }));
    } else {
      const updated: TrackItem = { ...item, ...(patch as Partial<TrackItem>) };
      set((state) => ({
        trackItemsMap: { ...state.trackItemsMap, [id]: updated },
      }));
    }
  },
}));
