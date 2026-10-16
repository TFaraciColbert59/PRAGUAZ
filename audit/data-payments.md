# AUD-01 — Données & paiements (L0)

## Source de vérité actuelle
- Produits : extraction ponctuelle SFCC 2026-10-16 (`src/lib/maje/catalog.ts`, 54 + 6, prix TTC affichés). **Pas** de SKU/TVA/coût/stock (EC-002/EC-003 manquants) — achat de variante épuisée **techniquement possible** (bloqueur CAT-01).
- Commandes : `orders`/`order_items` Supabase (statut `simulee`), ID client-side, insert minimal (pas de `returning`, pas de lecture publique). Commande test MJ-50436629 vérifiée.
- Newsletter : `newsletter_subscribers`, double opt-in **absent** (EC-026 à décider), désinscription 1-clic **absente**.

## Paiements : SIMULÉ (EC-011/EC-013/EC-014 non satisfaits)
- Aucun PSP, aucun webhook, aucune réservation de stock, totaux calculés **côté navigateur**.
- Recette P0 exige : PSP + webhooks signés idempotents + stock transactionnel + emails. Décision D-04 bloquante.

## À construire (L1/L2)
Tables §11.2 manquantes : `products`, `product_variants`, `inventory`, `carts`, `payments`, `shipments`, `returns`, `refunds`, `coupons`, `users/profiles`, `consents`, `audit_logs`, `webhook_events`, `feature_flags` (+ P1/P2 : tryon, wardrobe, club, loyalty, ugc).
Contrats API §11.3 : aucun endpoint `/api/*` n'existe.
