-- L'Osservatorio coi dati veri (#25): una riga per aeroporto osservato,
-- sovrascritta a ogni rilevazione AeroDataBox (indice ritardi arrivi 0-5,
-- fotografia delle ultime ~2 ore, aggiornata al massimo una volta al
-- giorno). Lettura e scrittura SOLO dal server: RLS accesa, zero policy.

create table if not exists osservatorio_ritardi (
  iata text primary key,
  nome text not null,
  indice numeric,
  mediana_minuti integer,
  arrivi integer,
  cancellati integer,
  rilevato_il timestamptz not null default now()
);

alter table osservatorio_ritardi enable row level security;
