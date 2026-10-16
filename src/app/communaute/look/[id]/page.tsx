"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeProducts } from "@/components/sites/maje/data";
import { UgcProvider, useUgc } from "@/lib/maje/ugc";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/ugc.css";

function LookDetailContenu() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { findPost, report, isReported } = useUgc();
  const post = findPost(id);

  if (!post) {
    return (
      <div className="pg-ugc-page">
        <p className="pg-ugc-kicker">Communauté</p>
        <h1 className="pg-ugc-title">Look indisponible</h1>
        <p className="pg-ugc-placeholder">
          Ce look n&apos;existe pas (ou plus) sur cet appareil : les soumissions sont stockées
          localement et peuvent avoir été retirées.
        </p>
        <p>
          <Link className="pg-ugc-link" href="/communaute">
            Retour à la galerie
          </Link>
        </p>
      </div>
    );
  }

  if (isReported(post.id)) {
    return (
      <div className="pg-ugc-page">
        <p className="pg-ugc-kicker">Communauté</p>
        <h1 className="pg-ugc-title">Look masqué</h1>
        <p className="pg-ugc-placeholder">
          Vous avez signalé ce look : il est masqué de votre galerie sur cet appareil.
        </p>
        <p>
          <Link className="pg-ugc-link" href="/communaute">
            Retour à la galerie
          </Link>
        </p>
      </div>
    );
  }

  const cover = post.photoDataUrl
    ? { src: post.photoDataUrl, alt: post.caption }
    : (() => {
        const first =
          MajeProducts.find((p) => post.productIds.includes(p.id)) ?? MajeProducts[0];
        return { src: first.image, alt: first.alt };
      })();
  const linked = post.productIds.map(
    (pid) => MajeProducts.find((p) => p.id === pid) ?? null,
  );

  return (
    <div className="pg-ugc-page">
      <p className="pg-ugc-kicker">
        <Link className="pg-ugc-link" href="/communaute">
          Communauté
        </Link>{" "}
        / Look
      </p>
      <div className="pg-ugc-detail">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pg-ugc-detail-img" src={cover.src} alt={cover.alt} />
        <div>
          <h1 className="pg-ugc-title">{post.caption}</h1>
          <p className="pg-ugc-badges">
            {post.seed && <span className="pg-ugc-badge pg-ugc-badge--exemple">Exemple</span>}
            {post.status === "publié" ? (
              <span className="pg-ugc-badge pg-ugc-badge--publie">Publié</span>
            ) : (
              <span className="pg-ugc-badge pg-ugc-badge--moderation">En modération</span>
            )}
          </p>
          <p className="pg-ugc-detail-meta">
            Partagé le {new Date(post.createdAt).toLocaleDateString("fr-FR")}
            {post.seed ? " · Look d'exemple (catalogue, sans photo cliente)" : ""}
          </p>
          <h2 className="pg-ugc-section-title">Pièces portées</h2>
          <ul className="pg-ugc-row">
            {linked.map((p, index) => (
              <li key={`${post.productIds[index]}-${index}`} className="pg-ugc-row-item">
                {p ? `${p.name} — ${p.newPrice}` : post.productIds[index]}
              </li>
            ))}
          </ul>
          {!post.seed && (
            <p>
              <button
                className="pg-ugc-btn pg-ugc-btn--danger"
                type="button"
                onClick={() => report(post.id)}
              >
                Signaler ce look
              </button>
            </p>
          )}
          <p>
            <Link className="pg-ugc-link" href="/communaute">
              Retour à la galerie
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LookDetailPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <UgcProvider>
        <LookDetailContenu />
      </UgcProvider>
      <MajeFooter />
    </main>
  );
}
