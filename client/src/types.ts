export interface Group {
  id: number;
  idx?: number;
  name: string | null;
  start: string;
  end: string;
  text?: string;
}

export interface TimelineGroup {
  id: number;
  idx?: number;
  name: string | null;
  start: number;
  end: number;
  text?: string;
}

interface TrackItemBase {
  id: number;
  name: string | null;
  start: number;
  end: number;
  duration?: number;
}

export interface VideoTrackItem extends TrackItemBase {
  type: "video";
  src?: string;
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

  // moveable ref
  sceneMoveableRef: React.RefObject<any> | null;
  setSceneMoveableRef: (ref: React.RefObject<any> | null) => void;

  // playback / composition
  fps: number;
  duration: number;
  size: Size;
  background: Background;

  // groups / timeline items
  groups: TimelineGroup[];
  groupsLoaded?: boolean;
  selectedGroupId: number | null;
  setSelectedGroupId: (id: number | null) => void;

  trackItemsMap: Record<number, TrackItem | undefined>;
  trackItemIds: number[];
  activeIds: number[];
  setActiveIds?: (ids: number[]) => void;

  currentVideoSrc: string | null;
  setCurrentVideoSrc: (src: string | null) => void;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  setState: (partial: Partial<ITimelineStore>) => void;
  addVideoTrackItem: (src: string, opts?: Partial<VideoTrackItem>) => number;
}
