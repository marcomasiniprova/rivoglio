-- LA FOTO DELLA PROVA DI PAGAMENTO (Valerio, 16/08).
--
-- Un bucket PRIVATO per le foto del bonifico che gli utenti caricano
-- (facoltativo) dopo aver vinto. Serve per i testimonial anonimi.
--
-- Privato di proposito: una foto di bonifico mostra IBAN e nome. Si legge
-- SOLO dal server con la chiave di servizio (che scavalca la RLS), e nel
-- pannello admin si mostra con un URL firmato che scade. Nessuna policy di
-- lettura pubblica: il service key non ne ha bisogno, e chiunque altro non
-- deve poter vedere niente.
--
-- Il riferimento alla foto sta negli EVENTI della pratica
-- (pratiche_eventi, tipo = 'prova_pagamento'), non in una colonna nuova:
-- una colonna mancante farebbe fallire tutta la lettura della pratica.
-- Quindi qui basta creare il bucket.

insert into storage.buckets (id, name, public)
values ('prove-pagamento', 'prove-pagamento', false)
on conflict (id) do nothing;

-- Controllo: deve comparire una riga con public = false.
-- select id, public from storage.buckets where id = 'prove-pagamento';
