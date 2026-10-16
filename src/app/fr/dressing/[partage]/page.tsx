"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { decodeSharedLook } from "@/lib/maje/dressing";
import { MajeProducts } from "@/components/sites/maje/data";
import { getProductSlug } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/dressing.css";

type SharedState =
  | { status: "loading" }
  | { status: "ok"; title: string; productIds: string[] }
  | { status: "invalid" };

function readSharedState(): SharedState {
  if (typeof window === "undefined") return { status: "loading" };
  const match = window.location.hash.match(/#d=([A-Za-z0-9+/=%]+)/);
  if (!match) return { status: "invalid" };
  const decoded = decodeSharedLook(match[1]);
  if (!decoded) return { status: "invalid" };
  return { status: "ok", title: decoded.title, productIds: decoded.productIds };
}

export default function LookPartagePage() {
  const [state, setState] = useState<SharedState>({ status: "loading" });

  // Sync après montage : le hash n'existe que côté client.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readSharedState());
  }, []);

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-dressing">
        {state.status === "loading" && <p>Chargement du look partagé…</p>}
        {state.status === "invalid" && (
          <>
            <h1 className="maje-dressing-title">Lien invalide ou révoqué</h1>
            <p>
              Ce look n&apos;est plus partagé. Demandez un nouveau lien à son autrice ou{" "}
              <Link href="/fr/mon-dressing">créez votre dressing</Link>.
            </p>
          </>
        )}
        {state.status === "ok" && (
          <>
            <h1 className="maje-dressing-title">{state.title}</h1>
            <p className="maje-dressing-intro">Look partagé par une cliente Praguaz.</p>
            <div className="maje-grid">
              {state.productIds.map((id) => {
                const product = MajeProducts.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <article key={id} className="maje-tile">
                    <Link
                      href={`/fr/p/${getProductSlug(product)}`}
                      className="maje-tile-link"
                      aria-label={product.name}
                    >
                      <div className="maje-tile-img">
                        <Image
                          src={product.image}
                          alt={product.alt}
                          width={720}
                          height={955}
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <div className="maje-tile-body">
                        <h3>{product.name}</h3>
                        <p className="maje-price">
                          <strong>{product.newPrice}</strong>
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
      <MajeFooter />
    </main>
  );
}
