# AUD-01 — Sécurité (L0)

## Contrôles exécutés
- `git check-ignore .env.local` → **ignoré** ✅. `.env.example` sans secret ✅.
- Secrets en dépôt : **aucun** (clés Supabase transmises par message, jamais commitées ; tokens GitHub en URL mémoire uniquement).
- Dépendances : `npm audit` → 16 vulnérabilités héritées du template (2 moderate, 12 high, 2 critical) — **non traitées**, à purger avant P0 (SEC-001).
- RLS : 3 tables `enable row level security` + policies insert anon uniquement ; **pas** de SELECT/UPDATE/DELETE publics ✅. Vues/fonctions `SECURITY DEFINER` : aucune.
- Uploads utilisateurs : aucun endpoint (surface nulle) ✅ — à cadrer pour essayage/UGC (AI-002, UG-004).
- Cartes bancaires : jamais stockées ; formulaires mock sans transmission ✅ (à remplacer par PSP, EC-011).
- En-têtes sécurité (CSP/HSTS), CSRF, rate-limit : **absents** (Next.js défaut) — à ajouter (SEC-001).
- `.playwright-mcp/` (captures) exclu du dépôt via `.gitignore` ✅.

## Exigences avant production
Auth (EC-023), rôles admin/support (rôles §3.1), journal d'audit, sauvegardes Supabase (PITR à activer), RGPD export/suppression (EC-024), mentions 16 ans+ (SEC-009).
