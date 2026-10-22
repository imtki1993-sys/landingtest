-- Voix off darija : versions, régénération d'une phrase, WAV, réglages, presets.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
alter table public.voiceovers
  add column if not exists parent_id uuid,           -- version précédente (phrase régénérée)
  add column if not exists preset text,              -- style de pub choisi
  add column if not exists exact boolean not null default false,  -- texte lu tel quel
  add column if not exists settings jsonb not null default '{}'::jsonb,  -- pauses, durée visée…
  add column if not exists sentences jsonb,          -- phrases lues, dans l'ordre
  add column if not exists gaps jsonb,               -- silence après chaque phrase
  add column if not exists bounds jsonb,             -- fin de chaque phrase dans segments_path
  add column if not exists wav_path text,            -- même rendu en WAV
  add column if not exists segments_path text,       -- phrases brutes (pour en régénérer une)
  add column if not exists quality jsonb;            -- saturation, silences, durée
create index if not exists voiceovers_parent_idx on public.voiceovers (parent_id);

notify pgrst, 'reload schema';
