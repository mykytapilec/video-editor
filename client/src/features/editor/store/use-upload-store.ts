// /client/src/features/editor/store/use-upload-store.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import { UploadFile } from "@/types";
import { normalizeVideoUrl } from "@/utils/normalize-url";
import { useEditorStore } from "./use-editor-store";

export interface UploadStore {
  uploads: UploadFile[];
  showUploadModal: boolean;
  setShowUploadModal: (value: boolean) => void;
  addPendingUploads: (files: UploadFile[]) => void;
  processUploads: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: [],
  showUploadModal: false,

  setShowUploadModal: (value) => set({ showUploadModal: value }),

  addPendingUploads: (files) =>
    set({ uploads: [...get().uploads, ...files] }),

  processUploads: async () => {
    const uploads = get().uploads;

    for (const file of uploads) {
      if (file.status !== "pending") continue;

      set({
        uploads: uploads.map((f) =>
          f.id === file.id ? { ...f, status: "uploading" } : f
        ),
      });

      try {
        let uploadedItem: UploadFile;

        if (file.url) {
          uploadedItem = {
            id: file.id,
            name: file.name,
            url: file.url,
            status: "uploaded",
          };
        } else if (file.file) {
          uploadedItem = {
            id: file.id,
            name: file.file.name,
            file: file.file,
            status: "uploaded",
          };
        } else {
          continue;
        }

        set({
          uploads: uploads.map((f) =>
            f.id === file.id ? uploadedItem : f
          ),
        });

        if (uploadedItem.url) {
          const videoUrl = normalizeVideoUrl(uploadedItem.url);

          useEditorStore.getState().setCurrentVideoSrc(videoUrl);
        }
      } catch (err) {
        set({
          uploads: uploads.map((f) =>
            f.id === file.id ? { ...f, status: "error" } : f
          ),
        });
      }
    }
  },
}));

export const generateUploadId = () => nanoid();
