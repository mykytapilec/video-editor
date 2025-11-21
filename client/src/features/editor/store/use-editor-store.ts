import { create } from "zustand";

export interface GroupItem {
  id: string;
  idx: number;
  text: string;
  start: number;
  end: number;
}

interface EditorStoreState {
  groups: GroupItem[];
  setGroups: (groups: GroupItem[]) => void;
  fetchGroups: () => Promise<void>;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  groups: [],

  setGroups: (groups) => set({ groups }),

  fetchGroups: async () => {
    try {
      const res = await fetch("/api/groups", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Failed to load groups:", await res.text());
        return;
      }

      const data = await res.json();
      set({ groups: data });
    } catch (e) {
      console.error("Groups fetch error:", e);
    }
  },
}));
