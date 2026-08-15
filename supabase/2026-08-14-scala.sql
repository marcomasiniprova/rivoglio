-- ============================================================
-- SCALA E SOLIDITÀ — indici e blindature per reggere l'alto traffico
-- (audit del 14/08). Da applicare sul Supabase vero, nel SQL editor.
-- Tutto è idempotente: si può rilanciare, non cancella e non tocca dati.
-- Nessuna di queste righe cambia il comportamento del sito: aggiungono
-- solo indici e protezioni. Il codice è già allineato.
-- ============================================================

-- 1) IL REGISTRO (`eventi`) È LA TABELLA PIÙ SCRITTA, E NON HA INDICE.
--    Il pannello la legge ordinata per data (leggiCruscotto, leggiSerie,
--    leggiRegistro) ogni 20 secondi. Senza indice, Postgres scandisce e
--    ordina TUTTA la tabella a ogni lettura: sotto un video virale (milioni
--    di righe) le pagine del pannello vanno in timeout proprio quando servono.
--    Su una tabella già enorme conviene la variante CONCURRENTLY (fuori da una
--    transazione); qui, prima del lancio, la tabella è piccola e l'indice è
--    immediato.
create index if not exists eventi_creato_il on public.eventi (creato_il desc);

-- 2) RLS SUL REGISTRO. `eventi` è stata creata a mano (giro #56) e non è mai
--    passata da una migrazione, quindi non risulta che la RLS sia accesa.
--    La chiave pubblica del sito viaggia nel browser di ogni visitatore: se
--    la RLS fosse spenta, chiunque potrebbe leggersi tutto l'imbuto (da dove
--    arriva il traffico, gli incassi) o iniettare righe finte. Il registro lo
--    legge SOLO il server con la chiave segreta, quindi la RLS va accesa
--    SENZA policy (è il disegno voluto: nessuno accede da fuori).
alter table public.eventi enable row level security;

-- 3) STESSA VERIFICA SUGLI ISCRITTI (l'Osservatorio). Accendere la RLS è
--    innocuo se è già accesa.
alter table public.iscritti enable row level security;

-- 4) IDEMPOTENZA DEI PAGAMENTI A LIVELLO DATABASE. Oggi "una verifica → una
--    pratica" è garantito solo da una lettura-poi-scrittura nel webhook: se
--    Polar consegna lo stesso pagamento due volte insieme (succede sotto
--    carico), nascono DUE pratiche e DUE email di benvenuto per un solo
--    incasso. Questo indice unico chiude la corsa nel database: la seconda
--    scrittura fallisce e il codice la tratta come "già gestita".
--    ⚠️ Se dovesse fallire perché esistono già pratiche doppie, vanno tolti i
--    doppioni prima (prima del lancio non dovrebbero essercene).
create unique index if not exists pratiche_verifica_unica
  on public.pratiche (verifica_id)
  where verifica_id is not null;

-- 5) LA CODA DEI VERDETTI DA GUARDARE, con un indice mirato. La Panoramica
--    (ogni 20s) e la sezione Verdetti contano/ordinano le verifiche idonee in
--    attesa: senza indice è uno scan che peggiora man mano che la tabella
--    cresce. Questo indice parziale copre sia il conteggio sia l'elenco.
create index if not exists verifiche_da_confermare
  on public.verifiche (creata_il desc)
  where esito = 'idoneo' and conferma = 'in_attesa';

-- ============================================================
-- CONTROLLO: dopo aver eseguito, questa query deve elencare i tre indici
-- nuovi (eventi_creato_il, pratiche_verifica_unica, verifiche_da_confermare).
-- ============================================================
select indexname from pg_indexes
where schemaname = 'public'
  and indexname in ('eventi_creato_il', 'pratiche_verifica_unica', 'verifiche_da_confermare')
order by indexname;
