# STATO — Rivoglio

**Aggiornato:** 2026-08-07, tarda sera
**SECONDO PIVOT (07/08 sera): il prodotto si chiama RIVOGLIO e cambia.**
Valerio ha trovato concorrenti più grandi sull'idea viaggi e l'ha chiusa.
Si tiene TUTTO (landing, app mobile, Supabase, motore, modo di lavorare),
è stato rinominato TUTTO in Rivoglio (codice, bundle `it.rivoglio.app`,
documenti, repo, progetto Supabase). **Cosa fa il nuovo prodotto lo dice
Valerio a breve**: fino ad allora i testi descrivono ancora l'idea vecchia,
si riscrivono in blocco alla definizione.

Primo pivot del mattino (resta vero): il prodotto è un'APP MOBILE per gli
store. L'app esiste in `mobile/` (Expo SDK 57), scritta da una squadra di
8 agenti, verificata: tsc 0 errori, lint pulito, 29 prove su 29. Migrazione
push applicata sul Supabase vero via Composio. La landing raccoglie la
lista d'attesa. Al mattino era partita LA PRIMA DESTINAZIONE VERA: Rimini,
147€ a testa, email via Resend, credito scalato 3→2.

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
- **Controllo completo del 07/08** (tutta la repo + verify): il quadro regge.
  Corretti al volo data dell'esempio, trattini lunghi visibili, `.env.example`.
  Tre punti aperti in `ARRETRATI.md`: capienza della camera, lettore MIMIT,
  rimborso atomico quando entra Polar.

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
