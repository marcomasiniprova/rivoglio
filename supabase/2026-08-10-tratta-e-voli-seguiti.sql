-- Migrazione 20260810_tratta_e_voli_seguiti
-- Applicata sul Supabase vero l'8/08/2026. Questo file è la copia
-- tracciata: le migrazioni non vivono solo nel database, o fra sei mesi
-- nessuno sa più com'è fatto lo schema.
--
-- Tre cose:
-- 1. la TRATTA sui voli, per parlare di città e non di codici;
-- 2. i VOLI SEGUITI, cioè i voli che il server ricontrolla per avvisare;
-- 3. il token push sul profilo, per sapere a quale telefono scrivere.

-- 1 ─────────────────────────────────────────── la tratta, in chiaro
alter table public.voli add column if not exists partenza_iata text;
alter table public.voli add column if not exists partenza_citta text;
alter table public.voli add column if not exists arrivo_iata text;
alter table public.voli add column if not exists arrivo_citta text;

-- 2 ──────────────────────────────────── i voli che il server segue
create table if not exists public.voli_seguiti (
  id uuid primary key default gen_random_uuid(),
  utente_id uuid not null references auth.users (id) on delete cascade,
  volo_iata text not null,
  data_locale date not null,
  -- L'ultimo esito per cui è già partito un avviso: senza, la stessa
  -- notifica ripartirebbe ogni mattina.
  esito_avvisato text,
  avvisato_il timestamptz,
  creato_il timestamptz not null default now(),
  unique (utente_id, volo_iata, data_locale)
);

alter table public.voli_seguiti enable row level security;

-- Ognuno vede e tocca SOLO i suoi voli. Il cron gira con la chiave di
-- servizio, che scavalca questa regola per costruzione.
drop policy if exists "ognuno vede i suoi voli seguiti" on public.voli_seguiti;
create policy "ognuno vede i suoi voli seguiti"
  on public.voli_seguiti
  for all
  using (auth.uid() = utente_id)
  with check (auth.uid() = utente_id);

create index if not exists voli_seguiti_da_controllare
  on public.voli_seguiti (data_locale)
  where esito_avvisato is null;

-- 3 ───────────────────────────────── a quale telefono mandare l'avviso
alter table public.profili add column if not exists expo_push_token text;
