-- LE RECENSIONI E IL BUONO ANALISI GRATIS (Valerio, 15/08).
--
-- Dopo un evento vero (un check, un verdetto, una pratica) la persona può
-- lasciare stelle + motivo. Ogni recensione:
--  - nasce NASCOSTA (stato 'in_attesa'): la vede solo l'admin, e SOLO se
--    lui la approva compare in landing;
--  - sblocca UN'analisi gratis, e una sola, legata a QUELL'evento: lo
--    stesso evento non si recensisce due volte (indice unico), quindi non
--    si possono mungere analisi gratis a raffica.
--
-- Idempotente: si può rilanciare. Non tocca nessun dato esistente.

-- ── Le recensioni ────────────────────────────────────────────────────
create table if not exists public.recensioni (
  id uuid primary key default gen_random_uuid(),
  stelle smallint not null check (stelle between 1 and 5),
  motivo text not null,
  -- Il nome pubblico mostrato in landing (opzionale: se manca, resta anonima).
  nome text,
  -- L'evento recensito: da qui l'unicità che impedisce i doppioni.
  evento_tipo text not null check (evento_tipo in ('check', 'verdetto', 'pratica')),
  evento_rif text not null,
  -- Chi l'ha lasciata: l'account se collegato, l'email per il buono.
  utente_id uuid references auth.users (id) on delete set null,
  email text,
  -- 'in_attesa' finché l'admin non decide. 'approvata' = in landing.
  stato text not null default 'in_attesa' check (stato in ('in_attesa', 'approvata', 'nascosta')),
  creata_il timestamptz not null default now(),
  approvata_il timestamptz
);

-- Un evento si recensisce UNA volta sola: è il muro contro le analisi
-- gratis a raffica (una recensione = un buono = un evento vero).
create unique index if not exists recensioni_evento_unico
  on public.recensioni (evento_tipo, evento_rif);

-- La landing legge solo le approvate, dalla più recente.
create index if not exists recensioni_approvate
  on public.recensioni (approvata_il desc)
  where stato = 'approvata';

-- Il pannello legge la coda da moderare, dalla più recente.
create index if not exists recensioni_in_attesa
  on public.recensioni (creata_il desc)
  where stato = 'in_attesa';

alter table public.recensioni enable row level security;
-- Nessuna policy: le legge e scrive SOLO il server con la chiave di
-- servizio (come eventi e iscritti). Il browser non tocca mai questa
-- tabella direttamente.

-- ── Il buono analisi gratis ──────────────────────────────────────────
create table if not exists public.buoni_analisi (
  id uuid primary key default gen_random_uuid(),
  -- La recensione che l'ha guadagnato: on delete cascade, un buono non
  -- vive senza la sua recensione.
  recensione_id uuid not null references public.recensioni (id) on delete cascade,
  utente_id uuid references auth.users (id) on delete set null,
  email text,
  -- null = non ancora usato. Quando si consuma, qui va l'istante: è il
  -- registro che rende il buono usa e getta, non il cookie (che si copia).
  usato_il timestamptz,
  -- Quale check l'ha consumato: serve a ritrovarlo e a non contarlo due volte.
  verifica_usata text,
  creato_il timestamptz not null default now()
);

-- Un buono per recensione: se la submission ritenta, non ne nascono due.
create unique index if not exists buoni_una_recensione
  on public.buoni_analisi (recensione_id);

alter table public.buoni_analisi enable row level security;
-- Nessuna policy: solo il server. Il buono si spende dal cancello del
-- check, con la chiave di servizio.
