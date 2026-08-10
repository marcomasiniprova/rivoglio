-- IL DOPO-LETTERA: quando la compagnia dice no.
--
-- Perche' serve: il 52% dei reclami validi viene respinto alla prima
-- risposta, e quasi sempre e' un no che non regge. La replica giusta pero'
-- dipende da COSA hanno risposto, quindi il motivo si chiede a scelta
-- chiusa e si scrive qui: da questo campo esce il paragrafo centrale del
-- sollecito.
--
-- Si puo' rilanciare quante volte si vuole.

alter table public.pratiche add column if not exists rifiuto_motivo text;
alter table public.pratiche add column if not exists rifiuto_il     timestamptz;

alter table public.pratiche drop constraint if exists pratiche_rifiuto_motivo_ck;
alter table public.pratiche add constraint pratiche_rifiuto_motivo_ck
  check (rifiuto_motivo is null or rifiuto_motivo in (
    'eccezionale_generico','meteo','guasto_tecnico','sciopero_compagnia',
    'sciopero_esterno','ritardo_contestato','gia_risarcito','silenzio'));

comment on column public.pratiche.rifiuto_motivo is
  'Il motivo del diniego della compagnia, dichiarato dal cliente a scelta chiusa. Decide la replica nel sollecito (lib/pratiche/rifiuto.ts).';
comment on column public.pratiche.rifiuto_il is
  'Quando il cliente ha dichiarato il diniego. Serve anche come prova dei tempi davanti all''ente nazionale.';
