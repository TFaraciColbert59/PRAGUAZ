# Maje FR — Template PLP (listing catégorie, 2026-10-16)

Source : https://fr.maje.com/ (listings catégories, style Salesforce Commerce Cloud)

## Fichiers

- `src/components/sites/maje/MajePLP.tsx` — composant client : fil d'Ariane,
  titre, compteur, tri, facettes, grille, « Charger plus ». Importe `./plp.css`.
- `src/components/sites/maje/plp-data.ts` — 12 catégories + métadonnées
  locales (couleurs, tailles, prix, nouveauté) + tranches de prix.
- `src/components/sites/maje/plp.css` — styles PLP + recopie des classes
  tuiles (`.maje-tile`, `.maje-grid`, `.maje-badge`, `.maje-price`).
  `maje.css` n'est pas modifié.
- Routes `src/app/fr/(plp)/**` (groupe sans impact URL) :
  chaque page rend `<main className="maje-page">` avec
  `MajeHeader` + `MajePLP` + `MajeFooter`.

## Catégories

| Slug local (`/fr/...`) | Titre | URL source fr.maje.com | Produits |
|---|---|---|---|
| `last-chance/tout-voir` | Last Chance : Tout voir | `/fr/last-chance/categories/tout-voir/` | 6 (tout le catalogue) |
| `robes` | Robes | `/fr/categories/robes/` | robe-maille |
| `vestes-manteaux` | Vestes & Manteaux | `/fr/categories/vestes-manteaux/` | manteau-long-laine, cardigan-cape |
| `pulls-cardigans` | Pulls & Cardigans | `/fr/categories/pulls-cardigans/` | cardigan-cape, robe-maille |
| `pantalons-jeans` | Pantalons & Jeans | `/fr/categories/pantalons-jeans/` | pantalon-tweed |
| `sacs` | Sacs | `/fr/categories/sacs/` | milpli-cuir |
| `chaussures` | Chaussures | `/fr/categories/chaussures/` | bottine-chelsea-suede |
| `manteaux` | Manteaux | `/fr/categories/manteaux/` | manteau-long-laine |
| `tops-chemises` | Tops & Chemises | `/fr/categories/tops-chemises/` | cardigan-cape, robe-maille |
| `jupes-shorts` | Jupes & Shorts | `/fr/categories/jupes-shorts/` | pantalon-tweed |
| `accessoires` | Accessoires | `/fr/categories/accessoires/` | milpli-cuir, bottine-chelsea-suede |
| `nouveautes` | Nouveautés | `/fr/nouveautes/` | robe-maille, milpli-cuir, cardigan-cape |

Tous les `productIds` existent dans `MajeProducts` (`data.ts`, 6 produits réels).

## Comportements (état local, sans backend)

- Tri : Pertinence (ordre source), Prix croissant, Prix décroissant,
  Nouveautés (`isNew` d'abord : robe-maille, milpli-cuir).
- Facettes : Taille (XS–XL + TU), Couleur (Beige, Camel, Écru, Marron, Noir),
  Prix (Moins de 200 € / 200–350 € / Plus de 350 €), avec compteurs.
  Chaussures et sacs portent la taille « TU ».
- « Charger plus » par 4 ; état vide avec réinitialisation ;
  « Effacer les filtres (n) » dans la toolbar.

## Limites maquette

- Catalogue local de 6 produits : les catégories mono-produit affichent
  1 tuile ; les prix/couleurs/tailles sont des mappings plausibles,
  pas des données source exhaustives.
- Header/Footer/Hero réutilisés tels quels, non modifiés.
