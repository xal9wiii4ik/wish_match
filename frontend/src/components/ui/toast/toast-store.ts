import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
}

const auto_dismiss_ms = 4000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (tone, message) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }));
    window.setTimeout(() => {
      get().dismiss(id);
    }, auto_dismiss_ms);
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const notify = {
  success(message: string): void {
    useToastStore.getState().push("success", message);
  },
  error(message: string): void {
    useToastStore.getState().push("error", message);
  },
  info(message: string): void {
    useToastStore.getState().push("info", message);
  },
};
