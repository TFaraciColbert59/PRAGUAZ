# Paiements, emails, retours et back-office (socle honnête)

Socle réel mais **désactivé sans clés** : aucune simulation silencieuse, aucun chiffre fictif.
États possibles : `configuré` ou `désactivé/setup`, jamais de fausses données.

## 1. Variables d'environnement (voir `.env.example`)

| Variable | Rôle | Sans elle |
|---|---|---|
| `STRIPE_SECRET_KEY` | Création de Checkout Sessions réelles | `createCheckoutSession()` lève une erreur claire |
| `STRIPE_WEBHOOK_SECRET` | Vérification HMAC des webhooks | Route webhook → **503 explicite** |
| `ADMIN_TOKEN` | Garde `/admin` (cookie httpOnly `pg-admin=1`) | Page « configurez ADMIN_TOKEN » |
| `RESEND_API_KEY` | Envoi via Resend | `sendEmail()` loggue + retourne `{ sent: false, reason }` |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook + back-office (contourne RLS) | 503 webhook / états setup admin |

## 2. Paiement (`src/lib/maje/stripe.ts`)

- `isStripeConfigured()` : les deux vars Stripe sont présentes.
- `createCheckoutSession()` : appel REST réel `POST https://api.stripe.com/v1/checkout/sessions`
  (EUR, locale fr, `metadata.order_number`). Lève si non configuré ou panier vide.
- Aucune dépendance `stripe` npm.

## 3. Webhook (`src/app/api/webhooks/payment/route.ts`)

- `POST /api/webhooks/payment`, runtime nodejs.
- Vérifie `Stripe-Signature: t=...,v1=...` : HMAC-SHA256 de `${t}.${corps}` via Web Crypto,
  tolérance ±5 min. Échec → 400 loggué.
- Idempotence via `webhook_events(provider, provider_event_id UNIQUE)` : doublon → `200 { duplicate: true }`.
- `checkout.session.completed` / `payment_intent.succeeded` : `UPDATE orders SET statut='payee'`
  par `numero` lu depuis `metadata.order_number`. Autres types : enregistrés, sans action.
- Tout est loggué (`[webhook/payment]`). Configurer dans Stripe : endpoint + secret → `STRIPE_WEBHOOK_SECRET`.

## 4. Emails (`src/lib/maje/emails.ts`)

- Templates FR texte+HTML : confirmation, expédition (`buildShipmentEmail`), remboursement (`buildRefundEmail`).
- `sendEmail(to, template)` : sans `RESEND_API_KEY` → log + `{ sent: false, reason }`. Jamais d'envoi
  silencieux raté. Expéditeur par défaut `no-reply@example.com` à remplacer en production.

## 5. Base (`supabase/migration-ops.sql`, après `schema.sql`)

- `webhook_events` : aucune policy publique (service_role uniquement).
- `shipments(order_id, transporteur, tracking, statut)` : service_role uniquement.
- `returns(order_id, order_numero, motif, statut)` : seule exception, `INSERT` anonyme autorisé pour
  le dépôt client ; lecture/modification via service_role. Aucune lecture publique.
- `refunds(order_id, order_numero, montant, statut)` : service_role uniquement, lignes créées après
  action PSP réelle.
- `order_id` est nullable : les demandes clients arrivent avec `order_numero` et sont rattachées
  par le back-office.

## 6. Back-office (`src/app/admin/`)

- `layout.tsx` gardien : sans `ADMIN_TOKEN` → page setup ; sans cookie → formulaire token ;
  `POST /admin/login` pose `pg-admin=1` (httpOnly) si égal, sinon **401**.
- `/admin` : liens + état config (booléens, pas de secrets). `/admin/commandes` : lecture service_role,
  état setup/erreur/vide explicites. `/admin/retours` : demandes + changement de statut (server action),
  remboursements en lecture avec rappel « jamais simulés ».

## 7. Retours client (`src/app/fr/compte/retours/page.tsx`)

- Formulaire numéro + motif → `localStorage("maje-retours")` + tentative `INSERT returns`
  (succès → « demande transmise », échec → message honnête avec la raison). Liste locale affichée.
