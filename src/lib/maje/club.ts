// Helpers Club + fidélité + parrainage : purs et local-first.
// La persistance serveur (Supabase) est optionnelle : try/catch, jamais de throw.

export type ClubPlanCode = "signature" | "prestige";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled" | "expired";

export interface ClubPlan {
  code: ClubPlanCode;
  name: string;
  priceMonthlyCents: number;
  discountPercent: number;
  perks: string[];
  welcomePoints: number;
}

export interface ClubSubscription {
  planCode: ClubPlanCode;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd: string;
}

export interface LoyaltyTier {
  threshold: number;
  percent: number;
  minTotalCents: number | null;
  freeShipping: boolean;
  label: string;
}

export const CLUB_PLANS: ClubPlan[] = [
  {
    code: "signature",
    name: "Signature",
    priceMonthlyCents: 999,
    discountPercent: 10,
    perks: ["-10% sur tout", "Livraison offerte dès 150 €", "Avant-premières privées"],
    welcomePoints: 50,
  },
  {
    code: "prestige",
    name: "Prestige",
    priceMonthlyCents: 2999,
    discountPercent: 15,
    perks: ["-15% sur tout", "Livraison offerte sans minimum", "Conciergerie et retouches offertes"],
    welcomePoints: 100,
  },
];

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { threshold: 50, percent: 10, minTotalCents: null, freeShipping: false, label: "-10% sans minimum" },
  { threshold: 100, percent: 15, minTotalCents: null, freeShipping: false, label: "-15% sans minimum" },
  { threshold: 200, percent: 20, minTotalCents: 8000, freeShipping: false, label: "-20% dès 80 €" },
  { threshold: 300, percent: 10, minTotalCents: null, freeShipping: true, label: "Livraison offerte + -10%" },
];

export const SIMULATED_PURCHASE_POINTS = 10;

export const SUBSCRIPTION_KEY = "pg-subscription";
export const PURCHASES_KEY = "pg-purchases";
export const WELCOME_POINTS_KEY = "pg-loyalty-welcome";
export const REDEEMED_POINTS_KEY = "pg-loyalty-redeemed";
export const LOYALTY_HISTORY_KEY = "pg-loyalty-history";
export const REWARDS_KEY = "pg-rewards";
export const REFERRAL_CODE_KEY = "pg-referral-code";
export const REFERRALS_COUNT_KEY = "pg-referrals-count";

export function getClubPlan(code: string | null | undefined): ClubPlan | null {
  if (!code) return null;
  return CLUB_PLANS.find((plan) => plan.code === code) ?? null;
}

export function formatClubPrice(cents: number): string {
  const value = cents / 100;
  return `${value.toFixed(2).replace(".", ",")} €`;
}

/** Applique la remise du plan au total (centimes). Plan null = aucun changement. */
export function applyClubDiscount(totalCents: number, plan: ClubPlan | null): number {
  if (!Number.isFinite(totalCents) || totalCents <= 0) return 0;
  if (!plan || plan.discountPercent <= 0) return Math.round(totalCents);
  const discounted = totalCents * (100 - plan.discountPercent) / 100;
  return Math.round(discounted);
}

/** 1 pt par tranche de 10 € (1000 centimes). Montant invalide = 0 pt. */
export function pointsForPurchase(totalCents: number): number {
  if (!Number.isFinite(totalCents) || totalCents <= 0) return 0;
  return Math.floor(totalCents / 1000);
}

/** Palier atteint pour un solde donné. null = aucun palier. */
export function tierForPoints(points: number): LoyaltyTier | null {
  if (!Number.isFinite(points) || points <= 0) return null;
  let current: LoyaltyTier | null = null;
  for (const tier of LOYALTY_TIERS) {
    if (points >= tier.threshold) current = tier;
  }
  return current;
}

/** Prochain palier après le solde donné. null = palier max atteint. */
export function nextTierForPoints(points: number): LoyaltyTier | null {
  const safe = Number.isFinite(points) && points > 0 ? points : 0;
  for (const tier of LOYALTY_TIERS) {
    if (safe < tier.threshold) return tier;
  }
  return null;
}

