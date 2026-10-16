import { NextResponse } from "next/server";
import {
  checkAvailability,
  getDbCatalog,
  validateCoupon,
  type AvailabilityItem,
  type DbProduct,
} from "@/lib/maje/catalog-db";
import { computeTotals } from "@/lib/maje/pricing";

export interface CheckoutValidateLine {
  id: string;
  size: string;
  qty: number;
  unitCents: number;
  name: string;
}

export interface CheckoutValidateResponse {
  ok: boolean;
  lines: CheckoutValidateLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  problems: string[];
}

/** Garde anti-abus par ligne (le stock réel est contrôlé par checkAvailability). */
const MAX_QTY_PER_LINE = 99;

function fail(problems: string[], status: number): NextResponse {
  const body: CheckoutValidateResponse = {
    ok: false,
    lines: [],
    subtotalCents: 0,
    discountCents: 0,
    totalCents: 0,
    problems,
  };
  return NextResponse.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Retrouve un produit du catalogue serveur par id ou slug (insensible à la casse). */
function findProduct(catalog: DbProduct[], id: string): DbProduct | undefined {
  const needle = id.toLowerCase();
  return catalog.find((p) => p.id === id || p.slug === needle);
}

/**
 * POST /api/checkout/validate
 * Corps : { items: [{ id, size, qty }], coupon? }
 * Recalcule tout depuis le catalogue serveur (`catalog-db`). Ne fait jamais
 * confiance au total envoyé par le navigateur (aucun total n'est lu).
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(["Corps de requête JSON invalide."], 400);
  }
  if (!isRecord(body)) return fail(["Corps de requête invalide."], 400);

  const { items, coupon } = body;
  if (!Array.isArray(items)) return fail(["Le champ `items` doit être un tableau."], 400);
  if (items.length === 0) return fail(["Le panier est vide."], 200);

  const catalog = await getDbCatalog();
  const problems: string[] = [];
  const lines: CheckoutValidateLine[] = [];
  const availabilityItems: AvailabilityItem[] = [];

  for (const raw of items) {
    if (!isRecord(raw)) {
      problems.push("Ligne de panier invalide (objet attendu).");
      continue;
    }
    const id = typeof raw.id === "string" ? raw.id : "";
    const size = typeof raw.size === "string" ? raw.size : "";
    const qty = typeof raw.qty === "number" ? raw.qty : Number.NaN;
    if (id === "") {
      problems.push("Ligne de panier sans identifiant article.");
      continue;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      problems.push(`Quantité invalide pour l'article ${id}.`);
      continue;
    }
    if (qty > MAX_QTY_PER_LINE) {
      problems.push(`Quantité maximale dépassée pour l'article ${id} (${MAX_QTY_PER_LINE}).`);
      continue;
    }
    if (size.trim() === "") {
      problems.push(`Taille manquante pour l'article ${id}.`);
      continue;
    }
    const entry = findProduct(catalog, id);
    if (!entry) {
      problems.push(`Article indisponible : ${id}.`);
      continue;
    }
    lines.push({ id, size, qty, unitCents: entry.priceCents, name: entry.name });
    availabilityItems.push({ id, size, qty });
  }

  // Disponibilité / stock depuis la source serveur (jamais du client).
  if (availabilityItems.length > 0) {
    const availability = await checkAvailability(availabilityItems);
    problems.push(...availability.problems);
  } else if (problems.length === 0) {
    problems.push("Aucune ligne de panier valide.");
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.unitCents * line.qty, 0);

  let percent = 0;
  if (typeof coupon === "string" && coupon.trim() !== "") {
    const result = await validateCoupon(coupon, subtotalCents);
    if (result.ok) {
      percent = result.percent;
    } else {
      problems.push(`Coupon refusé : ${result.reason}`);
    }
  } else if (coupon !== undefined && coupon !== null && coupon !== "") {
    problems.push("Code coupon invalide.");
  }

  const totals = computeTotals(
    lines.map((line) => ({ unitCents: line.unitCents, qty: line.qty })),
    percent,
  );

  const response: CheckoutValidateResponse = {
    ok: problems.length === 0,
    lines,
    subtotalCents: totals.subtotal,
    discountCents: totals.discount,
    totalCents: totals.total,
    problems,
  };
  return NextResponse.json(response);
}
