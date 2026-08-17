-- Il caso nuovo "ritardo di 5 ore e più con rinuncia" (art. 6 → art. 8), 17/08.
-- Il vincolo su verifiche.caso_dichiarato non lo conosce ancora: senza questo,
-- il salvataggio del verdetto dichiarato fallirebbe. Reversibile.

alter table public.verifiche drop constraint if exists verifiche_caso_dichiarato_check;

alter table public.verifiche add constraint verifiche_caso_dichiarato_check
  check (
    caso_dichiarato is null
    or caso_dichiarato = any (array[
      'negato', 'coincidenza', 'declassamento', 'cura', 'prm', 'ritardo_rinuncia'
    ])
  );
