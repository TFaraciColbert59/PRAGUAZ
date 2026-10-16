"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeProducts } from "./data";
import { getProductSlug, getSizesForProduct } from "./product-slugs";

const QuickReplies: { question: string; answer: string }[] = [
  {
    question: "Où est ma commande ?",
    answer:
      "Suivez votre colis depuis la page de suivi avec votre numéro de commande. Livraison offerte sous 2 jours ouvrés.",
  },
  {
    question: "Quelle taille choisir ?",
    answer:
      "Nos pièces taillent normalement. Entre deux tailles pour une veste ou un manteau, prenez la taille au-dessus.",
  },
  {
    question: "Comment retourner un article ?",
    answer:
      "Échanges et retours offerts sous 30 jours, remboursement sous 14 jours après réception.",
  },
];

type OccasionKey = "mariage" | "bureau" | "soiree" | "weekend" | "ceremonie";

type BudgetKey = "150" | "250" | "400" | "all";

interface AppliedCriteria {
  occasion: OccasionKey;
  budget: BudgetKey;
  size: string;
}

const OCCASION_LABELS: Record<OccasionKey, string> = {
  mariage: "Mariage / invitée",
  bureau: "Bureau",
  soiree: "Soirée",
  weekend: "Week-end",
  ceremonie: "Cérémonie",
};

const OCCASION_CATEGORIES: Record<OccasionKey, string[]> = {
  mariage: ["robes"],
  bureau: ["pantalons-jeans", "vestes"],
  soiree: ["robes"],
  weekend: ["pulls-cardigans", "pantalons-jeans"],
  ceremonie: ["robes"],
};

const BUDGET_LABELS: Record<BudgetKey, string> = {
  "150": "150 € max",
  "250": "250 € max",
  "400": "400 € max",
  all: "Sans limite",
};

const SIZE_OPTIONS: string[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "TU",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
];

const OCCASION_KEYS: OccasionKey[] = ["mariage", "bureau", "soiree", "weekend", "ceremonie"];

const BUDGET_KEYS: BudgetKey[] = ["150", "250", "400", "all"];

function parseFrPrice(value: string): number {
  const normalized = value.replace("€", "").trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function filterLooks(criteria: AppliedCriteria): typeof MajeProducts {
  const categories = OCCASION_CATEGORIES[criteria.occasion];
  const max = criteria.budget === "all" ? null : Number(criteria.budget);
  return MajeProducts.filter((product) => {
    if (!categories.includes(product.category ?? "")) return false;
    if (max !== null && parseFrPrice(product.newPrice) > max) return false;
    return getSizesForProduct(product).includes(criteria.size);
  }).slice(0, 3);
}

export function MajeChat() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [occasion, setOccasion] = useState<OccasionKey | "">("");
  const [budget, setBudget] = useState<BudgetKey>("all");
  const [size, setSize] = useState<string>("");
  const [applied, setApplied] = useState<AppliedCriteria | null>(null);

  const results = useMemo(() => {
    if (applied === null) return [];
    return filterLooks(applied);
  }, [applied]);

  const canSearch = occasion !== "" && size !== "";

  function handleSearch(): void {
    if (occasion === "" || size === "") return;
    setApplied({ occasion, budget, size });
  }

  function handleReset(): void {
    setOccasion("");
    setBudget("all");
    setSize("");
    setApplied(null);
  }

  return (
    <div className="maje-chat">
      {open && (
        <div className="maje-chat-panel" role="dialog" aria-label="Conseiller Praguaz">
          <div className="maje-chat-head">
            <strong>Conseiller Praguaz</strong>
            <button type="button" aria-label="Fermer le chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="maje-chat-body">
            {selected === null ? (
              <>
                <p className="maje-chat-hello">Bonjour, que puis-je faire pour vous ?</p>
                {QuickReplies.map((item, index) => (
                  <button
                    key={item.question}
                    type="button"
                    className="maje-chat-q"
                    onClick={() => setSelected(index)}
                  >
                    {item.question}
                  </button>
                ))}
              </>
            ) : (
              <>
                <p className="maje-chat-q maje-chat-q--asked">{QuickReplies[selected].question}</p>
                <p className="maje-chat-a">{QuickReplies[selected].answer}</p>
                <button
                  type="button"
                  className="maje-chat-q"
                  onClick={() => setSelected(null)}
                >
                  ← Autres questions
                </button>
              </>
            )}
            <hr />
            <p className="maje-chat-hello">Trouver mon look selon l&apos;occasion :</p>
            <label className="grid gap-1">
              Occasion
              <select
                value={occasion}
                onChange={(event) => setOccasion(event.target.value as OccasionKey | "")}
              >
                <option value="">Choisir une occasion</option>
                {OCCASION_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {OCCASION_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              Budget max
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value as BudgetKey)}
              >
                {BUDGET_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {BUDGET_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              Taille
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                <option value="">Choisir une taille</option>
                {SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="maje-chat-q"
              disabled={!canSearch}
              onClick={handleSearch}
            >
              Voir mes looks
            </button>
            {applied !== null && results.length > 0 && (
              <>
                <p className="maje-chat-a">
                  Voici ma sélection ({results.length} look{results.length > 1 ? "s" : ""}) :
                </p>
                <ul className="grid gap-2">
                  {results.map((product) => (
                    <li key={product.id} className="flex gap-2 items-center">
                      <Image
                        src={product.image}
                        alt={product.alt}
                        width={48}
                        height={64}
                        loading="lazy"
                      />
                      <div className="grid gap-1">
                        <span>{product.name}</span>
                        <span>{product.newPrice}</span>
                        <Link
                          href={`/fr/p/${getProductSlug(product)}`}
                          className="maje-chat-contact"
                        >
                          Voir le produit
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {applied !== null && results.length === 0 && (
              <>
                <p className="maje-chat-a">
                  Aucun look ne correspond à ces critères dans le catalogue actuel. Les
                  disponibilités ne sont pas suivies en temps réel, je ne propose que des
                  articles existants.
                </p>
                <button type="button" className="maje-chat-q" onClick={handleReset}>
                  Réinitialiser mes critères
                </button>
              </>
            )}
            <p className="maje-chat-a">
              Conseils automatiques à partir du catalogue, sans intelligence artificielle.
            </p>
            <Link href="/fr/aide/nous-contacter" className="maje-chat-contact">
              Contacter un conseiller
            </Link>
            <Link href="/fr/aide/faq" className="maje-chat-contact">
              Voir la FAQ
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        className="maje-chat-fab"
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
          <line x1="9" y1="12" x2="9.01" y2="12" />
          <line x1="12.5" y1="12" x2="12.51" y2="12" />
          <line x1="16" y1="12" x2="16.01" y2="12" />
        </svg>
      </button>
    </div>
  );
}
