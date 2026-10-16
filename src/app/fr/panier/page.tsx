"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";
import { applyPercent, formatCentsToEur } from "@/lib/maje/pricing";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

const COUPON_KEY = "maje-coupon";

interface CouponApiResult {
  ok: boolean;
  percent: number;
  reason: string;
}

export default function PanierPage() {
  const { lines, count, total, setQty, remove } = useMajeCart();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // La remise est calculée en centimes (entiers) à partir du sous-total client,
  // mais SEUL le serveur fait foi : le paiement revalide tout avant confirmation.
  const subtotalCents = Math.round(total * 100);
  const applied = applyPercent(subtotalCents, appliedCode ? couponPercent : 0);
  const discountedEuros = applied.total / 100;
  const livraisonOfferte = discountedEuros >= 150 || discountedEuros === 0;
  const fraisLivraison = discountedEuros === 0 ? 0 : livraisonOfferte ? 0 : 6.95;

  // Restaure le coupon stocké (saisi précédemment sur cette page).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUPON_KEY);
      if (stored && stored.trim() !== "") {
        setAppliedCode(stored.trim());
        setCouponInput(stored.trim());
      }
    } catch {
      // stockage indisponible : pas de coupon persistant
    }
  }, []);

  // Re-valide silencieusement le coupon stocké dès que le sous-total est connu.
  useEffect(() => {
    if (!appliedCode || subtotalCents <= 0) return;
    let cancelled = false;
    async function revalidate() {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCode, totalCents: subtotalCents }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as CouponApiResult;
        if (cancelled) return;
        if (data.ok) {
          setCouponPercent(data.percent);
          setCouponMsg(null);
        } else {
          try {
            window.localStorage.removeItem(COUPON_KEY);
          } catch {
            // stockage indisponible
          }
          setAppliedCode(null);
          setCouponPercent(0);
          setCouponMsg(data.reason);
        }
      } catch {
        // silencieux : la validation bloquante a lieu au paiement
      }
    }
    void revalidate();
    return () => {
      cancelled = true;
    };
  }, [appliedCode, subtotalCents]);

  async function applyCoupon(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = couponInput.trim();
    if (code === "") {
      setCouponMsg("Saisissez un code coupon.");
      return;
    }
    setChecking(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, totalCents: subtotalCents }),
      });
      const data = (await res.json()) as CouponApiResult;
      if (data.ok) {
        try {
          window.localStorage.setItem(COUPON_KEY, code);
        } catch {
          // stockage indisponible : coupon actif pour cette session uniquement
        }
        setAppliedCode(code);
        setCouponPercent(data.percent);
        setCouponMsg(null);
      } else {
        setCouponMsg(data.reason);
      }
    } catch {
      setCouponMsg("Vérification impossible. Réessayez.");
    } finally {
      setChecking(false);
    }
  }

  function removeCoupon() {
    try {
      window.localStorage.removeItem(COUPON_KEY);
    } catch {
      // stockage indisponible
    }
    setAppliedCode(null);
    setCouponPercent(0);
    setCouponMsg(null);
  }

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Panier ({count})</h1>
        {lines.length === 0 ? (
          <p className="maje-cart-empty">
            Votre panier est vide. <Link href="/">Découvrir la collection</Link>
          </p>
        ) : (
          <div className="maje-commerce-layout">
            <ul className="maje-cart-list">
              {lines.map((line) => (
                <li key={`${line.id}-${line.size}`} className="maje-cart-line">
                  <div className="maje-cart-thumb">
                    <Image src={line.product.image} alt={line.product.alt} width={176} height={234} />
                  </div>
                  <div>
                    <p className="maje-cart-name">{line.product.name}</p>
                    <p className="maje-cart-meta">Taille : {line.size}</p>
                    <p className="maje-cart-price">
                      {line.product.oldPrice !== "" && <s>{line.product.oldPrice}</s>}
                      <strong>{formatMajePrice(line.lineTotal)}</strong>
                    </p>
                    <div className="maje-cart-qty">
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        onClick={() => setQty(line.id, line.size, line.qty - 1)}
                      >
                        −
                      </button>
                      <output aria-label="Quantité">{line.qty}</output>
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() => setQty(line.id, line.size, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="maje-cart-remove"
                      onClick={() => remove(line.id, line.size)}
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="maje-cart-summary" aria-label="Récapitulatif">
              <h2>Récapitulatif</h2>
              <div className="maje-cart-summary-row">
                <span>Sous-total ({count} articles)</span>
                <span>{formatMajePrice(total)}</span>
              </div>
              {appliedCode ? (
                <>
                  <div className="maje-cart-summary-row">
                    <span>
                      Coupon {appliedCode} (−{couponPercent} %)
                    </span>
                    <span>−{formatCentsToEur(applied.discount)}</span>
                  </div>
                  <button type="button" className="maje-cart-remove" onClick={removeCoupon}>
                    Retirer le coupon
                  </button>
                </>
              ) : (
                <form className="maje-co-field" onSubmit={applyCoupon}>
                  <label htmlFor="coupon">Code coupon (optionnel)</label>
                  <input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="BIENVENUE10"
                    autoComplete="off"
                  />
                  <button className="maje-cart-cta maje-cart-cta-secondary" type="submit" disabled={checking}>
                    {checking ? "Vérification…" : "Appliquer"}
                  </button>
                  {couponMsg ? <p className="maje-co-error" role="alert">{couponMsg}</p> : null}
                </form>
              )}
              <div className="maje-cart-summary-row">
                <span>Livraison</span>
                <span>{fraisLivraison === 0 ? "Offerte" : formatMajePrice(fraisLivraison)}</span>
              </div>
              <div className="maje-cart-summary-row maje-cart-summary-total">
                <span>Total</span>
                <span>{formatMajePrice(discountedEuros + fraisLivraison)}</span>
              </div>
              <Link className="maje-cart-cta" href="/fr/commande/livraison">
                Passer commande
              </Link>
              <p className="maje-cart-note">Livraison offerte dès 150 € d&apos;achat.</p>
            </aside>
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
