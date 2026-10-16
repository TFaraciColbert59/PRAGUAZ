# Couche données catalogue — DB Supabase avec repli local

Fichiers : `supabase/migration-catalog.sql`, `src/lib/maje/catalog-db.ts`.

## 1. Schéma SQL

Tables créées par `supabase/migration-catalog.sql` (idempotent, ré-exécutable) :

| Table | Colonnes |
|---|---|
| `products` | `id` uuid pk (défaut `gen_random_uuid()`), `slug` text unique, `name`, `description`, `price_cents` int ≥ 0, `compare_at_cents` int null, `currency` défaut `'EUR'`, `category`, `colors` text[] , `materials` text[], `images` text[], `active` bool défaut true, `created_at` |
| `product_variants` | `id` uuid pk, `product_id` fk → products cascade, `sku` unique, `size`, `color` défaut `''`, `stock` int défaut 0, `price_cents` int null, `created_at` (+ index sur `product_id`) |
| `inventory_movements` | `id` uuid pk, `variant_id` fk → variants cascade, `qty` int, `reason` text, `created_at` (+ index sur `variant_id`) |
| `coupons` | `code` unique, `percent` int 0–100, `quota` int null, `used` int défaut 0, `min_total_cents` int défaut 0, `starts_at`/`ends_at` null, `active` bool |

RLS activé sur les 4 tables. Politiques :
- `products` : `select` pour `anon, authenticated` si `active = true`.
- `product_variants` : `select` pour `anon, authenticated` si le produit parent est actif.
- `coupons` : `select` pour `anon, authenticated` si `active = true` ; aucune écriture publique (rôle service uniquement).
- `inventory_movements` : aucune politique publique (rôle service uniquement).
- Politiques existantes (`orders`, `order_items`, `newsletter_subscribers`) intactes.

Seed : 3 produits neutres **PRAGUAZ** (aucune marque tierce) + variantes + coupons `BIENVENUE10` / `PREMIERES50`.

## 2. Contrats TS (`catalog-db.ts`)

Types : `DbProduct { id, slug, name, description, priceCents, currency, compareAtCents | null, category, colors[], materials[], images[], variants: DbVariant[] }`, `DbVariant { id, sku, size, color, stock, priceCents | null }`, `AvailabilityItem { id, size, qty }`, `AvailabilityCheck { ok, problems }`, `CouponValidation { ok, percent, reason }`.

- `getDbCatalog(): Promise<DbProduct[]>` — produits actifs + variantes depuis Supabase, sinon catalogue local.
- `getDbProduct(slug): Promise<DbProduct | null>` — produit DB par slug, sinon recherche locale (slug ou id insensible à la casse), `null` si absent.
- `checkAvailability(items): Promise<AvailabilityCheck>` — si données DB : refuse `qty > stock`, signale produit/taille introuvable et quantité invalide ; si repli local : toujours `{ ok: true }`.
- `validateCoupon(code, totalCents): Promise<CouponValidation>` — ligne `coupons` si disponible (règles : actif, dates, quota, minimum d'achat), sinon codes secours `BIENVENUE10` (-10 %) et `PREMIERES50` (-20 %, quota limité) ; code inconnu → `{ ok: false, percent: 0 }`.

Règles : tout accès Supabase en `try/catch` avec repli local, **jamais de `throw`** ; TS strict, aucun `any` (narrowing via `unknown`) ; exports nommés uniquement.

## 3. Repli local

Source : `src/lib/maje/catalog.ts` (54 produits, prix € → centimes via `Math.round(€ * 100)`, `compare_at_cents = null` si `oldPrice` nul) + les 6 produits de base recopiés (même prix/images/catégories que `data.ts`).
Slugs recalculés sans import : `id.toLowerCase()` pour les codes `MF*`, mapping explicite pour les 6 IDs de base (`manteau-long-laine` → `manteau-long-laine-melangee`, les 5 autres à l'identique).
Variantes locales : tailles `XS–XL` (chaussures `36–41`, sacs `TU`), `stock: 10`, `priceCents: null`.

Client Supabase : navigateur → `createBrowserClient` ; serveur → `createServerClient` avec cookies no-op (lecture publique anonyme suffisante) ; `null` si env manquantes.

## 4. SQL à exécuter

1. Dashboard Supabase → SQL Editor → coller le contenu de `supabase/migration-catalog.sql` → Run (après `schema.sql` + `migration-auth.sql`).
2. Vérifier : `select slug, price_cents from products where active = true;` (3 lignes PRAGUAZ attendues).
3. `.env.local` requis pour la lecture DB (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ; sans eux, repli local automatique et silencieux.
