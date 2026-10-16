import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractOrderNumber, type StripeWebhookEvent } from "@/lib/maje/stripe";

export const runtime = "nodejs";

const SIGNATURE_TOLERANCE_SECONDS = 300;

function missingKeysResponse() {
  return NextResponse.json(
    {
      error:
        "Webhook désactivé : STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET non configurés " +
        "(voir .env.example). Événement ignoré, rien n'a été mis à jour.",
    },
    { status: 503 },
  );
}

function parseStripeSignature(header: string | null): { t: number; v1: string[] } | null {
  if (!header) return null;
  let t: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const [key, ...rest] = part.split("=");
    const value = rest.join("=");
    if (key === "t") t = Number.parseInt(value, 10);
    else if (key === "v1" && value) v1.push(value);
  }
  if (t === null || Number.isNaN(t) || v1.length === 0) return null;
  return { t, v1 };
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Vérifie la signature Stripe `t=...,v1=...` (HMAC-SHA256, Web Crypto). */
async function verifySignature(rawBody: string, header: string, secret: string): Promise<{ ok: boolean; reason: string }> {
  const parsed = parseStripeSignature(header);
  if (!parsed) return { ok: false, reason: "En-tête Stripe-Signature manquant ou illisible." };
  const ageSeconds = Math.abs(Date.now() / 1000 - parsed.t);
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) {
    return { ok: false, reason: `Horodatage hors tolérance (${Math.round(ageSeconds)}s > 300s).` };
  }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parsed.t}.${rawBody}`));
  const expected = toHex(digest);
  if (!parsed.v1.includes(expected)) return { ok: false, reason: "Signature HMAC invalide." };
  return { ok: true, reason: "Signature valide." };
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error("[webhook/payment] 503 : clés Stripe absentes, événement ignoré.");
    return missingKeysResponse();
  }

  const signatureHeader = request.headers.get("stripe-signature");
  if (!signatureHeader) {
    console.error("[webhook/payment] 400 : en-tête Stripe-Signature absent.");
    return NextResponse.json({ error: "En-tête Stripe-Signature absent." }, { status: 400 });
  }

  const rawBody = await request.text();
  const check = await verifySignature(rawBody, signatureHeader, webhookSecret);
  if (!check.ok) {
    console.error(`[webhook/payment] 400 : ${check.reason}`);
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as StripeWebhookEvent;
  } catch {
    console.error("[webhook/payment] 400 : corps JSON illisible.");
    return NextResponse.json({ error: "Corps JSON illisible." }, { status: 400 });
  }
  if (!event.id || !event.type) {
    console.error("[webhook/payment] 400 : événement sans id/type.");
    return NextResponse.json({ error: "Événement Stripe sans id/type." }, { status: 400 });
  }
  console.log(`[webhook/payment] Reçu ${event.type} id=${event.id}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[webhook/payment] 503 : Supabase service_role non configuré, impossible d'enregistrer.");
    return NextResponse.json(
      { error: "Supabase non configuré côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante). Événement non enregistré." },
      { status: 503 },
    );
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Idempotence : un même événement Stripe n'est traité qu'une fois.
  const { error: insertError } = await supabase.from("webhook_events").insert({
    provider: "stripe",
    provider_event_id: event.id,
    payload: event,
  });
  if (insertError) {
    if (insertError.code === "23505") {
      console.log(`[webhook/payment] Doublon ignoré id=${event.id}`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error(`[webhook/payment] 500 : insert webhook_events impossible : ${insertError.message}`);
    return NextResponse.json({ error: `Enregistrement impossible : ${insertError.message}` }, { status: 500 });
  }

  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const orderNumber = extractOrderNumber(event);
    if (!orderNumber) {
      console.log(`[webhook/payment] ${event.type} id=${event.id} : aucun order_number en metadata, rien à mettre à jour.`);
      return NextResponse.json({ received: true, updated: false, reason: "metadata order_number absente" });
    }
    const { data, error } = await supabase.from("orders").update({ statut: "payee" }).eq("numero", orderNumber).select("numero");
    if (error) {
      console.error(`[webhook/payment] 500 : update orders ${orderNumber} impossible : ${error.message}`);
      return NextResponse.json({ error: `Mise à jour commande impossible : ${error.message}` }, { status: 500 });
    }
    const updated = Array.isArray(data) ? data.length : 0;
    console.log(`[webhook/payment] ${event.type} id=${event.id} : commande ${orderNumber} -> payee (${updated} ligne(s)).`);
    return NextResponse.json({ received: true, updated: updated > 0, order: orderNumber });
  }

  console.log(`[webhook/payment] Type ${event.type} enregistré, aucune action.`);
  return NextResponse.json({ received: true, updated: false });
}
