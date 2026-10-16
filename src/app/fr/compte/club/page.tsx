"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import {
  getClubPlan,
  formatClubPrice,
  readLocalSubscription,
  SUBSCRIPTION_KEY,
  type ClubSubscription,
} from "@/lib/maje/club";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function CompteClubPage() {
  const [subscription, setSubscription] = useState<ClubSubscription | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubscription(readLocalSubscription());
    setLoaded(true);
  }, []);

  function handleCancel() {
    if (!subscription) return;
    const canceled: ClubSubscription = { ...subscription, status: "canceled" };
    try {
      window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(canceled));
    } catch {
      // stockage indisponible : état mémoire uniquement
    }
    setSubscription(canceled);
  }

  function handleReactivate() {
    if (!subscription) return;
    const active: ClubSubscription = { ...subscription, status: "active" };
    try {
      window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(active));
    } catch {
      // ignore
    }
    setSubscription(active);
  }

  const plan = getClubPlan(subscription?.planCode ?? null);

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Mon Club</h1>
        <p className="maje-co-mock" role="note">
          Simulation — sans facturation réelle. Statut fictif conservé dans votre navigateur.
        </p>
        {!loaded ? (
          <p>Chargement…</p>
        ) : !subscription || !plan ? (
          <div>
            <p className="maje-co-intro">Vous n’avez pas encore d’abonnement simulé.</p>
            <div className="maje-look-actions">
              <Link className="maje-cart-cta" href="/club">
                Découvrir le Club
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <section className="maje-cart-summary" aria-label="Statut de l'abonnement">
              <h2>
                {plan.name} — {formatClubPrice(plan.priceMonthlyCents)}/mois (simulé)
              </h2>
              <p className="maje-co-intro">
                Statut : <strong>{subscription.status}</strong>
              </p>
              <p className="maje-co-intro">
                Période en cours jusqu’au{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")} (simulation).
              </p>
              <p className="maje-co-intro">Remise : -{plan.discountPercent}% sur tout (simulation).</p>
            </section>
            <div className="maje-look-actions">
              {subscription.status === "active" ? (
                <button type="button" className="maje-cart-cta" onClick={handleCancel}>
                  Résilier (simulation)
                </button>
              ) : (
                <button type="button" className="maje-cart-cta" onClick={handleReactivate}>
                  Réactiver (simulation)
                </button>
              )}
              <Link className="maje-cart-cta maje-cart-cta-secondary" href="/club">
                Voir les formules
              </Link>
              <Link className="maje-cart-cta maje-cart-cta-secondary" href="/fr/compte/fidelite">
                Voir mes points
              </Link>
            </div>
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
