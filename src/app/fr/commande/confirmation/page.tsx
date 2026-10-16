"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

function ConfirmationContenu() {
  const searchParams = useSearchParams();
  const { clear } = useMajeCart();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("commande");
    let number = fromUrl;
    if (!number) {
      try {
        const raw = window.localStorage.getItem("maje-order");
        if (raw) number = (JSON.parse(raw) as { number?: string }).number ?? null;
      } catch {
        number = null;
      }
    }
    if (!number) number = `PZ-${Date.now().toString().slice(-8)}`;
    setOrderNumber(number);
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="maje-commerce">
      <h1 className="maje-commerce-title">Merci pour votre commande</h1>
      <div className="maje-co-steps" aria-label="Étapes de la commande">
        <span data-active="false">1. Livraison</span>
        <span>→</span>
        <span data-active="false">2. Paiement</span>
        <span>→</span>
        <span data-active="true">3. Confirmation</span>
      </div>
      <div className="maje-co-success">
        <p className="maje-co-mock" role="note">
          Commande simulée — aucun paiement n’a été effectué, aucun article ne sera livré.
        </p>
        <p>Numéro de commande</p>
        <p className="maje-co-ordernum">{orderNumber ?? "…"}</p>
        <p>Un e-mail de confirmation fictif vient de partir vers votre boîte.</p>
        <Link className="maje-cart-cta" href="/">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <Suspense fallback={<div className="maje-commerce">Chargement de la confirmation…</div>}>
        <ConfirmationContenu />
      </Suspense>
      <MajeFooter />
    </main>
  );
}
