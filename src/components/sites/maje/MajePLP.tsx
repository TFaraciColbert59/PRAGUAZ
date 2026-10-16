"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeProducts, type MajeProduct } from "./data";
import {
  PlpColors,
  PlpPriceBands,
  PlpSizes,
  getPlpMeta,
  inPriceBand,
} from "./plp-data";
import { getProductSlug } from "./product-slugs";
import "./plp.css";

export type PlpSortKey = "relevance" | "price-asc" | "price-desc" | "newest";

export interface MajePLPProps {
  title: string;
  productIds: string[];
}

const PAGE_SIZE = 4;

const SORT_OPTIONS: { value: PlpSortKey; label: string }[] = [
  { value: "relevance", label: "Pertinence" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "newest", label: "Nouveautés" },
];

function toggleValue(list: string[], value: string): string[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  return [...list, value];
}

function PlpTile({ product }: { product: MajeProduct }) {
  return (
    <article className="maje-tile">
      <Link href={`/fr/p/${getProductSlug(product)}`} className="maje-tile-link" aria-label={product.name}>
      <div className="maje-tile-img">
        {product.discount !== "" && (
          <span className="maje-badge">{product.discount}</span>
        )}
        <Image
          src={product.image}
          alt={product.alt}
          width={720}
          height={955}
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {product.hoverImage !== undefined && (
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            width={720}
            height={955}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="maje-tile-img--alt"
          />
        )}
      </div>
      <div className="maje-tile-body">
        <h3>{product.name}</h3>
        <p className="maje-price">
          {product.oldPrice !== "" && <s>{product.oldPrice}</s>}
          <strong>{product.newPrice}</strong>
        </p>
      </div>
      </Link>
    </article>
  );
}

export function MajePLP({ title, productIds }: MajePLPProps) {
  const [sort, setSort] = useState<PlpSortKey>("relevance");
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeBands, setActiveBands] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const base = useMemo(() => {
    const found: MajeProduct[] = [];
    for (const id of productIds) {
      const product = MajeProducts.find((item) => item.id === id);
      if (product) found.push(product);
    }
    return found;
  }, [productIds]);

  const counts = useMemo(() => {
    const sizeCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    const bandCounts = new Map<string, number>();
    for (const product of base) {
      const meta = getPlpMeta(product.id);
      for (const size of meta.sizes) {
        sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
      }
      for (const color of meta.colors) {
        colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1);
      }
      for (const band of PlpPriceBands) {
        if (inPriceBand(meta.priceValue, band)) {
          bandCounts.set(band.id, (bandCounts.get(band.id) ?? 0) + 1);
        }
      }
    }
    return { sizeCounts, colorCounts, bandCounts };
  }, [base]);

  const filtered = useMemo(() => {
    const kept = base.filter((product) => {
      const meta = getPlpMeta(product.id);
      if (activeSizes.length > 0 && !activeSizes.some((s) => meta.sizes.includes(s))) {
        return false;
      }
      if (activeColors.length > 0 && !activeColors.some((c) => meta.colors.includes(c))) {
        return false;
      }
      if (activeBands.length > 0) {
        const inBand = PlpPriceBands.some(
          (band) => activeBands.includes(band.id) && inPriceBand(meta.priceValue, band),
        );
        if (!inBand) return false;
      }
      return true;
    });
    const indexed = kept.map((product, index) => ({ product, index }));
    if (sort === "price-asc") {
      indexed.sort(
        (a, b) =>
          getPlpMeta(a.product.id).priceValue - getPlpMeta(b.product.id).priceValue ||
          a.index - b.index,
      );
    } else if (sort === "price-desc") {
      indexed.sort(
        (a, b) =>
          getPlpMeta(b.product.id).priceValue - getPlpMeta(a.product.id).priceValue ||
          a.index - b.index,
      );
    } else if (sort === "newest") {
      indexed.sort((a, b) => {
        const aNew = getPlpMeta(a.product.id).isNew ? 0 : 1;
        const bNew = getPlpMeta(b.product.id).isNew ? 0 : 1;
        return aNew - bNew || a.index - b.index;
      });
    }
    return indexed.map((entry) => entry.product);
  }, [base, activeSizes, activeColors, activeBands, sort]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;
  const activeFilterCount = activeSizes.length + activeColors.length + activeBands.length;

  function clearFilters() {
    setActiveSizes([]);
    setActiveColors([]);
    setActiveBands([]);
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="maje-plp">
      <nav className="maje-breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/fr/last-chance/tout-voir">Femme</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className="maje-plp-head">
        <h1 className="maje-plp-title">{title}</h1>
        <p className="maje-plp-count">
          {filtered.length} article{filtered.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="maje-toolbar">
        <div className="maje-active-filters">
          {activeFilterCount > 0 && (
            <button type="button" className="maje-clear" onClick={clearFilters}>
              Effacer les filtres ({activeFilterCount})
            </button>
          )}
        </div>
        <label className="maje-sort">
          Trier par
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as PlpSortKey)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="maje-plp-layout">
        <aside className="maje-facets" aria-label="Filtres">
          <p className="maje-facets-title">Filtres</p>
          <fieldset className="maje-facet">
            <legend>Taille</legend>
            {PlpSizes.map((size) => (
              <label key={size} className="maje-check">
                <input
                  type="checkbox"
                  checked={activeSizes.includes(size)}
                  onChange={() => {
                    setActiveSizes((prev) => toggleValue(prev, size));
                    setVisible(PAGE_SIZE);
                  }}
                />
                {size}
                <span className="maje-check-count">({counts.sizeCounts.get(size) ?? 0})</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="maje-facet">
            <legend>Couleur</legend>
            {PlpColors.map((color) => (
              <label key={color} className="maje-check">
                <input
                  type="checkbox"
                  checked={activeColors.includes(color)}
                  onChange={() => {
                    setActiveColors((prev) => toggleValue(prev, color));
                    setVisible(PAGE_SIZE);
                  }}
                />
                {color}
                <span className="maje-check-count">({counts.colorCounts.get(color) ?? 0})</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="maje-facet">
            <legend>Prix</legend>
            {PlpPriceBands.map((band) => (
              <label key={band.id} className="maje-check">
                <input
                  type="checkbox"
                  checked={activeBands.includes(band.id)}
                  onChange={() => {
                    setActiveBands((prev) => toggleValue(prev, band.id));
                    setVisible(PAGE_SIZE);
                  }}
                />
                {band.label}
                <span className="maje-check-count">({counts.bandCounts.get(band.id) ?? 0})</span>
              </label>
            ))}
          </fieldset>
        </aside>
        <div className="maje-plp-results">
          {shown.length > 0 ? (
            <div className="maje-grid">
              {shown.map((product) => (
                <PlpTile key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="maje-empty">
              <p>Aucun article ne correspond à vos filtres.</p>
              <button type="button" onClick={clearFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
          {remaining > 0 && (
            <button
              type="button"
              className="maje-load-more"
              onClick={() => setVisible((prev) => prev + PAGE_SIZE)}
            >
              Charger plus ({remaining} restant{remaining > 1 ? "s" : ""})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
