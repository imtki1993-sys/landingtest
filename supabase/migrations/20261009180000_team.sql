-- Équipe de confirmation : attribution des commandes aux agents et suivi des appels.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
alter table public.orders add column if not exists assigned_to uuid;
alter table public.orders add column if not exists assigned_at timestamptz;
create index if not exists orders_ws_assigned_idx on public.orders (workspace_id, assigned_to, created_at desc);

alter table public.leads add column if not exists call_attempts integer not null default 0;
alter table public.leads add column if not exists last_call_at timestamptz;
alter table public.leads add column if not exists callback_at timestamptz;

-- Un même utilisateur ne peut être membre qu'une fois d'un workspace (nécessaire à l'ajout d'agents)
create unique index if not exists workspace_members_ws_user_uidx on public.workspace_members (workspace_id, user_id);

-- Autorise la valeur « agent » dans workspace_members.role (type énuméré ou contrainte CHECK)
do $$
declare
  t text;
  c record;
begin
  select udt_name into t from information_schema.columns
   where table_schema = 'public' and table_name = 'workspace_members' and column_name = 'role' and data_type = 'USER-DEFINED';
  if t is not null then
    execute format('alter type public.%I add value if not exists %L', t, 'agent');
  end if;
  for c in
    select conname, pg_get_constraintdef(oid) as def from pg_constraint
     where conrelid = 'public.workspace_members'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%role%' and pg_get_constraintdef(oid) not ilike '%agent%'
  loop
    execute format('alter table public.workspace_members drop constraint %I', c.conname);
  end loop;
end $$;

notify pgrst, 'reload schema';
