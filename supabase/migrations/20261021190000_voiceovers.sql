-- Voix off darija : historique des voix off générées par compte.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
create table if not exists public.voiceovers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  product_id uuid,
  title text,
  script text not null,          -- texte écrit (affiché, modifiable)
  tts_text text not null,        -- texte lu par la voix (chiffres et mots latins réécrits)
  voice text not null,
  provider text not null,
  speed numeric(3, 2) not null default 1,
  audio_url text not null,
  seconds numeric(6, 1),
  created_at timestamptz not null default now()
);
create index if not exists voiceovers_ws_idx on public.voiceovers (workspace_id, created_at desc);
alter table public.voiceovers enable row level security;  -- lu et écrit seulement par le serveur

notify pgrst, 'reload schema';
