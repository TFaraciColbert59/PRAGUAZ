# PRAGUAZ — Plan final 100 % (2026-10-16)

Référence : `PRAGUAZ_Cahier_des_charges_technique.md` (P0–P3, lots L0–L9, §20 = 8 conditions de « terminé »).
État : L0 audit ✅ · L1 rebrand ✅ (léger, médias transitionnels) · P1 dressing/conseiller/essayage-shell ✅ (sans fournisseur IA).

## Lots restants, prérequis, recette

| Lot | Contenu | Prérequis (qui) | Recette §20 |
|---|---|---|---|
| **A. Comptes + Auth** | Supabase Auth (inscription/connexion/mdp oublié), `/compte` (commandes, adresses, retours, favoris, consentements), fusion wishlist/dressing invité→compte, RGPD export/suppression | **moi seul** (projet + anon key OK) | EC-023/EC-024, J1 connecté |
| **B. Catalogue réel** | Tables `products/variants/inventory`, prix/TVA/stocks, import 60 produits, PLP/PDP branchées DB, blocage achat hors-stock serveur | **moi** (tableaux via SQL — me donner `service_role` OU j'envoie le SQL à coller) | CAT-01, EC-002/003 |
| **C. Transaction réelle** | Stripe (compte + clés), webhook signé idempotent, stock transactionnel, emails (Resend/Brevo), retours/remboursements, back-office commandes | **toi** : compte Stripe + clés + transporteur + domaine email | BUY-01/OPS-01, J1/J2, EC-011→017 |
| **D. Essayage fournisseur** | Contrat virtual try-on, jobs async + quotas/coûts, purge, mineurs | **toi** : fournisseur + budget/génération | AI-001→009, J3 |
| **E. Club + fidélité + parrainage** | Plans Signature/Prestige, Stripe Billing, ledger points idempotent, parrainage anti-fraude, box | **toi** : offres/marges validées + Stripe | CL/FL/RF, J5 |
| **F. Communauté/UGC** | Galerie, défi, modération, signalements, retraits | **moi** (sur base Auth+B) + **toi** : règles modération | UG, J6 |
| **G. Durcissement** | Tests (vitest + e2E J1-J4), SEO (sitemap/robots/JSON-LD), headers sécu, Sentry, RUM vitals, accessibilité clavier | **moi seul** | §14/§15, checklists P0/P1 |
| **H. P3** | Avatar/AR/scan | backlog, après usage réel | AV |

## Ordre d'exécution
A → G (socle testable) → B → C → D → E → F (GO entre C et D selon D-10) → H.
**Je fais seul** : A, G, F, B (code + SQL à valider). **Toi** : clés Stripe/transport/email (C), contrat IA (D), validation offres/marges (E), contenus légaux définitifs (avocat).

## GO lancement = checklists §15.2/§15.3 signées + monitoring + rollback. Rien de fictif en prod (§20.8).
