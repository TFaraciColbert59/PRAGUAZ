"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface MajeLook {
  id: string;
  title: string;
  productIds: string[];
  photoDataUrl?: string;
  visibility: "prive" | "partage";
  shareCode?: string;
  createdAt: string;
  updatedAt?: string;
  occasion?: string;
  note?: string;
  favorite?: boolean;
}

export const MAJE_OCCASIONS = [
  "Quotidien",
  "Bureau",
  "Soirée",
  "Cérémonie",
  "Week-end",
  "Vacances",
] as const;

interface MajeDressingContextValue {
  looks: MajeLook[];
  photos: string[];
  createLook: (title: string, productIds?: string[], occasion?: string) => MajeLook;
  renameLook: (id: string, title: string) => void;
  removeLook: (id: string) => void;
  duplicateLook: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateLook: (id: string, patch: { title?: string; occasion?: string; note?: string }) => void;
  addProductToLook: (lookId: string, productId: string) => void;
  removeProductFromLook: (lookId: string, productId: string) => void;
  setLookPhoto: (lookId: string, photoDataUrl: string | undefined) => void;
  shareLook: (lookId: string) => string;
  unshareLook: (lookId: string) => void;
  addPhoto: (photoDataUrl: string) => void;
  removePhoto: (photoDataUrl: string) => void;
}

const MajeDressingContext = createContext<MajeDressingContextValue | null>(null);

const LOOKS_KEY = "praguaz-dressing";
const PHOTOS_KEY = "praguaz-photos";

function makeId(prefix: string): string {
  try {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  } catch {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  }
}

function readLooks(): MajeLook[] {
  try {
    const raw = window.localStorage.getItem(LOOKS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (v): v is MajeLook =>
          typeof v === "object" &&
          v !== null &&
          typeof (v as MajeLook).id === "string" &&
          Array.isArray((v as MajeLook).productIds),
      )
      .map((v) => ({
        ...v,
        productIds: v.productIds.filter((p): p is string => typeof p === "string"),
        visibility: v.visibility === "partage" ? "partage" : "prive",
        title: typeof v.title === "string" && v.title.trim() !== "" ? v.title : "Mon look",
        occasion: typeof v.occasion === "string" ? v.occasion : undefined,
        note: typeof v.note === "string" ? v.note : undefined,
        favorite: v.favorite === true,
      }));
  } catch {
    return [];
  }
}

