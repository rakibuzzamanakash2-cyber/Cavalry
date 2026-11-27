// Ported from Ru'sAuth (src/toast/toastStore.ts).
import { create } from "zustand";

export type ToastType = "success" | "error";

type ToastItem = { id: string; message: string; type: ToastType };

type ToastStore = {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
};

// Long enough to read a short sentence (Ru'sAuth uses 3 seconds).
const TOAST_DURATION_MS = 6000;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, TOAST_DURATION_MS);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
