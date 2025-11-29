"use client";

import React, { useRef, useState, useEffect } from "react";
import { useUploadStore, generateUploadId } from "@/features/editor/store/use-upload-store";
import { UploadFile } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadIcon, FileIcon, X } from "lucide-react";
import clsx from "clsx";

const ModalUpload: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    showUploadModal,
    setShowUploadModal,
    addPendingUploads,
    processUploads,
  } = useUploadStore();

  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [localFiles, setLocalFiles] = useState<UploadFile[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  const createThumb = (file: File): Promise<string> =>
    new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        resolve(url);
        return;
      }

      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        const onLoaded = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 120;
            canvas.height = video.videoHeight || 90;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            resolve("");
          } finally {
            setTimeout(() => URL.revokeObjectURL(video.src), 2000);
          }
        };

        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.addEventListener("error", () => resolve(""), { once: true });
        setTimeout(() => resolve(""), 1500);
        return;
      }

      resolve("");
    });

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadFile[] = Array.from(files).map((f) => ({
      id: generateUploadId(),
      file: f,
      name: f.name,
      status: "pending",
      progress: 0,
    }));

    setLocalFiles((prev) => [...newFiles, ...prev]);

    const thumbsMap: Record<string, string> = {};
    await Promise.all(
      newFiles.map(async (nf) => {
        if (!nf.file) return;
        const t = await createThumb(nf.file);
        if (t) thumbsMap[nf.id] = t;
      })
    );
    setThumbs((prev) => ({ ...prev, ...thumbsMap }));

    if (inputRef.current) inputRef.current.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dtFiles = e.dataTransfer.files;
    if (!dtFiles || dtFiles.length === 0) return;

    const newFiles: UploadFile[] = Array.from(dtFiles).map((f) => ({
      id: generateUploadId(),
      file: f,
      name: f.name,
      status: "pending",
      progress: 0,
    }));

    setLocalFiles((prev) => [...newFiles, ...prev]);

    const thumbsMap: Record<string, string> = {};
    await Promise.all(
      newFiles.map(async (nf) => {
        if (!nf.file) return;
        const t = await createThumb(nf.file);
        if (t) thumbsMap[nf.id] = t;
      })
    );
    setThumbs((prev) => ({ ...prev, ...thumbsMap }));
  };

  const removeLocalFile = (id: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.id !== id));
    setThumbs((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleUpload = () => {
    const items: UploadFile[] = [
      ...localFiles.map((f) => ({ ...f, status: "pending" as const })),
    ];

    if (urlInput.trim()) {
      items.push({
        id: generateUploadId(),
        url: urlInput.trim(),
        name: urlInput.trim().split("/").pop() || "external",
        status: "pending",
        progress: 0,
      });
    }

    if (items.length > 0) {
      addPendingUploads(items);
      processUploads();
    }

    setLocalFiles([]);
    setThumbs({});
    setUrlInput("");
    setShowUploadModal(false);
  };

  useEffect(() => {
    if (!showUploadModal) {
      setLocalFiles([]);
      setThumbs({});
      setUrlInput("");
      setDragOver(false);
    }
  }, [showUploadModal]);

  if (!showUploadModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-muted/60">
              <UploadIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">Upload media</div>
          </div>
          <div>
            <Button size="icon" variant="ghost" onClick={() => setShowUploadModal(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />

          {localFiles.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Selected files</div>
              <ScrollArea className="max-h-40 rounded">
                <div className="flex flex-col gap-2">
                  {localFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-2 border rounded bg-muted/40">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 flex items-center justify-center overflow-hidden rounded bg-black/20 border">
                          {thumbs[f.id] ? (
                            <img src={thumbs[f.id]} className="object-cover w-full h-full" alt={f.name} />
                          ) : (
                            <FileIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-sm truncate max-w-xs">{f.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => removeLocalFile(f.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste media URL (https://...)"
              className="flex-1 px-3 py-2 rounded bg-slate-800 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button onClick={() => { if (urlInput.trim()) { /* quick add */ const item: UploadFile = { id: generateUploadId(), url: urlInput.trim(), name: urlInput.trim().split("/").pop() || "external", status: "pending" }; setLocalFiles((p) => [item, ...p]); setUrlInput(""); }}} variant="outline" size="sm">
              Add
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/60 bg-slate-950">
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={localFiles.length === 0 && !urlInput.trim()}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalUpload;