function readPhotos(): string[] {
  try {
    const raw = window.localStorage.getItem(PHOTOS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

/** Encode un look pour lien de partage (pair-à-pair, sans serveur). */
export function encodeSharedLook(look: MajeLook): string {
  const payload = { t: look.title, p: look.productIds, c: look.shareCode ?? look.id };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeSharedLook(hash: string): {
  title: string;
  productIds: string[];
  shareCode: string | null;
} | null {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(escape(atob(hash))));
    if (typeof parsed !== "object" || parsed === null) return null;
    const p = parsed as Record<string, unknown>;
    const title = p.title ?? p.t;
    const productIds = p.productIds ?? p.p;
    const shareCode = p.shareCode ?? p.c;
    if (typeof title !== "string" || !Array.isArray(productIds)) return null;
    return {
      title,
      productIds: productIds.filter((v): v is string => typeof v === "string"),
      shareCode: typeof shareCode === "string" ? shareCode : null,
    };
  } catch {
    return null;
  }
}

const REVOKED_KEY = "praguaz-revoked-shares";

function readRevoked(): string[] {
  try {
    const raw = window.localStorage.getItem(REVOKED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function isShareRevoked(shareCode: string | null): boolean {
  if (!shareCode) return false;
  return readRevoked().includes(shareCode);
}

function revokeShare(shareCode: string): void {
  try {
    const revoked = readRevoked();
    if (!revoked.includes(shareCode)) {
      window.localStorage.setItem(REVOKED_KEY, JSON.stringify([...revoked, shareCode]));
    }
  } catch {
    // stockage indisponible : révocation limitée à la session
  }
}

export function MajeDressingProvider({ children }: { children: ReactNode }) {
  const [looks, setLooks] = useState<MajeLook[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const dirtyRef = useRef(false);

  // Hydration-safe : état initial vide côté serveur, sync locale après montage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLooks(readLooks());
    setPhotos(readPhotos());
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) return;
    try {
      window.localStorage.setItem(LOOKS_KEY, JSON.stringify(looks));
    } catch {
      // quota dépassé (photos lourdes) : on garde en mémoire
    }
  }, [looks]);

  useEffect(() => {
    if (!dirtyRef.current) return;
    try {
      window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    } catch {
      // quota dépassé : on garde en mémoire
    }
  }, [photos]);

  const createLook = useCallback(
    (title: string, productIds: string[] = [], occasion?: string): MajeLook => {
      dirtyRef.current = true;
      const now = new Date().toISOString();
      const look: MajeLook = {
        id: makeId("look"),
        title: title.trim() || "Mon look",
        productIds: [...new Set(productIds)],
        visibility: "prive",
        createdAt: now,
        updatedAt: now,
        occasion: occasion?.trim() ? occasion.trim() : undefined,
        favorite: false,
      };
      setLooks((prev) => [look, ...prev]);
      return look;
    },
    [],
  );

  const renameLook = useCallback((id: string, title: string) => {
    dirtyRef.current = true;
    const now = new Date().toISOString();
    setLooks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, title: title.trim() || l.title, updatedAt: now } : l)),
    );
  }, []);

  const updateLook = useCallback(
    (id: string, patch: { title?: string; occasion?: string; note?: string }) => {
      dirtyRef.current = true;
      const now = new Date().toISOString();
      setLooks((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const next: MajeLook = { ...l, updatedAt: now };
          if (patch.title !== undefined) {
            const t = patch.title.trim();
            if (t !== "") next.title = t;
          }
          if (patch.occasion !== undefined) {
            const o = patch.occasion.trim();
            next.occasion = o === "" ? undefined : o;
          }
          if (patch.note !== undefined) {
            const n = patch.note.trim();
            next.note = n === "" ? undefined : patch.note.slice(0, 280);
          }
          return next;
        }),
      );
    },
    [],
  );

  const toggleFavorite = useCallback((id: string) => {
    dirtyRef.current = true;
    setLooks((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, favorite: !l.favorite, updatedAt: new Date().toISOString() }
          : l,
      ),
    );
  }, []);

  const duplicateLook = useCallback((id: string) => {
    dirtyRef.current = true;
    const now = new Date().toISOString();
    setLooks((prev) => {
      const src = prev.find((l) => l.id === id);
      if (!src) return prev;
      const copy: MajeLook = {
        ...src,
        id: makeId("look"),
        title: `${src.title} (copie)`,
        visibility: "prive",
        shareCode: undefined,
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      return [copy, ...prev];
    });
  }, []);

  const removeLook = useCallback((id: string) => {
    dirtyRef.current = true;
    setLooks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addProductToLook = useCallback((lookId: string, productId: string) => {
    dirtyRef.current = true;
    const now = new Date().toISOString();
    setLooks((prev) =>
      prev.map((l) =>
        l.id === lookId && !l.productIds.includes(productId)
          ? { ...l, productIds: [...l.productIds, productId], updatedAt: now }
          : l,
      ),
    );
  }, []);

  const removeProductFromLook = useCallback((lookId: string, productId: string) => {
    dirtyRef.current = true;
    const now = new Date().toISOString();
    setLooks((prev) =>
      prev.map((l) =>
        l.id === lookId
          ? { ...l, productIds: l.productIds.filter((p) => p !== productId), updatedAt: now }
          : l,
      ),
    );
  }, []);

  const setLookPhoto = useCallback((lookId: string, photoDataUrl: string | undefined) => {
    dirtyRef.current = true;
    const now = new Date().toISOString();
    setLooks((prev) =>
      prev.map((l) => (l.id === lookId ? { ...l, photoDataUrl, updatedAt: now } : l)),
    );
  }, []);

  const shareLook = useCallback((lookId: string): string => {
    dirtyRef.current = true;
    const code = makeId("pgz");
    setLooks((prev) =>
      prev.map((l) =>
        l.id === lookId ? { ...l, visibility: "partage" as const, shareCode: code } : l,
      ),
    );
    return code;
  }, []);

  const unshareLook = useCallback((lookId: string) => {
    dirtyRef.current = true;
    setLooks((prev) => {
      const target = prev.find((l) => l.id === lookId);
      if (target?.shareCode) revokeShare(target.shareCode);
      return prev.map((l) => (l.id === lookId ? { ...l, visibility: "prive" as const } : l));
    });
  }, []);

  const addPhoto = useCallback((photoDataUrl: string) => {
    dirtyRef.current = true;
    setPhotos((prev) => (prev.includes(photoDataUrl) ? prev : [photoDataUrl, ...prev].slice(0, 12)));
  }, []);

  const removePhoto = useCallback((photoDataUrl: string) => {
    dirtyRef.current = true;
    setPhotos((prev) => prev.filter((p) => p !== photoDataUrl));
  }, []);

  const value = useMemo<MajeDressingContextValue>(
    () => ({
      looks,
      photos,
      createLook,
      renameLook,
      removeLook,
      duplicateLook,
      toggleFavorite,
      updateLook,
      addProductToLook,
      removeProductFromLook,
      setLookPhoto,
      shareLook,
      unshareLook,
      addPhoto,
      removePhoto,
    }),
    [
      looks,
      photos,
      createLook,
      renameLook,
      removeLook,
      duplicateLook,
      toggleFavorite,
      updateLook,
      addProductToLook,
      removeProductFromLook,
      setLookPhoto,
      shareLook,
      unshareLook,
      addPhoto,
      removePhoto,
    ],
  );

  return <MajeDressingContext.Provider value={value}>{children}</MajeDressingContext.Provider>;
}

export function useMajeDressing(): MajeDressingContextValue {
  const ctx = useContext(MajeDressingContext);
  if (!ctx) throw new Error("useMajeDressing doit être utilisé dans <MajeDressingProvider>");
  return ctx;
}
