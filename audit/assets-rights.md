# AUD-01 — Assets et droits (L0) — BLOQUANT BR-01

## Inventaire tiers non autorisé (à remplacer avant commercialisation, §11)
- **Marque/nom/logo** : « Maje », logo SVG officiel, baseline « Site Officiel ». Fichier : `public/sites/maje/logo.svg`.
- **Photos produits** : 219 fichiers, ~10 Mo (`public/sites/maje/`), extraits de fr.maje.com (hi-res + packshots). Aucune licence.
- **Textes** : noms produits, prix, descriptifs PDP/FAQ/CGV rédigés d'après la source ; mentions « Maje/SMCP » dans footers.
- **Polices** : stack système (AvantGarde/ITC non embarquées — bien) ; rien à purger côté fonts.
- **Réseaux** : liens Instagram/Facebook/TikTok **majeparis** dans le footer → remplacer par comptes PRAGUAZ (@ghyselisa à confirmer, §18.1).

## Commandes utiles
- `ls public/sites/maje | wc -l` → 219 ; `du -sh public/sites/maje` → ~10 Mo.
- `grep -rn "maje\|Maje\|MAJE" src public --include="*.tsx" --include="*.ts" -l` pour traquer les résidus après rebrand.

## Règle
Aucune mise en production publique tant que BR-01 n'est pas clos : nom, logo, photos, textes, fiches, direction artistique PRAGUAZ originale (bohème chic, §5.5), prix 25–40 € à valider (EC-008b).
