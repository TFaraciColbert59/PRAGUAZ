-- Migration : communauté UGC (préparatoire, NON bloquante).
-- Statut : inactif en production tant que le stockage (buckets) et l'auth
-- ne sont pas branchés sur ces tables.
--
-- ACTIF QUAND :
--   1. un bucket Supabase Storage (ex. `ugc-photos`) est créé pour `image_url` ;
--   2. l'authentification est branchée (policies ci-dessous via `auth.uid()`) ;
--   3. cette migration est exécutée dans l'éditeur SQL Supabase.
-- En attendant, la communauté fonctionne en local-first (localStorage :
-- `pg-ugc-posts`, `pg-ugc-reports`), étiqueté honnêtement dans l'UI.

-- Soumissions clientes : photo, légende, pièces liées, statut de modération.
create table if not exists public.ugc_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  image_url text,
  caption text not null check (char_length(caption) <= 280),
  product_ids text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Preuves de consentement d'affichage (et retraits).
create table if not exists public.ugc_consents (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.ugc_posts (id) on delete cascade,
  scope text not null default 'display'
    check (scope in ('display', 'withdrawn')),
  created_at timestamptz not null default now()
);

-- Journal des décisions de modération.
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.ugc_posts (id) on delete cascade,
  action text not null check (action in ('approved', 'rejected')),
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists ugc_posts_status_idx on public.ugc_posts (status);
create index if not exists ugc_posts_user_id_idx on public.ugc_posts (user_id);
create index if not exists ugc_consents_post_id_idx on public.ugc_consents (post_id);
create index if not exists moderation_actions_post_id_idx on public.moderation_actions (post_id);

alter table public.ugc_posts enable row level security;
alter table public.ugc_consents enable row level security;
alter table public.moderation_actions enable row level security;

-- Lecture publique des seuls looks approuvés.
drop policy if exists "lecture publique des looks approuvés" on public.ugc_posts;
create policy "lecture publique des looks approuvés"
  on public.ugc_posts for select to anon, authenticated
  using (status = 'approved');

-- Écriture réservée à la propriétaire connectée.
drop policy if exists "la propriétaire gère ses looks" on public.ugc_posts;
create policy "la propriétaire gère ses looks"
  on public.ugc_posts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Consentements : lecture publique des consentements d'affichage, écriture propriétaire.
drop policy if exists "lecture publique des consentements" on public.ugc_consents;
create policy "lecture publique des consentements"
  on public.ugc_consents for select to anon, authenticated
  using (scope = 'display');

drop policy if exists "la propriétaire gère ses consentements" on public.ugc_consents;
create policy "la propriétaire gère ses consentements"
  on public.ugc_consents for all to authenticated
  using (
    exists (
      select 1 from public.ugc_posts p
      where p.id = ugc_consents.post_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.ugc_posts p
      where p.id = ugc_consents.post_id and p.user_id = (select auth.uid())
    )
  );

-- Journal de modération : lecture connectée, écriture service (pas de policy insert publique).
drop policy if exists "lecture connectée du journal" on public.moderation_actions;
create policy "lecture connectée du journal"
  on public.moderation_actions for select to authenticated
  using (true);
