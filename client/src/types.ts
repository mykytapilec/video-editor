import { ITransition } from "@designcombo/types";

// /client/src/types.ts
export interface Group {
  id: string;
  idx?: number;
  name: string | null;
  start: string;
  end: string;
  text?: string;
}

export interface TimelineGroup {
  id: string;
  sourceId: number;
  start: number;
  end: number;
  name: string | null;
  text?: string;
  dirty?: boolean;
}

interface TrackItemBase {
  id: string;
  name: string | null;
  start: number;
  end: number;
  duration?: number;
  timelineStart?: number;
}

export interface ExtendedVideoDetails {
  volume?: number;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: {
    color: string;
    x: number;
    y: number;
    blur: number;
  };
}

export interface VideoTrackItem extends TrackItemBase {
  type: "video";
  src?: string;
  trim?: { start: number; end: number };
  playbackRate?: number;
  details?: ExtendedVideoDetails;
  thumbnail?: string;
}

export interface ImageTrackItem extends TrackItemBase {
  type: "image";
  src?: string;
}

export interface TextTrackItem extends TrackItemBase {
  type: "text" | "caption";
  text?: string;
}

export interface AudioTrackItem extends TrackItemBase {
  type: "audio";
  src?: string;
  volume?: number;
}

export interface ShapeTrackItem extends TrackItemBase {
  type: "shape" | "rect" | "progressBar" | "progressSquare" | "progressFrame";
}

export interface TemplateTrackItem extends TrackItemBase {
  type: "template";
  [key: string]: any;
}

export type TrackItem =
  | VideoTrackItem
  | ImageTrackItem
  | TextTrackItem
  | AudioTrackItem
  | ShapeTrackItem
  | TemplateTrackItem;

export interface Background {
  type: "color" | "image";
  value: string;
}

export interface Size {
  width: number;
  height: number;
}

export interface ITimelineStore {
  playerRef: React.RefObject<any> | null;
  setPlayerRef: (ref: React.RefObject<any> | null) => void;

  fps: number;

  /* ===== GROUPS ===== */
  groups: TimelineGroup[];
  setGroups: (groups: TimelineGroup[]) => void;
  addGroup: (group: TimelineGroup) => void;
  updateGroup: (id: string, patch: Partial<TimelineGroup>) => void;
  removeGroup: (id: string) => void;

  /* ===== playback ===== */
  currentTime: number;
  setCurrentTime: (t: number) => void;

  videoDuration: number;
  setVideoDuration: (d: number) => void;

  zoom: number;
  setZoom: (z: number) => void;

  /* ===== GROUP MANIPULATION (with constraints) ===== */
  updateGroupDrag: (id: string, wantedStart: number) => void;
  updateGroupResizeLeft: (id: string, wantedStart: number) => void;
  updateGroupResizeRight: (id: string, wantedEnd: number) => void;

  setState: (partial: Partial<ITimelineStore>) => void;
}

export type UploadStatus = "pending" | "uploading" | "uploaded" | "error";

export interface UploadFile {
  id: string;
  file?: File;
  url?: string;
  name: string;
  status: UploadStatus;
  progress?: number;
}
