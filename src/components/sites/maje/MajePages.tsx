"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface MajeCMSLink {
  label: string;
  href: string;
}

export interface MajeCMSBlock {
  heading: string;
  paragraphs: string[];
  links?: MajeCMSLink[];
}

export interface MajeCMSPageProps {
  title: string;
  eyebrow?: string;
  intro?: string;
  blocks: MajeCMSBlock[];
}

export interface MajeStore {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
  hours: string;
}

export function MajeCMSPage({ title, eyebrow, intro, blocks }: MajeCMSPageProps) {
  return (
    <div className="maje-cms">
      <nav className="maje-cms-breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span aria-hidden="true"> / </span>
        <span>{title}</span>
      </nav>
      <p className="maje-cms-eyebrow">{eyebrow ?? "Maje — Aide & Services"}</p>
      <h1 className="maje-cms-title">{title}</h1>
      {intro ? <p className="maje-cms-intro">{intro}</p> : null}
      <div className="maje-cms-blocks">
        {blocks.map((block) => (
          <section key={block.heading} className="maje-cms-block">
            <h2>{block.heading}</h2>
            {block.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {block.links && block.links.length > 0 ? (
              <ul className="maje-cms-links">
                {block.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
      <p className="maje-cms-disclaimer">
        Boutique PRAGUAZ — contenus résumés à des fins de démonstration.
      </p>
    </div>
  );
}

export function MajeStoreLocator({ stores }: { stores: MajeStore[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalized) return stores;
    return stores.filter((s) =>
      `${s.name} ${s.address} ${s.zip} ${s.city}`.toLowerCase().includes(normalized)
    );
  }, [stores, normalized]);

  return (
    <div className="maje-stores">
      <div className="maje-stores-search">
        <label htmlFor="maje-store-q">Rechercher une ville ou une boutique</label>
        <div className="maje-stores-search-row">
          <input
            id="maje-store-q"
            type="search"
            placeholder="Ex. Paris, Lyon, Bordeaux…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <span className="maje-stores-count" role="status">
            {filtered.length} boutique{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="maje-stores-layout">
        <ul className="maje-stores-list">
          {filtered.map((store) => (
            <li key={store.id} className="maje-stores-item">
              <h2>{store.name}</h2>
              <p>
                {store.address}
                <br />
                {store.zip} {store.city}
              </p>
              <p className="maje-stores-meta">{store.phone}</p>
              <p className="maje-stores-meta">{store.hours}</p>
              <div className="maje-stores-actions">
                <span className="maje-stores-cta">Itinéraire</span>
                <Link href="/fr/e-reservation">E-réserver</Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="maje-stores-empty">
              Aucune boutique trouvée pour « {query} ». Essayez « Paris » ou « Lyon ».
            </li>
          ) : null}
        </ul>
        <div className="maje-stores-map" aria-hidden="true">
          <div className="maje-stores-map-grid" />
          <ul className="maje-stores-pins">
            {filtered.slice(0, 8).map((store, i) => (
              <li key={store.id} style={{ left: `${12 + i * 10}%`, top: `${18 + ((i * 23) % 60)}%` }}>
                <span>{i + 1}</span>
              </li>
            ))}
          </ul>
          <p>Carte factice — maquette</p>
        </div>
      </div>
    </div>
  );
}

export function MajeGiftCard({ amounts = [50, 100, 150, 200] }: { amounts?: number[] }) {
  const [selected, setSelected] = useState<number>(amounts[1] ?? 100);
  return (
    <div className="maje-gift">
      <div className="maje-gift-visual" aria-hidden="true">
        <p className="maje-gift-brand">MAJE</p>
        <p className="maje-gift-sub">Carte cadeau</p>
        <p className="maje-gift-amount">{selected} €</p>
        <p className="maje-gift-note">Valable en boutique &amp; en ligne</p>
      </div>
      <div className="maje-gift-body">
        <h2>Choisissez un montant</h2>
        <div className="maje-gift-amounts" role="group" aria-label="Montants">
          {amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={amount === selected ? "is-active" : ""}
              aria-pressed={amount === selected}
              onClick={() => setSelected(amount)}
            >
              {amount} €
            </button>
          ))}
        </div>
        <button type="button" className="maje-gift-cta">
          Ajouter au panier — {selected} € (démo)
        </button>
        <p className="maje-gift-help">
          Maquette : aucun paiement réel. Carte utilisable en une ou plusieurs fois, non remboursable,
          valable 12 mois.
        </p>
      </div>
    </div>
  );
}
