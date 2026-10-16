/**
 * Tarification Maje — montants entiers en centimes, pur et testable.
 *
 * Règle anti-triche : le navigateur n'envoie jamais de total. Les routes
 * `/api/checkout/validate` et `/api/coupons/validate` recalculent tout
 * depuis le catalogue serveur (`getDbCatalog`) + `checkAvailability` +
 * `validateCoupon` de `@/lib/maje/catalog-db`.
 *
 * PONT `catalog-db` — voir `src/lib/maje/catalog-db.ts` (autre lot) :
 * `getDbCatalog() : Promise<DbProduct[]>`,
 * `checkAvailability(items: AvailabilityItem[]) : Promise<AvailabilityCheck>`,
 * `validateCoupon(code, totalCents) : Promise<CouponValidation>`.
 * Les routes importent ces fonctions depuis `@/lib/maje/catalog-db`.
 * Ce module reste purement arithmétique (centimes entiers) et testable.
 */

export interface PricingLine {
  unitCents: number;
  qty: number;
}

export interface PercentResult {
  total: number;
  discount: number;
}

export interface TotalsResult {
  subtotal: number;
  discount: number;
  total: number;
}

/** "272,50 €" -> 27250. Retourne 0 si inanalysable. */
export function parseEurToCents(fr: string): number {
  const cleaned = fr
    .replace(/€/g, "")
    .replace(/[\s ]/g, "")
    .replace(",", ".");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

/** 27250 -> "272,50 €". */
export function formatCentsToEur(cents: number): string {
  const rounded = Math.round(cents);
  return `${(rounded / 100).toFixed(2).replace(".", ",")} €`;
}

/** Applique un pourcentage (0..100, borné) à un montant en centimes. */
export function applyPercent(totalCents: number, percent: number): PercentResult {
  const base = Math.max(0, Math.round(totalCents));
  const rate = !Number.isFinite(percent) ? 0 : Math.min(100, Math.max(0, percent));
  const discount = Math.round((base * rate) / 100);
  return { total: base - discount, discount };
}

/** Sous-total + remise + total depuis des lignes serveur. */
export function computeTotals(lines: PricingLine[], percent = 0): TotalsResult {
  const subtotal = lines.reduce((sum, line) => {
    const qty = Math.max(0, Math.floor(line.qty));
    const unit = Math.max(0, Math.round(line.unitCents));
    return sum + unit * qty;
  }, 0);
  const applied = applyPercent(subtotal, percent);
  return { subtotal, discount: applied.discount, total: applied.total };
}
