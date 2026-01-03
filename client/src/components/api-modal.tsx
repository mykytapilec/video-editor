"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { useApiModalStore } from "@/features/editor/store/use-api-modal-store";

const ApiModal: React.FC = () => {
  const {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    close,
  } = useApiModalStore();

  if (!isOpen) return null;

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  const handleConfirm = async () => {
    await onConfirm?.();
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-lg shadow-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-sm font-medium">{title}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 text-sm text-muted-foreground">
          {description}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/60 bg-slate-950">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText ?? "No"}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmText ?? "Yes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiModal;