/** Solde local = bienvenue + achats simulés (10 pts/achat) − points convertis. */
export function loyaltyBalanceFor(purchases: number, welcomePoints: number, redeemedPoints: number): number {
  const safePurchases = Number.isFinite(purchases) && purchases > 0 ? Math.floor(purchases) : 0;
  const safeWelcome = Number.isFinite(welcomePoints) && welcomePoints > 0 ? Math.floor(welcomePoints) : 0;
  const safeRedeemed = Number.isFinite(redeemedPoints) && redeemedPoints > 0 ? Math.floor(redeemedPoints) : 0;
  return safeWelcome + safePurchases * SIMULATED_PURCHASE_POINTS - safeRedeemed;
}

function randomCode(prefix: string, length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${suffix}`;
}

function readLocal(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLocalInt(key: string): number {
  const raw = readLocal(key);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Code parrain personnel, créé une fois et conservé en local. */
export function getOrCreateReferralCode(): string {
  if (typeof window === "undefined") return "PGZ-SIMULE";
  try {
    const existing = window.localStorage.getItem(REFERRAL_CODE_KEY);
    if (existing && /^PGZ-[A-Z0-9]{6}$/.test(existing)) return existing;
    const code = randomCode("PGZ", 6);
    window.localStorage.setItem(REFERRAL_CODE_KEY, code);
    return code;
  } catch {
    return "PGZ-SIMULE";
  }
}

/** Lien de parrainage à copier (simulation). */
export function referralLink(code: string): string {
  const clean = code.trim() || "PGZ-SIMULE";
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/fr/compte/inscription?parrain=${encodeURIComponent(clean)}`;
  }
  return `/fr/compte/inscription?parrain=${encodeURIComponent(clean)}`;
}

/** Raccourci { code, link } pour les pages. Ne jette jamais. */
export function referralCodes(): { code: string; link: string } {
  try {
    const code = getOrCreateReferralCode();
    return { code, link: referralLink(code) };
  } catch {
    return { code: "PGZ-SIMULE", link: "/fr/compte/inscription?parrain=PGZ-SIMULE" };
  }
}

/** Génère un code récompense style BIENVENUE (ex. FID-AB12CD). Pur. */
export function makeRewardCode(prefix = "FID"): string {
  return randomCode(prefix, 6);
}

export function readLocalSubscription(): ClubSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ClubSubscription>;
    if (parsed.planCode !== "signature" && parsed.planCode !== "prestige") return null;
    return {
      planCode: parsed.planCode,
      status: parsed.status ?? "active",
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : new Date().toISOString(),
      currentPeriodEnd:
        typeof parsed.currentPeriodEnd === "string" ? parsed.currentPeriodEnd : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ---- Persistance serveur optionnelle (jamais de throw) ----

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as Record<string, unknown>;
  // PostgREST : PGRST205 = table absente du cache, 42P01 = relation inexistante.
  return record["code"] === "PGRST205" || record["code"] === "42P01";
}

/** Solde fidélité serveur (somme des transactions). 0 si indisponible. */
export async function getLoyaltyBalance(userId: string): Promise<number> {
  try {
    if (!userId) return 0;
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("loyalty_transactions")
      .select("points")
      .eq("user_id", userId);
    if (error || !data) return 0;
    let balance = 0;
    for (const row of data as { points: number }[]) {
      const value = Number(row.points);
      if (Number.isFinite(value)) balance += value;
    }
    return balance;
  } catch (error) {
    if (!isMissingTableError(error)) {
      // indisponible : repli local
    }
    return 0;
  }
}

/** Enregistre des points côté serveur (anti-doublon par ref). false si indisponible. */
export async function recordPurchasePoints(
  userId: string,
  points: number,
  reason: string,
  ref: string
): Promise<boolean> {
  try {
    if (!userId || !ref || !Number.isFinite(points) || points === 0) return false;
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("loyalty_transactions").insert({
      user_id: userId,
      points: Math.floor(points),
      kind: points > 0 ? "earned" : "redeemed",
      reason,
      ref,
    });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export { readLocalInt };
