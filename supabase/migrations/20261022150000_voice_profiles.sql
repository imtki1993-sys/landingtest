-- Voix off darija : voix pub personnalisées (extrait de 4 à 12 s enregistré par le vendeur, avec consentement).
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  name text not null,
  gender text not null default 'm' check (gender in ('m', 'f')),
  ref_path text not null,          -- WAV 24 kHz dans le bucket privé « voiceovers »
  ref_text text not null,          -- texte exact lu dans l'extrait
  seconds numeric(4, 1),
  consent_at timestamptz not null, -- « c'est ma voix ou j'ai l'accord de la personne »
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists voice_profiles_ws_idx on public.voice_profiles (workspace_id, created_at desc);
alter table public.voice_profiles enable row level security;  -- lu et écrit seulement par le serveur

notify pgrst, 'reload schema';
