-- APPLICATA sul Supabase vero il 12/08 col connettore.
--
-- 🔴 IL BUG: «Non sono riuscito a salvare. Riprova fra un attimo.»
--
-- Valerio metteva il nome pubblico, spuntava la classifica, premeva
-- Salva, e il sito rispondeva di riprovare. Riprovare non poteva
-- funzionare: nei log di Postgres c'era «permission denied for table
-- profili».
--
-- ⚠️ E NON ERA LA REGOLA DI RIGA. La policy «modifico solo il mio
-- profilo» (RLS) esisteva ed era giusta, ma non veniva mai raggiunta:
-- Postgres controlla PRIMA il permesso di tabella (GRANT), e per il
-- ruolo `authenticated` il permesso UPDATE non c'era. Sono due
-- serrature in fila, e guardando solo la seconda sembrava tutto a posto.
--
-- Il permesso invece ce l'aveva `anon`, cioe' il visitatore NON
-- collegato: esattamente al contrario di come deve stare.
--
-- Cosa era rotto, non solo la classifica: il nome pubblico, l'adesione
-- alla classifica, la citta' di partenza e il gettone delle notifiche
-- push. Tutto quello che un utente puo' cambiare del proprio profilo,
-- dal sito e dall'app.

grant update on public.profili to authenticated;
revoke update on public.profili from anon;

-- Controllo: `authenticated` deve avere UPDATE, `anon` no.
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_schema='public' and table_name='profili'
--     and privilege_type='UPDATE';
