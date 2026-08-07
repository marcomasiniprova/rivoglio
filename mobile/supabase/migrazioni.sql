-- Migrazione per l'app mobile: il token delle notifiche push.
--
-- Cosa fa: aggiunge a `profili` la colonna `expo_push_token`, dove l'app
-- salva il token Expo del telefono dopo che l'utente concede il permesso.
-- Il server la userà per mandare la destinazione anche come push, oltre
-- che per email.
--
-- Quando va applicata: PRIMA di pubblicare l'app, a mano dal pannello
-- Supabase (SQL Editor > New query > incolla > Run). La sandbox di
-- sviluppo non raggiunge la rete, quindi da qui non si può eseguire.
-- Rieseguirla non fa danni: `if not exists` la rende ripetibile.

alter table profili
  add column if not exists expo_push_token text;

comment on column profili.expo_push_token is
  'Token push Expo del telefono. Vuoto finché l''utente non concede il permesso notifiche.';
