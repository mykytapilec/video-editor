import { create } from "zustand";
import { persist } from "zustand/middleware";
import { processUpload } from "@/utils/upload-service";
import useStore from "./use-store";

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
          files: typeof files === "function" ? files(state.files) : files,
        })),

      pendingUploads: [],
      addPendingUploads: (uploads) =>
        set((state) => ({
          pendingUploads: [...state.pendingUploads, ...uploads],
        })),

      processUploads: () => {
        const pending = get().pendingUploads;

        for (const u of pending) {
          processUpload(
            u.id,
            { file: u.file, url: u.url },
            { onProgress: () => {}, onStatus: () => {} }
          )
            .then((res) => {
              const results = Array.isArray(res) ? res : [res];
              const addVideo = useStore.getState().addVideoTrackItem;

              results.forEach((file) => {
                const src =
                  file.url ||
                  file.filePath ||
                  file.metadata?.uploadedUrl ||
                  file.metadata?.originalUrl;

                if (!src) return;
                addVideo(src, { name: file.name ?? "Video" });
              });
            })
            .catch(console.error);
        }

        set({ pendingUploads: [] });
      },

      uploads: [],
      setUploads: (uploads) =>
        set((state) => ({
          uploads: typeof uploads === "function" ? uploads(state.uploads) : uploads,
        })),
    }),
    { name: "upload-store", partialize: (state) => ({ uploads: state.uploads }) }
  )
);

export default useUploadStore;
