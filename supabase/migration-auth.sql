-- Migration : comptes (Lot A). À exécuter dans l'éditeur SQL Supabase.
-- Lie les commandes aux utilisatrices authentifiées, lecture strictement personnelle.

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);

-- Lecture de SES commandes par une utilisatrice connectée (rien d'autre).
drop policy if exists "lecture de ses commandes" on public.orders;
create policy "lecture de ses commandes"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id);
