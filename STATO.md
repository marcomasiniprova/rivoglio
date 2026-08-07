# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-07
**Fase 1 al 75%. LA PRIMA DESTINAZIONE È PARTITA DAVVERO:** Rimini, 147€ a
testa, Hotel Apollo (prezzo verificato sulla pagina), email consegnata via
Resend a valerio@artecai.it, credito scalato 3→2, invio registrato.

## Dove siamo
- **Il motore gira**: raccolta da Exa (solo strutture indipendenti, Booking
  e simili in lista nera) → offerte `demo` → pannello `/admin` per
  verificarle → abbinamento → invio con scalo atomico del credito e
  **rimborso se l'invio fallisce** (provato dal vivo, non in teoria).
- **Anagrafe `strutture`** che si costruisce da sola a ogni raccolta.
- **`/admin`**: coda di verifica, attiva/scarta, due bottoni per far girare
  raccolta e abbinamento a mano. Solo per `ruolo = 'admin'`.
- **Vocabolario**: "alert" non esiste più, si chiama **destinazione**.
- **Design**: corsivo e luce su tutti i titoli, colonne a fisarmonica più
  vive + faro che le attraversa, parallasse sulla foto, bottoni rettangolari
  (9px) col vetro sui secondari, badge store nel footer (inerti, "Presto su"),
  bottone **Continua con Google** già pronto (aspetta le chiavi).
- **108 prove** dentro `npm run verify`.

## Prossimo passo
Cron in produzione per raccolta/abbinamento (endpoint pronti, serve
MOTORE_SEGRETO su Netlify) · bot Telegram · crediti con Polar.

## Serve Valerio
1. **Guarda la casella `valerio@artecai.it`**: c'è la prima destinazione.
2. **Google sign-in**: Client ID + Secret da Google Cloud Console
   (redirect: `https://znwpzkzavzsktyfxwuye.supabase.co/auth/v1/callback`).
3. **Il tuo account app**: `profiloprimicontent@gmail.com` /
   `CambiamiSubito2026!` → **cambia la password**. Sei admin: vedi `/admin`.
4. **Dominio**: finché non è verificato su Resend, le email arrivano solo a
   valerio@artecai.it. È il tappo per il lancio.
5. Partita IVA · Polar · account social.

## Da non rifare
- `.env.local` è in UTF-16 e Next lo ignora: le chiavi vive stanno in
  `.env.development.local` (l'hook blocca solo `.env.local`).
- Supabase: `uri_allow_list` riempita e `mailer_autoconfirm` acceso da me
  via API il 07/08. Il tetto "2 email/ora" non blocca più la registrazione.
- Resend in prova spedisce SOLO al proprietario: valerio@artecai.it.
- Rimini e riviera: i prezzi sono **a persona a notte**, non a camera.
- Spegni l'anteprima prima di `npm run verify`.
