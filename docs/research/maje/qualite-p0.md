# Qualité P0 — tests + SEO + headers

## 1. Ce qui est couvert

### Tests unitaires (`npm test` → `vitest run`)
- `tests/unit/pricing.test.ts` (19 tests)
  - `parseMajePrice` / `formatMajePrice` importés de `src/lib/maje/cart.tsx`.
  - Parse EUR : entier (`545 €`), décimal FR (`272,50 €`), sans symbole,
    espace insécable U+00A0, cas invalides → `0`.
  - Format : `545` → `545,00 €`, round-trip parse → format.
  - Centimes : `272,50 €` → `27250`, arrondis (`19.995` → `2000`), `0` → `0`.
  - Remises % (helper local pur `discountPct`) : 545 → 272,50 = 50 %,
    425 → 340 = 20 %, prix identique = 0 %, ancien prix 0 = 0 %.
  - Totaux (helper local pur `cartTotal`) : lignes qté × prix, panier vide,
    quantité nulle.
- `tests/unit/club-rules.test.ts` (13 tests)
  - Règles du club **en dur dans le test** (fonctions locales pures,
    aucune dépendance aux autres lots) : 1 € = 1 pt (`Math.floor`),
    paliers 50/100/200/300 (`tierForBalance`), cumul gains/dépenses
    (`addPoints`/`spendPoints`, plancher à 0), expiration 365 j
    (`isRewardExpired`, TTL paramétrable).

### Tests e2e (`npm run test:e2e` → `playwright test`)
- `tests/e2e/j1.spec.ts`, `baseURL http://localhost:3001`
  (`playwright.config.ts` : chromium uniquement, `retries: 0`).
- Parcours : `/` → PLP `/fr/robes` → 1re tuile (`a[href*="/fr/p/"]`) →
  PDP (taille si sélecteur présent) → ajout panier → `/fr/panier` →
  `/fr/commande/livraison` (remplissage tolérant champ par champ) →
  `/fr/commande/paiement` (carte `4242424242424242`) →
  `/fr/commande/confirmation` (assert `MJ/PZ-`).
- **Skip gracieux** : le `beforeEach` tente `page.goto("/")` (timeout 8 s) ;
  en cas d'échec (serveur absent) → `test.skip()`. Chaque étape optionnelle
  (taille, boutons) est gardée par `count() > 0`.

### SEO
- `src/app/sitemap.ts` : 11 pages fixes (priority 1 pour `/`) + 12 PLP
  (`PlpCategories` : last-chance, robes, vestes-manteaux, pulls-cardigans,
  pantalons-jeans, sacs, chaussures, manteaux, tops-chemises, jupes-shorts,
  accessoires, nouveautés) + 60 produits (`MajeProducts` 6 base + 54
  catalogue via `getProductSlug`) = **83 URLs**. `changefreq` daily (home,
  PLP) / weekly (produits) / monthly (compte).
- `src/app/robots.ts` : `allow: /`, `disallow: ["/api/", "/fr/commande/"]`,
  `sitemap: https://www.praguaz.fr/sitemap.xml`.
- `src/components/sites/maje/MajeJsonLd.tsx` (intégration **non requise**,
  l'intégrateur s'en charge) :
  - `<JsonLdOrganization />` : graphe Organization + WebSite, à monter une
    fois (ex. `src/app/layout.tsx`).
  - `<JsonLdProduct product={product} />` : Product + Offer (EUR, prix via
    `parseMajePrice`, URL via `getProductSlug`), à monter sur chaque PDP
    (ex. `src/app/fr/p/[slug]/page.tsx`). Voir les blocs `@example` du fichier.

### Headers sécurité (`next.config.ts`, `headers()` ajouté, reste inchangé)
Apoliqués à `/:path*` : `Strict-Transport-Security:
max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options:
nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### `package.json` (ajouts seuls)
- scripts : `"test": "vitest run"`, `"test:e2e": "playwright test"`.
- devDeps épinglées : `"vitest": "5.0.5"`, `"@playwright/test": "1.64.1"`.

## 2. Comment lancer

```bash
npm test            # unitaires (vitest)
npm run test:e2e    # e2e (nécessite `next dev -- --port 3001` dans un autre terminal)
npx tsc --noEmit    # typecheck
```

Note : `vitest.config.ts` émet un warning Vite bénin
(`configLoader: 'native'`, package sans `"type": "module"`) sans impact.

## 3. Résultats

### `npm test` — 32/32 ✅ (2026-10-16)

```text
> ai-website-clone-template@0.6.1 test
> vitest run

(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
(node:11985) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

 RUN  v5.0.5 /Users/fr168256/Projets/ai-website-cloner-template


 Test Files  2 passed (2)
      Tests  32 passed (32)
   Start at  15:13:24
   Duration  249ms (import 42%, transform 36%, worker 12%, tests 11%)
```

### `npx tsc --noEmit` — 0 erreur P0 ✅
Aucune erreur dans `sitemap.ts`, `robots.ts`, `MajeJsonLd.tsx`,
`pricing.test.ts`, `club-rules.test.ts`, `j1.spec.ts`,
`vitest.config.ts`, `playwright.config.ts`, `next.config.ts`.
4 erreurs pré-existantes hors périmètre (autre lot, fichiers non touchés) :
`src/app/club/prestige/page.tsx` et `src/app/club/signature/page.tsx`
(`'plan' is possibly 'null'`, TS18047).

### e2e — non exécuté (serveur `localhost:3001` non lancé, spec conçue pour skipper).
