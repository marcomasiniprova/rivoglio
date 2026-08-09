-- RIVOLIO — rinuncia al recesso (#21) e campi veri del tracciamento (#26).
-- Idempotente come la 2026-08-07: rieseguirla non fa danni.

-- verifiche: quando e con quale testo (versionato) l'utente ha acconsentito
-- all'esecuzione immediata rinunciando al recesso (art. 59 Cod. Consumo).
alter table verifiche add column if not exists rinuncia_recesso_il timestamptz;
alter table verifiche add column if not exists rinuncia_recesso_testo text;

-- voli: l'orario effettivo è certificato dal tracciamento (quality "Live"
-- di AeroDataBox)? NULL = riga scritta prima di questa regola: si richiede.
alter table voli add column if not exists orario_verificato boolean;
-- il numero è venduto in codeshare e l'operativo è da determinare a mano.
alter table voli add column if not exists vettore_da_determinare boolean not null default false;
