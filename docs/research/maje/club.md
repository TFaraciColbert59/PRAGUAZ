# Club + fidélité + parrainage — simulation labellisée

## Pattern suivi
Même pattern que le checkout mock existant (`src/app/fr/commande/paiement/page.tsx`) :
- pages clientes `"use client"`, `MajeHeader` / `MajeFooter`, CSS `maje.css` + `commerce.css` ;
- bandeau `maje-co-mock` : « Simulation — sans facturation réelle » sur chaque page ;
- local-first (`localStorage`), Supabase optionnel en arrière-plan avec `Promise.race` / try/catch, jamais bloquant.

## Tables (supabase/migration-club.sql)
- `club_plans` (code PK `signature`/`prestige`, name, price_monthly_cents, discount_percent, perks text[]) — lecture publique, écriture service_role uniquement.
- `subscriptions` (id, user_id, plan_code → club_plans, status trial/active/past_due/canceled/expired, current_period_end) — RLS propriétaire authentifié (`auth.uid() = user_id`) en select/insert/update.
- `loyalty_transactions` (id, user_id, points int, kind earned/redeemed/reversed/expired, reason, ref unique anti-doublon) — RLS propriétaire en select/insert.
- `rewards` (id, user_id, code unique, percent, used, expires_at) — lecture propriétaire, création service_role.
- `referrals` (id, parrain_code unique, parrain_user_id, filleul_email, statut en_attente/valide/rejete) — lecture par le parrain, insert anon/authenticated avec check e-mail (`<> ''` + `%@%`).
- Seed : Signature 999 cents (9,99 €/mois, -10%), Prestige 2999 cents (29,99 €/mois, -15%).

## Lib (src/lib/maje/club.ts, pur + local-first)
- `CLUB_PLANS`, `LOYALTY_TIERS`, `SIMULATED_PURCHASE_POINTS = 10`.
- `applyClubDiscount(totalCents, plan|null)` → total remisé arrondi.
- `pointsForPurchase(totalCents)` → `floor(totalCents/1000)` (1 pt/10 € ; un achat simulé ≈ 100 € ≈ 10 pts).
- `tierForPoints(points)` → 50→-10%, 100→-15%, 200→-20% dès 80 €, 300→livraison offerte + -10% ; `nextTierForPoints`, `loyaltyBalanceFor(achats, bienvenue, convertis)`.
- `getOrCreateReferralCode()` (PGZ-XXXXXX en local), `referralLink(code)`, `referralCodes()` → { code, link }, `makeRewardCode()` (FID-XXXXXX).
- Clés locales : `pg-subscription`, `pg-purchases`, `pg-loyalty-welcome`, `pg-loyalty-redeemed`, `pg-loyalty-history`, `pg-rewards`, `pg-referral-code`, `pg-referrals-count`.
- Serveur optionnel (try/catch, jamais de throw) : `getLoyaltyBalance(userId)` → 0 si indisponible, `recordPurchasePoints(userId, points, reason, ref)` → false si indisponible.

## Pages
- `/club` : landing + comparatif + CTA vers /club/signature et /club/prestige.
- `/club/signature` : détail + souscrire → `pg-subscription` { active, +30 j } + 50 pts bienvenue → redirect /fr/compte/club.
- `/club/prestige` : idem avec 100 pts bienvenue.
- `/fr/compte/club` : statut, fin de période, résiliation → `canceled` (ou réactivation), liens fidélité.
- `/fr/compte/fidelite` : solde = bienvenue + 10 pts/achat simulé (`pg-purchases`) − convertis ; historique local (50 max) ; paliers ; conversion du palier atteint en code FID-XXXXXX (déduit le seuil, stocké dans `pg-rewards`).
- `/fr/compte/parrainage` : code perso `PGZ-<random>`, lien copiable (`/fr/compte/inscription?parrain=`), compteur filleuls simulé (`pg-referrals-count` + bouton +1), règles anti-abus affichées (1 e-mail = 1 parrainage, auto-parrainage interdit, révocation fraude, max 10/mois).

## Footer
`MajeFooter.tsx`, colonne « À propos » : ajout `{ Club, /club }` et `{ Fidélité, /fr/compte/fidelite }`, rien d'autre.

## Vérification
- `npx tsc --noEmit` : OK (aucun dev/build lancé, consigne respectée).
