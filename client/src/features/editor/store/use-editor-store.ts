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
  setGroups: (groups: GroupItem[]) => void;
  fetchGroups: () => Promise<void>;
  selectedGroupId: number | null;
  setSelectedGroupId: (id: number | null) => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  groups: [],
  selectedGroupId: null,

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

      // Ensure ids are numbers (API returns number, but normalize just in case)
      const normalized = (data || []).map((g: any) => ({
        ...g,
        id: typeof g.id === "string" ? Number(g.id) : g.id,
        start: typeof g.start === "string" ? Number(g.start) : g.start,
        end: typeof g.end === "string" ? Number(g.end) : g.end,
      }));

      set({ groups: normalized });
    } catch (e) {
      console.error("Groups fetch error:", e);
    }
  },
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
}));
