// Trạng thái giao diện dùng chung: giỏ hàng trượt và thông báo nhỏ (toast).
import { useSyncExternalStore } from "react";

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((l) => l());
    },
    use: () =>
      useSyncExternalStore(
        (fn) => {
          listeners.add(fn);
          return () => {
            listeners.delete(fn);
          };
        },
        () => value,
        () => initial,
      ),
  };
}

export const drawerStore = createStore(false);
export const openCart = () => drawerStore.set(true);
export const closeCart = () => drawerStore.set(false);

export type Toast = {
  id: number;
  message: string;
  type?: "info" | "error";
  image?: string;
  openCartAction?: boolean;
  leaving?: boolean;
};
export const toastStore = createStore<Toast[]>([]);
let nextId = 1;

export function toast(message: string, opts: Omit<Toast, "id" | "message"> = {}) {
  const id = nextId++;
  toastStore.set([...toastStore.get(), { id, message, ...opts }]);
  setTimeout(() => {
    toastStore.set(toastStore.get().map((t) => (t.id === id ? { ...t, leaving: true } : t)));
  }, 3200);
}
export function removeToast(id: number) {
  toastStore.set(toastStore.get().filter((t) => t.id !== id));
}

export const bumpStore = createStore(0);
