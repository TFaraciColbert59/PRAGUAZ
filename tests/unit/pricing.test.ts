import { describe, expect, it } from "vitest";

import { formatMajePrice, parseMajePrice } from "@/lib/maje/cart";

/** Convertit un prix EUR en centimes (entier), arrondi bancaire simple. */
function priceToCents(valueEur: number): number {
  return Math.round(valueEur * 100);
}

/** Remise en % (arrondie) entre un ancien prix et un nouveau prix. */
function discountPct(oldPriceEur: number, newPriceEur: number): number {
  if (oldPriceEur <= 0) return 0;
  return Math.round((1 - newPriceEur / oldPriceEur) * 100);
}

/** Total d'un panier : somme des (prix unitaire x quantite). */
function cartTotal(lines: { unitEur: number; qty: number }[]): number {
  return lines.reduce((sum, line) => sum + line.unitEur * line.qty, 0);
}

describe("parseMajePrice", () => {
  it("parse un prix entier avec symbole euro", () => {
    expect(parseMajePrice("545 €")).toBe(545);
  });

  it("parse un prix decimal a la francaise", () => {
    expect(parseMajePrice("272,50 €")).toBeCloseTo(272.5, 5);
  });

  it("parse sans espace ni symbole", () => {
    expect(parseMajePrice("147,50")).toBeCloseTo(147.5, 5);
  });

  it("parse avec espace inseccable U+00A0", () => {
    expect(parseMajePrice("1 272,50 €")).toBeCloseTo(1272.5, 5);
  });

  it("retourne 0 pour une valeur vide ou invalide", () => {
    expect(parseMajePrice("")).toBe(0);
    expect(parseMajePrice("offert")).toBe(0);
  });
});

describe("formatMajePrice", () => {
  it("formate un entier avec 2 decimales", () => {
    expect(formatMajePrice(545)).toBe("545,00 €");
  });

  it("formate un decimal a la francaise", () => {
    expect(formatMajePrice(272.5)).toBe("272,50 €");
  });

  it("round-trip parse -> format", () => {
    expect(formatMajePrice(parseMajePrice("272,50 €"))).toBe("272,50 €");
    expect(formatMajePrice(parseMajePrice("545 €"))).toBe("545,00 €");
  });
});

describe("centimes EUR", () => {
  it("convertit 272,50 EUR en 27250 centimes", () => {
    expect(priceToCents(parseMajePrice("272,50 €"))).toBe(27250);
  });

  it("arrondit les fractions de centime", () => {
    expect(priceToCents(19.995)).toBe(2000);
    expect(priceToCents(0.004)).toBe(0);
  });

  it("0 EUR vaut 0 centime", () => {
    expect(priceToCents(0)).toBe(0);
  });
});

describe("remises %", () => {
  it("545 -> 272,50 = -50%", () => {
    expect(discountPct(545, 272.5)).toBe(50);
  });

  it("425 -> 340 = -20%", () => {
    expect(discountPct(425, 340)).toBe(20);
  });

  it("prix identique = 0%", () => {
    expect(discountPct(100, 100)).toBe(0);
  });

  it("ancien prix nul ou negatif = 0% (pas de division par zero)", () => {
    expect(discountPct(0, 50)).toBe(0);
  });
});

describe("totaux panier", () => {
  it("somme les lignes qty x prix", () => {
    const total = cartTotal([
      { unitEur: parseMajePrice("272,50 €"), qty: 1 },
      { unitEur: parseMajePrice("147,50 €"), qty: 2 },
    ]);
    expect(total).toBeCloseTo(567.5, 5);
    expect(formatMajePrice(total)).toBe("567,50 €");
    expect(priceToCents(total)).toBe(56750);
  });

  it("panier vide = 0", () => {
    expect(cartTotal([])).toBe(0);
    expect(formatMajePrice(cartTotal([]))).toBe("0,00 €");
  });

  it("quantite nulle = ligne a 0", () => {
    expect(cartTotal([{ unitEur: 340, qty: 0 }])).toBe(0);
  });
});
