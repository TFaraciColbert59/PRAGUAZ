"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeProducts } from "@/components/sites/maje/data";
import {
  UGC_CAPTION_MAX,
  UgcProvider,
  useUgc,
  type UgcPost,
} from "@/lib/maje/ugc";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/ugc.css";

function productName(id: string): string {
  return MajeProducts.find((p) => p.id === id)?.name ?? id;
}

function postCover(post: UgcPost): { src: string; alt: string } {
  if (post.photoDataUrl) return { src: post.photoDataUrl, alt: post.caption };
  const first = MajeProducts.find((p) => post.productIds.includes(p.id)) ?? MajeProducts[0];
  return { src: first.image, alt: first.alt };
}

function StatusBadge({ post }: { post: UgcPost }) {
  return (
    <span className="pg-ugc-badges">
      {post.seed && <span className="pg-ugc-badge pg-ugc-badge--exemple">Exemple</span>}
      {post.status === "publié" ? (
        <span className="pg-ugc-badge pg-ugc-badge--publie">Publié</span>
      ) : (
        <span className="pg-ugc-badge pg-ugc-badge--moderation">En modération</span>
      )}
    </span>
  );
}

function GalleryCard({ post }: { post: UgcPost }) {
  const { report, isReported } = useUgc();
  const cover = postCover(post);
  const masked = isReported(post.id);
  if (masked) return null;
  return (
    <li className="pg-ugc-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pg-ugc-card-img" src={cover.src} alt={cover.alt} loading="lazy" />
      <div className="pg-ugc-card-body">
        <StatusBadge post={post} />
        <p className="pg-ugc-caption">{post.caption}</p>
        <p className="pg-ugc-products">{post.productIds.map(productName).join(" · ")}</p>
        <div className="pg-ugc-card-actions">
          <Link className="pg-ugc-link" href={`/communaute/look/${post.id}`}>
            Voir le look
          </Link>
          {!post.seed && (
            <button
              className="pg-ugc-btn pg-ugc-btn--danger"
              type="button"
              onClick={() => report(post.id)}
            >
              Signaler
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function SubmitForm() {
  const { submit } = useUgc();
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function toggleProduct(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    const result = submit({ caption, productIds: selected, photoDataUrl: photo, consent });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Soumission impossible.");
      return;
    }
    setDone(true);
    setCaption("");
    setSelected([]);
    setPhoto(undefined);
    setConsent(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form className="pg-ugc-form" onSubmit={handleSubmit}>
      <h2 className="pg-ugc-section-title">Proposer mon look</h2>
      <label className="pg-ugc-field" htmlFor="pg-ugc-caption">
        Légende ({UGC_CAPTION_MAX} caractères max)
        <textarea
          id="pg-ugc-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={UGC_CAPTION_MAX}
          placeholder="Racontez votre look en une phrase…"
        />
      </label>
      <span className="pg-ugc-count">
        {caption.length}/{UGC_CAPTION_MAX}
      </span>
      <div className="pg-ugc-field">
        <span>Pièces portées (au moins une)</span>
        <div className="pg-ugc-checklist" role="group" aria-label="Pièces du catalogue">
          {MajeProducts.map((p) => (
            <label key={p.id}>
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>
      <label className="pg-ugc-field" htmlFor="pg-ugc-photo">
        Photo (optionnelle, reste sur cet appareil)
        <input
          id="pg-ugc-photo"
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
        />
      </label>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pg-ugc-preview" src={photo} alt="Aperçu de votre photo" />
      )}
      <label className="pg-ugc-consent" htmlFor="pg-ugc-consent">
        <input
          id="pg-ugc-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Je consens à l&apos;affichage de ce look dans la galerie communauté. Je confirme qu&apos;il
          s&apos;agit de ma propre photo (ou d&apos;un look sans photo) et que je peux retirer ce
          consentement à tout moment depuis « Mes soumissions ».
        </span>
      </label>
      {error && (
        <p className="pg-ugc-error" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="pg-ugc-success" role="status">
          Look envoyé en file de modération locale. Retrouvez-le dans « Mes soumissions » pour le
          publier.
        </p>
      )}
      <button className="pg-ugc-submit" type="submit" disabled={busy}>
        Soumettre mon look
      </button>
    </form>
  );
}

function CommunauteContenu() {
  const { gallery } = useUgc();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => (filter ? gallery.filter((p) => p.productIds.includes(filter)) : gallery),
    [gallery, filter],
  );

  return (
    <div className="pg-ugc-page">
      <p className="pg-ugc-kicker">La communauté Praguaz</p>
      <h1 className="pg-ugc-title">Vos looks, vos pièces</h1>
      <p className="pg-ugc-intro">
        La galerie communauté rassemble les looks portés par nos clientes, liés aux pièces du
        catalogue. Chaque soumission passe par une modération avant publication.
      </p>
      <p className="pg-ugc-local-note">
        Démo 100&nbsp;% locale : tout est stocké dans ce navigateur (localStorage), sans serveur.
      </p>

      <section className="pg-ugc-challenge" aria-label="Défi de la semaine">
        <h2>#VendrediPraguaz — le défi de la semaine</h2>
        <p>
          Cette semaine : <strong>le tweed en version casual</strong>. Proposez votre look avec au
          moins une pièce en tweed, légende de {UGC_CAPTION_MAX} caractères maximum. Les looks
          publiés avec le plus de pièces liées seront mis à l&apos;honneur vendredi prochain.
        </p>
      </section>

      <h2 className="pg-ugc-section-title">Galerie</h2>
      <div className="pg-ugc-filter">
        <label htmlFor="pg-ugc-filtre">Filtrer par pièce</label>
        <select
          id="pg-ugc-filtre"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Toutes les pièces</option>
          {MajeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="pg-ugc-empty">
          Aucun look pour cette pièce pour l&apos;instant. Soyez la première à le proposer
          ci-dessous.
        </p>
      ) : (
        <ul className="pg-ugc-grid">
          {filtered.map((post) => (
            <GalleryCard key={post.id} post={post} />
          ))}
        </ul>
      )}

      <h2 className="pg-ugc-section-title">Participer</h2>
      <SubmitForm />

      <section className="pg-ugc-mentions" aria-label="Règles de la communauté">
        <h2>Bon à savoir</h2>
        <ul>
          <li>Modération avant publication : simulée ici par une file d&apos;attente locale.</li>
          <li>Droit à l&apos;image : ne publiez que des photos dont vous détenez les droits.</li>
          <li>Les soumissions impliquant des mineures sont refusées.</li>
          <li>Retrait possible à tout moment depuis « Mes soumissions ».</li>
        </ul>
        <p>
          <Link className="pg-ugc-link" href="/fr/compte/ugc">
            Voir mes soumissions
          </Link>
        </p>
      </section>
    </div>
  );
}

export default function CommunautePage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <UgcProvider>
        <CommunauteContenu />
      </UgcProvider>
      <MajeFooter />
    </main>
  );
}
