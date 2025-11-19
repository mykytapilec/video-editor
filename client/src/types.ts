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

export interface TrackItem {
  id: number;
  name: string | null;
  start: number;
  end: number;
  [key: string]: any;
}

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
  selectedGroupId: number | null;
  setSelectedGroupId: (id: number | null) => void;
  trackItemsMap: Record<number, TrackItem>;
  trackItemIds: number[];
  activeIds: number[];
  setState: (partial: Partial<ITimelineStore>) => void;
}
