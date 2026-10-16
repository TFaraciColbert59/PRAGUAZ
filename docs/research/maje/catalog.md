# Catalogue local Maje FR — 54 produits (2026-10-16)

Source : `https://fr.maje.com/sitemap_0-product.xml` (322 URL au 2026-10-16, collection FW en cours).
Plateforme : Salesforce Commerce Cloud (Demandware).

## Couverture (54 produits, tous récupérés, 0 manquant)
- manteaux : 6 (tous les `MFPOU*` du sitemap)
- robes : 10 (`MFPRO*`, échantillon)
- pulls-cardigans : 10 (`MFPCA*` + `MFPPU*`, échantillon)
- pantalons-jeans : 8 (`MFPPA*` + `MFPJE*`, échantillon)
- sacs : 10 (`MFASA*` + `MFAPM*`, échantillon)
- chaussures : 8 (`MFACH*`, échantillon)
- vestes : 2 (`MFPVE*`, bonus pour dépasser 50)

Aucun blocage SFCC (pas de rate-limit/captcha constaté le 2026-10-16 avec UA navigateur + 1,2 s d'intervalle).
Les codes historiques du page-brief (`MFPOU01441`, `MFPPA00779` coloris 2517, `MFPRO05095`…)
ne figurent plus dans `sitemap_0-product.xml` (sortis de la collection courante) : le catalogue
reflète donc l'offre actuelle, pas les archives.

## Méthode d'extraction (par fiche produit)
- `name` : JSON-LD `Product.name` (repli : `data-gtmga4data.item_name`).
- Prix : `data-gtmga4data` de la variante principale (`item_id` = code produit) :
  `newPrice` = `price`, remise = `discount` (> 0 ⇒ promo).
  `oldPrice` = `price + discount`, `discount` (badge) = `-X %` recalculé.
  12 produits en promo (majoritairement -50 %, 1× -40 %, 1× -30 %), 42 à prix plein (`oldPrice: null`, `discount: null`).
- Prix observés le 2026-10-16, TVA FR incluse, en euros (ex. manteau 525 → 262,50 ; chelsea suède 375 → 187,50).
- Image : visuel principal SFCC `hi-res …_F_1.jpg` + `?sw=720&sh=955&sm=fit` (720 px de large,
  ratio ~3:4 comme les tuiles du site), téléchargé dans `public/sites/maje/`.
  Le packshot `…_F_P.jpg` existe pour chaque produit mais n'est pas retenu (vignette studio,
  moins représentative que le porté `F_1`).

## Defaults tranchés (pas de question posée)
1. `slug` de fichier = code produit en minuscules, `_` → `-` : `prod-<code>.jpg`
   (ex. `prod-mfpou01497-0103.jpg`). Garantit l'unicité (deux coloris partagent parfois
   le même libellé, ex. `Pantalon en tweed` MFPPA00779 vs MFPPA00879).
2. `image` pointe vers le fichier local (`/sites/maje/prod-….jpg`), jamais vers le CDN :
   le catalogue fonctionne hors-ligne et sans hotlink.
3. `oldPrice: number | null`, `discount: string | null` (`"-50%"`) : `null` = prix plein.
4. `category` = famille d'échantillonnage en kebab-case (`manteaux`, `robes`,
   `pulls-cardigans`, `pantalons-jeans`, `sacs`, `chaussures`, `vestes`).
5. `alt` = `name` (texte alternatif FR identique au libellé).
6. Re-génération : `sh scripts/maje-catalog.sh` (ne retélécharge que les fichiers
   manquants < 10 Ko ; ne touche jamais aux assets préexistants `hero-*`, `logo.svg`,
   `prod-manteau-long.jpg`, etc.).

## Fichiers
- `src/lib/maje/catalog.ts` — `MajeCatalogProduct` + `MajeCatalog` (54 entrées).
- `scripts/maje-catalog.sh` — re-téléchargement des 54 visuels (URL dw/image exactes).
- `public/sites/maje/prod-mfp*.jpg`, `prod-mfach*.jpg`, `prod-mfapm*.jpg` — 54 JPEG valides (~17–57 Ko, 720 px).
