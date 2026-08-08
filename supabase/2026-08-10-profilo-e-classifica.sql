-- Migrazione 20260810_profilo_e_classifica
-- Applicata sul Supabase vero l'8/08/2026 (copia tracciata).
--
-- Il nickname e l'adesione alla classifica. Scelte di Valerio (popup):
-- in classifica si entra SOLO scegliendo un nome pubblico (opt-in);
-- chi non sceglie niente non compare mai. La classifica al lancio resta
-- SPENTA (interruttore CLASSIFICA_ATTIVA sul server) finché non ci sono
-- vincite vere da mostrare.

alter table public.profili add column if not exists nickname text;
alter table public.profili add column if not exists classifica_optin boolean not null default false;

-- Il formato del nome pubblico: 3-20 caratteri, lettere, numeri e _.
alter table public.profili drop constraint if exists profili_nickname_formato;
alter table public.profili add constraint profili_nickname_formato
  check (nickname is null or nickname ~ '^[A-Za-z0-9_]{3,20}$');

-- Un nome pubblico appartiene a UNA persona (senza distinzione di maiuscole).
create unique index if not exists profili_nickname_unico
  on public.profili (lower(nickname))
  where nickname is not null;

-- Le policy esistenti bastano: "vedo solo il mio profilo" (select) e
-- "modifico solo il mio profilo" (update). La classifica pubblica NON
-- legge da qui col client: la costruisce il server con la chiave di
-- servizio, prendendo solo nickname e somma di chi ha aderito.
