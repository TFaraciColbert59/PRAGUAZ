"use client";

import Image from "next/image";
import Link from "next/link";
import { useMajeCart, formatMajePrice } from "@/lib/maje/cart";

interface MajeCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MajeCartDrawer({ open, onClose }: MajeCartDrawerProps) {
  const { lines, count, total, setQty, remove } = useMajeCart();

  if (!open) return null;

  return (
    <>
      <div className="maje-cart-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="maje-cart-drawer" data-open="true" aria-label="Panier" role="dialog" aria-modal="true">
        <div className="maje-cart-drawer-head">
          <h2>Panier ({count})</h2>
          <button className="maje-cart-drawer-close" onClick={onClose} aria-label="Fermer le panier">
            ×
          </button>
        </div>
        <div className="maje-cart-drawer-body">
          {lines.length === 0 ? (
            <p className="maje-cart-empty">Votre panier est vide.</p>
          ) : (
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
          )}
        </div>
        <div className="maje-cart-drawer-foot">
          <div className="maje-cart-summary-row maje-cart-summary-total">
            <span>Sous-total</span>
            <span>{formatMajePrice(total)}</span>
          </div>
          <Link className="maje-cart-cta" href="/fr/commande/livraison" onClick={onClose}>
            Passer commande
          </Link>
          <Link className="maje-cart-cta maje-cart-cta-secondary" href="/fr/panier" onClick={onClose}>
            Voir le panier
          </Link>
        </div>
      </aside>
    </>
  );
}
