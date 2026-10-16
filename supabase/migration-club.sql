-- Migration : Club + fidélité + parrainage (simulation, local-first).
-- À exécuter dans l'éditeur SQL Supabase. Idempotente.
-- Les pages restent en simulation locale (localStorage) ; ces tables
-- servent uniquement à la persistance serveur optionnelle (jamais bloquante).

-- ============ club_plans ============
create table if not exists public.club_plans (
  code text primary key,
  name text not null,
  price_monthly_cents integer not null check (price_monthly_cents > 0),
  discount_percent integer not null check (discount_percent >= 0 and discount_percent <= 90),
  perks text[] not null default '{}'
);

alter table public.club_plans enable row level security;

-- Lecture publique (comparatif affiché sans compte).
drop policy if exists "lecture publique des plans" on public.club_plans;
create policy "lecture publique des plans"
  on public.club_plans for select to anon, authenticated
  using (true);

-- Pas de policy d'écriture : écriture via service_role uniquement.

-- ============ subscriptions ============
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  plan_code text not null references public.club_plans (code) on delete restrict,
  status text not null default 'active'
    check (status in ('trial', 'active', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_plan_code_idx on public.subscriptions (plan_code);

alter table public.subscriptions enable row level security;

drop policy if exists "abonnements lus par le propriétaire" on public.subscriptions;
create policy "abonnements lus par le propriétaire"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "abonnements créés par le propriétaire" on public.subscriptions;
create policy "abonnements créés par le propriétaire"
  on public.subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "abonnements modifiés par le propriétaire" on public.subscriptions;
create policy "abonnements modifiés par le propriétaire"
  on public.subscriptions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============ loyalty_transactions ============
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  points integer not null,
  kind text not null check (kind in ('earned', 'redeemed', 'reversed', 'expired')),
  reason text not null default '',
  ref text unique,
  created_at timestamptz not null default now()
);

create index if not exists loyalty_transactions_user_id_idx on public.loyalty_transactions (user_id);

alter table public.loyalty_transactions enable row level security;

drop policy if exists "points lus par le propriétaire" on public.loyalty_transactions;
create policy "points lus par le propriétaire"
  on public.loyalty_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

-- Insertion par le propriétaire ; l'anti-doublon est garanti par la contrainte unique sur ref.
drop policy if exists "points crédités par le propriétaire" on public.loyalty_transactions;
create policy "points crédités par le propriétaire"
  on public.loyalty_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ============ rewards ============
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  code text not null unique,
  percent integer not null check (percent > 0 and percent <= 50),
  used boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists rewards_user_id_idx on public.rewards (user_id);

alter table public.rewards enable row level security;

drop policy if exists "récompenses lues par le propriétaire" on public.rewards;
create policy "récompenses lues par le propriétaire"
  on public.rewards for select to authenticated
  using ((select auth.uid()) = user_id);

-- Création via service_role uniquement (conversion serveur) : pas de policy insert.

-- ============ referrals ============
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  parrain_code text not null unique,
  parrain_user_id uuid references auth.users (id) on delete set null,
  filleul_email text not null default '',
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'valide', 'rejete')),
  created_at timestamptz not null default now()
);

create index if not exists referrals_parrain_code_idx on public.referrals (parrain_code);
create index if not exists referrals_parrain_user_id_idx on public.referrals (parrain_user_id);

alter table public.referrals enable row level security;

-- Le parrain lit ses parrainages.
drop policy if exists "parrainages lus par le parrain" on public.referrals;
create policy "parrainages lus par le parrain"
  on public.referrals for select to authenticated
  using ((select auth.uid()) = parrain_user_id);

-- Un filleul (même anonyme) peut s'enregistrer avec un e-mail non vide.
drop policy if exists "inscription filleul anonyme" on public.referrals;
create policy "inscription filleul anonyme"
  on public.referrals for insert to anon, authenticated
  with check (filleul_email <> '' and filleul_email like '%@%');

-- ============ Seed : 2 plans ============
-- 999 cents = 9,99 €/mois (-10%), 2999 cents = 29,99 €/mois (-15%).
insert into public.club_plans (code, name, price_monthly_cents, discount_percent, perks)
values
  ('signature', 'Signature', 999, 10, array['-10% sur tout', 'Livraison offerte dès 150 €', 'Avant-premières privées']),
  ('prestige', 'Prestige', 2999, 15, array['-15% sur tout', 'Livraison offerte sans minimum', 'Conciergerie et retouches offertes'])
on conflict (code) do update set
  name = excluded.name,
  price_monthly_cents = excluded.price_monthly_cents,
  discount_percent = excluded.discount_percent,
  perks = excluded.perks;
