"use client";

import { useState } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeDressing, encodeSharedLook, type MajeLook } from "@/lib/maje/dressing";
import { MajeProducts } from "@/components/sites/maje/data";
import { getProductSlug } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/dressing.css";

function LookCard({ look }: { look: MajeLook }) {
  const { renameLook, removeLook, removeProductFromLook, shareLook, unshareLook } =
    useMajeDressing();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(look.title);
  const [copied, setCopied] = useState(false);
  const products = look.productIds
    .map((id) => MajeProducts.find((p) => p.id === id))
    .filter((p) => p !== undefined);

  function handleShare() {
    if (look.visibility === "partage") {
      unshareLook(look.id);
      setCopied(false);
      return;
    }
    shareLook(look.id);
  }

  async function handleCopy() {
    const url = `${window.location.origin}/fr/dressing/partage#d=${encodeSharedLook(look)}`;
    try {
      await window.navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="maje-look-card">
      <div className="maje-look-head">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renameLook(look.id, draft);
              setEditing(false);
            }}
          >
            <input
              className="maje-look-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Nom du look"
            />
          </form>
        ) : (
          <h2>{look.title}</h2>
        )}
        <span className="maje-look-visibility">
          {look.visibility === "partage" ? "Partagé" : "Privé"}
        </span>
      </div>
      {look.photoDataUrl !== undefined && (
        <div className="maje-look-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={look.photoDataUrl} alt={`Photo du look ${look.title}`} />
        </div>
      )}
      <ul className="maje-look-items">
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/fr/p/${getProductSlug(product)}`}>{product.name}</Link>
            <button
              type="button"
              aria-label={`Retirer ${product.name} du look`}
              onClick={() => removeProductFromLook(look.id, product.id)}
            >
              ✕
            </button>
          </li>
        ))}
        {products.length === 0 && <li className="maje-look-empty">Aucune pièce pour l&apos;instant.</li>}
      </ul>
      <div className="maje-look-actions">
        <button type="button" onClick={() => setEditing((v) => !v)}>
          {editing ? "Annuler" : "Renommer"}
        </button>
        <button type="button" onClick={handleShare}>
          {look.visibility === "partage" ? "Rendre privé" : "Partager"}
        </button>
        {look.visibility === "partage" && (
          <button type="button" onClick={handleCopy}>
            {copied ? "Lien copié ✓" : "Copier le lien"}
          </button>
        )}
        <button type="button" onClick={() => removeLook(look.id)}>
          Supprimer
        </button>
      </div>
    </article>
  );
}

function DressingContenu() {
  const { looks, photos, createLook, removePhoto } = useMajeDressing();
  const [title, setTitle] = useState("");

  return (
    <div className="maje-dressing">
      <h1 className="maje-dressing-title">Mon dressing</h1>
      <p className="maje-dressing-intro">
        Vos looks et photos restent sur cet appareil. Le partage crée un lien révocable, sans
        compte ni serveur.
      </p>
      <form
        className="maje-look-new"
        onSubmit={(e) => {
          e.preventDefault();
          createLook(title);
          setTitle("");
        }}
      >
        <input
          className="maje-look-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du look : soirée d'été…"
          aria-label="Nom du nouveau look"
        />
        <button type="submit">Créer un look</button>
      </form>
      <div className="maje-look-grid">
        {looks.map((look) => (
          <LookCard key={look.id} look={look} />
        ))}
      </div>
      {looks.length === 0 && (
        <p>
          Aucun look pour l&apos;instant. Ajoutez des pièces depuis une{" "}
          <Link href="/fr/robes">fiche produit</Link>.
        </p>
      )}
      <h2 className="maje-dressing-subtitle">Mes photos</h2>
      {photos.length === 0 ? (
        <p>Aucune photo. Utilisez « Essayer sur ma photo » depuis une fiche produit.</p>
      ) : (
        <div className="maje-photo-grid">
          {photos.map((src) => (
            <div key={src.slice(-32)} className="maje-photo-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Photo cliente pour essayage" />
              <button type="button" onClick={() => removePhoto(src)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DressingPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <DressingContenu />
      <MajeFooter />
    </main>
  );
}
