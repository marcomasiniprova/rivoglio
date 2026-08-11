# Le variabili di Netlify, una per una

Questo file risponde a una domanda sola: **cosa devo scrivere dentro
ognuna?** Aprilo accanto alla pagina di Netlify
(*Site configuration → Environment variables*) e confronta riga per riga.

La stessa cosa la trovi anche dentro il sito, su **`/admin/impostazioni`**:
lì vedi anche quali sono già a posto e quali mancano, senza mai mostrare
il valore.

**Due regole che valgono per tutte:**

1. **Il nome è esatto, maiuscole comprese.** `Aerodatabox_api_key` non
   funziona: per il sito è una variabile che non esiste.
2. **Quelle che cominciano per `NEXT_PUBLIC_` si scrivono nella pagina
   quando il sito viene costruito.** Se le cambi su Netlify e basta, il
   sito continua a usare il valore vecchio: serve un nuovo deploy
   (*Deploys → Trigger deploy → Deploy site*).

---

## 1. Senza queste il sito non fa il suo mestiere

| Nome | Cosa ci va dentro | Se manca |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://znwpzkzavzsktyfxwuye.supabase.co` | Niente account, niente pratiche, niente cruscotto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | La chiave **pubblicabile** del progetto Supabase (Settings → API Keys). Comincia per `sb_publishable_`. Se hai ancora quella vecchia va bene il nome `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Nessuno riesce a entrare col proprio account |
| `SUPABASE_SECRET_KEY` | La chiave **segreta** dello stesso posto. Comincia per `sb_secret_`. Nome vecchio accettato: `SUPABASE_SERVICE_ROLE_KEY` | Il sito non scrive più niente: verifiche, pratiche, registro. ⚠️ Questa non deve MAI finire in una pagina |
| `AERODATABOX_API_KEY` | La chiave di RapidAPI per AeroDataBox | **Il sito passa in modalità dimostrativa**: risponde solo ai voli finti che cominciano per ZZ. È il motivo del "FR4001 non funziona" dell'8/08 |
| `NEXT_PUBLIC_SITO` | `https://rivolio.netlify.app` (il giorno del dominio: `https://rivolio.it`). Senza barra finale | I link dentro le email e quelli che dichiariamo a Google puntano all'indirizzo sbagliato |
| `RESEND_API_KEY` | La chiave di Resend. Comincia per `re_` | Nessuna email parte: né conferma iscrizione, né benvenuto pratica |
| `RESEND_MITTENTE` | `Valerio di Rivolio <valerio@iltuodominio>` — nome fra virgolette no, indirizzo fra parentesi angolari sì | Le email partono da un mittente di riserva, o non partono |
| `MISTRAL_API_KEY` | La chiave di Mistral | La foto della carta d'imbarco non si legge più (il resto del check funziona) |
| `MOTORE_SEGRETO` | **Una parola lunga inventata da te**, almeno 30 caratteri a caso. Non deve significare niente | Le sveglie automatiche (notifiche, scioperi, riepilogo della sera) rispondono "non autorizzato" |
| `SEGRETO_ISCRITTI` | **Un'altra parola lunga inventata**, diversa dalla prima | Non è un guasto: se manca si usa la chiave segreta di Supabase. Ma è la firma delle ricevute del check e dei link di iscrizione, e le firme è meglio tenerle separate |

---

## 2. Gli interruttori: ci sono o non ci sono

Valgono **`1`**. Per spegnerli si **toglie la variabile**, non si scrive
`0` (funziona lo stesso, ma toglierla è più chiaro fra sei mesi).

