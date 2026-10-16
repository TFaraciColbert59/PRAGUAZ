import { describe, expect, it } from "vitest";

/**
 * Regles du programme de fidelite (EN DUR dans ce test, volontairement
 * independant des autres lots) :
 * - 1 EUR achete = 1 point (arrondi inferieur).
 * - Paliers d'avantages : 50 / 100 / 200 / 300 points.
 * - Les points se cumulent (solde = somme des gains - somme des depenses).
 * - Les points expirent 365 jours apres leur acquisition.
 */

const CLUB_TIERS = [50, 100, 200, 300] as const;

const CLUB_TTL_DAYS = 365;

function pointsEarned(amountEur: number): number {
  if (!Number.isFinite(amountEur) || amountEur <= 0) return 0;
  return Math.floor(amountEur);
}

function tierForBalance(balance: number): number {
  let reached = 0;
  for (const tier of CLUB_TIERS) {
    if (balance >= tier) reached = tier;
  }
  return reached;
}

function addPoints(balance: number, earned: number): number {
  return Math.max(0, balance) + Math.max(0, earned);
}

function spendPoints(balance: number, spent: number): number {
  return Math.max(0, Math.max(0, balance) - Math.max(0, spent));
}

function isRewardExpired(issuedAtMs: number, nowMs: number, ttlDays: number = CLUB_TTL_DAYS): boolean {
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return nowMs - issuedAtMs >= ttlMs;
}

describe("club : paliers 50/100/200/300", () => {
  it("0 point = aucun palier", () => {
    expect(tierForBalance(0)).toBe(0);
  });

  it("49 points = aucun palier, 50 = palier 50", () => {
    expect(tierForBalance(49)).toBe(0);
    expect(tierForBalance(50)).toBe(50);
  });

  it("99 = palier 50, 100 = palier 100", () => {
    expect(tierForBalance(99)).toBe(50);
    expect(tierForBalance(100)).toBe(100);
  });

  it("199 = palier 100, 200 = palier 200", () => {
    expect(tierForBalance(199)).toBe(100);
    expect(tierForBalance(200)).toBe(200);
  });

  it("299 = palier 200, 300 = palier 300, au-dela reste 300", () => {
    expect(tierForBalance(299)).toBe(200);
    expect(tierForBalance(300)).toBe(300);
    expect(tierForBalance(1250)).toBe(300);
  });
});

describe("club : cumul des points", () => {
  it("1 EUR = 1 point, arrondi inferieur", () => {
    expect(pointsEarned(272.5)).toBe(272);
    expect(pointsEarned(147.99)).toBe(147);
    expect(pointsEarned(0.99)).toBe(0);
  });

  it("montants nuls ou negatifs = 0 point", () => {
    expect(pointsEarned(0)).toBe(0);
    expect(pointsEarned(-10)).toBe(0);
  });

  it("les gains s'additionnent au solde", () => {
    const afterFirst = addPoints(0, pointsEarned(147.5));
    const afterSecond = addPoints(afterFirst, pointsEarned(272.5));
    expect(afterFirst).toBe(147);
    expect(afterSecond).toBe(419);
    expect(tierForBalance(afterSecond)).toBe(300);
  });

  it("les depenses decrementent sans passer sous zero", () => {
    expect(spendPoints(120, 50)).toBe(70);
    expect(spendPoints(30, 50)).toBe(0);
  });

  it("le palier suit le solde apres depense", () => {
    expect(tierForBalance(spendPoints(210, 150))).toBe(50);
  });
});

describe("club : expiration 365 jours", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const issued = Date.parse("2025-01-01T00:00:00Z");

  it("non expire avant 365 jours", () => {
    expect(isRewardExpired(issued, issued + 364 * DAY)).toBe(false);
  });

  it("expire a 365 jours pile", () => {
    expect(isRewardExpired(issued, issued + 365 * DAY)).toBe(true);
  });

  it("expire apres 366 jours", () => {
    expect(isRewardExpired(issued, issued + 366 * DAY)).toBe(true);
  });

  it("TTL personnalise respecte", () => {
    expect(isRewardExpired(issued, issued + 31 * DAY, 30)).toBe(true);
    expect(isRewardExpired(issued, issued + 29 * DAY, 30)).toBe(false);
  });
});
