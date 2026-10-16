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

export type UgcStatus = "en-modération" | "publié";

export interface UgcPost {
  id: string;
  caption: string;
  productIds: string[];
  photoDataUrl?: string;
  status: UgcStatus;
  createdAt: string;
  /** Horodatage du consentement d'affichage (preuve affichée dans le compte). */
  consentAt: string;
  /** Vrai pour les looks d'exemple fournis avec la démo (pas de photo cliente). */
  seed?: boolean;
}

export interface UgcSubmitInput {
  caption: string;
  productIds: string[];
  photoDataUrl?: string;
  /** Case « je consens à l'affichage » — obligatoire. */
  consent: boolean;
}

export interface UgcSubmitResult {
  ok: boolean;
  post?: UgcPost;
  error?: string;
}

interface UgcContextValue {
  /** Soumissions de l'utilisatrice (localStorage uniquement). */
  posts: UgcPost[];
  /** Looks d'exemple (catalogue, sans photo cliente). */
  seeds: UgcPost[];
  /** Galerie visible : seeds + soumissions publiées, moins les posts signalés. */
  gallery: UgcPost[];
  reports: string[];
  submit: (input: UgcSubmitInput) => UgcSubmitResult;
  /** Simule la validation de la file de modération locale. */
  publish: (id: string) => void;
  /** Retrait immédiat (droit au retrait). */
  withdraw: (id: string) => void;
  /** Signale un post : enregistré localement, post masqué de la galerie. */
  report: (postId: string) => void;
  isReported: (postId: string) => boolean;
  findPost: (id: string) => UgcPost | undefined;
}

const UgcContext = createContext<UgcContextValue | null>(null);

export const UGC_POSTS_KEY = "pg-ugc-posts";
export const UGC_REPORTS_KEY = "pg-ugc-reports";

export const UGC_CAPTION_MAX = 280;
export const UGC_PHOTO_MAX = 12;

function makeId(prefix: string): string {
  try {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  } catch {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  }
}

function readPosts(): UgcPost[] {
  try {
    const raw = window.localStorage.getItem(UGC_POSTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is UgcPost =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as UgcPost).id === "string" &&
        typeof (v as UgcPost).caption === "string" &&
        Array.isArray((v as UgcPost).productIds) &&
        typeof (v as UgcPost).createdAt === "string",
    );
  } catch {
    return [];
  }
}

function readReports(): string[] {
  try {
    const raw = window.localStorage.getItem(UGC_REPORTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

/**
 * Looks d'exemple : pièces du catalogue, SANS photo cliente.
 * Ils portent le badge « Exemple » dans la galerie.
 */
export const UGC_SEEDS: UgcPost[] = [
  {
    id: "seed-look-tweed-automne",
    caption: "Total tweed pour une balade d'automne à Saint-Germain.",
    productIds: ["pantalon-tweed", "cardigan-cape"],
    status: "publié",
    createdAt: "2026-09-12T10:00:00.000Z",
    consentAt: "2026-09-12T10:00:00.000Z",
    seed: true,
  },
  {
    id: "seed-look-robe-soir",
    caption: "La robe en maille en soirée, avec le milpli craquelé.",
    productIds: ["robe-maille", "milpli-cuir"],
    status: "publié",
    createdAt: "2026-09-26T18:30:00.000Z",
    consentAt: "2026-09-26T18:30:00.000Z",
    seed: true,
  },
  {
    id: "seed-look-manteau-chelsea",
    caption: "Manteau long + chelsea en suède : l'uniforme du vendredi.",
    productIds: ["manteau-long-laine", "bottine-chelsea-suede"],
    status: "publié",
    createdAt: "2026-10-03T09:15:00.000Z",
    consentAt: "2026-10-03T09:15:00.000Z",
    seed: true,
  },
];

export function UgcProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<UgcPost[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const dirtyPosts = useRef(false);
  const dirtyReports = useRef(false);

  // Hydration-safe : état initial vide côté serveur, sync locale après montage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts(readPosts());
    setReports(readReports());
  }, []);

  useEffect(() => {
    if (!dirtyPosts.current) return;
    try {
      window.localStorage.setItem(UGC_POSTS_KEY, JSON.stringify(posts));
    } catch {
      // quota dépassé (photos dataURL) : on garde en mémoire
    }
  }, [posts]);

  useEffect(() => {
    if (!dirtyReports.current) return;
    try {
      window.localStorage.setItem(UGC_REPORTS_KEY, JSON.stringify(reports));
    } catch {
      // stockage indisponible : signalements limités à la session
    }
  }, [reports]);

  const submit = useCallback((input: UgcSubmitInput): UgcSubmitResult => {
    const caption = input.caption.trim();
    if (!caption) return { ok: false, error: "Ajoutez une légende à votre look." };
    if (caption.length > UGC_CAPTION_MAX)
      return { ok: false, error: `Légende trop longue (${UGC_CAPTION_MAX} caractères maximum).` };
    const productIds = [...new Set(input.productIds.filter(Boolean))];
    if (productIds.length === 0)
      return { ok: false, error: "Liez au moins une pièce du catalogue à votre look." };
    if (!input.consent)
      return { ok: false, error: "Le consentement d'affichage est obligatoire pour publier." };
    dirtyPosts.current = true;
    let created: UgcPost | undefined;
    let failure: string | undefined;
    setPosts((prev) => {
      if (input.photoDataUrl && prev.filter((p) => p.photoDataUrl).length >= UGC_PHOTO_MAX) {
        failure = `Limite de ${UGC_PHOTO_MAX} photos atteinte sur cet appareil : retirez un look pour en ajouter un nouveau.`;
        return prev;
      }
      const now = new Date().toISOString();
      created = {
        id: makeId("ugc"),
        caption,
        productIds,
        photoDataUrl: input.photoDataUrl,
        status: "en-modération",
        createdAt: now,
        consentAt: now,
      };
      return [created, ...prev];
    });
    if (failure) return { ok: false, error: failure };
    if (!created) return { ok: false, error: "Soumission impossible pour le moment." };
    return { ok: true, post: created };
  }, []);

  const publish = useCallback((id: string) => {
    dirtyPosts.current = true;
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "publié" as const } : p)));
  }, []);

  const withdraw = useCallback((id: string) => {
    dirtyPosts.current = true;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const report = useCallback((postId: string) => {
    dirtyReports.current = true;
    setReports((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
  }, []);

  const isReported = useCallback((postId: string) => reports.includes(postId), [reports]);

  const findPost = useCallback(
    (id: string): UgcPost | undefined =>
      UGC_SEEDS.find((s) => s.id === id) ?? posts.find((p) => p.id === id),
    [posts],
  );

  const gallery = useMemo<UgcPost[]>(
    () =>
      [...UGC_SEEDS, ...posts.filter((p) => p.status === "publié")].filter(
        (p) => !reports.includes(p.id),
      ),
    [posts, reports],
  );

  const value = useMemo<UgcContextValue>(
    () => ({ posts, seeds: UGC_SEEDS, gallery, reports, submit, publish, withdraw, report, isReported, findPost }),
    [posts, gallery, reports, submit, publish, withdraw, report, isReported, findPost],
  );

  return <UgcContext.Provider value={value}>{children}</UgcContext.Provider>;
}

export function useUgc(): UgcContextValue {
  const ctx = useContext(UgcContext);
  if (!ctx) throw new Error("useUgc doit être utilisé dans <UgcProvider>");
  return ctx;
}
