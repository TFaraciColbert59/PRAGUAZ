"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeProducts } from "@/components/sites/maje/data";
import { useMajeCart } from "@/lib/maje/cart";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function RechercheResultats() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);
  const { add, toggleWishlist, isWishlisted } = useMajeCart();

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return MajeProducts.filter((p) => normalize(p.name).includes(q));
  }, [query]);

  return (
    <div className="maje-commerce">
      <h1 className="maje-commerce-title">Recherche</h1>
      <form
        className="maje-search-form"
        method="get"
        action="/fr/recherche"
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          if (input.trim()) params.set("q", input.trim());
          router.push(`/fr/recherche${params.toString() ? `?${params.toString()}` : ""}`);
        }}
      >
        <input
          className="maje-search-input"
          type="search"
          name="q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Rechercher un manteau, une robe…"
          aria-label="Rechercher un produit"
        />
        <button className="maje-search-btn" type="submit">
          Rechercher
        </button>
      </form>
      {query ? (
        <p className="maje-search-count">
          {results.length} résultat{results.length > 1 ? "s" : ""} pour « {query} »
        </p>
      ) : (
        <p className="maje-search-count">Saisissez un mot-clé pour lancer la recherche.</p>
      )}
      <div className="maje-wish-grid">
        {results.map((product) => (
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
              <button type="button" className="maje-cart-cta" onClick={() => add(product.id, "T1", 1)}>
                Ajouter au panier
              </button>
              <button
                type="button"
                className="maje-cart-cta maje-cart-cta-secondary"
                onClick={() => toggleWishlist(product.id)}
              >
                {isWishlisted(product.id) ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <Suspense fallback={<div className="maje-commerce">Chargement de la recherche…</div>}>
        <RechercheResultats />
      </Suspense>
      <MajeFooter />
    </main>
  );
}
