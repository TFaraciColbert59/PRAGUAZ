# Maje FR — Page brief (homepage, 2026-10-16)

Source: https://fr.maje.com/
Platform: Salesforce Commerce Cloud (Demandware)

## Route map
- Source `/` → local `/` (first root clone, replaces untouched template homepage)
- Files owned: `src/app/page.tsx`, `src/components/sites/maje/*`, `public/sites/maje/*`

## Structure observed (desktop + mobile)
1. Promo top bar: "Last Chance : -10% supplémentaires sur la sélection SHOP NOW" → https://fr.maje.com/fr/last-chance/categories/tout-voir/
2. Header: logo Maje SVG center/left, search, wishlist (/fr/ma-wishlist/), cart (/fr/panier/), nav mega-menu
3. Hero slider: desktop `sliderbooster.jpg` (1920x1080), mobile `Slider_booster_mobile.jpg` (1080x1920). Overlay text white: "Last Chance / -10% supplémentaires / sur la sélection" + CTA white button black text "Shop now"
4. Category pills: Last Chance, -50%, Robes, Vestes & Manteaux, Pulls & Cardigans, Pantalons & Jeans, Sacs, Chaussures (+ Seconde Main, Réparation & Retouches, Carte cadeau)
5. Section "Vos pièces favorites": product carousel, tiles with image 720x955 (3:4), name, old price barré, new price, badge -50%/-20%
6. Services: Livraison à domicile offerte sous 2j, Paiement en plusieurs fois sans frais, Echanges & Retours offerts, Suivi de commande
7. Footer: Carte cadeau, M de Maje, E-Réservation, Offre étudiante, Soldes/Outlet/Black Friday, contact, FAQ, retours, entretien, CGV, confidentialité, cookies, stores, À propos Judith Milgrom, Campagne FW26, Carrières

## Products (real content)
- Manteau long en laine mélangée — 545 € → 272,50 € (-50%)
- Bottine chelsea en suède — prix source variable
- Pantalon en tweed
- Veste courte en cuir — 355 € → 177,50 € (-50%)
- Bottines chelsea à talon en cuir — 395 € → 197,50 € (-50%)
- Robe courte brodée — 345 € → 172,50 € (-50%)
- Robe midi en crochet strassé — 445 € → 356 € (-20%)
- Manteau en laine à capuche amovible — 525 € → 262,50 € (-50%)
- Cardigan effet cape / Milpli en cuir craquelé / Robe en maille avec pull amovible

## Design tokens
- BG: #ffffff, text: #000000, muted: #6b6b6b, border: #e5e5e5
- CTA hero: white bg, black text
- Badges promo: black text on white / black bg white text for -%
- Fonts: AvantGarde, ItcAvantGardeGothicDemi, Helvetica/Arial fallback. Licensed files not downloadable → local stack approximation disclosed.
- Tile ratio: 720x955 portrait, object-cover

## Asset map (source → local)
- Logo SVG → public/sites/maje/logo.svg
- hero desktop sliderbooster.jpg → public/sites/maje/hero-desktop.jpg
- hero mobile → public/sites/maje/hero-mobile.jpg
- MFPOU01441 manteau → prod-manteau-long.jpg
- MFACH00833 bottine suède → prod-chelsea-suede.jpg
- MFPPA00779 pantalon tweed → prod-pantalon-tweed.jpg
- MFPCA00785 cardigan cape → prod-cardigan-cape.jpg
- MFASA01489 milpli cuir → prod-milpli-cuir.jpg
- MFPRO05095 robe maille → prod-robe-maille.jpg
