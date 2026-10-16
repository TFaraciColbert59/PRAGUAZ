-- Schéma Supabase pour la boutique Maje (maquette).
-- À exécuter dans l'éditeur SQL du dashboard Supabase.

-- Inscriptions newsletter (footer)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  consentement_cookies text not null default 'inconnu'
);
alter table public.newsletter_subscribers enable row level security;
create policy "insertion publique newsletter"
  on public.newsletter_subscribers for insert to anon with check (true);

-- Commandes (tunnel mock -> à brancher sur PSP réel plus tard)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  email text not null,
  prenom text not null default '',
  nom text not null default '',
  telephone text not null default '',
  adresse text not null default '',
  code_postal text not null default '',
  ville text not null default '',
  pays text not null default 'France',
  sous_total numeric not null default 0,
  total numeric not null default 0,
  statut text not null default 'simulee',
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "insertion publique commandes"
  on public.orders for insert to anon with check (true);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  product_name text not null default '',
  size text not null default '',
  qty integer not null default 1,
  unit_price numeric not null default 0
);
alter table public.order_items enable row level security;
create policy "insertion publique lignes"
  on public.order_items for insert to anon with check (true);
