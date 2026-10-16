# AUD-01 — Matrice fonctionnelle (L0)

Légende : ✅ présent & fonctionnel · 🟡 présent & simulé · ❌ absent · 🔴 présent & défaillant.

| Capacité (spec §2.1) | État | Test du 2026-10-16 |
|---|---|---|
| Navigation catalogue / catégories | ✅ | 12 PLP 200, méga-menu snapshot |
| Filtres prix/couleur/taille + tri | ✅ (mock) | tri croissant 147,50→213 € ; facette → 3 articles |
| Recherche + suggestions | ✅ partiel (pas de suggestions) | 11 résultats « robe », zéro-résultat géré |
| Fiche produit + variantes | ✅ (mock, pas de stock) | erreur sans taille, 4 vues galerie |
| Wishlist / panier | ✅ (local) | persistance, quantités, totaux |
| Checkout + confirmation | 🟡 | MJ-50436629 en Supabase, paiement fictif |
| Compte / suivi commandes | ❌ | pas de `/compte`, pas d'auth |
| Newsletter | ✅ | insert 201 + fallback local |
| Avis produits | ❌ | rien en PDP |
| Alertes retour en stock | ❌ | rien |
| Carte cadeau | 🟡 | page montants, aucun achat réel |
| Essai virtuel | ❌ | P1 AI-001…AI-009 à construire |
| Emails transactionnels | ❌ | aucun prestataire |
| Retours / remboursements | 🟡 | pages d'aide + tunnel sans exécution |

Conclusion §2.3 : conserver grille/header/filtres/fiches/panier/tunnel **après** rebrand+tests ; reconfigurer taxonomie/prix/livraison ; retirer boutiques physiques (stores, e-réservation, retouches, seconde main) tant que non proposés ; recréer identité.
