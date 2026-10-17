"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import {
  MAJE_OCCASIONS,
  encodeSharedLook,
  useMajeDressing,
  type MajeLook,
} from "@/lib/maje/dressing";
import { parseMajePrice, formatMajePrice, useMajeCart } from "@/lib/maje/cart";
import { MajeProducts, type MajeProduct } from "@/components/sites/maje/data";
import { getProductSlug, getSizesForProduct } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/dressing.css";

type SortKey = "recent" | "nom" | "pieces" | "valeur";
type FilterVis = "tous" | "prive" | "partage" | "favoris";

function getLookProducts(look: MajeLook): MajeProduct[] {
  return look.productIds
    .map((id) => MajeProducts.find((p) => p.id === id))
    .filter((p): p is MajeProduct => p !== undefined);
}

function getLookValue(look: MajeLook): number {
  return getLookProducts(look).reduce((sum, p) => sum + parseMajePrice(p.newPrice), 0);
}

function LookCard({ look, view }: { look: MajeLook; view: "grille" | "liste" }) {
  const {
    renameLook,
    removeLook,
    duplicateLook,
    toggleFavorite,
    updateLook,
    removeProductFromLook,
    shareLook,
    unshareLook,
  } = useMajeDressing();
  const { add } = useMajeCart();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(look.title);
  const [draftOccasion, setDraftOccasion] = useState(look.occasion ?? "");
  const [draftNote, setDraftNote] = useState(look.note ?? "");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  const products = getLookProducts(look);
  const total = getLookValue(look);
  const coverProducts = products.slice(0, 3);

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
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    renameLook(look.id, draft);
    updateLook(look.id, { occasion: draftOccasion, note: draftNote });
    setEditing(false);
  }

  function handleAddAll() {
    for (const p of products) {
      const sizes = getSizesForProduct(p);
      add(p.id, sizes[0] ?? "M", 1);
    }
    setAddedAll(true);
    window.setTimeout(() => setAddedAll(false), 2500);
  }

  return (
    <article className={`maje-look-card maje-look-card--${view}${look.favorite ? " is-fav" : ""}`}>
      {/* Couverture visuelle */}
      <div className="maje-look-cover">
        {look.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={look.photoDataUrl} alt={`Photo du look ${look.title}`} />
        ) : coverProducts.length > 0 ? (
          <div className={`maje-look-mosaic maje-look-mosaic--${coverProducts.length}`}>
            {coverProducts.map((p) => (
              <Link key={p.id} href={`/fr/p/${getProductSlug(p)}`} aria-label={p.name}>
                <Image src={p.image} alt={p.alt} width={360} height={478} sizes="300px" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="maje-look-cover-empty">
            <span aria-hidden="true">✦</span>
            <p>Ajoutez des pièces depuis une fiche produit</p>
            <Link href="/fr/robes">Découvrir les robes</Link>
          </div>
        )}
        <div className="maje-look-cover-top">
          <span
            className={`maje-look-badge ${look.visibility === "partage" ? "is-shared" : ""}`}
          >
            {look.visibility === "partage" ? "● Partagé" : "○ Privé"}
          </span>
          {look.occasion && <span className="maje-look-badge is-occasion">{look.occasion}</span>}
        </div>
        <button
          type="button"
          className={`maje-look-fav${look.favorite ? " is-active" : ""}`}
          aria-label={look.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={look.favorite}
          onClick={() => toggleFavorite(look.id)}
        >
          {look.favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="maje-look-body">
        <div className="maje-look-head">
          {editing ? (
            <form onSubmit={handleSaveEdit} className="maje-look-edit">
              <input
                className="maje-look-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Nom du look"
                maxLength={60}
              />
              <div className="maje-look-edit-row">
                <select
                  value={draftOccasion}
                  onChange={(e) => setDraftOccasion(e.target.value)}
                  aria-label="Occasion"
                  className="maje-look-select"
                >
                  <option value="">Occasion…</option>
                  {MAJE_OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Note : avec les bottines chelsea, ceinture fine…"
                aria-label="Note du look"
                rows={2}
                maxLength={280}
                className="maje-look-textarea"
              />
              <div className="maje-look-edit-actions">
                <button type="submit" className="maje-btn-primary">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="maje-btn-ghost"
                  onClick={() => {
                    setDraft(look.title);
                    setDraftOccasion(look.occasion ?? "");
                    setDraftNote(look.note ?? "");
                    setEditing(false);
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h2>{look.title}</h2>
                <p className="maje-look-meta">
                  {products.length} pièce{products.length > 1 ? "s" : ""} ·{" "}
                  {formatMajePrice(total)}
                  {look.note ? ` · ${look.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="maje-btn-ghost"
                onClick={() => setEditing(true)}
              >
                Modifier
              </button>
            </>
          )}
        </div>

        {products.length > 0 ? (
          <ul className="maje-look-items">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/fr/p/${getProductSlug(product)}`}
                  className="maje-look-item-link"
                >
                  <span className="maje-look-thumb">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      width={120}
                      height={159}
                      sizes="80px"
                    />
                  </span>
                  <span className="maje-look-item-text">
                    <strong>{product.name}</strong>
                    <span>{product.newPrice}</span>
                  </span>
                </Link>
                <span className="maje-look-item-actions">
                  <button
                    type="button"
                    aria-label={`Ajouter ${product.name} au panier`}
                    title="Ajouter au panier"
                    onClick={() => {
                      const sizes = getSizesForProduct(product);
                      add(product.id, sizes[0] ?? "M", 1);
                    }}
                  >
                    ＋ panier
                  </button>
                  <button
                    type="button"
                    aria-label={`Retirer ${product.name} du look`}
                    onClick={() => removeProductFromLook(look.id, product.id)}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="maje-look-empty">
            Aucune pièce pour l&apos;instant. Ajoutez des pièces depuis une{" "}
            <Link href="/fr/robes">fiche produit</Link>.
          </p>
        )}

        <div className="maje-look-footer">
          <div className="maje-look-total">
            <span>Total du look</span>
            <strong>{formatMajePrice(total)}</strong>
          </div>
          <div className="maje-look-actions">
            <button
              type="button"
              className="maje-btn-primary"
              disabled={products.length === 0}
              onClick={handleAddAll}
            >
              {addedAll ? "Ajouté au panier ✓" : "Tout ajouter au panier"}
            </button>
            <button type="button" className="maje-btn-secondary" onClick={handleShare}>
              {look.visibility === "partage" ? "Rendre privé" : "Partager"}
            </button>
            {look.visibility === "partage" && (
              <button type="button" className="maje-btn-secondary" onClick={handleCopy}>
                {copied ? "Lien copié ✓" : "Copier le lien"}
              </button>
            )}
            <button
              type="button"
              className="maje-btn-secondary"
              onClick={() => duplicateLook(look.id)}
            >
              Dupliquer
            </button>
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  className="maje-btn-danger"
                  onClick={() => removeLook(look.id)}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  className="maje-btn-ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Garder
                </button>
              </>
            ) : (
              <button
                type="button"
                className="maje-btn-ghost maje-btn-danger-ghost"
                onClick={() => setConfirmDelete(true)}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DressingContenu() {
  const { looks, photos, createLook, removePhoto, addProductToLook } = useMajeDressing();
  const { add } = useMajeCart();
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [query, setQuery] = useState("");
  const [filterVis, setFilterVis] = useState<FilterVis>("tous");
  const [filterOccasion, setFilterOccasion] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"grille" | "liste">("grille");

  const stats = useMemo(() => {
    const pieces = looks.reduce((s, l) => s + l.productIds.length, 0);
    const valeur = looks.reduce((s, l) => s + getLookValue(l), 0);
    const partages = looks.filter((l) => l.visibility === "partage").length;
    const favoris = looks.filter((l) => l.favorite).length;
    return { looks: looks.length, pieces, valeur, partages, favoris };
  }, [looks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...looks];
    if (filterVis === "prive") list = list.filter((l) => l.visibility === "prive");
    if (filterVis === "partage") list = list.filter((l) => l.visibility === "partage");
    if (filterVis === "favoris") list = list.filter((l) => l.favorite);
    if (filterOccasion) list = list.filter((l) => l.occasion === filterOccasion);
    if (q) {
      list = list.filter((l) => {
        const inTitle = l.title.toLowerCase().includes(q);
        const inNote = (l.note ?? "").toLowerCase().includes(q);
        const inProducts = getLookProducts(l).some((p) =>
          p.name.toLowerCase().includes(q),
        );
        return inTitle || inNote || inProducts;
      });
    }
    switch (sort) {
      case "nom":
        list.sort((a, b) => a.title.localeCompare(b.title, "fr"));
        break;
      case "pieces":
        list.sort((a, b) => b.productIds.length - a.productIds.length);
        break;
      case "valeur":
        list.sort((a, b) => getLookValue(b) - getLookValue(a));
        break;
      case "recent":
      default:
        list.sort((a, b) =>
          (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
        );
        break;
    }
    return list;
  }, [looks, query, filterVis, filterOccasion, sort]);

  const suggestions = useMemo(() => {
    const inDressing = new Set(looks.flatMap((l) => l.productIds));
    return MajeProducts.filter((p) => !inDressing.has(p.id)).slice(0, 4);
  }, [looks]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim() === "" && looks.length > 0) return;
    createLook(title || `Look ${looks.length + 1}`, [], occasion || undefined);
    setTitle("");
    setOccasion("");
  }

  function addSuggestionToEnvies(productId: string) {
    const existing = looks.find((l) => l.title === "Mes envies");
    const lookId = existing ? existing.id : createLook("Mes envies").id;
    addProductToLook(lookId, productId);
  }

  return (
    <div className="maje-dressing">
      {/* Hero */}
      <header className="maje-dressing-hero">
        <div>
          <p className="maje-dressing-kicker">Espace personnel · privé par défaut</p>
          <h1 className="maje-dressing-title">Mon dressing</h1>
          <p className="maje-dressing-intro">
            Composez des looks, visualisez leur valeur, partagez-les par lien révocable —
            tout reste sur cet appareil, sans compte ni serveur.
          </p>
        </div>
        <div className="maje-dressing-stats" role="list" aria-label="Résumé du dressing">
          <div role="listitem">
            <strong>{stats.looks}</strong>
            <span>look{stats.looks > 1 ? "s" : ""}</span>
          </div>
          <div role="listitem">
            <strong>{stats.pieces}</strong>
            <span>pièces</span>
          </div>
          <div role="listitem">
            <strong>{formatMajePrice(stats.valeur)}</strong>
            <span>valeur totale</span>
          </div>
          <div role="listitem">
            <strong>{stats.partages}</strong>
            <span>partagé{stats.partages > 1 ? "s" : ""}</span>
          </div>
        </div>
      </header>

      {/* Création */}
      <form className="maje-look-new" onSubmit={handleCreate}>
        <input
          className="maje-look-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du look : soirée d’été, bureau minimal…"
          aria-label="Nom du nouveau look"
          maxLength={60}
        />
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          aria-label="Occasion du nouveau look"
          className="maje-look-select"
        >
          <option value="">Occasion…</option>
          {MAJE_OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <button type="submit">Créer un look</button>
      </form>

      {/* Barre d'outils */}
      {looks.length > 0 && (
        <div className="maje-dressing-toolbar">
          <div className="maje-dressing-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un look, une pièce, une note…"
              aria-label="Rechercher dans le dressing"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche">
                ✕
              </button>
            )}
          </div>
          <div className="maje-dressing-filters" role="group" aria-label="Filtres">
            {(
              [
                ["tous", "Tous"],
                ["favoris", "★ Favoris"],
                ["prive", "Privés"],
                ["partage", "Partagés"],
              ] as [FilterVis, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                className={filterVis === v ? "is-active" : ""}
                aria-pressed={filterVis === v}
                onClick={() => setFilterVis(v)}
              >
                {label}
              </button>
            ))}
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              aria-label="Filtrer par occasion"
            >
              <option value="">Toutes occasions</option>
              {MAJE_OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Trier">
              <option value="recent">Récents d’abord</option>
              <option value="nom">Nom A–Z</option>
              <option value="pieces">Plus de pièces</option>
              <option value="valeur">Valeur décroissante</option>
            </select>
            <div className="maje-view-toggle" role="group" aria-label="Affichage">
              <button
                type="button"
                className={view === "grille" ? "is-active" : ""}
                aria-pressed={view === "grille"}
                onClick={() => setView("grille")}
              >
                ⊞
              </button>
              <button
                type="button"
                className={view === "liste" ? "is-active" : ""}
                aria-pressed={view === "liste"}
                onClick={() => setView("liste")}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des looks */}
      {filtered.length > 0 ? (
        <div className={`maje-look-grid maje-look-grid--${view}`}>
          {filtered.map((look) => (
            <LookCard key={look.id} look={look} view={view} />
          ))}
        </div>
      ) : looks.length === 0 ? (
        <div className="maje-dressing-empty">
          <p className="maje-dressing-empty-title">Votre dressing vous attend</p>
          <p>
            Créez votre premier look ci-dessus, puis ajoutez des pièces depuis une{" "}
            <Link href="/fr/robes">fiche produit</Link> avec « Ajouter au dressing ».
          </p>
          <div className="maje-dressing-empty-actions">
            <Link href="/fr/robes" className="maje-btn-primary">
              Découvrir les robes
            </Link>
            <Link href="/fr/vestes-manteaux" className="maje-btn-secondary">
              Voir les manteaux
            </Link>
          </div>
        </div>
      ) : (
        <p className="maje-dressing-noresult">
          Aucun look ne correspond à ces filtres.{" "}
          <button type="button" onClick={() => { setQuery(""); setFilterVis("tous"); setFilterOccasion(""); }}>
            Réinitialiser
          </button>
        </p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section aria-label="Suggestions pour compléter vos looks">
          <h2 className="maje-dressing-subtitle">Complétez vos looks</h2>
          <div className="maje-suggest-grid">
            {suggestions.map((p) => (
              <article key={p.id} className="maje-suggest-card">
                <Link href={`/fr/p/${getProductSlug(p)}`} aria-label={p.name}>
                  <Image src={p.image} alt={p.alt} width={360} height={478} sizes="240px" />
                </Link>
                <h3>{p.name}</h3>
                <p>{p.newPrice}</p>
                <div className="maje-suggest-actions">
                  <button type="button" onClick={() => addSuggestionToEnvies(p.id)}>
                    ＋ Dressing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sizes = getSizesForProduct(p);
                      add(p.id, sizes[0] ?? "M", 1);
                    }}
                  >
                    ＋ Panier
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Photos */}
      <section aria-label="Mes photos d'essayage">
        <h2 className="maje-dressing-subtitle">
          Mes photos <span className="maje-dressing-count">({photos.length}/12)</span>
        </h2>
        {photos.length === 0 ? (
          <p className="maje-dressing-hint">
            Aucune photo. Utilisez « Essayer sur ma photo » depuis une fiche produit pour
            voir le rendu sur vous.
          </p>
        ) : (
          <div className="maje-photo-grid">
            {photos.map((src) => (
              <div key={src.slice(-48)} className="maje-photo-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Photo cliente pour essayage" />
                <button type="button" onClick={() => removePhoto(src)}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="maje-dressing-privacy">
          Stockage 100 % local : videz le cache du navigateur pour tout effacer. Le partage
          crée un lien révocable, sans envoi vers un serveur.
        </p>
      </section>
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
