"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeAuth } from "@/lib/maje/auth";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export function MajeAuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">{title}</h1>
        <p className="maje-co-intro">{intro}</p>
        {children}
        <div className="maje-co-links">{footer}</div>
      </div>
      <MajeFooter />
    </main>
  );
}

export function useRequireGuestRedirect(path = "/fr/compte") {
  const { user, loading } = useMajeAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user) {
      router.replace(path);
    }
  }, [loading, user, router, path]);
  return { user, loading };
}

export async function submitAuth(
  action: () => Promise<string | null>,
  setError: (message: string | null) => void,
  setDone: () => void,
  event: FormEvent,
) {
  event.preventDefault();
  setError(null);
  const message = await action();
  if (message) {
    setError(message);
    return;
  }
  setDone();
}

export function AuthFooterLinks() {
  return (
    <>
      <Link href="/fr/compte/connexion">Se connecter</Link>
      <span aria-hidden="true"> · </span>
      <Link href="/fr/compte/inscription">Créer un compte</Link>
      <span aria-hidden="true"> · </span>
      <Link href="/fr/compte/mot-de-passe-oublie">Mot de passe oublié</Link>
    </>
  );
}
