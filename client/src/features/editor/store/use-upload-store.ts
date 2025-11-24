import { create } from "zustand";
import { persist } from "zustand/middleware";
import { processUpload } from "@/utils/upload-service";

export type UploadProvider = "local" | "external";

export interface UploadFile {
  id: string;
  file?: File;
  url?: string;
  type?: string;
  provider?: UploadProvider;
  status?: "pending" | "uploading" | "uploaded" | "failed";
  progress?: number;
  error?: string;
  name?: string;
}

interface IUploadStore {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  files: UploadFile[];
  setFiles: (files: UploadFile[] | ((prev: UploadFile[]) => UploadFile[])) => void;
  pendingUploads: UploadFile[];
  addPendingUploads: (uploads: UploadFile[]) => void;
  processUploads: () => void;
  uploads: UploadFile[];
  setUploads: (uploads: UploadFile[] | ((prev: UploadFile[]) => UploadFile[])) => void;
}

const useUploadStore = create<IUploadStore>()(
  persist(
    (set, get) => ({
      showUploadModal: false,
      setShowUploadModal: (show) => set({ showUploadModal: show }),

      files: [],
      setFiles: (files) =>
        set((state) => ({
          files:
            typeof files === "function"
              ? (files as (prev: UploadFile[]) => UploadFile[])(state.files)
              : files,
        })),

      pendingUploads: [],
      addPendingUploads: (uploads) =>
        set((state) => ({
          pendingUploads: [...state.pendingUploads, ...uploads],
        })),

      processUploads: () => {
        const { pendingUploads, setUploads } = get();
        for (const u of pendingUploads) {
          processUpload(
            u.id,
            { file: u.file, url: u.url },
            { onProgress: () => {}, onStatus: () => {} }
          )
            .then((res) => {
              setUploads((prev) => [...prev, ...(Array.isArray(res) ? res : [res])]);
            })
            .catch(console.error);
        }
        set({ pendingUploads: [] });
      },

      uploads: [],
      setUploads: (uploads) =>
        set((state) => ({
          uploads:
            typeof uploads === "function"
              ? (uploads as (prev: UploadFile[]) => UploadFile[])(state.uploads)
              : uploads,
        })),
    }),
    { name: "upload-store", partialize: (state) => ({ uploads: state.uploads }) }
  )
);

export default useUploadStore;
