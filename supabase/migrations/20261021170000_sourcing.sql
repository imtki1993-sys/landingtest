-- Sourcing Derb Omar : catalogue partagé des produits publiés dans des canaux Telegram publics
-- de fournisseurs de gros. Lu toutes les 30 min par /api/cron/sourcing-sync.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.

create table if not exists public.sourcing_channels (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,            -- nom public du canal (t.me/<username>)
  title text,
  photo_url text,
  description text,
  active boolean not null default true,
  last_post_id bigint,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.sourcing_posts (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.sourcing_channels (id) on delete cascade,
  post_id bigint not null,
  url text not null,
  posted_at timestamptz,
  text text,
  photos text[] not null default '{}',
  has_video boolean not null default false,
  -- fiche produit lue dans le message (regex, puis IA si une clé est configurée)
  is_product boolean not null default true,
  name text,
  category text,
  price numeric(12, 2),
  min_qty integer,
  phone text,
  extracted_by text not null default 'regex',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_id, post_id)
);
create index if not exists sourcing_posts_recent_idx on public.sourcing_posts (posted_at desc);
create index if not exists sourcing_posts_category_idx on public.sourcing_posts (category, posted_at desc);
create index if not exists sourcing_posts_pending_idx on public.sourcing_posts (extracted_by) where extracted_by = 'regex';

-- Lus et écrits seulement par le serveur (clé secrète)
alter table public.sourcing_channels enable row level security;
alter table public.sourcing_posts enable row level security;

notify pgrst, 'reload schema';
