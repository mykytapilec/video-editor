"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type UploadFile = {
  id: string;
  file?: File;
  url?: string;
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
};

interface UploadStore {
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
              status: "success",
            };
          } else if (file.file) {
            uploadedItem = {
              id: file.id,
              name: file.file.name,
              file: file.file,
              status: "success",
            };
          }

          set({
            uploads: uploads.map((f) =>
              f.id === file.id ? { ...uploadedItem } : f
            ),
          });
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
