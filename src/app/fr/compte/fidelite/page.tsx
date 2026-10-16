"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import {
  LOYALTY_TIERS,
  SIMULATED_PURCHASE_POINTS,
  loyaltyBalanceFor,
  makeRewardCode,
  nextTierForPoints,
  tierForPoints,
  PURCHASES_KEY,
  WELCOME_POINTS_KEY,
  REDEEMED_POINTS_KEY,
  LOYALTY_HISTORY_KEY,
  REWARDS_KEY,
} from "@/lib/maje/club";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

interface HistoryEntry {
  date: string;
  label: string;
  points: number;
}

interface Reward {
  code: string;
  percent: number;
  createdAt: string;
}

function readInt(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function FidelitePage() {
  const [purchases, setPurchases] = useState(0);
  const [welcome, setWelcome] = useState(0);
  const [redeemed, setRedeemed] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPurchases(readInt(PURCHASES_KEY));
    setWelcome(readInt(WELCOME_POINTS_KEY));
    setRedeemed(readInt(REDEEMED_POINTS_KEY));
    setHistory(readJson<HistoryEntry[]>(LOYALTY_HISTORY_KEY, []));
    setRewards(readJson<Reward[]>(REWARDS_KEY, []));
    setLoaded(true);
  }, []);

  const balance = loyaltyBalanceFor(purchases, welcome, redeemed);
  const tier = tierForPoints(balance);
  const next = nextTierForPoints(balance);

  function persist(p: number, r: number, h: HistoryEntry[], rw: Reward[]) {
    try {
      window.localStorage.setItem(PURCHASES_KEY, String(p));
      window.localStorage.setItem(REDEEMED_POINTS_KEY, String(r));
      window.localStorage.setItem(LOYALTY_HISTORY_KEY, JSON.stringify(h));
      window.localStorage.setItem(REWARDS_KEY, JSON.stringify(rw));
    } catch {
      // stockage indisponible : état mémoire uniquement
    }
  }

  function handleSimulatePurchase() {
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      label: `Achat simulé (+${SIMULATED_PURCHASE_POINTS} pts)`,
      points: SIMULATED_PURCHASE_POINTS,
    };
    const nextPurchases = purchases + 1;
    const nextHistory = [entry, ...history].slice(0, 50);
    setPurchases(nextPurchases);
    setHistory(nextHistory);
    persist(nextPurchases, redeemed, nextHistory, rewards);
  }

  function handleConvert() {
    if (!tier) return;
    const code = makeRewardCode("FID");
    const reward: Reward = { code, percent: tier.percent, createdAt: new Date().toISOString() };
    const nextRewards = [reward, ...rewards].slice(0, 20);
    const nextRedeemed = redeemed + tier.threshold;
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      label: `Conversion ${tier.threshold} pts → ${code} (-${tier.percent}%)`,
      points: -tier.threshold,
    };
    const nextHistory = [entry, ...history].slice(0, 50);
    setRedeemed(nextRedeemed);
    setRewards(nextRewards);
    setHistory(nextHistory);
    setLastCode(code);
    persist(purchases, nextRedeemed, nextHistory, nextRewards);
  }

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Ma fidélité</h1>
        <p className="maje-co-mock" role="note">
          Simulation — sans facturation réelle. Solde fictif : {SIMULATED_PURCHASE_POINTS} pts par achat simulé.
        </p>
        {!loaded ? (
          <p>Chargement…</p>
        ) : (
          <div>
            <section className="maje-cart-summary" aria-label="Solde fidélité">
              <h2>
                Solde : {balance} pts ({purchases} achat{purchases > 1 ? "s" : ""} simulé
                {purchases > 1 ? "s" : ""} + {welcome} pts bienvenue)
              </h2>
              <p className="maje-co-intro">
                Palier actuel :{" "}
                <strong>{tier ? `${tier.label} (dès ${tier.threshold} pts)` : "aucun — dès 50 pts"}</strong>
              </p>
              {next ? (
                <p className="maje-co-intro">
                  Prochain palier : {next.label} à {next.threshold} pts (plus que {next.threshold - balance}{" "}
                  pts).
                </p>
              ) : (
                <p className="maje-co-intro">Palier maximum atteint ✓</p>
              )}
            </section>

            <h2 className="maje-dressing-subtitle">Paliers</h2>
            <ul className="maje-look-items">
              {LOYALTY_TIERS.map((step) => (
                <li key={step.threshold}>
                  <span>
                    {step.threshold} pts — {step.label}
                  </span>
                  <span>{balance >= step.threshold ? "atteint ✓" : "à venir"}</span>
                </li>
              ))}
            </ul>

            <div className="maje-look-actions">
              <button type="button" className="maje-cart-cta" onClick={handleSimulatePurchase}>
                Simuler un achat (+{SIMULATED_PURCHASE_POINTS} pts)
              </button>
              <button
                type="button"
                className="maje-cart-cta maje-cart-cta-secondary"
                onClick={handleConvert}
                disabled={!tier}
              >
                Convertir en code promo (simulation)
              </button>
            </div>
            {lastCode ? (
              <p className="maje-co-intro" role="status">
                Votre code : <strong>{lastCode}</strong> — à saisir au panier (simulation, format BIENVENUE).
              </p>
            ) : null}

            {rewards.length > 0 ? (
              <div>
                <h2 className="maje-dressing-subtitle">Mes codes</h2>
                <ul className="maje-look-items">
                  {rewards.map((reward) => (
                    <li key={reward.code}>
                      <span>
                        {reward.code} — -{reward.percent}%
                      </span>
                      <span>{new Date(reward.createdAt).toLocaleDateString("fr-FR")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <h2 className="maje-dressing-subtitle">Historique local</h2>
            {history.length === 0 ? (
              <p className="maje-co-intro">
                Aucun mouvement pour l’instant. Simulez un achat pour gagner {SIMULATED_PURCHASE_POINTS} pts.
              </p>
            ) : (
              <ul className="maje-look-items">
                {history.map((entry, index) => (
                  <li key={`${entry.date}-${index}`}>
                    <span>{entry.label}</span>
                    <span>{new Date(entry.date).toLocaleDateString("fr-FR")}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="maje-co-intro">
              <Link href="/fr/compte/parrainage">Parrainer et gagner des points</Link> ·{" "}
              <Link href="/club">Découvrir le Club</Link>
            </p>
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
