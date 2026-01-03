import { create } from "zustand";

interface ApiModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;

  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;

  open: (config: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => Promise<void> | void;
    onCancel?: () => void;
  }) => void;

  close: () => void;
}

export const useApiModalStore = create<ApiModalState>((set) => ({
  isOpen: false,
  title: "",
  description: "",

  open: (config) =>
    set({
      isOpen: true,
      ...config,
    }),

  close: () =>
    set({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: undefined,
      onCancel: undefined,
    }),
}));
