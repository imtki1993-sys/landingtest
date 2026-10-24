-- Sourcing Derb Omar : nom du fournisseur affiché aux clients (choisi par l'administrateur).
-- Les clients ne voient jamais le nom du canal Telegram ; sans nom choisi, ils voient « Fournisseur N ».
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
alter table public.sourcing_channels add column if not exists display_name text;

notify pgrst, 'reload schema';
