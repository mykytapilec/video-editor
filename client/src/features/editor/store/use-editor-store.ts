import { create } from "zustand";

export interface GroupItem {
  id: number;
  idx: number;
  text: string;
  start: number;
  end: number;
}

interface EditorStoreState {
  groups: GroupItem[];
  currentVideoSrc: string | null;
  setCurrentVideoSrc: (src: string | null) => void;
  fetchGroups: () => Promise<void>;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  groups: [],
  currentVideoSrc: null,
  setCurrentVideoSrc: (src) => set({ currentVideoSrc: src }),

  fetchGroups: async () => {
    try {
      const res = await fetch("/api/groups", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      const normalized = (data || []).map((g: any) => ({
        id: Number(g.id),
        idx: Number(g.idx),
        text: g.text,
        start: Number(g.start),
        end: Number(g.end),
      }));

      set({ groups: normalized });
    } catch (e) {
      console.error("Groups fetch error", e);
    }
  },
}));
