-- Cache del meteo per (aeroporto, data, ora UTC).
--
-- Applicata sul Supabase vero (progetto rivolio) il 19/08 col connettore.
-- Lo storico meteo non cambia: una volta letto un punto e un'ora dall'istanza
-- Open-Meteo dedicata, non la si richiama piu'. La legge e la scrive SOLO il
-- client di servizio (service role), come le altre cache: RLS acceso e nessuna
-- policy = tabella invisibile ai client, solo il server la tocca.

create table if not exists public.meteo_cache (
  iata text not null,
  data date not null,
  ora_utc text not null,
  dato jsonb not null,
  creato_il timestamptz not null default now(),
  primary key (iata, data, ora_utc)
);

alter table public.meteo_cache enable row level security;
