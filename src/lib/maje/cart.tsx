"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MajeProducts, type MajeProduct } from "@/components/sites/maje/data";

export interface MajeCartItem {
  id: string;
  qty: number;
  size: string;
}

export interface MajeCartLine extends MajeCartItem {
  product: MajeProduct;
  lineTotal: number;
}

interface MajeCartContextValue {
  items: MajeCartItem[];
  lines: MajeCartLine[];
  count: number;
  total: number;
  add: (id: string, size?: string, qty?: number) => void;
  remove: (id: string, size?: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

const MajeCartContext = createContext<MajeCartContextValue | null>(null);

const CART_KEY = "maje-cart";
const WISHLIST_KEY = "maje-wishlist";

export function parseMajePrice(price: string): number {
  const cleaned = price.replace(/€/g, "").replace(/[\s\u00a0]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function formatMajePrice(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

export function getMajeProduct(id: string): MajeProduct | undefined {
  return MajeProducts.find((p) => p.id === id);
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sameLine(a: MajeCartItem, id: string, size: string): boolean {
  return a.id === id && a.size === size;
}

export function MajeCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MajeCartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const dirtyRef = useRef(false);

  // Hydration-safe : le serveur rend toujours un panier vide, le client
  // se synchronise avec localStorage après montage (système externe).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage<MajeCartItem[]>(CART_KEY, []));
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // stockage indisponible : le panier reste en mémoire
    }
  }, [items]);

  useEffect(() => {
    if (!dirtyRef.current) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // stockage indisponible : la wishlist reste en mémoire
    }
  }, [wishlist]);

  const add = useCallback((id: string, size = "T1", qty = 1) => {
    dirtyRef.current = true;
    const safeQty = Math.max(1, Math.floor(qty));
    setItems((prev) => {
      const existing = prev.find((l) => sameLine(l, id, size));
      if (existing) {
        return prev.map((l) => (sameLine(l, id, size) ? { ...l, qty: l.qty + safeQty } : l));
      }
      return [...prev, { id, size, qty: safeQty }];
    });
  }, []);

  const remove = useCallback((id: string, size = "T1") => {
    dirtyRef.current = true;
    setItems((prev) => prev.filter((l) => !sameLine(l, id, size)));
  }, []);

  const setQty = useCallback((id: string, size: string, qty: number) => {
    dirtyRef.current = true;
    const safeQty = Math.floor(qty);
    setItems((prev) => {
      if (safeQty <= 0) return prev.filter((l) => !sameLine(l, id, size));
      return prev.map((l) => (sameLine(l, id, size) ? { ...l, qty: safeQty } : l));
    });
  }, []);

  const clear = useCallback(() => {
    dirtyRef.current = true;
    setItems([]);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    dirtyRef.current = true;
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }, []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const lines = useMemo<MajeCartLine[]>(() => {
    const result: MajeCartLine[] = [];
    for (const item of items) {
      const product = getMajeProduct(item.id);
      if (!product) continue;
      const unit = parseMajePrice(product.newPrice);
      result.push({ ...item, product, lineTotal: unit * item.qty });
    }
    return result;
  }, [items]);

  const count = useMemo(() => items.reduce((sum, l) => sum + l.qty, 0), [items]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);

  const value = useMemo<MajeCartContextValue>(
    () => ({ items, lines, count, total, add, remove, setQty, clear, wishlist, toggleWishlist, isWishlisted }),
    [items, lines, count, total, add, remove, setQty, clear, wishlist, toggleWishlist, isWishlisted]
  );

  return <MajeCartContext.Provider value={value}>{children}</MajeCartContext.Provider>;
}

export function useMajeCart(): MajeCartContextValue {
  const ctx = useContext(MajeCartContext);
  if (!ctx) throw new Error("useMajeCart doit être utilisé dans <MajeCartProvider>");
  return ctx;
}
