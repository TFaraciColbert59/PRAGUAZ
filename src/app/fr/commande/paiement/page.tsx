"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function PaiementPage() {
  const router = useRouter();
  const { lines, total } = useMajeCart();
  const [titulaire, setTitulaire] = useState("");
  const [numero, setNumero] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cryptogramme, setCryptogramme] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    setError(null);
    const orderNumber = `MJ-${Date.now().toString().slice(-8)}`;
    try {
      window.localStorage.setItem(
        "maje-order",
        JSON.stringify({ number: orderNumber, total, date: new Date().toISOString() })
      );
    } catch {
      // stockage indisponible : on poursuit vers la confirmation
    }
    router.push(`/fr/commande/confirmation?commande=${encodeURIComponent(orderNumber)}`);
  }

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
              <button className="maje-cart-cta" type="submit">
                Payer {formatMajePrice(total)} (simulation)
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
              <div className="maje-cart-summary-row maje-cart-summary-total">
                <span>Total</span>
                <span>{formatMajePrice(total)}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
