"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeProducts, type MajeProduct } from "./data";
import { IconHeart } from "./MajeIcons";
import { MajeTryon } from "./MajeTryon";
import { DressingQuickAdd } from "./DressingQuickAdd";
import {
  MajePdpSlugs,
  findProductBySlug,
  getProductSlug,
  getCategoryForProduct,
  getSizesForProduct,
} from "./product-slugs";
import "./pdp.css";

export { MajePdpSlugs, findProductBySlug, getProductSlug, getCategoryForProduct, getSizesForProduct };

import { getProductViews } from "@/lib/maje/hover-map";

const CART_KEY = "maje-cart";
const WISHLIST_KEY = "maje-wishlist";

interface CartLine {
  id: string;
  size: string;
  qty: number;
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.size === "string" && typeof v.qty === "number";
}

function readCart(): CartLine[] {
  try {
    const raw: string | null = window.localStorage.getItem(CART_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: string | null = window.localStorage.getItem(WISHLIST_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

interface MajePDPProps {
  product: MajeProduct;
}

export function MajePDP({ product }: MajePDPProps) {
  const [activeView, setActiveView] = useState<number>(0);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  // Sync après montage : évite un mismatch d'hydratation quand
  // la wishlist stockée contient déjà ce produit.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWishlisted(readWishlist().includes(product.id));
  }, [product.id]);

  const sizes: string[] = getSizesForProduct(product);
  const category: string = getCategoryForProduct(product);
  const views: string[] = getProductViews(product.id, product.image);
  const viewSrc: string = views[activeView] ?? views[0];
  const related: MajeProduct[] = MajeProducts.filter((p) => p.id !== product.id).slice(0, 3);

  function handleAddToCart(): void {
    if (size === null) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const cart: CartLine[] = readCart();
    const existing: CartLine | undefined = cart.find((l) => l.id === product.id && l.size === size);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, size, qty: 1 });
    }
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // stockage indisponible : on confirme quand même visuellement
    }
    setAdded(true);
  }

  function handleToggleWishlist(): void {
    const list: string[] = readWishlist();
    const next: string[] = list.includes(product.id)
      ? list.filter((id) => id !== product.id)
      : [...list, product.id];
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    } catch {
      // stockage indisponible : état local seul
    }
    setWishlisted(next.includes(product.id));
  }

  return (
    <div className="maje-pdp">
      <nav className="maje-pdp-breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span aria-hidden="true"> / </span>
        <span>Femme</span>
        <span aria-hidden="true"> / </span>
        <span>{category}</span>
        <span aria-hidden="true"> / </span>
        <strong>{product.name}</strong>
      </nav>

      <div className="maje-pdp-layout">
        <div className="maje-pdp-gallery">
          <div className="maje-pdp-main">
            {product.discount !== "" && (
              <span className="maje-pdp-badge">{product.discount}</span>
            )}
            <Image
              key={viewSrc}
              src={viewSrc}
              alt={product.alt}
              width={720}
              height={955}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              className="maje-pdp-main-img"
            />
          </div>
          <div className="maje-pdp-thumbs">
            {views.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Vue ${i + 1} sur ${views.length}`}
                aria-pressed={i === activeView}
                onClick={() => setActiveView(i)}
                className={i === activeView ? "maje-pdp-thumb maje-pdp-thumb--active" : "maje-pdp-thumb"}
              >
                <Image
                  src={src}
                  alt={`${product.alt} — vue ${i + 1}`}
                  width={180}
                  height={239}
                  sizes="120px"
                  className="maje-pdp-thumb-img"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="maje-pdp-info">
          <h1 className="maje-pdp-name">{product.name}</h1>
          <p className="maje-pdp-ref">Réf. {product.id.toUpperCase()}</p>
          <p className="maje-pdp-prices">
            {product.oldPrice !== "" && <s className="maje-pdp-old">{product.oldPrice}</s>}
            <strong className="maje-pdp-new">{product.newPrice}</strong>
            {product.discount !== "" && (
              <span className="maje-pdp-discount">{product.discount}</span>
            )}
          </p>
          <p className="maje-pdp-promo-note">Last Chance : -10% supplémentaires appliqués au panier</p>

          <div className="maje-pdp-size-head">
            <span className="maje-pdp-size-label">Taille</span>
            <Link className="maje-pdp-size-guide" href="/fr/aide/guide-tailles">
              Guide des tailles
            </Link>
          </div>
          <div className="maje-pdp-sizes" role="radiogroup" aria-label="Choisir une taille">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                  setAdded(false);
                }}
                className={size === s ? "maje-pdp-size maje-pdp-size--active" : "maje-pdp-size"}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError && <p className="maje-pdp-size-error">Veuillez sélectionner une taille</p>}

          <div className="maje-pdp-actions">
            <button
              type="button"
              onClick={handleAddToCart}
              className={added ? "maje-pdp-add maje-pdp-add--added" : "maje-pdp-add"}
            >
              {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={wishlisted ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
              aria-pressed={wishlisted}
              className={wishlisted ? "maje-pdp-wish maje-pdp-wish--active" : "maje-pdp-wish"}
            >
              <IconHeart filled={wishlisted} />
            </button>
          </div>
          {added && size !== null && (
            <p className="maje-pdp-added-msg">
              {product.name} — taille {size} ajouté au panier. <Link href="/fr/panier/">Voir le panier</Link>
            </p>
          )}
          <MajeTryon product={product} />
          <DressingQuickAdd productId={product.id} />

          <ul className="maje-pdp-services">
            <li>Livraison à domicile offerte sous 2 jours ouvrés</li>
            <li>Échanges &amp; retours offerts sous 30 jours</li>
            <li>Paiement en plusieurs fois sans frais</li>
          </ul>

          <details className="maje-pdp-acc" open>
            <summary className="maje-pdp-acc-title">Détails</summary>
            <div className="maje-pdp-acc-body">
              <p>
                {product.name} — pièce de la sélection Last Chance Praguaz. Coupe soignée, finitions couture et
                matière premium sélectionnée par le studio.
              </p>
              <p>Composition : matières nobles mélangées. Conseil d&apos;entretien : nettoyage pressing recommandé.</p>
            </div>
          </details>
          <details className="maje-pdp-acc">
            <summary className="maje-pdp-acc-title">Livraison &amp; retours</summary>
            <div className="maje-pdp-acc-body">
              <p>Livraison à domicile offerte sous 2 jours ouvrés. Retrait en boutique disponible sous 2h.</p>
              <p>Échanges et retours offerts sous 30 jours, remboursement sous 14 jours après réception.</p>
            </div>
          </details>
        </div>
      </div>

      <section className="maje-pdp-related" aria-label="Vous aimerez aussi">
        <h2 className="maje-pdp-related-title">Vous aimerez aussi</h2>
        <div className="maje-pdp-related-grid">
          {related.map((p) => (
            <Link key={p.id} href={`/fr/p/${getProductSlug(p)}`} className="maje-pdp-related-card">
              <div className="maje-pdp-related-img">
                {p.discount !== "" && <span className="maje-pdp-badge">{p.discount}</span>}
                <Image src={p.image} alt={p.alt} width={720} height={955} sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
              <h3 className="maje-pdp-related-name">{p.name}</h3>
              <p className="maje-pdp-related-price">
                {p.oldPrice !== "" && <s>{p.oldPrice}</s>} <strong>{p.newPrice}</strong>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
