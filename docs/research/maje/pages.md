# Maje FR — Pages satellites (2026-10-16)

Maquette éducative non affiliée à Maje / SMCP. Intitulés repris du footer réel
(cf. `docs/research/maje/page-brief.md`), textes résumés et réécrits — aucun
long texte juridique copié.

## Route map

| Route locale | Source / intitulé footer | Composant |
|---|---|---|
| `/fr/stores` | Store locator | `MajeStoreLocator` + recherche ville, 8 boutiques, carte factice |
| `/fr/carte-cadeau` | Carte cadeau | `MajeGiftCard` montants 50/100/150/200 + CTA mock |
| `/fr/seconde-main` | Seconde Main | `MajeCMSPage` 4 blocs |
| `/fr/e-reservation` | E-Réservation | `MajeCMSPage` 4 blocs |
| `/fr/aide/suivi-commande` | Suivi de commande | template `aide/[slug]` 4 blocs |
| `/fr/aide/nous-contacter` | Nous contacter | 3 blocs |
| `/fr/aide/faq` | F.A.Q. | 4 blocs |
| `/fr/aide/echanges-retours` | Échanges, Retours & Remboursements | 4 blocs |
| `/fr/aide/entretien` | Conseil d\u2019entretien | 4 blocs |
| `/fr/aide/cgv` | CGV | 4 blocs |
| `/fr/aide/confidentialite` | Politique de confidentialité | 3 blocs |
| `/fr/aide/cookies` | Charte cookies | 3 blocs |
| `/fr/aide/accessibilite` | Déclaration d\u2019accessibilité | 3 blocs |
| `/fr/aide/a-propos` | À propos (+ Judith Milgrom, Campagne FW26, Carrières, M de Maje) | 4 blocs |

## Composants (`src/components/sites/maje/MajePages.tsx`)

- `MajeCMSPage({ title, eyebrow, intro, blocks })` — fil d\u2019Ariane,
  eyebrow, H1, intro, sections H2 + paragraphes + liens optionnels,
  mention légale discrète « Maquette éducative non affiliée ».
- `MajeStoreLocator({ stores })` — client : input recherche ville (filtre
  insensible à la casse), compteur, liste 8 boutiques, carte factice CSS
  (grille + pastilles numérotées).
- `MajeGiftCard({ amounts })` — client : visuel noir MAJE, sélection de
  montant avec `aria-pressed`, CTA mock « Ajouter au panier (démo) ».

Styles : `src/components/sites/maje/pages.css` (mobile-first, `@media
min-width: 900px` 2 colonnes). `maje.css` importé en plus dans chaque route
pour header/footer (non modifiés, importés en lecture seule).

## Boutiques (adresses plausibles, fictives)

Paris : Le Marais (3 rue de Sévigné, 75004), Saint-Germain (14 rue du Four,
75006), Galeries Lafayette Haussmann (40 bd Haussmann, 75009), Forum des
Halles (101 porte Berger, 75001). France : Lyon République, Bordeaux
Intendance, Marseille Saint-Ferréol, Lille Grande Chaussée. Tél. et horaires
plausibles affichés.

## Notes

- Chaque page CMS : 3–5 paragraphes résumés par thème, liens internes vers
  `/fr/stores`, `/fr/carte-cadeau`, `/fr/e-reservation`, `/fr/aide/*`.
- `generateStaticParams` fige les 10 slugs aide ; `generateMetadata` async
  (params `Promise`, Next 16) ; `notFound()` hors slugs.
- TS strict, `import type` pour types, pas de `any`, named exports, 2 espaces.
