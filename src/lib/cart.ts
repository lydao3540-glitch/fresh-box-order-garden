// Giỏ hàng – lưu trong localStorage của trình duyệt, đồng bộ giữa các tab.
import { useSyncExternalStore } from "react";
import { clampQty, computeCart, findProduct, type CartItem } from "./catalog";

const KEY = "freshbox-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((i) => i && findProduct(i.id))
      .map((i) => ({ id: String(i.id), quantity: clampQty(i.quantity) }))
      .filter((i) => i.quantity > 0);
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  items = read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      items = read();
      emit();
    }
  });
}

function emit() {
  snapshot = computeCart(items);
  listeners.forEach((fn) => fn());
}

function save(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn */
  }
  emit();
}

const serverSnapshot = computeCart(EMPTY);
let snapshot = serverSnapshot;

function subscribe(fn: () => void) {
  ensureLoaded();
  if (snapshot === serverSnapshot && items.length) snapshot = computeCart(items);
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
}

export function getCart() {
  ensureLoaded();
  return computeCart(items);
}

export function addToCart(id: string, quantity = 1) {
  ensureLoaded();
  if (!findProduct(id)) return;
  const existing = items.find((i) => i.id === id);
  save(
    existing
      ? items.map((i) => (i.id === id ? { ...i, quantity: clampQty(i.quantity + quantity) } : i))
      : [...items, { id, quantity: clampQty(quantity) }],
  );
}

export function setQuantity(id: string, quantity: number) {
  ensureLoaded();
  const q = clampQty(quantity);
  if (q === 0) return removeFromCart(id);
  save(items.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
}

export function removeFromCart(id: string) {
  ensureLoaded();
  save(items.filter((i) => i.id !== id));
}

export function clearCart() {
  ensureLoaded();
  save([]);
}
