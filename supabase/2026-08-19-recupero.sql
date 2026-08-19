-- Sequenza di recupero via email (framework CONVERTI).
--
-- Applicata sul Supabase vero (progetto rivolio) il 19/08 col connettore.
-- Chi ha fatto un check, lasciato l'email e NON aperto la pratica riceve
-- fino a 2 promemoria (giorno 1 e giorno 4). Queste tre colonne servono a
-- non mandarne mai due uguali e a fermarsi se la persona si disiscrive.
--
-- ⚠️ Il giro resta SPENTO finché non c'è RECUPERO_ATTIVO=1 su Netlify: si
-- accende il giorno del gestore di pagamento (scelta di Valerio).

alter table verifiche add column if not exists recupero_passo smallint not null default 0;
alter table verifiche add column if not exists recupero_ultimo_il timestamptz;
alter table verifiche add column if not exists recupero_stop boolean not null default false;
