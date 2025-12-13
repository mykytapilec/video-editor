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

  zoom: 1,
  setZoom: (z) => set({ zoom: z }),

  containerWidth: 1080,
  setContainerWidth: (w) => set({ containerWidth: w }),

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

  videoDuration: 0,
setVideoDuration: (d) =>
  set((state) => {
    if (!Number.isFinite(d) || d <= 0) {
      return { videoDuration: d };
    }

    const videoItemId = state.trackItemIds.find(
      (id) => state.trackItemsMap[id]?.type === "video"
    );

    if (!videoItemId) {
      return { videoDuration: d };
    }

    const videoItem = state.trackItemsMap[videoItemId];

    if (videoItem.end >= d - 0.01) {
      return { videoDuration: d };
    }

    return {
      videoDuration: d,
      trackItemsMap: {
        ...state.trackItemsMap,
        [videoItemId]: {
          ...videoItem,
          start: 0,
          end: d,
          duration: d,
        },
      },
    };
  }),


  addVideoTrackItem: (src, opts = {}) => {
    const id = nanoid();
    const videoDuration = get().videoDuration || 0;

    const providedTrim = (opts as Partial<VideoTrackItem>).trim;
    let trim;
    if (providedTrim && typeof providedTrim.start === "number" && typeof providedTrim.end === "number") {
      trim = { start: providedTrim.start, end: providedTrim.end };
    } else if (videoDuration > 0.1) {
      trim = { start: 0, end: videoDuration };
    } else {
      trim = { start: 0, end: 1 };
    }

    const duration = Math.max(1, trim.end - trim.start);

    const item: VideoTrackItem = {
      id,
      type: "video",
      name: (opts as Partial<VideoTrackItem>).name ?? `Video ${id}`,
      src,
      timelineStart: (opts as Partial<VideoTrackItem>).timelineStart ?? 0,
      start: trim.start,
      end: trim.start + duration,
      duration,
      trim: { start: trim.start, end: trim.start + duration },
      playbackRate: (opts as Partial<VideoTrackItem>).playbackRate ?? 1,
      details: { ...defaultVideoDetails, ...((opts as Partial<VideoTrackItem>).details ?? {}) },
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

    const videoDuration = get().videoDuration || 1;
    const minLen = 1;
    const maxLength = Math.max(1, videoDuration);

    if (item.type === "video") {
      const currentTrim = item.trim ?? { start: item.start ?? 0, end: item.end ?? (item.start ?? 0) + Math.max(1, item.duration ?? 1) };
      let nextTrim = "trim" in patch && (patch as Partial<VideoTrackItem>).trim ? (patch as Partial<VideoTrackItem>).trim! : { ...currentTrim };

      nextTrim.start = typeof nextTrim.start === "number" ? nextTrim.start : currentTrim.start;
      nextTrim.end = typeof nextTrim.end === "number" ? nextTrim.end : currentTrim.end;

      if (nextTrim.start < 0) nextTrim.start = 0;
      if (nextTrim.start > videoDuration - minLen) nextTrim.start = Math.max(0, videoDuration - minLen);

      if (nextTrim.end > videoDuration) nextTrim.end = videoDuration;
      if (nextTrim.end < nextTrim.start + minLen) nextTrim.end = Math.min(videoDuration, nextTrim.start + minLen);

      const trimmedLen = Math.min(maxLength, Math.max(minLen, nextTrim.end - nextTrim.start));
      nextTrim.end = nextTrim.start + trimmedLen;

      const start = nextTrim.start;
      const end = nextTrim.end;
      const duration = Math.max(minLen, end - start);

      let timelineStart = item.timelineStart ?? 0;
      if ("timelineStart" in patch) timelineStart = (patch as Partial<VideoTrackItem>).timelineStart ?? timelineStart;
      timelineStart = Math.max(0, Math.min(videoDuration - duration, timelineStart));

      const updated: VideoTrackItem = {
        ...item,
        ...(patch as Partial<VideoTrackItem>),
        start,
        end,
        duration,
        trim: nextTrim,
        timelineStart,
        details: { ...(item.details ?? defaultVideoDetails), ...("details" in patch && (patch as any).details ? (patch as any).details : {}) },
      };

      set((state) => ({ trackItemsMap: { ...state.trackItemsMap, [id]: updated } }));
    } else {
      const updated: TrackItem = { ...item, ...(patch as Partial<TrackItem>) };
      set((state) => ({ trackItemsMap: { ...state.trackItemsMap, [id]: updated } }));
    }
  },
}));
