# Plan final — clôture clonage fr.maje.com (2026-10-16)

## Constats audités
1. Boutons → maje.com : nav catégories, topbar, hero CTA, breadcrumb, footer, guide tailles, confirmation panier.
2. Fiches inaccessibles : tuiles home/PLP sans lien, pas de PDP liées.
3. Icônes : glyphes/emoji (☰ ⌕ ♡ 🛍 ○) fragiles selon OS.
4. Manquants vs source : cookie, newsletter, socials, chat, hover 2e vue (source : 8 imgs/tuile), galerie multi-vues, sticky header, reveals, footer fidèle.

## Réalisé
- A. Liens 100 % internes : `MajeCategories` → routes locales, topbar/hero/breadcrumb/footer/guide-tailles/panier recâblés, lien « origine » supprimé, page `/fr/aide/guide-tailles` créée. Reste externe : 4 réseaux sociaux (Instagram/Facebook/TikTok/Pinterest, observés source).
- B. Tuiles → PDP : `Link /fr/p/<slug>` sur home, PLP, related.
- C. Icônes SVG inline (`MajeIcons.tsx`) : menu, recherche, compte, cœur, sac, close, chevron + 4 sociaux. Zéro glyphe restant.
- D. Cookie (`maje-consent`), newsletter footer (validation + `maje-newsletter`), chat mock (3 Q/R + contact), montés dans le layout.
- E. 156 vues F_2/F_3/F_4 téléchargées (52 produits) : hover crossfade tuiles, galerie PDP 1→4 miniatures (`getProductViews`).
- F. Animations : header sticky + ombre au scroll, entrée hero (zoom + rise), reveal au scroll (view-timeline, `prefers-reduced-motion` respecté), hover zoom tuiles, transitions drawer/menu/boutons.
- G. Footer fidèle : newsletter + colonnes Services/Aide/À propos/Boutiques + sociaux + légal.
- Correctifs QA : 404 Turbopack (restart propre), slug unicode → ASCII, hydration mismatch (sync post-montage + garde dirty), homepage 6 tuiles (featured).

## Vérifié (Playwright MCP + curl)
- 94/94 routes 200, 0 lien externe non-social, 0 erreur console (9 gabarits).
- Méga-menu, recherche (11 résultats « robe »), tri/facettes/charger-plus, erreur taille, ajout panier, wishlist, quantités, tunnel complet jusqu'à `MJ-xxxxxxxx`, stores « Lyon » 8→1, cookie, newsletter invalide/valide, chat, mobile 390px sans overflow.
- `npm run check` vert (98 pages statiques).

## Limites assumées (non-clonables sans moyens Maje)
- Tunnel réel (PSP/stocks), prix temps réel, compte client serveur, iAdvize/GTM/Teads tiers, font AvantGarde sous licence (stack système), vidéos campagne.
