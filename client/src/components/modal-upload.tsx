import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { FileIcon, UploadIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useUploadStore, { UploadFile } from "@/features/editor/store/use-upload-store";
import { Input } from "./ui/input";
import axios from "axios";
import useStore from "@/features/editor/store/use-store";

type ModalUploadProps = { type?: string };

export const extractVideoThumbnail = (file: File) =>
  new Promise<string>((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };

    video.onerror = () => resolve("");
  });

const ModalUpload: React.FC<ModalUploadProps> = ({ type = "all" }) => {
  const {
    showUploadModal,
    setShowUploadModal,
    files,
    setFiles,
    addPendingUploads,
    processUploads
  } = useUploadStore();

  const [videoThumbnails, setVideoThumbnails] = useState<{ [name: string]: string }>({});
  const [videoUrl, setVideoUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles
      .filter((f) => !files.some((fileObj) => fileObj.file?.name === f.name))
      .map((f) => ({ id: crypto.randomUUID(), file: f }));

    if (!newFiles.length) return;

    setFiles((prev) => [...prev, ...newFiles]);

    const thumbs = await Promise.all(
      newFiles
        .filter((f) => f.file?.type.startsWith("video/"))
        .map(async (f) => ({
          name: f.file?.name ?? "",
          thumb: f.file ? await extractVideoThumbnail(f.file) : ""
        }))
    );

    setVideoThumbnails((prev) => ({
      ...prev,
      ...Object.fromEntries(thumbs.map((v) => [v.name, v.thumb]))
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!e.dataTransfer.files) return;

    const newFiles = Array.from(e.dataTransfer.files)
      .filter((f) => !files.some((fileObj) => fileObj.file?.name === f.name))
      .map((f) => ({ id: crypto.randomUUID(), file: f }));

    if (!newFiles.length) return;

    setFiles((prev) => [...prev, ...newFiles]);

    const thumbs = await Promise.all(
      newFiles
        .filter((f) => f.file?.type.startsWith("video/"))
        .map(async (f) => ({
          name: f.file?.name ?? "",
          thumb: f.file ? await extractVideoThumbnail(f.file) : ""
        }))
    );

    setVideoThumbnails((prev) => ({
      ...prev,
      ...Object.fromEntries(thumbs.map((v) => [v.name, v.thumb]))
    }));
  };

  const handleRemoveFile = (id: string) =>
    setFiles(files.filter((f) => f.id !== id));

  const getAcceptType = () => {
    switch (type) {
      case "audio":
        return "audio/*";
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      default:
        return "audio/*,image/*,video/*";
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    const userId = "PJ1nkaufw0hZPyhN7bWCP";

    try {
      let uploadedFiles: UploadFile[] = [];

      // URL UPLOAD
      if (videoUrl.trim()) {
        const res = await axios.post("/api/uploads/url", {
          userId,
          urls: [videoUrl.trim()]
        });

        uploadedFiles.push(
          ...res.data.uploads.map((u: any) => ({
            id: crypto.randomUUID(),
            url: u.url,
            type: "url",
            name: u.fileName || ""
          }))
        );
      }

      // LOCAL UPLOAD
      if (files.length > 0) {
        const fileNames = files.map((f) => f.file?.name || "file");

        await axios.post("/api/uploads/presign", {
          userId,
          fileNames
        });

        uploadedFiles.push(
          ...files.map((f) => ({
            id: f.id,
            file: f.file,
            type: f.file?.type,
            name: f.file?.name
          }))
        );
      }

      addPendingUploads(uploadedFiles);
      processUploads();

      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((f) => {
          useStore.getState().setActiveIds?.([
            f.id as unknown as number
          ]);
        });
      }

      setFiles([]);
      setVideoUrl("");
      setShowUploadModal(false);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setFiles([]);
  }, [showUploadModal]);

  return (
    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <label className="flex flex-col gap-2">
            <input
              type="file"
              accept={getAcceptType()}
              onChange={handleFileChange}
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <div
              className={clsx(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border border-border hover:border-muted-foreground/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or
              </p>
              <Button onClick={triggerFileInput} variant="outline" size="sm">
                browse files
              </Button>
            </div>
          </label>

          {files.length > 0 && (
            <ScrollArea className="max-h-48">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    className="relative flex flex-col items-center p-2 border rounded shadow-sm w-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="flex flex-1 gap-2 items-center">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {file.file?.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file.file)}
                              alt={file.file.name}
                              className="h-8 w-8 object-cover rounded border"
                            />
                          ) : file.file?.type.startsWith("video/") &&
                            videoThumbnails[file.file.name] ? (
                            <img
                              src={videoThumbnails[file.file.name]}
                              alt={file.file.name}
                              className="h-8 w-8 object-cover rounded border"
                            />
                          ) : (
                            <div className="h-8 w-8 flex items-center justify-center rounded border bg-muted">
                              <FileIcon className="h-4 w-4 text-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">{file.file?.name}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}

          <Input
            type="text"
            placeholder="Paste media link https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={(files.length === 0 && !videoUrl) || isUploading}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUpload;
