# Maje — Revalidation serveur du panier + coupons (anti-triche)

Le navigateur n'envoie jamais de total. Les prix et les coupons sont recalculés
côté serveur avant tout paiement / toute confirmation.

## Fichiers (scope exclusif de ce lot)

- `src/lib/maje/pricing.ts` — pur, testable, TS strict (centimes entiers).
- `src/app/api/checkout/validate/route.ts` — `POST`, recalcul complet.
- `src/app/api/coupons/validate/route.ts` — `POST`, vérification d'un code.
- `src/app/fr/panier/page.tsx` — champ coupon optionnel (`maje-coupon`).
- `src/app/fr/commande/paiement/page.tsx` — revalidation bloquante avant confirmation.

## Contrats

### `pricing.ts`

```ts
parseEurToCents(fr: string): number            // "272,50 €" -> 27250
formatCentsToEur(cents: number): string       // 27250 -> "272,50 €"
applyPercent(totalCents, percent): { total, discount }
computeTotals(lines: { unitCents, qty }[], percent?): { subtotal, discount, total }
```

### Couche `catalog-db` (autre lot, fourni)

Signatures réelles dans `src/lib/maje/catalog-db.ts` (les routes les importent) :

```ts
getDbCatalog(): Promise<DbProduct[]>  // DbProduct { id, slug, name, priceCents, variants… }
checkAvailability(items: AvailabilityItem[]): Promise<AvailabilityCheck>
// AvailabilityItem = { id, size, qty }, AvailabilityCheck = { ok, problems: string[] }
validateCoupon(code, totalCents): Promise<CouponValidation>
// CouponValidation = { ok, percent, reason }
```

Produits actifs + variantes depuis Supabase, sinon catalogue local (54 + 6 base).
Coupons secours : `BIENVENUE10` (−10 %), `PREMIERES50` (−20 %).

### `POST /api/checkout/validate`

Requête : `{ items: [{ id, size, qty }], coupon? }` — aucun total lu.
Réponse :

```json
{
  "ok": true,
  "lines": [{ "id": "...", "size": "T1", "qty": 1, "unitCents": 27250, "name": "..." }],
  "subtotalCents": 27250,
  "discountCents": 2725,
  "totalCents": 24525,
  "problems": []
}
```

`ok === (problems.length === 0)`. Chaque ligne est re-tarifée depuis
`getDbCatalog` + contrôlée par `checkAvailability` ; le coupon éventuel est
revalidé par `validateCoupon` (coupon invalide ⇒ problème ⇒ refus).

### `POST /api/coupons/validate`

Requête : `{ code, totalCents }`.
Réponse : `{ ok, percent, reason }`.

## Flux

1. Panier : champ coupon optionnel → vérifié via `/api/coupons/validate`,
   stocké en `localStorage["maje-coupon"]`, remise appliquée au récap
   (indicative : seul le serveur fait foi).
2. Paiement : au montage, récap affiché depuis `/api/checkout/validate`
   (total « vérifié »). À la soumission, revalidation fraîche ; si `problems`
   non vides (ou fetch en échec) → erreur affichée, **pas de confirmation**
   (fail closed). Sinon la commande (`maje-order`, Supabase) utilise
   `totalCents / 100` du serveur, jamais le total navigateur.
3. Le flux reste un mock labellisé (« Paiement simulé », « Commande simulée »).

## Recette

- `npx tsc --noEmit` : sans erreur.
- Panier → saisir `BIENVENUE10` → « Appliquer » → remise −10 % au récap,
  coupon conservé après rechargement (retirer via « Retirer le coupon »).
- Code inconnu (`FAUX`) → `reason` affiché, rien n'est stocké.
- Paiement : le total du bouton/récap est le total serveur ; avec un coupon
  valide, la ligne « Coupon » (−X,XX €) apparaît.
- **Anti-triche console** : dans les DevTools, avant de payer,
  `localStorage.setItem("maje-coupon", "PREMIERES50")` puis payer → le serveur
  accepte le vrai −20 % (recalculé, pas injecté) ; puis tester
  `localStorage.setItem("maje-cart", '[{"id":"manteau-long-laine","size":"T1","qty":1}]')`
  avec un article modifié/supprimé du catalogue, ou écrire
  `maje-coupon` avec `TRICHE99` → `/api/checkout/validate` répond
  `ok: false` + `problems` non vides → l'erreur s'affiche et la confirmation
  est bloquée (aucune redirection).
- Échec réseau (offline) au paiement → « Impossible de vérifier le panier »,
  pas de confirmation.
