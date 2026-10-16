"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";
import { formatCentsToEur } from "@/lib/maje/pricing";
import { saveOrderToSupabase } from "@/lib/maje/supabase-orders";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

const COUPON_KEY = "maje-coupon";

interface CheckoutApiResult {
  ok: boolean;
  lines: Array<{ id: string; size: string; qty: number; unitCents: number; name: string }>;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  problems: string[];
}

async function validateCart(
  items: Array<{ id: string; size: string; qty: number }>,
  coupon: string | null,
): Promise<CheckoutApiResult> {
  const res = await fetch("/api/checkout/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, coupon }),
  });
  return (await res.json()) as CheckoutApiResult;
}

export default function PaiementPage() {
  const router = useRouter();
  const { items, lines, total } = useMajeCart();
  const [titulaire, setTitulaire] = useState("");
  const [numero, setNumero] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cryptogramme, setCryptogramme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutApiResult | null>(null);
  const [validating, setValidating] = useState(false);

  // Coupon saisi sur la page panier (localStorage `maje-coupon`), transmis tel quel
  // au serveur : c'est `/api/checkout/validate` qui décide de la remise réelle.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUPON_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored && stored.trim() !== "") setCoupon(stored.trim());
    } catch {
      // stockage indisponible : pas de coupon
    }
  }, []);

  // Récapitulatif affiché depuis les totaux serveur (anti-triche navigateur).
  useEffect(() => {
    if (items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuote(null);
      return;
    }
    let cancelled = false;
    async function refresh() {
      try {
        const data = await validateCart(items, coupon);
        if (!cancelled) setQuote(data);
      } catch {
        // silencieux : la vérification bloquante a lieu à la soumission
      }
    }
    void refresh();
    return () => {
      cancelled = true;
    };
  }, [items, coupon]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!titulaire.trim() || !numero.trim() || !expiration.trim() || !cryptogramme.trim()) {
      setError("Veuillez remplir tous les champs de la carte.");
      return;
    }
    if (!/^\d{13,19}$/.test(numero.replace(/[\s-]/g, ""))) {
      setError("Le numéro de carte doit comporter entre 13 et 19 chiffres (simulation).");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiration.trim())) {
      setError("La date d’expiration doit être au format MM/AA.");
      return;
    }
    if (!/^\d{3,4}$/.test(cryptogramme.trim())) {
      setError("Le cryptogramme doit comporter 3 ou 4 chiffres.");
      return;
    }
    // Revalidation serveur juste avant confirmation : le total client n'est
    // jamais utilisé. En cas de refus (problems non vides), on bloque ici.
    setValidating(true);
    setError(null);
    let result: CheckoutApiResult | null = null;
    try {
      result = await validateCart(items, coupon);
    } catch {
      setError("Impossible de vérifier le panier. Réessayez.");
      setValidating(false);
      return;
    }
    if (!result || !result.ok || result.problems.length > 0) {
      const problems = result?.problems ?? ["Panier refusé par le serveur."];
      setError(problems.join(" "));
      setQuote(result);
      setValidating(false);
      return;
    }
    // Seuls les totaux serveur sont persistés (jamais le total navigateur).
    const serverTotal = result.totalCents / 100;
    const orderNumber = `PZ-${Date.now().toString().slice(-8)}`;
    try {
      window.localStorage.setItem(
        "maje-order",
        JSON.stringify({
          number: orderNumber,
          total: serverTotal,
          subtotalCents: result.subtotalCents,
          discountCents: result.discountCents,
          totalCents: result.totalCents,
          date: new Date().toISOString(),
        })
      );
    } catch {
      // stockage indisponible : on poursuit vers la confirmation
    }
    // Sauvegarde Supabase en arrière-plan (tables absentes = ignoré, jamais bloquant)
    const snapshot = lines.map((line) => ({ ...line }));
    void Promise.race([
      saveOrderToSupabase(orderNumber, snapshot, serverTotal),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
    router.push(`/fr/commande/confirmation?commande=${encodeURIComponent(orderNumber)}`);
  }

  const serverTotalLabel =
    quote && quote.ok ? formatCentsToEur(quote.totalCents) : formatMajePrice(total);

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Commande — Paiement</h1>
        <div className="maje-co-steps" aria-label="Étapes de la commande">
          <span data-active="false">1. Livraison</span>
          <span>→</span>
          <span data-active="true">2. Paiement</span>
          <span>→</span>
          <span data-active="false">3. Confirmation</span>
        </div>
        {lines.length === 0 ? (
          <p className="maje-cart-empty">
            Votre panier est vide. <Link href="/">Retour à la boutique</Link>
          </p>
        ) : (
          <div className="maje-commerce-layout">
            <form className="maje-co-form" onSubmit={handleSubmit} noValidate>
              <p className="maje-co-mock" role="note">
                Paiement simulé — aucune transaction réelle. N’utilisez pas de vraie carte bancaire.
              </p>
              <div className="maje-co-field">
                <label htmlFor="titulaire">Titulaire de la carte</label>
                <input id="titulaire" value={titulaire} onChange={(e) => setTitulaire(e.target.value)} autoComplete="cc-name" />
              </div>
              <div className="maje-co-field">
                <label htmlFor="numero">Numéro de carte</label>
                <input id="numero" inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value)} autoComplete="cc-number" placeholder="4242 4242 4242 4242" />
              </div>
              <div className="maje-co-row">
                <div className="maje-co-field">
                  <label htmlFor="expiration">Expiration (MM/AA)</label>
                  <input id="expiration" value={expiration} onChange={(e) => setExpiration(e.target.value)} autoComplete="cc-exp" placeholder="12/28" />
                </div>
                <div className="maje-co-field">
                  <label htmlFor="cryptogramme">Cryptogramme</label>
                  <input id="cryptogramme" inputMode="numeric" value={cryptogramme} onChange={(e) => setCryptogramme(e.target.value)} autoComplete="cc-csc" placeholder="123" />
                </div>
              </div>
              {error ? <p className="maje-co-error" role="alert">{error}</p> : null}
              <button className="maje-cart-cta" type="submit" disabled={validating}>
                {validating ? "Vérification…" : `Payer ${serverTotalLabel} (simulation)`}
              </button>
              <Link className="maje-cart-cta maje-cart-cta-secondary" href="/fr/commande/livraison">
                Retour à la livraison
              </Link>
            </form>
            <aside className="maje-cart-summary" aria-label="Récapitulatif">
              <h2>Récapitulatif</h2>
              {lines.map((line) => (
                <div key={`${line.id}-${line.size}`} className="maje-cart-summary-row">
                  <span>{line.product.name} × {line.qty}</span>
                  <span>{formatMajePrice(line.lineTotal)}</span>
                </div>
              ))}
              {quote && quote.ok && quote.discountCents > 0 ? (
                <div className="maje-cart-summary-row">
                  <span>Coupon{coupon ? ` ${coupon}` : ""}</span>
                  <span>−{formatCentsToEur(quote.discountCents)}</span>
                </div>
              ) : null}
              <div className="maje-cart-summary-row maje-cart-summary-total">
                <span>Total vérifié</span>
                <span>{serverTotalLabel}</span>
              </div>
              {quote && !quote.ok ? (
                <p className="maje-co-error" role="alert">{quote.problems.join(" ")}</p>
              ) : null}
            </aside>
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
