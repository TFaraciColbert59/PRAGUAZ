# Maje FR — PDP (fiche produit), 2026-10-16

Source : https://fr.maje.com/ (style PDP Salesforce Commerce Cloud).
Template : `src/components/sites/maje/MajePDP.tsx` + `src/components/sites/maje/pdp.css`.
Routes : `src/app/fr/p/<slug>/page.tsx` (6 dossiers).

## Mapping slug → data.ts

| Route slug | data.ts id | Prix |
|---|---|---|
| manteau-long-laine-melangée | manteau-long-laine | 545 € → 272,50 € (-50%) |
| bottine-chelsea-suede | bottine-chelsea-suede | 395 € → 197,50 € (-50%) |
| pantalon-tweed | pantalon-tweed | 295 € → 147,50 € (-50%) |
| cardigan-cape | cardigan-cape | 345 € → 172,50 € (-50%) |
| milpli-cuir | milpli-cuir | 425 € → 340 € (-20%) |
| robe-maille | robe-maille | 445 € → 356 € (-20%) |

Helpers exportés : `findProductBySlug`, `getProductSlug`, `getCategoryForProduct`, `getSizesForProduct`.

## Structure du template

1. Fil d'Ariane : Accueil / Femme / catégorie / nom.
2. Galerie : 1 image locale par produit (720x955) affichée en grand + 3 miniatures =
   même fichier décliné en 3 vues CSS (`object-position` 18 % / 42 % + zoom x1.6 / 100 %).
3. Bloc info : nom (h1), réf., prix barré + prix promo + badge, note Last Chance.
4. Tailles : XS–XL par défaut, 36–41 pour chaussures (`getSizesForProduct`).
   Ajout sans taille → « Veuillez sélectionner une taille ».
5. Ajouter au panier : state local → « Ajouté au panier ✓ » + ligne `{id, size, qty}`
   persistée en localStorage clé `maje-cart`.
6. Wishlist ♡/♥ : toggle persisté en localStorage clé `maje-wishlist`.
7. Accordions natifs `<details>` : Détails (ouvert par défaut) / Livraison & retours
   (livraison à domicile offerte sous 2 jours ouvrés, retours offerts sous 30 jours).
8. « Vous aimerez aussi » : 3 autres produits de `data.ts` avec liens `/fr/p/<slug>`.
9. Header/Footer Maje importés, non modifiés.

## Styles

`pdp.css`, classes préfixées `maje-pdp-`, mobile-first, 2 colonnes ≥ 900 px.
Images ratio 720/955 `object-fit: cover`, tokens repris de `maje.css` (#000, #6b6b6b, #e5e5e5).

## Vérification

`npx tsc --noEmit` passe sur les 8 fichiers créés. Pas de `any`, named exports, 2 espaces.
Routes non lancées en dev/build (contrainte de mission).
