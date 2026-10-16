"use client";

import Image from "next/image";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeProducts } from "@/components/sites/maje/data";
import { useMajeCart } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, add } = useMajeCart();
  const products = MajeProducts.filter((p) => wishlist.includes(p.id));

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Ma wishlist ({wishlist.length})</h1>
        {products.length === 0 ? (
          <p className="maje-cart-empty">
            Votre wishlist est vide. <Link href="/">Découvrir la collection</Link>
          </p>
        ) : (
          <div className="maje-wish-grid">
            {products.map((product) => (
              <article key={product.id} className="maje-wish-card">
                <div className="maje-wish-img">
                  <Image src={product.image} alt={product.alt} width={720} height={955} />
                </div>
                <div className="maje-wish-body">
                  <h2 className="maje-cart-name">{product.name}</h2>
                  <p className="maje-cart-price">
                    {product.oldPrice !== "" && <s>{product.oldPrice}</s>}
                    <strong>{product.newPrice}</strong>
                  </p>
                  <button
                    type="button"
                    className="maje-cart-cta"
                    onClick={() => add(product.id, "T1", 1)}
                  >
                    Ajouter au panier
                  </button>
                  <button
                    type="button"
                    className="maje-cart-cta maje-cart-cta-secondary"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    Retirer de la wishlist
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
