-- Abonnements par clé d'activation (3, 6 ou 12 mois).
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
-- Seul le serveur LandPro (clé service) lit et écrit cette table.

create table if not exists public.license_keys (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,          -- empreinte HMAC de la clé, jamais la clé elle-même
  code_hint text not null,                 -- 4 derniers caractères, pour la reconnaître
  duration_months integer not null check (duration_months in (3, 6, 12)),
  price_mad integer not null check (price_mad >= 0),
  status text not null default 'available' check (status in ('available', 'used', 'revoked')),
  note text,                               -- ex. nom du client, référence du virement
  created_by uuid,
  created_at timestamptz not null default now(),
  used_by_workspace uuid,
  used_by_user uuid,
  used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists license_keys_status_idx on public.license_keys (status, created_at desc);
create index if not exists license_keys_workspace_idx on public.license_keys (used_by_workspace);

-- Aucune lecture possible avec la clé publique (anon) ou un jeton utilisateur
alter table public.license_keys enable row level security;
revoke all on public.license_keys from anon, authenticated;

-- Dates de période sur les abonnements (déjà présentes normalement ; sans effet sinon)
alter table public.workspace_subscriptions add column if not exists current_period_start timestamptz;
alter table public.workspace_subscriptions add column if not exists current_period_end timestamptz;
