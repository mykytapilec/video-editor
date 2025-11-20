import React from "react";
import useUploadStore from "@/features/editor/store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { Button } from "@/components/ui/button";

const UploadMenuItem: React.FC = () => {
  const { setShowUploadModal, showUploadModal } = useUploadStore();

  const openModal = () => setShowUploadModal(true);

  return (
    <>
      <Button variant="outline" size="sm" onClick={openModal}>
        Upload
      </Button>

      {showUploadModal && <ModalUpload />}
    </>
  );
};

export default UploadMenuItem;
