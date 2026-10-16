# Conseiller Praguaz — chat Maje (déterministe, sans LLM)

Fichier : `src/components/sites/maje/MajeChat.tsx` (client).
Styles : classes `maje-chat-*` existantes de `maje.css` (non modifié) + utilitaires Tailwind pour le formulaire et les résultats.

## Comportement

1. Panneau FAB inchangé + titre « Conseiller Praguaz ».
2. 3 réponses rapides d'origine conservées (« Où est ma commande ? », « Quelle taille choisir ? », « Comment retourner un article ? »).
3. Mini questionnaire : occasion (`mariage`, `bureau`, `soiree`, `weekend`, `ceremonie`), budget max (`150` / `250` / `400` / `all` = sans limite), taille (`XS`–`XL`, `TU`, `36`–`41`). Bouton « Voir mes looks » actif uniquement si occasion + taille choisies.

## Moteur de règles (100 % déterministe)

- Occasion → catégories (`OCCASION_CATEGORIES`) :
  - mariage / invitée → `robes`
  - bureau → `pantalons-jeans` + `vestes`
  - soirée → `robes`
  - week-end → `pulls-cardigans` + `pantalons-jeans`
  - cérémonie → `robes`
- Filtre prix : `parseFrPrice(newPrice)` (format FR « 272,50 € ») ≤ budget ; `all` = aucun filtre.
- Filtre taille : `getSizesForProduct(product)` (voir `product-slugs.ts` : `XS`–`XL` sauf `chaussures` → `36`–`41`, `sacs` → `TU`) doit inclure la taille choisie.
- Source : `MajeProducts` (60 produits : 6 de base + 54 du catalogue). Max 3 résultats, ordre catalogue conservé, chacun avec image, nom, prix, lien `/fr/p/<slug>` via `getProductSlug`.
- 0 résultat : message honnête (« Aucun look ne correspond à ces critères dans le catalogue actuel… ») + bouton « Réinitialiser mes critères ». Aucun stock inventé, aucune disponibilité temps réel affirmée.

## Escalade

- Lien `/fr/aide/nous-contacter` (existant, conservé) + lien `/fr/aide/faq`.
- Mention affichée : « Conseils automatiques à partir du catalogue, sans intelligence artificielle. »

## Limites assumées

- Pas de LLM, pas de mémoire, pas d'appel réseau : règles codées en dur.
- Le stock temps réel n'existe pas dans ce clone ; le conseiller ne parle que du catalogue local.
- Vérifié avec `npx tsc --noEmit` (aucun dev/build lancé).
