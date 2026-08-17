-- OTTIMIZZAZIONI DB (17/08) — dal performance advisor di Supabase.
-- Tutte reversibili. NON tocca le tabelle viaggi (invii, ricerche, transazioni,
-- strutture): sono eredità morta, si lasciano stare.
--
-- Tre cose:
--  1) indici di copertura sulle chiavi esterne delle tabelle ATTIVE (una JOIN
--     o una cancellazione a cascata senza indice scandisce tutta la tabella);
--  2) via l'indice DOPPIONE su eventi (due indici identici = spreco in scrittura);
--  3) le regole RLS chiamano auth.uid() DENTRO (select ...): così Postgres la
--     valuta UNA volta per query invece di una volta per riga. Stessa logica,
--     stesso risultato, solo più svelto quando le righe crescono.

-- 1) Indici di copertura (tabelle attive)
create index if not exists buoni_analisi_utente_id_idx on public.buoni_analisi (utente_id);
create index if not exists crediti_pratica_pratica_usata_idx on public.crediti_pratica (pratica_usata);
create index if not exists pratiche_volo_id_idx on public.pratiche (volo_id);
create index if not exists recensioni_utente_id_idx on public.recensioni (utente_id);
create index if not exists verifiche_utente_id_idx on public.verifiche (utente_id);
create index if not exists verifiche_volo_id_idx on public.verifiche (volo_id);

-- 2) Indice doppione su eventi (resta eventi_creato_il)
drop index if exists public.eventi_creato_il_idx;

-- 3) RLS: auth.uid() dentro (select ...) — stessa logica, valutata una volta
alter policy "pratiche: le mie" on public.pratiche
  using ((select auth.uid()) = utente_id);

alter policy "eventi: delle mie pratiche" on public.pratiche_eventi
  using (exists (
    select 1 from public.pratiche p
    where p.id = pratiche_eventi.pratica_id and p.utente_id = (select auth.uid())
  ));

alter policy "vedo solo il mio profilo" on public.profili
  using ((select auth.uid()) = id);

alter policy "modifico solo il mio profilo" on public.profili
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "verifiche: le mie" on public.verifiche
  using ((select auth.uid()) = utente_id);

alter policy "voli_seguiti_propri" on public.voli_seguiti
  using ((select auth.uid()) = utente_id)
  with check ((select auth.uid()) = utente_id);
