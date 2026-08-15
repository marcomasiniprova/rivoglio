-- LA CODA DEGLI INCERTI DA RICONTROLLARE (Valerio, 15/08).
--
-- Quando un check esce "incerto" perché il dato non è ancora arrivato (un
-- volo di ieri: l'orario certificato consolida entro un giorno) o perché
-- eravamo in piena (fornitore al limite), l'utente lascia l'email e questa
-- coda lo ricontrolla per lui. È la promessa "se ci lasci l'email ti
-- avvisiamo noi" che il testo del verdetto incerto fa già.
--
-- Non serve una tabella nuova: l'email è già agganciata alla riga di
-- `verifiche` (la lascia il verdetto incerto). Bastano due date per sapere
-- a che punto è la riga nella coda.
--
-- Idempotente: si può rilanciare. Non tocca nessun dato esistente.

alter table public.verifiche add column if not exists coda_avvisata_il timestamptz;
alter table public.verifiche add column if not exists coda_chiusa_il timestamptz;

-- Il cron cerca SOLO gli incerti con email ancora aperti: un indice
-- parziale tiene la ricerca veloce anche con tante verifiche in archivio.
create index if not exists verifiche_coda_aperta
  on public.verifiche (creata_il)
  where esito = 'incerto'
    and email is not null
    and coda_avvisata_il is null
    and coda_chiusa_il is null;
