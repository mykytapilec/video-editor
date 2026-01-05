import { IDesign } from "@designcombo/types";
import { create } from "zustand";

export type ExportType = "json" | "mp4";

interface Output {
  url: string;
  type: ExportType;
  filename: string;
}

interface DownloadState {
  exporting: boolean;
  exportType: ExportType;
  progress: number;
  payload?: IDesign;
  output?: Output;
  displayProgressModal: boolean;

  actions: {
    setExportType: (type: ExportType) => void;
    setPayload: (payload: IDesign) => void;
    setDisplayProgressModal: (value: boolean) => void;
    startExport: () => Promise<void>;
  };
}

export const useDownloadState = create<DownloadState>((set, get) => ({
  exporting: false,
  exportType: "mp4",
  progress: 0,
  displayProgressModal: false,

  actions: {
    setExportType: (exportType) => set({ exportType }),
    setPayload: (payload) => set({ payload }),
    setDisplayProgressModal: (value) =>
      set({ displayProgressModal: value }),

    startExport: async () => {
      const { payload, exportType } = get();
      if (!payload) {
        console.error("Export failed: payload is missing");
        return;
      }

      /* ---------- JSON EXPORT ---------- */
      if (exportType === "json") {
        const blob = new Blob(
          [JSON.stringify(payload, null, 2)],
          { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        set({
          exporting: false,
          progress: 100,
          output: {
            url,
            type: "json",
            filename: "design.json"
          },
          displayProgressModal: true
        });

        return;
      }

      /* ---------- MP4 EXPORT ---------- */
      try {
        set({
          exporting: true,
          progress: 0,
          displayProgressModal: true
        });

        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            design: payload,
            format: "mp4"
          })
        });

        if (!res.ok) {
          throw new Error("Backend render failed");
        }

        const { url } = await res.json();

        set({
          exporting: false,
          progress: 100,
          output: {
            url,
            type: "mp4",
            filename: "video.mp4"
          }
        });
      } catch (err) {
        console.error("MP4 export failed:", err);

        set({
          exporting: false,
          progress: 0
        });
      }
    }
  }
}));
