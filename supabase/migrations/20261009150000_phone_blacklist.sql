-- Liste noire de numéros de téléphone, par compte (workspace).
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
create table if not exists public.phone_blacklist (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  phone_e164 text not null,               -- format +212XXXXXXXXX, comme leads.phone_e164
  reason text,                            -- ex. « refuse les colis », « faux numéro »
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (workspace_id, phone_e164)
);
create index if not exists phone_blacklist_ws_idx on public.phone_blacklist (workspace_id, created_at desc);

-- Accès uniquement par le serveur LandPro (clé service)
alter table public.phone_blacklist enable row level security;
revoke all on public.phone_blacklist from anon, authenticated;
grant all on public.phone_blacklist to service_role;

-- Accélère la recherche des commandes d'un même client
create index if not exists leads_ws_phone_idx on public.leads (workspace_id, phone_e164);

notify pgrst, 'reload schema';
