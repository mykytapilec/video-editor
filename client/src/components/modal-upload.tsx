"use client";

import React, { useRef, useState } from "react";
import { UploadFile, useUploadStore } from "@/features/editor/store/use-upload-store";

const ModalUpload: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showUploadModal, setShowUploadModal, addPendingUploads, processUploads } =
    useUploadStore();
  const [urlInput, setUrlInput] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const newFiles: UploadFile[] = Array.from(event.target.files).map((file) => ({
      id: (Date.now() + Math.random()).toString(),
      file,
      name: file.name,
      status: "pending",
    }));

    addPendingUploads(newFiles);
    processUploads();
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    const newFiles: UploadFile[] = [
      {
        id: (Date.now() + Math.random()).toString(),
        url: urlInput.trim(),
        name: urlInput.trim().split("/").pop() || "external",
        status: "pending",
      },
    ];

    addPendingUploads(newFiles);
    setUrlInput("");
    processUploads();
  };

  return !showUploadModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg p-6 w-96 flex flex-col gap-4">
        <h2 className="text-white text-lg">Upload Files or URL</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste video URL"
            className="flex-1 px-2 py-1 rounded text-black"
          />
          <button
            onClick={handleAddUrl}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Select Files
        </button>

        <button
          onClick={() => setShowUploadModal(false)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalUpload;
