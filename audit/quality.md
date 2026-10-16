# AUD-01 — Qualité mobile/perf/accessibilité (L0)

## Mesuré le 2026-10-16 (Playwright, build local)
- 390px : `scrollWidth == innerWidth`, hero + grilles OK, tunnel complet rejoué au clavier Playwright (pas de test lecteur d'écran).
- Console : 0 erreur sur home, PLP, PDP, panier, livraison, confirmation, wishlist, stores, aide.
- `npm run check` vert (lint + typecheck + 98 pages). Aucun test automatisé.

## Non mesuré / absent
- Core Web Vitals terrain (LCP/INP/CLS) : pas de RUM, pas de Lighthouse CI.
- 360/768/1440 : 390 et desktop large vérifiés visuellement ; 360/768/1440 **à recetter**.
- Accessibilité : navigation clavier partielle (focus natif), pas d'audit WCAG 2.2 AA, pas de test lecteur d'écran (SEC-012).
- SEO : metadata basiques, pas de sitemap.xml/robots/JSON-LD/données structurées (§14).
- Observabilité : aucun logging front/back, pas de Sentry/logs, pas de procédure incident (§13/§14).

## Recommandation L0→P0
Ajouter : vitest (calculs prix/remises/points), Playwright e2E (J1), Lighthouse CI, `sitemap.ts`+`robots.ts`, en-têtes sécurité, Sentry. Coût perf à surveiller : 219 images (~10 Mo) → CDN + `next/image` sizes à auditer.
