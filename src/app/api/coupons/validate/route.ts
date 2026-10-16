import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/maje/catalog-db";

export interface CouponValidateResponse {
  ok: boolean;
  percent: number;
  reason: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * POST /api/coupons/validate
 * Corps : { code, totalCents }
 * Vérifie un code coupon côté serveur (source de vérité anti-triche).
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const res: CouponValidateResponse = {
      ok: false,
      percent: 0,
      reason: "Corps de requête JSON invalide.",
    };
    return NextResponse.json(res, { status: 400 });
  }
  if (!isRecord(body)) {
    const res: CouponValidateResponse = {
      ok: false,
      percent: 0,
      reason: "Corps de requête invalide.",
    };
    return NextResponse.json(res, { status: 400 });
  }

  const { code, totalCents } = body;
  if (typeof code !== "string") {
    const res: CouponValidateResponse = {
      ok: false,
      percent: 0,
      reason: "Saisissez un code coupon.",
    };
    return NextResponse.json(res);
  }
  const total =
    typeof totalCents === "number" && Number.isFinite(totalCents)
      ? Math.round(totalCents)
      : 0;

  const result = await validateCoupon(code, total);
  const res: CouponValidateResponse = {
    ok: result.ok,
    percent: result.percent,
    reason: result.reason,
  };
  return NextResponse.json(res);
}
