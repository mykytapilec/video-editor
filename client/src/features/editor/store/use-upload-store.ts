import { create } from "zustand";
import { nanoid } from "nanoid";
import { UploadFile } from "@/types";
import useStore from "./use-store";
import { normalizeVideoUrl } from "@/utils/normalize-url";

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
  addPendingUploads: (files) => set({ uploads: [...get().uploads, ...files] }),
  processUploads: async () => {
    const uploads = get().uploads;
    for (const file of uploads) {
      if (file.status === "pending") {
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
              f.id === file.id ? { ...uploadedItem } : f
            ),
          });

          if (uploadedItem.url) {
            const videoUrl = normalizeVideoUrl(uploadedItem.url);
            const id = useStore.getState().addVideoTrackItem(videoUrl, {
              name: uploadedItem.name,
              trim: { start: 0, end: 5 },
              timelineStart: 0,
            });
            useStore.getState().setActiveIds([id]);
          }
        } catch (err) {
          set({
            uploads: uploads.map((f) =>
              f.id === file.id ? { ...f, status: "error" } : f
            ),
          });
        }
      }
    }
  },
}));

export const generateUploadId = () => nanoid();
