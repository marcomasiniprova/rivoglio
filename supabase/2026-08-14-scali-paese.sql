-- GIRO #44 — IL PAESE DEGLI SCALI ENTRA IN CACHE.
--
-- Perché serve: il cancello territoriale (art. 3 par. 1) decide se il
-- Regolamento si applica, e per farlo deve sapere in che paese sta lo
-- scalo di partenza. Il paese arriva insieme al volo dal fornitore, ma
-- finora non veniva salvato: il primo passeggero chiudeva il caso, il
-- secondo ripartiva senza il dato.
--
-- Si può rilanciare quante volte si vuole: IF NOT EXISTS ovunque.

alter table public.voli add column if not exists partenza_paese text;
alter table public.voli add column if not exists arrivo_paese   text;
alter table public.voli add column if not exists partenza_icao  text;
alter table public.voli add column if not exists arrivo_icao    text;

comment on column public.voli.partenza_paese is
  'Codice ISO-2 del paese dello scalo di partenza, come lo manda il fornitore. Serve al cancello territoriale.';
comment on column public.voli.arrivo_paese is
  'Codice ISO-2 del paese dello scalo di arrivo, come lo manda il fornitore.';
comment on column public.voli.partenza_icao is
  'Sigla ICAO dello scalo di partenza. Terza strada del cancello: il prefisso puo solo aggiungere un si, mai un no.';
comment on column public.voli.arrivo_icao is
  'Sigla ICAO dello scalo di arrivo.';

-- Le righe scritte prima del cancello territoriale (7-9 agosto) non hanno
-- gli scali: restano dove sono, ma il codice le scarta e richiede il volo
-- al fornitore (lib/voli/verifica.ts, rigaUsabile). Nessuna cancellazione:
-- il payload grezzo di quelle righe e' una prova, e le prove non si buttano.

-- IL VETTORE OPERATIVO DICHIARATO DALL'UTENTE (casi in codeshare).
-- Quando il fornitore non sa chi ha operato il volo, lo chiediamo a chi
-- c'era: la sua risposta si scrive qui, con la data, perche' se un domani
-- la compagnia contesta la dichiarazione deve esistere per iscritto.
alter table public.verifiche add column if not exists operativo_dichiarato    text;
alter table public.verifiche add column if not exists operativo_dichiarato_il timestamptz;

comment on column public.verifiche.operativo_dichiarato is
  'Codice IATA della compagnia che il passeggero dichiara abbia operato il volo (solo casi in codeshare non risolto).';
