"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

const SHIPPING_KEY = "maje-shipping";

interface ShippingForm {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
}

const INITIAL: ShippingForm = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  adresse: "",
  codePostal: "",
  ville: "",
  pays: "France",
};

export default function LivraisonPage() {
  const router = useRouter();
  const { lines, total } = useMajeCart();
  const [form, setForm] = useState<ShippingForm>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = Object.entries(form).filter(([, v]) => v.trim() === "");
    if (missing.length > 0) {
      setError("Veuillez remplir tous les champs du formulaire.");
      return;
    }
    if (!/^\d{5}$/.test(form.codePostal.trim())) {
      setError("Le code postal doit comporter 5 chiffres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("L’adresse e-mail semble invalide.");
      return;
    }
    setError(null);
    try {
      window.localStorage.setItem(SHIPPING_KEY, JSON.stringify(form));
    } catch {
      // stockage indisponible : on poursuit vers le paiement
    }
    router.push("/fr/commande/paiement");
  }

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Commande — Livraison</h1>
        <div className="maje-co-steps" aria-label="Étapes de la commande">
          <span data-active="true">1. Livraison</span>
          <span>→</span>
          <span data-active="false">2. Paiement</span>
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
              <div className="maje-co-row">
                <div className="maje-co-field">
                  <label htmlFor="prenom">Prénom</label>
                  <input id="prenom" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} autoComplete="given-name" />
                </div>
                <div className="maje-co-field">
                  <label htmlFor="nom">Nom</label>
                  <input id="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="family-name" />
                </div>
              </div>
              <div className="maje-co-row">
                <div className="maje-co-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </div>
                <div className="maje-co-field">
                  <label htmlFor="telephone">Téléphone</label>
                  <input id="telephone" type="tel" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} autoComplete="tel" />
                </div>
              </div>
              <div className="maje-co-field">
                <label htmlFor="adresse">Adresse</label>
                <input id="adresse" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} autoComplete="street-address" />
              </div>
              <div className="maje-co-row">
                <div className="maje-co-field">
                  <label htmlFor="codePostal">Code postal</label>
                  <input id="codePostal" inputMode="numeric" value={form.codePostal} onChange={(e) => set("codePostal", e.target.value)} autoComplete="postal-code" />
                </div>
                <div className="maje-co-field">
                  <label htmlFor="ville">Ville</label>
                  <input id="ville" value={form.ville} onChange={(e) => set("ville", e.target.value)} autoComplete="address-level2" />
                </div>
              </div>
              <div className="maje-co-field">
                <label htmlFor="pays">Pays</label>
                <select id="pays" value={form.pays} onChange={(e) => set("pays", e.target.value)}>
                  <option>France</option>
                  <option>Belgique</option>
                  <option>Luxembourg</option>
                  <option>Suisse</option>
                </select>
              </div>
              {error ? <p className="maje-co-error" role="alert">{error}</p> : null}
              <button className="maje-cart-cta" type="submit">
                Continuer vers le paiement
              </button>
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