| Nome | Cosa fa quando vale `1` |
|---|---|
| `NEXT_PUBLIC_CHECK_PREZZO_ATTIVO` | **Accende il muro**: il check si paga 1,99. Senza, il check è gratis e il sito lo dice in tutte le sue sessanta righe |
| `EXPO_PUBLIC_CHECK_PREZZO_ATTIVO` | **Lo stesso, per l'app.** Va tenuta uguale alla precedente: se sono diverse, l'app promette gratis quello che il sito fa pagare. ⚠️ Dopo averla cambiata l'app va riesportata (`npm run anteprima` dentro `mobile/`) |
| `SHADOW_MODE` | Nessun verdetto idoneo diventa vendibile finché non lo confermi tu da `/admin`. **Tienilo acceso** finché non hai visto 100 verdetti di fila giusti |
| `CLASSIFICA_ATTIVA` | Fa comparire la tab Classifica nell'app. Va acceso solo quando ci sono 10 giorni di dati veri |
| `OPENMETEO_COMMERCIALE` | Accende la riga meteo nella lettera di reclamo. **Non accenderlo**: richiede il piano a pagamento (~99 dollari al mese) |

---

## 3. La cassa di prova (temporanea)

| Nome | Cosa ci va dentro |
|---|---|
| `CASSA_PROVA_SEGRETO` | **Una parola inventata che sai solo tu.** Serve a percorrere muro → cassa → analisi sbloccata prima che esista un venditore vero |

Come si usa: apri **una volta sola**
`https://rivolio.netlify.app/api/check/prova/chiave?s=LAPAROLA`
e da quel momento **quel browser** è il tuo collaudatore. Per tutti gli
altri il bottone del muro porta ai prezzi.

⚠️ **Il giorno che arriva un venditore vero, questa variabile si toglie.**
Finché c'è, chi conoscesse la parola avrebbe analisi gratis.

---

## 4. Il TIN sul telefono (nuove dell'11/08)

| Nome | Cosa ci va dentro | Se manca |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Il gettone che ti dà **@BotFather** su Telegram quando crei un bot. Ha la forma `1234567890:AAF...` | Nessuna notifica. Il cruscotto su `/admin/cruscotto` funziona lo stesso |
| `TELEGRAM_ADMIN_CHAT` | Il tuo numero di chat. Lo trovi scrivendo a **@userinfobot**: è il campo `Id`, un numero | Come sopra |

Come si fa, in tre minuti: su Telegram scrivi a **@BotFather**, mandi
`/newbot`, scegli un nome, e lui ti risponde col gettone. Poi scrivi a
**@userinfobot**, che ti risponde col tuo numero. Poi **mandi un
messaggio qualsiasi al bot che hai appena creato** (senza quello Telegram
non gli permette di scriverti per primo).

---

## 5. Polar (o chi per lui), quando ci sarà

| Nome | Cosa ci va dentro |
|---|---|
| `POLAR_CHECKOUT_PRATICA` | Il link del prodotto Pratica a 14,90 |
| `POLAR_CHECKOUT_FAMIGLIA` | Il link del prodotto Pratica famiglia a 24,90 |
| `POLAR_CHECKOUT_PRATICA_B` | Il link della Pratica a 24,90 (il prezzo alto del test) |
| `POLAR_CHECKOUT_FAMIGLIA_B` | Il link della Famiglia a 39,90 |
| `POLAR_WEBHOOK_SECRET` | Il segreto del webhook, che Polar mostra quando lo crei. Serve a essere certi che l'avviso "ha pagato" arrivi davvero da loro |

Senza i due `_B` il sito serve il prezzo basso a tutti: il test dei due
prezzi non parte, ma **niente si rompe**.

---

## 6. Facoltative

| Nome | A cosa serve |
|---|---|
| `ALERT_EMAIL` | Dove mandare gli allarmi automatici, se vuoi un indirizzo diverso dal tuo |
| `RESEND_HOOK_SECRET` | Serve solo se fai passare da Resend anche le email di accesso di Supabase |

---

## 7. Quelle che puoi togliere

| Nome | Perché |
|---|---|
| `AVIATIONSTACK_API_KEY` | Il fornitore è morto per noi dall'8/08 (il piano gratuito dà solo il tempo reale e ha licenza personale). Il codice la legge ancora ma non ci fa niente |
| `EXA_API_KEY` | Resto del prodotto viaggi, che è morto il 7/08 |

---

## Quelle che NON devi creare tu

`URL`, `DEPLOY_PRIME_URL`, `NODE_ENV`, `CONTEXT` e simili le scrive
Netlify da sé a ogni build. Se ne crei una con lo stesso nome rischi di
rompere le sveglie automatiche.
