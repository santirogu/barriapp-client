import { create } from 'zustand';
import type { ProductPublic } from '@barriapp/api-client';

export interface CartLine {
  product: ProductPublic;
  qty: number;
}

interface CartState {
  /** Cart is scoped to a single store; adding from another store replaces it. */
  storeId: string | null;
  lines: Record<string, CartLine>;
  add: (storeId: string, product: ProductPublic) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>((set) => ({
  storeId: null,
  lines: {},
  add: (storeId, product) =>
    set((state) => {
      // Switching stores starts a fresh cart.
      const base = state.storeId === storeId ? state.lines : {};
      const existing = base[product.id];
      return {
        storeId,
        lines: {
          ...base,
          [product.id]: { product, qty: (existing?.qty ?? 0) + 1 },
        },
      };
    }),
  setQty: (productId, qty) =>
    set((state) => {
      if (qty <= 0) {
        const { [productId]: _removed, ...rest } = state.lines;
        return { lines: rest, storeId: Object.keys(rest).length ? state.storeId : null };
      }
      const line = state.lines[productId];
      if (!line) return state;
      return { lines: { ...state.lines, [productId]: { ...line, qty } } };
    }),
  remove: (productId) =>
    set((state) => {
      const { [productId]: _removed, ...rest } = state.lines;
      return { lines: rest, storeId: Object.keys(rest).length ? state.storeId : null };
    }),
  clear: () => set({ storeId: null, lines: {} }),
}));

/** Total item count across the cart. */
export function cartCount(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((sum, l) => sum + l.qty, 0);
}

/** Client-side items subtotal (COP) — the server total on order is authoritative. */
export function cartSubtotal(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((sum, l) => sum + l.product.price * l.qty, 0);
}
