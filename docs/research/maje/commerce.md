# Maje — Commerce local (mock)

Commerce 100 % local, sans backend : panier + wishlist persistés en `localStorage`,
recherche plein texte sur le catalogue `MajeProducts`, tunnel de commande simulé.

## Fichiers

- `src/lib/maje/cart.tsx` — `MajeCartProvider` + `useMajeCart`.
  Items `{ id, qty, size }`, `add/remove/setQty/clear`, `total`, `count`, `lines`.
  Wishlist `toggleWishlist/isWishlisted`. Persistance `maje-cart` / `maje-wishlist`.
  Helpers `parseMajePrice`, `formatMajePrice`, `getMajeProduct`.
- `src/components/sites/maje/MajeCartDrawer.tsx` — tiroir latéral (`open`, `onClose`),
  quantités, total, CTA « Passer commande » → `/fr/commande/livraison`.
- `src/components/sites/maje/commerce.css` — classes `maje-cart-*`, `maje-co-*`,
  `maje-wish-*`, `maje-search-*`.
- `src/app/fr/panier/page.tsx` — liste + récap (livraison offerte dès 150 €) + CTA.
- `src/app/fr/ma-wishlist/page.tsx` — grille des produits wish-listés.
- `src/app/fr/recherche/page.tsx` — `?q=`, filtre insensible aux accents sur le nom.
- `src/app/fr/commande/livraison/page.tsx` — adresse FR validée → `maje-shipping` → paiement.
- `src/app/fr/commande/paiement/page.tsx` — CB MOCK, mention
  « Paiement simulé — aucune transaction réelle » → confirmation (`maje-order`).
- `src/app/fr/commande/confirmation/page.tsx` — n° `MJ-xxxxxxxx`, vide le panier.

## Intégration attendue (par l’intégrateur, hors scope)

- Monter `<MajeCartProvider>` dans le layout (non fait ici).
- Câbler `MajeCartDrawer` sur l’icône panier du `MajeHeader`.
- Ajouter boutons « Ajouter au panier » / cœur wishlist sur les tuiles produit.

## Vérification

- `npm run typecheck` (`tsc --noEmit`) sans erreur.
- Parcours manuel : recherche → ajout panier → tiroir → panier → livraison →
  paiement (mention simulée visible) → confirmation (panier vidé).
