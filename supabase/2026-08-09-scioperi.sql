-- Gli scioperi del trasporto aereo, popolati a mano dalle fonti
-- pubbliche (CGS cgsse.it, cruscotto MIT, ENAC). Il motore li usa per
-- la regola v1: volo sopra soglia in giorno di sciopero = incerto.
-- Lettura SOLO dal server (chiave di servizio): RLS accesa, zero policy.

create table if not exists scioperi (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  settore text not null,
  descrizione text not null default '',
  -- IATA delle compagnie coinvolte; vuoto = generale/ATC, vale per tutti
  compagnie text[] not null default '{}',
  tipo text not null check (tipo in ('personale_compagnia', 'atc_esterno', 'handling', 'generale', 'altro')),
  fonte_url text not null,
  creato_il timestamptz not null default now()
);

create index if not exists scioperi_per_data on scioperi (data);
alter table scioperi enable row level security;

-- La chiave naturale rende il seed rieseguibile senza doppioni.
create unique index if not exists scioperi_unici on scioperi (data, tipo, descrizione);

-- SEED 2026-08-08, ricerca web (squadra di 6 agenti). I calendari
-- ufficiali scioperi.mit.gov.it e cgsse.it non erano raggiungibili dalla
-- sandbox: le date vengono da ENAC (21/07, pagina ufficiale) e da testate
-- che riportano i calendari MIT/CGS; da riverificare sul cruscotto MIT.
-- ESCLUSI apposta: sciopero DAT del 21/07 (revocato secondo la stampa) e
-- elicotteri Avincis del 04/08 (lavoro aereo, non voli di linea).
-- Nota franchigia: dal 27/07 al 05/09 niente scioperi aerei nazionali;
-- per ottobre 2026 all'8/08 non risulta ancora nulla di proclamato.
-- `compagnie` usa SOLO codici IATA: il motore confronta quelli.
insert into scioperi (data, settore, descrizione, compagnie, tipo, fonte_url) values
  ('2026-06-13', 'trasporto aereo, personale navigante',
   'Sciopero nazionale di 18 ore (6-24) di piloti e assistenti di volo easyJet (FILT-CGIL, FIT-CISL, UILT-UIL, UGL-TA, ANPAC). Fasce garantite 7-10 e 18-21.',
   '{U2}', 'personale_compagnia',
   'https://www.missionline.it/scioperi-aerei-giugno-2026-voli-a-rischio-negli-aeroporti-italiani/'),
  ('2026-06-13', 'ATC ENAV',
   'Sciopero di 18 ore (6-24) del personale ENAV dell''aeroporto di Verona: impatto locale sui voli da e per Verona fuori dalle fasce garantite.',
   '{}', 'atc_esterno',
   'https://www.sicurauto.it/news/traffico-e-viabilita/sciopero-aerei-13-giugno-2026-orari-garantiti-e-voli-cancellati/'),
  ('2026-06-13', 'handling e servizi aeroportuali',
   'Sciopero Sky Service (handling) a Milano Linate 12-16 e personale gruppo Sogaer a Cagliari per 18 ore (6-24).',
   '{}', 'handling',
   'https://www.trasporti-italia.com/mobilita/scioperi/sciopero-aerei-il-13-giugno-2026/1255439/'),
  ('2026-07-05', 'trasporto aereo, personale navigante',
   'Sciopero nazionale di 24 ore del personale navigante easyJet. Fasce garantite 7-10 e 18-21.',
   '{U2}', 'personale_compagnia',
   'https://www.fanpage.it/attualita/sciopero-il-5-luglio-si-fermano-gli-aerei-per-24-ore-orari-compagnie-interessate-e-voli-garantiti/'),
  ('2026-07-05', 'ATC ENAV',
   'Sciopero di 24 ore del personale ENAV di Milano Malpensa (CUB Trasporti: annunciati 36 voli cancellati a Malpensa e 20 a Linate).',
   '{}', 'atc_esterno',
   'https://www.travelquotidiano.com/trasporti/scioperi-a-luglio-2026/tqid-516548'),
  ('2026-07-05', 'handling e indotto aeroportuale',
   'Sciopero nazionale di 24 ore del comparto aereo, aeroportuale e handling (Assohandlers); ADR Security 10-18 a Fiumicino e Ciampino; FedEx 14-18 a Malpensa.',
   '{}', 'handling',
   'https://www.sicurauto.it/news/traffico-e-viabilita/sciopero-aerei-5-luglio-2026-orari-garantiti-e-voli-cancellati/'),
  ('2026-07-21', 'trasporto aereo, personale navigante',
   'Sciopero nazionale di 24 ore del personale navigante easyJet; ENAC ha pubblicato l''elenco dei voli garantiti (fasce 7-10 e 18-21, isole, intercontinentali).',
   '{U2}', 'personale_compagnia',
   'https://www.enac.gov.it/news/voli-garantiti-sciopero-dat-e-easy-jet-del-21-luglio-2026'),
  ('2026-07-21', 'handling e logistica aeroportuale',
   'Scioperi handling: SACAL GH a Lamezia 24 ore; Alha, MLE-BCube e FedEx a Malpensa 24 ore; Geasar a Olbia e Alghero 13-17; GH Napoli a Napoli e Salerno 10-14.',
   '{}', 'handling',
   'https://www.fanpage.it/attualita/sciopero-il-21-luglio-2026-si-fermano-gli-aerei-fino-a-24-ore-orari-voli-garantiti-e-compagnie-interessate/'),
  ('2026-09-13', 'sicurezza aeroportuale',
   'Sciopero di 24 ore di ADR Security (controlli di sicurezza) a Roma Fiumicino e Ciampino; agitazioni Italpol e Sicuritalia nel bacino Malpensa e Verux a Torino.',
   '{}', 'altro',
   'https://www.qualitytravel.it/scioperi-settembre-2026-treni-aerei-e-trasporto-pubblico-ecco-tutte-le-date-da-segnare-gia-in-agenda/191581'),
  ('2026-09-30', 'ATC ENAV e Techno Sky',
   'Sciopero nazionale di 4 ore (13-17) del personale ENAV e Techno Sky, con articolazioni locali a Bologna, Bari e Roma: possibili ripercussioni in tutta Italia.',
   '{}', 'atc_esterno',
   'https://www.qualitytravel.it/scioperi-settembre-2026-treni-aerei-e-trasporto-pubblico-ecco-tutte-le-date-da-segnare-gia-in-agenda/191581')
on conflict (data, tipo, descrizione) do nothing;
