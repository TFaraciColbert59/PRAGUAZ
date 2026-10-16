# P1 — Dressing & essayage-shell (vérifié 2026-10-16)

## Dressing (DR-001…DR-008, local d'abord)
- `src/lib/maje/dressing.tsx` : looks (titre, pièces, photo, `prive`/`partage`, shareCode), photos (dataURL ≤12, resize 800px JPEG 0.7), persistance `praguaz-dressing`/`praguaz-photos`, hydration-safe.
- `/fr/mon-dressing` : créer/renommer/supprimer, ajout/retrait pièces, partage opt-in → lien `/fr/dressing/partage#d=<base64>` (pair-à-pair, révocable en repassant privé), copier-lien.
- `/fr/dressing/[partage]` : lecture lien, produits liés, placeholder si indisponibles, page « révoqué » sinon.
- Entrées : PDP « Ajouter au dressing » (look « Mes envies »), wishlist, essayage.
- Distinctions DR-002 : wishlist (cœur) vs dressing (looks) vs essayages (photos) séparés.
- Vérifié : création, ajout PDP, partage/copie, lecture lien anonyme, révocation (page invalide).

## Essayage-shell (AI-001, sans fournisseur — assumé)
- `MajeTryon.tsx` sur chaque PDP : consentement explicite (traitement 100 % local), upload JPEG/PNG/WebP ≤10 Mo, aperçu, enregistrement photo + look auto.
- Mention claire : « Génération IA non connectée ». Achat toujours possible.
- Reste P1 : brancher fournisseur try-on (AI-004), quotas/coûts (AI-007), purge (AI-006) → backend requis.

## Conseiller : voir `conseiller.md` (lot parallèle).
