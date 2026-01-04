"use client";

import React from "react";
import { useUploadStore } from "@/features/editor/store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const UploadMenuItem: React.FC = () => {
  const { setShowUploadModal, showUploadModal } = useUploadStore();

  const openModal = () => setShowUploadModal(true);

  return (
    <div className="px-4 py-3 space-y-3 pointer-events-auto select-none">
      <div className="text-text-primary flex h-12 flex-none items-center px-1 text-sm font-medium">
        Your uploads
      </div>

      <Button
        onClick={openModal}
        className={cn(
          buttonVariants({ variant: "default" }),
          "w-full flex items-center justify-center gap-2"
        )}
      >
        <PlusCircle className="w-4 h-4" />
        Uploads
      </Button>

      {showUploadModal && <ModalUpload />}
    </div>
  );
};

export default UploadMenuItem;
