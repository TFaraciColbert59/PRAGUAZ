# Communauté UGC — locale-first (sans backend)

## Principe
Aucun serveur : soumissions, file de modération et signalements vivent dans le
localStorage du navigateur, étiqueté honnêtement dans l'UI (« Démo 100 % locale »).

- `pg-ugc-posts` : soumissions `{id, caption, productIds, photoDataUrl?, status, createdAt, consentAt}`.
  - `status` : `en-modération` à la soumission, `publié` via le bouton « Publier »
    (simule la validation de la file de modération locale).
  - Photo en dataURL, max 12 looks avec photo (même règle que le dressing).
  - Légende ≤ 280 caractères, au moins une pièce du catalogue liée.
  - Consentement d'affichage obligatoire (checkbox), horodaté (`consentAt`) et
    affiché comme preuve dans « Mes soumissions ».
- `pg-ugc-reports` : ids signalés → masqués de la galerie sur cet appareil.
- Retrait (`withdraw`) : suppression immédiate du post (droit au retrait).

## Seeds
3 looks d'exemple (`seed-look-*`), pièces du catalogue via `MajeProducts`,
SANS photo cliente, badge « Exemple ».

## Pages
- `/communaute` : galerie filtrable par produit + défi `#VendrediPraguaz` +
  formulaire de soumission + mentions (modération simulée, droit à l'image,
  mineures refusées).
- `/communaute/look/[id]` : détail (post local ou seed), placeholder si
  indisponible ou masqué, bouton signaler.
- `/fr/compte/ugc` : mes soumissions (statut, publier/retirer, preuve de
  consentement affichée).

## Fichiers
- `src/lib/maje/ugc.tsx` — contexte `UgcProvider` / `useUgc` (+ `ugc.css` importé
  par les pages, classes `pg-ugc-*`).
- `supabase/migration-ugc.sql` — préparatoire, inactif tant que buckets + auth
  ne sont pas branchés (voir en-tête du fichier).

## Vérification
`npx tsc --noEmit` OK. Pas de `dev`/`build` lancé.
