-- ═══════════════════════════════════════════════════════════════════════
--  TUTTO QUELLO CHE MANCA AL SUPABASE VERO, IN UN FILE SOLO.
--  Aggiornato al 9/08 (giro #44).
-- ═══════════════════════════════════════════════════════════════════════
--
--  COME SI USA (2 minuti):
--  1. apri https://supabase.com/dashboard e scegli il progetto di Rivolio;
--  2. nel menu di sinistra clicca "SQL Editor", poi "New query";
--  3. incolla TUTTO questo file e premi "Run" (in basso a destra).
--
--  SI PUÒ LANCIARE PIÙ VOLTE SENZA FARE DANNI. Ogni riga dice "aggiungi
--  solo se non c'è già": se ne hai già applicata una parte, quella parte
--  viene saltata. Non cancella niente e non tocca nessun dato.
--
--  Alla fine deve comparire "Success. No rows returned": è la risposta
--  giusta, vuol dire che ha eseguito tutto e non c'era niente da mostrare.
--
--  Dentro ci sono cinque cose, in ordine di data:
--   1. doppio opt-in dell'Osservatorio        (11/08)
--   2. risposte sui voli cancellati           (12/08)
--   3. negato imbarco e coincidenza persa     (13/08)
--   4. paese degli scali + compagnia operativa dichiarata  (14/08)
--   5. il no della compagnia, per il dopo-lettera           (15/08)
--
--  ⚠️ Le prime quattro Valerio le ha già eseguite il 10/08: rilanciarle
--  non fa niente. La quinta è nuova.
-- ═══════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────
-- 1. DOPPIO OPT-IN SULL'OSSERVATORIO
-- ─────────────────────────────────────────────────────────────────────
-- Chi scrive l'email sul sito viene salvato subito, ma NON è iscritto
-- finché non clicca il link che gli arriva in posta. Serve a due cose:
-- 1. nessuno può iscrivere l'indirizzo di qualcun altro;
-- 2. gli indirizzi falsi non rimbalzano, e la reputazione del dominio
--    resta pulita (cioè: le email arrivano in posta e non in spam).
--
-- `disdetto_il` è l'altra faccia: il link "non voglio più queste email"
-- non cancella la riga, la marca. Cancellarla vorrebbe dire perdere la
-- prova del consenso e riscrivere alla stessa persona il mese dopo.

alter table public.iscritti
  add column if not exists confermato_il timestamptz,
  add column if not exists disdetto_il  timestamptz;

create index if not exists iscritti_confermati_idx
  on public.iscritti (confermato_il)
  where confermato_il is not null and disdetto_il is null;

comment on column public.iscritti.confermato_il is
  'Quando ha cliccato il link di conferma. NULL = non iscritto: non mandargli la newsletter.';
comment on column public.iscritti.disdetto_il is
  'Quando ha chiesto di non ricevere più. Non si cancella la riga: serve come prova del consenso.';


-- ─────────────────────────────────────────────────────────────────────
-- 2. LE RISPOSTE SUI VOLI CANCELLATI
-- ─────────────────────────────────────────────────────────────────────
-- L'articolo 5 del CE 261/2004 lega la compensazione a due fatti che
-- nessun archivio di volo conosce: quanti giorni prima la compagnia ha
-- avvisato, e com'è andata con il volo alternativo. Le chiediamo, e le
-- scriviamo qui: se un domani la compagnia contesta, deve esistere la
-- prova di cosa ha dichiarato il passeggero e quando.

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


-- ─────────────────────────────────────────────────────────────────────
-- 3. NEGATO IMBARCO E COINCIDENZA PERSA
-- ─────────────────────────────────────────────────────────────────────
-- Sono i casi che gli archivi di volo non possono vedere: un aereo
-- partito in orario non dice niente su chi è rimasto al gate.

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


-- ─────────────────────────────────────────────────────────────────────
-- 4a. IL PAESE DEGLI SCALI ENTRA IN CACHE
-- ─────────────────────────────────────────────────────────────────────
-- Il cancello territoriale (art. 3 par. 1) decide se il Regolamento si
-- applica, e per farlo deve sapere in che paese sta lo scalo di partenza.
-- Il paese arriva insieme al volo dal fornitore, ma finora non veniva
-- salvato: il primo passeggero chiudeva il caso, il secondo ripartiva
-- senza il dato. È la stessa famiglia di problemi del volo FR4001.

alter table public.voli add column if not exists partenza_paese text;
alter table public.voli add column if not exists arrivo_paese   text;
alter table public.voli add column if not exists partenza_icao  text;
alter table public.voli add column if not exists arrivo_icao    text;

comment on column public.voli.partenza_paese is
  'Codice ISO-2 del paese dello scalo di partenza, come lo manda il fornitore. Serve al cancello territoriale.';
comment on column public.voli.arrivo_paese is
  'Codice ISO-2 del paese dello scalo di arrivo, come lo manda il fornitore.';
comment on column public.voli.partenza_icao is
  'Sigla ICAO dello scalo di partenza. Terza strada del cancello: il prefisso può solo aggiungere un sì, mai un no.';
comment on column public.voli.arrivo_icao is
  'Sigla ICAO dello scalo di arrivo.';

-- Le righe salvate prima del cancello territoriale (7-9 agosto) non hanno
-- gli scali: restano dove sono, ma il codice le scarta e richiede il volo
-- al fornitore (lib/voli/verifica.ts, `rigaUsabile`). Nessuna
-- cancellazione: il payload grezzo di quelle righe è una prova, e le
-- prove non si buttano.


-- ─────────────────────────────────────────────────────────────────────
-- 4b. LA COMPAGNIA CHE HA OPERATO, DICHIARATA DALL'UTENTE (codeshare)
-- ─────────────────────────────────────────────────────────────────────
-- Quando il fornitore non sa chi ha fatto volare l'aereo, lo chiediamo a
-- chi c'era: la sua risposta si scrive qui, con la data, perché se un
-- domani la compagnia contesta la dichiarazione deve esistere per iscritto.

alter table public.verifiche add column if not exists operativo_dichiarato    text;
alter table public.verifiche add column if not exists operativo_dichiarato_il timestamptz;

comment on column public.verifiche.operativo_dichiarato is
  'Codice IATA della compagnia che il passeggero dichiara abbia operato il volo (solo casi in codeshare non risolto).';


-- ─────────────────────────────────────────────────────────────────────
-- 5. IL NO DELLA COMPAGNIA (il dopo-lettera)
-- ─────────────────────────────────────────────────────────────────────
-- Il 52% dei reclami validi viene respinto alla prima risposta, e quasi
-- sempre è un no che non regge. La replica giusta però dipende da COSA
-- hanno risposto: a un guasto tecnico si ribatte in un modo, a uno
-- sciopero del personale in un altro. Il motivo si chiede a scelta chiusa
-- e si scrive qui, perché da questo campo esce il paragrafo centrale del
-- sollecito.

alter table public.pratiche add column if not exists rifiuto_motivo text;
alter table public.pratiche add column if not exists rifiuto_il     timestamptz;

alter table public.pratiche drop constraint if exists pratiche_rifiuto_motivo_ck;
alter table public.pratiche add constraint pratiche_rifiuto_motivo_ck
  check (rifiuto_motivo is null or rifiuto_motivo in (
    'eccezionale_generico','meteo','guasto_tecnico','sciopero_compagnia',
    'sciopero_esterno','ritardo_contestato','gia_risarcito','silenzio'));

comment on column public.pratiche.rifiuto_motivo is
  'Il motivo del diniego della compagnia, dichiarato dal cliente a scelta chiusa. Decide la replica nel sollecito (lib/pratiche/rifiuto.ts).';
comment on column public.pratiche.rifiuto_il is
  'Quando il cliente ha dichiarato il diniego. Serve anche come prova dei tempi davanti all''ente nazionale.';


-- ═══════════════════════════════════════════════════════════════════════
--  CONTROLLO FINALE: togli le due barrette qui sotto e rilancia solo
--  questa parte per vedere l'elenco delle colonne nuove. Devono essere 15.
-- ═══════════════════════════════════════════════════════════════════════
-- select table_name, column_name
--   from information_schema.columns
--  where table_schema = 'public'
--    and (table_name, column_name) in (
--      ('iscritti','confermato_il'), ('iscritti','disdetto_il'),
--      ('verifiche','cancellato_preavviso'), ('verifiche','cancellato_alternativa'),
--      ('verifiche','cancellato_risposto_il'), ('verifiche','caso_dichiarato'),
--      ('verifiche','dichiarazione'), ('verifiche','dichiarato_il'),
--      ('verifiche','operativo_dichiarato'), ('verifiche','operativo_dichiarato_il'),
--      ('voli','partenza_paese'), ('voli','arrivo_paese'), ('voli','partenza_icao'),
--      ('pratiche','rifiuto_motivo'), ('pratiche','rifiuto_il'))
--  order by table_name, column_name;


-- ═══════════════════════════════════════════════════════════════════════
-- 6. IL REGISTRO DELLE ANALISI PAGATE  (11/08, giro #54)
-- ═══════════════════════════════════════════════════════════════════════
-- PERCHÉ SERVE, in una riga: senza questa colonna chi paga 1,99 può
-- copiarsi il cookie della ricevuta e riusarlo all'infinito.
--
-- La ricevuta è firmata da noi, quindi dimostra CHE HAI PAGATO. Ma dice
-- anche QUANTO TI RESTA, e quel pezzo sta nel browser dell'utente: basta
-- rimettere a mano il valore di prima per tornare ad avere il credito
-- pieno. Provato l'11/08 attaccando il muro: seconda analisi con la
-- stessa ricevuta già consumata, e passava.
--
-- Un conto lo tiene chi non lo può cambiare. Da qui in avanti ogni
-- analisi consumata scrive il proprio ordine qui sopra, e il cancello
-- conta le righe invece di fidarsi del cookie.
--
-- ⚠️ Finché questa colonna non c'è, il muro funziona lo stesso ma torna
-- a fidarsi del cookie: si può riusare la ricevuta. Con la cassa vera
-- accesa, questo punto va eseguito PRIMA.
alter table public.verifiche
  add column if not exists ordine_check text;

-- L'indice serve al conteggio che gira a ogni analisi di chi ha pagato:
-- senza, con la tabella grande diventa una scansione completa.
create index if not exists verifiche_ordine_check_idx
  on public.verifiche (ordine_check)
  where ordine_check is not null;

-- Controllo: deve rispondere una riga.
select column_name
from information_schema.columns
where table_name = 'verifiche' and column_name = 'ordine_check';
