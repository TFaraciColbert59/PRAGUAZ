# Maje — Header global enrichi (2026-10-16)

## Fichiers
- `src/components/sites/maje/MajeHeader.tsx` (client) : topbar promo + nav + overlay recherche + drawer/méga-menu + compte/wishlist/panier.
- `src/components/sites/maje/MajeMegaMenu.tsx` (client) : panneau 4 colonnes + pied promo.
- `src/components/sites/maje/maje.css` (append uniquement) : classes `maje-menu-wrap`, `maje-mega*`, `maje-search*`, `maje-action-link`, `maje-count-badge`.

## Structure conservée
Topbar promo (lien externe Last Chance), `.maje-nav` (☰ ⌕ logo `/` actions), nav `.maje-cats` (8 liens `MajeCategories` → `fr.maje.com/fr/last-chance/categories/<cat>/`). Aucune classe existante modifiée.

## Ajouts
- **Burger ☰** : `aria-expanded` / `aria-controls="maje-mega-menu"` / `aria-haspopup="true"`, toggle au clic. Survol/focus des liens catégories ouvre aussi le panneau (desktop) ; `onMouseLeave` du wrapper le referme.
- **Méga-menu** : 4 colonnes Prêt-à-porter / Sacs / Chaussures / Accessoires, sous-liens vers vraies URL `fr.maje.com`. Pied promo → PLP locale `/fr/last-chance/tout-voir` (aucune route `/fr/*` locale n'existe encore ; le pied anticipe la PLP mock). Chaque lien appelle `onClose`. Mobile-first : drawer vertical fixe (`min(86vw, 340px)`) ; desktop ≥900px : panneau plein-largeur absolu sous les catégories.
- **Recherche ⌕** : `aria-expanded` / `aria-controls="maje-search"`, overlay `role="search"` avec `<form action="/fr/recherche" method="get">` + `input[name="q"]` → navigue vers `/fr/recherche?q=…` sans JS. Bouton ✕ pour fermer.
- **Compte (mock)** : lien `/fr/mon-compte/` (glyphe ○, `aria-label="Mon compte"`).
- **Wishlist / Panier** : liens mocks locaux `/fr/ma-wishlist/` et `/fr/panier/` (remplacent les URL externes pour préparer les pages locales). Badge `.maje-count-badge` affiché si > 0, `aria-hidden`, compte injecté dans `aria-label` (« Panier, 3 articles »).
- **Compteurs** : lus dans `useEffect` depuis `localStorage` (`maje-cart`, `maje-wishlist`) — tableau JSON → length, nombre fini → valeur, sinon 0, `try/catch`. Rafraîchi sur event `storage`. SSR-safe (init 0, pas de mismatch d'hydratation).

## Accessibilité / fermeture
- `Echap` ferme menu + recherche (listener `keydown`).
- Clic extérieur au `<header>` ferme le méga-menu (listener `mousedown` + `ref`).
- Menu non rendu quand fermé (`return null`), recherche rendue conditionnellement.

## Vérification
- `npx tsc --noEmit` : à lancer (ou relecture). Aucun `any`, exports nommés, indentation 2 espaces.
- `dev`/`build` non lancés (consigne mission).
