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
  idx?: number;
  name: string | null;
  start: number;
  end: number;
  text?: string;
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

  sceneMoveableRef: React.RefObject<any> | null;
  setSceneMoveableRef: (ref: React.RefObject<any> | null) => void;

  fps: number;
  duration: number;
  size: Size;
  background: Background;

  groups: TimelineGroup[];
  groupsLoaded?: boolean;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;

  trackItemsMap: Record<string, TrackItem>;
  trackItemIds: string[];
  activeIds: string[];
  setActiveIds: (ids: string[]) => void;

  currentVideoSrc: string | null;
  setCurrentVideoSrc: (src: string | null) => void;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  setState: (partial: Partial<ITimelineStore>) => void;

  addVideoTrackItem: (src: string, opts?: Partial<VideoTrackItem>) => string;
  updateTrackItem: (id: string, patch: Partial<TrackItem>) => void;
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
