import { create } from "zustand";

export type UploadFile = {
  id: string;
  file?: File;
  url?: string;
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  uploadedUrl?: string;
};

type UploadStore = {
  pendingUploads: UploadFile[];
  showUploadModal: boolean;
  setShowUploadModal: (value: boolean) => void;
  addPendingUploads: (files: UploadFile[]) => void;
  processUploads: () => Promise<void>;
};

export const useUploadStore = create<UploadStore>((set, get) => ({
  pendingUploads: [],
  showUploadModal: false,

  setShowUploadModal: (value: boolean) => set({ showUploadModal: value }),

  addPendingUploads: (files: UploadFile[]) =>
    set({ pendingUploads: [...get().pendingUploads, ...files] }),

  processUploads: async () => {
    const uploads = get().pendingUploads;

    for (const file of uploads) {
      if (file.status !== "pending") continue;

      set({
        pendingUploads: get().pendingUploads.map((f) =>
          f.id === file.id ? { ...f, status: "uploading" } : f
        ),
      });

      try {
        let uploadedItem: { id: string; uploadedUrl: string; status: "success" };

        if (file.file) {
          uploadedItem = {
            id: file.id,
            uploadedUrl: URL.createObjectURL(file.file),
            status: "success",
          };
        } else if (file.url) {
          const res = await fetch("/api/uploads/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: file.url }),
          });

          if (!res.ok) throw new Error("Upload failed");

          const data = await res.json();
          uploadedItem = data.uploads[0];
        } else {
          continue;
        }

        set({
          pendingUploads: get().pendingUploads.map((f) =>
            f.id === file.id
              ? { ...f, status: "success", uploadedUrl: uploadedItem.uploadedUrl }
              : f
          ),
        });
      } catch (err) {
        console.error("Upload failed:", err);
        set({
          pendingUploads: get().pendingUploads.map((f) =>
            f.id === file.id ? { ...f, status: "error" } : f
          ),
        });
      }
    }
  },
}));
