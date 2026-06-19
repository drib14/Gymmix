import { create } from 'zustand';

let toastId = 0;

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    const toast = { id, type, title, message, duration, createdAt: Date.now() };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }
    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  success: (message, title = 'Success') => get().addToast({ type: 'success', title, message }),
  error: (message, title = 'Error') => get().addToast({ type: 'error', title, message, duration: 6000 }),
  info: (message, title = 'Info') => get().addToast({ type: 'info', title, message }),
  warning: (message, title = 'Warning') => get().addToast({ type: 'warning', title, message }),
}));

export default useToastStore;
