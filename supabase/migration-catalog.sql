-- Migration catalogue (Lot B) — boutique PRAGUAZ (maquette).
-- À exécuter dans l'éditeur SQL du dashboard Supabase, APRÈS supabase/schema.sql.
-- Idempotente : ré-exécutable sans doublons (IF NOT EXISTS + ON CONFLICT DO NOTHING).
-- Ne touche PAS aux tables/politiques existantes (orders, order_items, newsletter_subscribers).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- produits
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer null check (compare_at_cents is null or compare_at_cents >= 0),
  currency text not null default 'EUR',
  category text not null default '',
  colors text[] not null default '{}',
  materials text[] not null default '{}',
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx
  on public.products (category) where active = true;

-- --------------------------------------------------------------- variantes
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text not null default '',
  color text not null default '',
  stock integer not null default 0 check (stock >= 0),
  price_cents integer null check (price_cents is null or price_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

-- ------------------------------------------------------ mouvements de stock
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  qty integer not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_variant_id_idx
  on public.inventory_movements (variant_id);

-- ----------------------------------------------------------------- coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent integer not null check (percent >= 0 and percent <= 100),
  quota integer null check (quota is null or quota >= 0),
  used integer not null default 0 check (used >= 0),
  min_total_cents integer not null default 0 check (min_total_cents >= 0),
  starts_at timestamptz null,
  ends_at timestamptz null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------- RLS
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.coupons enable row level security;

-- Lecture publique du catalogue actif uniquement.
drop policy if exists "lecture publique catalogue" on public.products;
create policy "lecture publique catalogue"
  on public.products for select to anon, authenticated
  using (active = true);

-- Lecture publique des variantes des produits actifs uniquement.
drop policy if exists "lecture publique variantes" on public.product_variants;
create policy "lecture publique variantes"
  on public.product_variants for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.active = true
    )
  );

-- Lecture publique des coupons actifs (validation côté client).
-- Aucune politique d'écriture : seul le rôle service peut créer/consommer.
drop policy if exists "lecture publique coupons" on public.coupons;
create policy "lecture publique coupons"
  on public.coupons for select to anon, authenticated
  using (active = true);

-- inventory_movements : aucune politique publique (réservé au rôle service).
-- orders / order_items : politiques d'insertion existantes conservées telles quelles.

-- -------------------------------------------------------------------- seed
-- 3 produits d'exemple neutres PRAGUAZ (aucune marque tierce).
insert into public.products
  (slug, name, description, price_cents, compare_at_cents, currency, category, colors, materials, images, active)
values
  (
    'praguaz-robe-midi-lin',
    'Robe midi en lin mélangé',
    'Robe midi fluide en lin mélangé, dos nu, finitions couture française.',
    18900, null, 'EUR', 'robes',
    array['Terracotta', 'Ivoire'],
    array['Lin', 'Viscose'],
    array['/sites/praguaz/robe-midi-lin.jpg'],
    true
  ),
  (
    'praguaz-manteau-mi-long-laine',
    'Manteau mi-long en laine mélangée',
    'Manteau mi-long en laine mélangée, col tailleur, doublure satinée.',
    34900, 49900, 'EUR', 'manteaux',
    array['Camel', 'Noir'],
    array['Laine', 'Polyester'],
    array['/sites/praguaz/manteau-mi-long-laine.jpg'],
    true
  ),
  (
    'praguaz-cabas-cuir-graine',
    'Cabas en cuir grainé',
    'Cabas en cuir grainé, doublure textile, pochette intérieure zippée.',
    25900, null, 'EUR', 'sacs',
    array['Noir'],
    array['Cuir de vachette'],
    array['/sites/praguaz/cabas-cuir-graine.jpg'],
    true
  )
on conflict (slug) do nothing;

-- Variantes (tailles + stock de démonstration).
insert into public.product_variants (product_id, sku, size, color, stock)
select p.id, x.sku, x.size, x.color, x.stock
from public.products p
cross join (values
  ('PRAG-ROBE-XS', 'XS', 'Terracotta', 12),
  ('PRAG-ROBE-S', 'S', 'Terracotta', 12),
  ('PRAG-ROBE-M', 'M', 'Terracotta', 12),
  ('PRAG-ROBE-L', 'L', 'Terracotta', 12),
  ('PRAG-ROBE-XL', 'XL', 'Terracotta', 12)
) as x (sku, size, color, stock)
where p.slug = 'praguaz-robe-midi-lin'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, sku, size, color, stock)
select p.id, x.sku, x.size, x.color, x.stock
from public.products p
cross join (values
  ('PRAG-MANT-XS', 'XS', 'Camel', 8),
  ('PRAG-MANT-S', 'S', 'Camel', 8),
  ('PRAG-MANT-M', 'M', 'Camel', 8),
  ('PRAG-MANT-L', 'L', 'Camel', 8),
  ('PRAG-MANT-XL', 'XL', 'Camel', 8)
) as x (sku, size, color, stock)
where p.slug = 'praguaz-manteau-mi-long-laine'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, sku, size, color, stock)
select p.id, x.sku, x.size, x.color, x.stock
from public.products p
cross join (values
  ('PRAG-CAB-TU', 'TU', 'Noir', 20)
) as x (sku, size, color, stock)
where p.slug = 'praguaz-cabas-cuir-graine'
on conflict (sku) do nothing;

-- Coupons de démonstration (miroir des codes secours applicatifs).
insert into public.coupons (code, percent, quota, used, min_total_cents, active)
values
  ('BIENVENUE10', 10, null, 0, 0, true),
  ('PREMIERES50', 20, 500, 0, 0, true)
on conflict (code) do nothing;
