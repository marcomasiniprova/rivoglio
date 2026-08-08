-- Doppio opt-in sull'Osservatorio (scelta di Valerio, 9/08).
--
-- Chi scrive l'email sul sito viene salvato subito, ma NON è iscritto
-- finché non clicca il link che gli arriva in posta. Serve a due cose:
-- 1. nessuno può iscrivere l'indirizzo di qualcun altro;
-- 2. gli indirizzi falsi non rimbalzano, e la reputazione del dominio
--    resta pulita (cioè: le email arrivano in posta e non in spam).
--
-- `disdetto_il` è l'altra faccia: il link "non voglio più queste email"
-- non cancella la riga, la marca. Cancellarla vorrebbe dire perdere la
-- prova del consenso e riscrivere alla stessa persona il mese dopo.

alter table public.iscritti
  add column if not exists confermato_il timestamptz,
  add column if not exists disdetto_il  timestamptz;

-- Chi mandare: solo confermati e non disdetti.
create index if not exists iscritti_confermati_idx
  on public.iscritti (confermato_il)
  where confermato_il is not null and disdetto_il is null;

comment on column public.iscritti.confermato_il is
  'Quando ha cliccato il link di conferma. NULL = non iscritto: non mandargli la newsletter.';
comment on column public.iscritti.disdetto_il is
  'Quando ha chiesto di non ricevere più. Non si cancella la riga: serve come prova del consenso.';
