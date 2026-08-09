-- Le risposte dell'utente sui voli CANCELLATI.
--
-- L'articolo 5 del CE 261/2004 lega la compensazione a due fatti che
-- nessun archivio di volo conosce: quanti giorni prima la compagnia ha
-- avvisato, e com'è andata con il volo alternativo. Le chiediamo, e le
-- scriviamo qui: se un domani la compagnia contesta, deve esistere la
-- prova di cosa ha dichiarato il passeggero e quando.
--
-- Sono a scelta chiusa, mai testo libero: il motore deve poterle leggere
-- come dati, non come frasi.

alter table public.verifiche
  add column if not exists cancellato_preavviso   text,
  add column if not exists cancellato_alternativa text,
  add column if not exists cancellato_risposto_il timestamptz;

alter table public.verifiche
  drop constraint if exists verifiche_cancellato_preavviso_ck;
alter table public.verifiche
  add constraint verifiche_cancellato_preavviso_ck
  check (cancellato_preavviso is null
         or cancellato_preavviso in ('oltre14','fra7e13','meno7','nessuno','nonRicordo'));

alter table public.verifiche
  drop constraint if exists verifiche_cancellato_alternativa_ck;
alter table public.verifiche
  add constraint verifiche_cancellato_alternativa_ck
  check (cancellato_alternativa is null
         or cancellato_alternativa in ('nessuna','entro2','fra2e4','oltre4','nonRicordo'));

comment on column public.verifiche.cancellato_preavviso is
  'Quanti giorni prima la compagnia ha avvisato della cancellazione, dichiarato dall''utente (art. 5 CE 261/2004).';
comment on column public.verifiche.cancellato_alternativa is
  'Quanto dopo il previsto è arrivato con il volo alternativo, dichiarato dall''utente.';
