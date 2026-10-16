# AUD-01 — Architecture (L0)

Date : 2026-10-16. Dépôt : `TFaraciColbert59/PRAGUAZ`, branche `main`.
Base : template `JCodesMore/ai-website-cloner-template` (Next.js, pas de backend propre).

## Stack prouvée (manifestes)
- Next.js 16.3.5 (App Router, Turbopack), React 19.2.4, TypeScript strict (`tsc --noEmit` vert).
- Tailwind CSS v4 (+ `tw-animate-css`), shadcn/ui (thème), Lucide non utilisé (icônes SVG inline maison).
- `@supabase/supabase-js ^2.118.0` + `@supabase/ssr ^0.12.7` (clients `src/lib/supabase/`).
- Pas de Prisma/ORM, pas d'API routes métier, pas de PSP, pas d'auth, pas de jobs, pas de back-office.
- Configs : `opencode.json` (MCP playwright projet), `~/.config/opencode/opencode.json` (MCP supabase + github, globaux).

## Services externes réellement branchés
- Supabase projet `alwlrsbepkzdmobuzlow` : tables `newsletter_subscribers`, `orders`, `order_items` (RLS, insert anon). Clés dans `.env.local` (ignoré par git, vérifié).
- Aucun PSP, transporteur, email transactionnel, IA, CDN.

## Commandes
- `npm run dev` (port 3001 en local), `npm run check` = lint + typecheck + build. Build : 98 pages statiques.

## États prouvés (convention §2.2)
- Catalogue/panier/wishlist/recherche/checkout mock : **présent & simulé** (localStorage + inserts Supabase tests).
- Paiement réel, stock serveur, emails, comptes, admin : **absents**.
- Données produits : scraping ponctuel Maje (60 produits, prix TTC affichés, pas de TVA/coût/stock) : **simulé**, à remplacer (BR-01/CAT-01).

## Décisions structurantes à prendre (D-03, D-04)
- Garder Next.js + Supabase (recommandé : maintenable, testable) ou migrer.
- Choisir PSP (Stripe recommandé), transporteur, fournisseur email avant L2.
