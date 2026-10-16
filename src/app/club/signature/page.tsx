"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import {
  getClubPlan,
  formatClubPrice,
  readLocalSubscription,
  SUBSCRIPTION_KEY,
  WELCOME_POINTS_KEY,
  type ClubSubscription,
} from "@/lib/maje/club";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function SignaturePage() {
  const router = useRouter();
  const plan = getClubPlan("signature");
  const [current, setCurrent] = useState<ClubSubscription | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(readLocalSubscription());
  }, []);

  if (!plan) return null;

  function handleSubscribe() {
    const current = getClubPlan("signature");
    if (!current) return;
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    const subscription: ClubSubscription = {
      planCode: "signature",
      status: "active",
      startedAt: now.toISOString(),
      currentPeriodEnd: end.toISOString(),
    };
    try {
      window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
      const raw = window.localStorage.getItem(WELCOME_POINTS_KEY);
      const existing = raw ? Number.parseInt(raw, 10) : 0;
      if (!Number.isFinite(existing) || existing < current.welcomePoints) {
        window.localStorage.setItem(WELCOME_POINTS_KEY, String(current.welcomePoints));
      }
    } catch {
      // stockage indisponible : on poursuit vers le compte
    }
    setDone(true);
    router.push("/fr/compte/club");
  }

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Club — {plan.name}</h1>
        <p className="maje-co-mock" role="note">
          Simulation — sans facturation réelle. Aucune carte demandée, abonnement fictif local.
        </p>
        <p className="maje-co-intro">
          {formatClubPrice(plan.priceMonthlyCents)}/mois (simulé) · -{plan.discountPercent}% sur tout ·{" "}
          {plan.welcomePoints} points de bienvenue.
        </p>
        <ul className="maje-look-items">
          {plan.perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
        {current && current.status === "active" ? (
          <p className="maje-co-intro">
            Vous avez déjà la formule <strong>{current.planCode}</strong> (simulation).{" "}
            <Link href="/fr/compte/club">Gérer mon abonnement</Link>
          </p>
        ) : (
          <div className="maje-look-actions">
            <button type="button" className="maje-cart-cta" onClick={handleSubscribe}>
              Souscrire en simulation — {formatClubPrice(plan.priceMonthlyCents)}/mois
            </button>
            <Link className="maje-cart-cta maje-cart-cta-secondary" href="/club">
              Comparer les formules
            </Link>
          </div>
        )}
        {done ? <p className="maje-co-intro">Abonnement simulé activé ✓</p> : null}
      </div>
      <MajeFooter />
    </main>
  );
}
