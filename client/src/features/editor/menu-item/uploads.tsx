// client/src/features/editor/menu-item/uploads.tsx
"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video as VideoIcon } from "lucide-react";
import useStore from "@/features/editor/store/use-store";
import ModalUpload from "@/components/modal-upload";

const Uploads: React.FC = () => {
  const addVideoTrackItem = useStore((s) => s.addVideoTrackItem);

  useEffect(() => {
    const handler = (video: { url: string }) => {
      addVideoTrackItem(video.url, {
        start: 0,
        end: 10,
        name: video.url.split("/").pop() || "Uploaded Video",
      });
    };

    window.addEventListener("videoSelected", (ev: any) => handler(ev.detail));

    return () => {
      window.removeEventListener("videoSelected", (ev: any) => handler(ev.detail));
    };
  }, [addVideoTrackItem]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Your uploads
      </div>

      <ModalUpload />

      <div className="flex items-center justify-center px-4 mb-4">
        <Button className="w-full cursor-pointer" onClick={() => {
          const event = new CustomEvent("openUploadModal");
          window.dispatchEvent(event);
        }}>
          <VideoIcon className="w-4 h-4" />
          <span className="ml-2">Upload</span>
        </Button>
      </div>
    </div>
  );
};

export default Uploads;
