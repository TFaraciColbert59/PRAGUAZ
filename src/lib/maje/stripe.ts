// Socle paiement réel Stripe — DÉSACTIVÉ sans clés (aucune simulation silencieuse).
// Aucune dépendance `stripe` npm : appels REST via fetch, vérification HMAC
// via Web Crypto dans `src/app/api/webhooks/payment/route.ts`.

export interface CheckoutLineInput {
  name: string;
  unitAmountCents: number;
  quantity: number;
}

export interface CheckoutSessionInput {
  orderNumber: string;
  email: string;
  lines: CheckoutLineInput[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  id: string;
  url: string | null;
}

export interface StripeWebhookObject {
  id: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: { object: StripeWebhookObject };
}

export const SUPPORTED_WEBHOOK_TYPES = ["checkout.session.completed", "payment_intent.succeeded"] as const;
export type SupportedWebhookType = (typeof SUPPORTED_WEBHOOK_TYPES)[number];

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

function stripeMisconfiguredError(): Error {
  return new Error(
    "Paiement désactivé : STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET ne sont pas configurés " +
      "(voir .env.example et docs/research/maje/paiements-admin.md). Aucune session simulée.",
  );
}

/**
 * Crée une vraie Checkout Session Stripe via l'API REST.
 * Lève une erreur claire si Stripe n'est pas configuré — jamais de simulation.
 */
export async function createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !process.env.STRIPE_WEBHOOK_SECRET) throw stripeMisconfiguredError();
  if (input.lines.length === 0) throw new Error("createCheckoutSession : panier vide, session refusée.");

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("locale", "fr");
  params.set("customer_email", input.email);
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("metadata[order_number]", input.orderNumber);
  params.set("payment_intent_data[metadata][order_number]", input.orderNumber);
  input.lines.forEach((line, index) => {
    params.set(`line_items[${index}][price_data][currency]`, "eur");
    params.set(`line_items[${index}][price_data][product_data][name]`, line.name);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.max(0, Math.round(line.unitAmountCents))));
    params.set(`line_items[${index}][quantity]`, String(Math.max(1, Math.floor(line.quantity))));
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Stripe a refusé la session (${response.status}) : ${detail.slice(0, 300)}`);
  }

  const session = (await response.json()) as { id?: string; url?: string | null };
  if (!session.id) throw new Error("Réponse Stripe invalide : identifiant de session manquant.");
  return { id: session.id, url: session.url ?? null };
}

/** Extrait le numéro de commande depuis les metadata d'un objet webhook. */
export function extractOrderNumber(event: StripeWebhookEvent): string | null {
  const metadata = event.data.object.metadata;
  if (!metadata) return null;
  const numero = metadata.order_number ?? metadata.numero;
  return typeof numero === "string" && numero.length > 0 ? numero : null;
}
