"use client";

import Image from "next/image";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function PanierPage() {
  const { lines, count, total, setQty, remove } = useMajeCart();
  const livraisonOfferte = total >= 150 || total === 0;
  const fraisLivraison = total === 0 ? 0 : livraisonOfferte ? 0 : 6.95;

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
              <div className="maje-cart-summary-row">
                <span>Livraison</span>
                <span>{fraisLivraison === 0 ? "Offerte" : formatMajePrice(fraisLivraison)}</span>
              </div>
              <div className="maje-cart-summary-row maje-cart-summary-total">
                <span>Total</span>
                <span>{formatMajePrice(total + fraisLivraison)}</span>
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
