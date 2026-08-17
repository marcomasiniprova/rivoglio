-- IL CREDITO DELLA GARANZIA (Valerio, 17/08).
--
-- La garanzia non rimborsa più in CONTANTI: quando la compagnia rifiuta
-- senza un motivo valido (o non risponde nei termini) e l'utente ha già
-- combattuto con la replica, Rivolio gli regala la PROSSIMA PRATICA. Così
-- il cliente è tutelato davvero, ma non esce cassa: il credito costa quasi
-- zero e non manda mai in perdita, nemmeno pagando i creator in anticipo.
--
-- Ogni credito è una riga: nasce quando la garanzia scatta, porta il TIPO
-- della pratica fallita (una famiglia fallita vale una famiglia gratis, una
-- singola una singola), e si spegne quando l'utente lo usa per aprire una
-- pratica nuova senza pagare. Non scade.
--
-- Idempotente: si può rilanciare. Non tocca nessun dato esistente.

create table if not exists public.crediti_pratica (
  id uuid primary key default gen_random_uuid(),
  -- Di chi è il credito. on delete cascade: se sparisce l'account, spariscono
  -- i suoi crediti (non hanno senso senza di lui).
  utente_id uuid not null references auth.users (id) on delete cascade,
  -- Il valore del credito, dal tipo della pratica che l'ha generato: una
  -- 'famiglia' copre una famiglia (o una singola), una 'singola' una singola.
  tipo text not null check (tipo in ('singola', 'famiglia')),
  -- La pratica fallita che l'ha fatto nascere (la garanzia scattata lì).
  pratica_origine uuid references public.pratiche (id) on delete set null,
  -- null = ancora libero. Quando si usa, qui va l'istante: è il registro che
  -- rende il credito usa e getta, come per i buoni analisi.
  usato_il timestamptz,
  -- La pratica nuova aperta col credito: serve a ritrovarlo e a non usarlo due volte.
  pratica_usata uuid references public.pratiche (id) on delete set null,
  creato_il timestamptz not null default now()
);

-- I crediti liberi di un utente, per il lato "hai una pratica gratis": si
-- leggono spesso (a ogni verdetto idoneo di chi è loggato).
create index if not exists crediti_pratica_utente_liberi
  on public.crediti_pratica (utente_id)
  where usato_il is null;

-- Un credito nasce UNA volta sola per pratica fallita: se la rotta esito
-- ritenta (doppio clic, webhook doppio), non ne nascono due.
create unique index if not exists crediti_pratica_una_origine
  on public.crediti_pratica (pratica_origine)
  where pratica_origine is not null;

alter table public.crediti_pratica enable row level security;
-- Nessuna policy: la legge e scrive SOLO il server con la chiave di servizio,
-- come eventi, iscritti, recensioni e buoni. Il browser non la tocca mai.
