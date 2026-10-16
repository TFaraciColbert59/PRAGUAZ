"use client";

import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeProducts } from "@/components/sites/maje/data";
import { UgcProvider, useUgc } from "@/lib/maje/ugc";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/ugc.css";

function productName(id: string): string {
  return MajeProducts.find((p) => p.id === id)?.name ?? id;
}

function MesSoumissionsContenu() {
  const { posts, publish, withdraw } = useUgc();

  return (
    <div className="pg-ugc-page">
      <p className="pg-ugc-kicker">Mon compte</p>
      <h1 className="pg-ugc-title">Mes soumissions</h1>
      <p className="pg-ugc-intro">
        Vos looks sont stockés uniquement dans ce navigateur. La modération est simulée par une
        file d&apos;attente locale : publiez un look « en modération » pour le faire apparaître
        dans la galerie, retirez-le à tout moment.
      </p>

      {posts.length === 0 ? (
        <p className="pg-ugc-empty">
          Aucune soumission pour l&apos;instant.{" "}
          <Link className="pg-ugc-link" href="/communaute">
            Proposer un look
          </Link>
        </p>
      ) : (
        <ul className="pg-ugc-row">
          {posts.map((post) => (
            <li key={post.id} className="pg-ugc-row-item">
              <p className="pg-ugc-badges">
                {post.status === "publié" ? (
                  <span className="pg-ugc-badge pg-ugc-badge--publie">Publié</span>
                ) : (
                  <span className="pg-ugc-badge pg-ugc-badge--moderation">En modération</span>
                )}
              </p>
              <p className="pg-ugc-caption">{post.caption}</p>
              <p className="pg-ugc-products">{post.productIds.map(productName).join(" · ")}</p>
              <p className="pg-ugc-consent-proof">
                Consentement d&apos;affichage accordé le{" "}
                {new Date(post.consentAt).toLocaleDateString("fr-FR")} — révocable par retrait du
                look.
              </p>
              <div className="pg-ugc-row-actions">
                <Link className="pg-ugc-link" href={`/communaute/look/${post.id}`}>
                  Voir
                </Link>
                {post.status !== "publié" && (
                  <button className="pg-ugc-btn" type="button" onClick={() => publish(post.id)}>
                    Publier
                  </button>
                )}
                <button
                  className="pg-ugc-btn pg-ugc-btn--danger"
                  type="button"
                  onClick={() => withdraw(post.id)}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="pg-ugc-mentions" aria-label="Règles">
        <h2>Bon à savoir</h2>
        <ul>
          <li>Droit à l&apos;image : ne publiez que des photos dont vous détenez les droits.</li>
          <li>Les soumissions impliquant des mineures sont refusées.</li>
          <li>Le retrait est immédiat et supprime le look de cet appareil.</li>
        </ul>
        <p>
          <Link className="pg-ugc-link" href="/communaute">
            Retour à la galerie communauté
          </Link>
        </p>
      </section>
    </div>
  );
}

export default function CompteUgcPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <UgcProvider>
        <MesSoumissionsContenu />
      </UgcProvider>
      <MajeFooter />
    </main>
  );
}
