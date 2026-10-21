-- Voix off darija : dictionnaire de prononciation de chaque compte (mot écrit → comment le dire).
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
create table if not exists public.voiceover_lexicon (
  workspace_id uuid primary key,
  words jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.voiceover_lexicon enable row level security;  -- lu et écrit seulement par le serveur

notify pgrst, 'reload schema';
