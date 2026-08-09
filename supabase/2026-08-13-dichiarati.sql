-- Le dichiarazioni su NEGATO IMBARCO e COINCIDENZA PERSA.
--
-- Sono i casi che gli archivi di volo non possono vedere: un aereo
-- partito in orario non dice niente su chi è rimasto al gate. Il
-- passeggero dichiara a scelte chiuse, il motore decide, e qui resta
-- la prova di cosa è stato dichiarato e quando.

alter table public.verifiche
  add column if not exists caso_dichiarato text,
  add column if not exists dichiarazione   jsonb,
  add column if not exists dichiarato_il   timestamptz;

alter table public.verifiche
  drop constraint if exists verifiche_caso_dichiarato_ck;
alter table public.verifiche
  add constraint verifiche_caso_dichiarato_ck
  check (caso_dichiarato is null or caso_dichiarato in ('negato','coincidenza'));

comment on column public.verifiche.caso_dichiarato is
  'Caso CE 261 dichiarato dall''utente: negato imbarco o coincidenza persa.';
comment on column public.verifiche.dichiarazione is
  'Le risposte a scelte chiuse, come arrivate: sono la prova se la compagnia contesta.';
