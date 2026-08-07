-- RIVOGLIO — lo schema del nuovo prodotto (2026-08-07, sera).
-- Applicata sul progetto vero via Composio la sera stessa: rieseguirla non
-- fa danni (if not exists ovunque). Le tabelle di viaggio (offerte,
-- ricerche, invii, strutture) restano: eredità, nessun dato si cancella.

-- ============================================================ voli
-- La cache dei FATTI. Un volo con 180 passeggeri = 1 riga, 1 chiamata API.
-- payload_grezzo è la prova immutabile se una compagnia contesta fra 6 mesi.
create table if not exists voli (
  id uuid primary key default gen_random_uuid(),
  volo_iata text not null,
  data_locale date not null,
  vettore_operativo text,
  vettore_marketing text,
  arrivo_previsto_utc timestamptz,
  arrivo_effettivo_utc timestamptz,
  stato text not null default 'sconosciuto'
    check (stato in ('atterrato','cancellato','dirottato','sconosciuto')),
  km_ortodromica double precision,
  fonte text not null,
  fonti_discordanti boolean not null default false,
  payload_grezzo jsonb,
  recuperato_il timestamptz not null default now(),
  unique (volo_iata, data_locale)
);
alter table voli enable row level security;
-- Nessuna policy: ai voli accede solo il server con la chiave di servizio.

-- ======================================================== verifiche
-- Ogni check fatto da chiunque, anche anonimo. È l'imbuto e la memoria.
create table if not exists verifiche (
  id uuid primary key default gen_random_uuid(),
  volo_id uuid references voli(id),
  volo_iata text not null,
  data_locale date not null,
  esito text not null check (esito in ('idoneo','incerto','non_idoneo')),
  importo integer,
  ritardo_minuti integer,
  motivo text,
  versione_regole text not null,
  -- shadow mode: 'automatica' quando la conferma umana è spenta;
  -- 'in_attesa' -> 'confermata' | 'corretta' quando è accesa (SPEC §4)
  conferma text not null default 'automatica'
    check (conferma in ('automatica','in_attesa','confermata','corretta')),
  email text,
  utente_id uuid references auth.users(id),
  creata_il timestamptz not null default now()
);
create index if not exists verifiche_creata_il on verifiche (creata_il desc);
alter table verifiche enable row level security;
drop policy if exists "verifiche: le mie" on verifiche;
create policy "verifiche: le mie" on verifiche
  for select using (auth.uid() = utente_id);

-- ========================================================= pratiche
-- La macchina a stati di un reclamo. Le transizioni le fa solo il server.
create table if not exists pratiche (
  id uuid primary key default gen_random_uuid(),
  utente_id uuid references auth.users(id),
  verifica_id uuid references verifiche(id),
  volo_id uuid references voli(id),
  stato text not null default 'creata' check (stato in
    ('creata','pagata','pronta','inviata','sollecito','enac',
     'esito_pagata','esito_rifiutata','rimborsata')),
  tipo text not null default 'singola' check (tipo in ('singola','famiglia')),
  -- [{nome, cognome}] fino a 5 per la famiglia; il primo è l'intestatario
  passeggeri jsonb not null default '[]'::jsonb,
  importo_fascia integer,
  prezzo_pagato numeric(6,2),
  polar_ordine text,
  email text not null,
  scadenza_stimata date,
  garanzia_fino_al date,
  inviata_il timestamptz,
  creata_il timestamptz not null default now(),
  aggiornata_il timestamptz not null default now()
);
create index if not exists pratiche_utente on pratiche (utente_id);
alter table pratiche enable row level security;
drop policy if exists "pratiche: le mie" on pratiche;
create policy "pratiche: le mie" on pratiche
  for select using (auth.uid() = utente_id);

-- =================================================== pratiche_eventi
-- La cronologia visibile nel tracker: creata, pagata, email T+15 partita...
create table if not exists pratiche_eventi (
  id uuid primary key default gen_random_uuid(),
  pratica_id uuid not null references pratiche(id) on delete cascade,
  tipo text not null,
  nota text,
  creato_il timestamptz not null default now()
);
create index if not exists eventi_pratica on pratiche_eventi (pratica_id, creato_il);
alter table pratiche_eventi enable row level security;
drop policy if exists "eventi: delle mie pratiche" on pratiche_eventi;
create policy "eventi: delle mie pratiche" on pratiche_eventi
  for select using (exists (
    select 1 from pratiche p
    where p.id = pratica_id and p.utente_id = auth.uid()
  ));
