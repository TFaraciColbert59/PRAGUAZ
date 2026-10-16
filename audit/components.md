# AUD-01 — Composants (L0)

Tous dans `src/components/sites/maje/`, préfixe `maje-*`, réutilisables tels quels après rebrand (BR-01).

| Composant | Rôle | État prouvé |
|---|---|---|
| `MajeHeader` + `MajeMegaMenu` | topbar, nav, recherche overlay, badges, sticky+ombre | fonctionnel, 0 erreur console |
| `MajeHero` | visuel + CTA | fonctionnel, entrance animée |
| `MajeProductGrid` / `MajePLP` + `plp-data.ts` | tuiles, tri, facettes, pagination | fonctionnel (données mock) |
| `MajePDP` + `product-slugs.ts` | galerie 1–4 vues, tailles, prix, accordions, cross-sell | fonctionnel |
| `MajeCartDrawer`, `cart.tsx` (context) | panier/wishlist persistés | fonctionnel, hydration-safe |
| `MajeFooter` (+ newsletter), `MajeCookie`, `MajeChat` | consentement, capture email, aide | fonctionnel, inserts Supabase OK |
| `MajePages` (CMS), `MajeIcons` (SVG) | pages satellites, iconographie | fonctionnel |
| `MajePages` stores/cadeau | locator filtré, montants mock | simulé |

Données : `data.ts` (60 produits mergés) + `src/lib/maje/catalog.ts` (54 extraits) + `hover-map.ts` (vues).
Tests : aucun test automatisé (ni unitaires ni e2E) — exigés §15 avant P0 (§15.1).
