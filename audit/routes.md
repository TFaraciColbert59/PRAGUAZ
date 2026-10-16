# AUD-01 — Routes (L0)

Vérifiées une à une (curl 200 + Playwright). 32 fichiers `page.tsx`, ~98 URLs statiques.

| Route | État prouvé | Preuve |
|---|---|---|
| `/` homepage (hero, favoris, services) | présent & fonctionnel (vitrine) | snapshot + screenshot 2026-10-16 |
| 12 PLP `/fr/*` (tri, facettes, charger-plus) | présent & fonctionnel (données mock) | tri prix vérifié, facette «<200 €» → 3 articles |
| 60 PDP `/fr/p/*` (galerie 1–4 vues, tailles, ajout, wishlist) | présent & fonctionnel (vitrine) | erreur sans taille, ajout persisté |
| `/fr/panier`, `/fr/ma-wishlist`, `/fr/recherche?q=` | présent & fonctionnel (local) | quantités, totaux, 11 résultats « robe » |
| `/fr/commande/livraison|paiement|confirmation` | **présent & simulé** | commande MJ-50436629 en base, aucun vrai paiement |
| `/fr/stores`, `/fr/carte-cadeau`, `/fr/seconde-main`, `/fr/e-reservation`, `/fr/mon-compte` | présent & simulé/statique | filtre Lyon 8→1 vérifié |
| 11 `/fr/aide/*` (dont guide-tailles) | présent & fonctionnel (contenu résumé) | 200 + snapshot |
| Cookie, newsletter, chat, méga-menu, recherche header | présent & fonctionnel | accept→`maje-consent`, insert newsletter 201 |
| `/connexion`, `/compte/*`, `/admin/*`, `/essayage`, `/club`, `/communaute`, API `/api/*` | **absents** | 404, rien en `src/app/api` |

Mobile 390px : pas d'overflow, hero + grilles OK. Desktop vérifié par screenshots.
