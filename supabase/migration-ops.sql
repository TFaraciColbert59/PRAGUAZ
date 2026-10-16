-- Opérations paiement / expéditions / retours / remboursements.
-- À exécuter dans l'éditeur SQL Supabase APRÈS supabase/schema.sql.
--
-- RLS : AUCUNE policy publique en lecture sur ces tables.
--   - webhook_events : aucune policy publique du tout. Insertion et lecture
--     réservées au service_role (qui contourne RLS) depuis la route webhook
--     et le back-office /admin. Ne jamais créer de policy publique dessus.
--   - returns : seule une policy d'INSERT anonyme existe (dépôt d'une demande
--     depuis /fr/compte/retours). Lecture/modification via service_role uniquement.
--   - shipments, refunds : aucune policy publique, service_role uniquement.

-- Idempotence des webhooks (clé : provider + provider_event_id).
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  provider_event_id text not null unique,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security;

-- Suivi des expéditions (une ligne par colis).
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  order_numero text not null default '',
  transporteur text not null default '',
  tracking text not null default '',
  statut text not null default 'en_preparation',
  created_at timestamptz not null default now()
);
alter table public.shipments enable row level security;

-- Demandes de retour clients.
create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  order_numero text not null default '',
  motif text not null default '',
  statut text not null default 'demande',
  created_at timestamptz not null default now()
);
alter table public.returns enable row level security;
drop policy if exists "insertion publique retours" on public.returns;
create policy "insertion publique retours"
  on public.returns for insert to anon with check (true);

-- Remboursements (lignes créées par le back-office après action PSP réelle).
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  order_numero text not null default '',
  montant numeric not null default 0,
  statut text not null default 'demande',
  created_at timestamptz not null default now()
);
alter table public.refunds enable row level security;
