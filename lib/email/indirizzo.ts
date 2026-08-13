/**
 * L'INDIRIZZO EMAIL, CONTROLLATO SUL SERIO.
 *
 * 🔴 Valerio, 13/08: «alla idoneità chiede email per salvare la pratica e
 * ti crea direttamente l'account? Ecco, ho scoperto che viene creato
 * anche con email inesistenti, false, scritte male e temporanee».
 * Aveva ragione, ed era peggio di come sembrava: lo stesso controllo
 * permissivo (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`) era COPIATO in cinque
 * punti diversi (verdetto, iscrizione, login, app, browser). Cinque copie
 * vogliono dire cinque regole che divergono al primo cambio, e infatti
 * quella regex lasciava passare `a@b.cc`, `pippo@gmial.com`,
 * `x@mailinator.com` e qualunque dominio che non esiste.
 *
 * Perché conta più di quanto sembri: su un indirizzo morto non arriva
 * l'email del verdetto, non arriva il link che riapre il risultato da un
 * altro telefono, e soprattutto **l'account della pratica nasce con
 * quell'indirizzo**. Il giorno del primo cliente pagante, un refuso
 * significa un pagamento incassato e una pratica che il cliente non
 * riesce ad aprire.
 *
 * I quattro cancelli, in ordine di costo (i primi tre non toccano la rete):
 * 1. FORMA — sintassi vera, non "c'è una chiocciola";
 * 2. USA E GETTA — le caselle che si autodistruggono in dieci minuti;
 * 3. REFUSO — `gmial.com` esiste davvero come dominio, quindi il controllo
 *    del punto 4 lo lascerebbe passare: qui si riconosce che assomiglia
 *    troppo a `gmail.com` e si propone il giusto;
 * 4. IL DOMINIO RICEVE POSTA? — si chiede al DNS se quel dominio ha una
 *    destinazione per la posta (record MX, o in mancanza un indirizzo,
 *    che RFC 5321 §5.1 ammette come ripiego).
 *
 * ⚠️ IL PUNTO 4 SBAGLIA DALLA PARTE DI CHI PAGA. Se il DNS non risponde
 * (rete lenta, server giù, questa sandbox) NON si blocca: si lascia
 * passare. Bloccare un indirizzo buono perché il nostro DNS ha avuto una
 * giornata storta è un cliente perso per un guasto nostro, ed è un danno
 * peggiore di un'email che rimbalza.
 *
 * ⚠️ IL REFUSO SI PROPONE, NON SI IMPONE. Esistono domini legittimi che
 * assomigliano a quelli famosi. Chi conferma passa: la seconda chiamata
 * arriva con `insisto: true`.
 */

/* --------------------------------------------------------------- tipi */

export type MotivoScarto = "formato" | "usa_e_getta" | "refuso" | "dominio_morto";

export type EsitoIndirizzo =
  | { ok: true; email: string }
  | {
      ok: false;
      motivo: MotivoScarto;
      /** Il messaggio da mostrare, già scritto per un essere umano. */
      messaggio: string;
      /** L'indirizzo corretto da proporre con un clic. Solo per "refuso". */
      suggerimento?: string;
    };

/* ------------------------------------------------------------- la forma */

/**
 * La parte prima della chiocciola. RFC 5322 permette molto di più (le
 * virgolette, i commenti), ma nessuna casella vera al mondo li usa e
 * accettarli vorrebbe dire accettare anche gli errori di battitura.
 */
const LOCALE_OK = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

/** Una etichetta di dominio: lettere, numeri e trattini, mai ai bordi. */
const ETICHETTA_OK = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/** Il suffisso finale: solo lettere. Blocca `.c0m`, `.123` e i troncamenti. */
const TLD_OK = /^[a-z]{2,24}$/;

/**
 * Toglie il rumore che arriva da un incolla: spazi, `mailto:`, le
 * parentesi angolari di un client di posta, il punto finale di una frase.
 */
export function normalizza(grezza: string): string {
  return grezza
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/^[<(\[]|[>)\].,;]+$/g, "")
    .trim()
    .toLowerCase();
}

/** Il dominio di un indirizzo già normalizzato, o stringa vuota. */
export function dominioDi(email: string): string {
  const i = email.lastIndexOf("@");
  return i === -1 ? "" : email.slice(i + 1);
}

function formaValida(email: string): boolean {
  if (email.length > 254 || email.includes(" ")) return false;
  const i = email.lastIndexOf("@");
  if (i <= 0 || i === email.length - 1) return false;

  const locale = email.slice(0, i);
  const dominio = email.slice(i + 1);
  if (locale.length > 64 || !LOCALE_OK.test(locale)) return false;
  if (dominio.length > 253) return false;

  const etichette = dominio.split(".");
  // Servono almeno due pezzi: "pippo@gmail" non è un indirizzo.
  if (etichette.length < 2) return false;
  if (!etichette.every((e) => ETICHETTA_OK.test(e))) return false;
  return TLD_OK.test(etichette[etichette.length - 1]);
}

/* ---------------------------------------------------------- usa e getta */

/**
 * Le caselle temporanee più diffuse. Non è un elenco completo e non può
 * esserlo: ne nascono ogni settimana. Copre i servizi che una persona
 * trova cercando "email temporanea", che sono quelli che incontriamo
 * davvero.
 *
 * ⚠️ Il confronto prende anche i sottodomini (`inbox.mailinator.com`):
 * i servizi grossi ne regalano a manciate proprio per aggirare le liste.
 */
const USA_E_GETTA = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "20minutemail.it",
  "33mail.com",
  "burnermail.io",
  "dispostable.com",
  "disposablemail.com",
  "discard.email",
  "discardmail.com",
  "emailondeck.com",
  "emltmp.com",
  "fakeinbox.com",
  "fakemail.net",
  "getairmail.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "harakirimail.com",
  "inboxkitten.com",
  "jetable.org",
  "linshiyouxiang.net",
  "luxusmail.org",
  "mail.tm",
  "mail7.io",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailnesia.com",
  "mailsac.com",
  "minuteinbox.com",
  "moakt.com",
  "mohmal.com",
  "mytemp.email",
  "nada.email",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "tempail.com",
  "tempinbox.com",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempr.email",
  "throwawaymail.com",
  "tmpmail.net",
  "tmpmail.org",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

/** Vero se il dominio (o il suo padre) è una casella temporanea. */
export function usaEGetta(dominio: string): boolean {
  if (USA_E_GETTA.has(dominio)) return true;
  const pezzi = dominio.split(".");
  for (let i = 1; i < pezzi.length - 1; i++) {
    if (USA_E_GETTA.has(pezzi.slice(i).join("."))) return true;
  }
  return false;
}

/* -------------------------------------------------------------- refusi */

/**
 * I domini che scrivono i nostri utenti. Servono a una cosa sola:
 * riconoscere quando qualcuno ne ha sbagliato una lettera.
 * ⚠️ Ci sono i `.it` di casa (libero, virgilio, alice, tiscali, poste),
 * che una lista scritta guardando il mercato americano non avrebbe.
 */
const DOMINI_NOTI = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.it",
  "outlook.com",
  "outlook.it",
  "live.com",
  "live.it",
  "msn.com",
  "yahoo.com",
  "yahoo.it",
  "icloud.com",
  "me.com",
  "libero.it",
  "virgilio.it",
  "alice.it",
  "tin.it",
  "tiscali.it",
  "email.it",
  "inwind.it",
  "poste.it",
  "fastwebnet.it",
  "aruba.it",
  "teletu.it",
  "protonmail.com",
  "proton.me",
];

/**
 * Quante correzioni servono per passare da una parola all'altra.
 *
 * ⚠️ LE DUE LETTERE INVERTITE CONTANO UNA, NON DUE, e non è un dettaglio
 * da manuale: `gmial.com` è il refuso più frequente del mondo, e con la
 * distanza classica (Levenshtein) dista **2** da `gmail.com`, cioè
 * esattamente quanto un dominio che con Gmail non c'entra niente. Con
 * quella misura il controllo non prendeva il caso per cui esiste. Una
 * prova l'ha bocciato al primo giro.
 */
function distanza(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  // Tre righe: per lo scambio serve anche la penultima, non solo la precedente.
  let dueSopra = new Array<number>(n + 1).fill(0);
  let sopra = Array.from({ length: n + 1 }, (_, j) => j);
  let riga = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    riga[0] = i;
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      riga[j] = Math.min(
        sopra[j] + 1, // cancellazione
        riga[j - 1] + 1, // inserimento
        sopra[j - 1] + costo, // sostituzione
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        riga[j] = Math.min(riga[j], dueSopra[j - 2] + 1); // scambio
      }
    }
    dueSopra = sopra;
    sopra = riga;
    riga = new Array<number>(n + 1).fill(0);
  }
  return sopra[n];
}

/**
 * Il dominio giusto, se questo ci assomiglia troppo. Null se va bene
 * così com'è o se non somiglia a niente che conosciamo.
 *
 * TRE PALETTI, e ognuno evita un modo diverso di rovinare la giornata a
 * un cliente correggendogli un indirizzo che era giusto:
 * 1. UNA correzione sola. A due si comincia a "correggere" domini
 *    aziendali che con Gmail non c'entrano niente.
 * 2. Stesso suffisso finale. `gmail.it` esiste ed è di qualcun altro:
 *    proporgli `gmail.com` sarebbe mandarlo dalla parte sbagliata.
 * 3. Almeno otto caratteri. Sui domini corti una lettera di differenza è
 *    quasi sempre un dominio diverso e vero: `tim.it` non è un `tin.it`
 *    scritto male, è l'operatore telefonico.
 */
export function refusoDominio(dominio: string): string | null {
  if (DOMINI_NOTI.includes(dominio)) return null;
  const suffisso = dominio.slice(dominio.lastIndexOf("."));
  for (const noto of DOMINI_NOTI) {
    if (noto.length < 8) continue;
    if (!noto.endsWith(suffisso)) continue;
    if (distanza(dominio, noto) === 1) return noto;
  }
  return null;
}

/* ------------------------------------------------- il controllo offline */

const MESSAGGI: Record<MotivoScarto, string> = {
  formato: "Controlla l'indirizzo: manca qualcosa, o c'è un carattere di troppo.",
  usa_e_getta:
    "Questo è un indirizzo temporaneo, e fra dieci minuti non esiste più. La pratica vive lì dentro: serve una casella che apri davvero.",
  refuso: "",
  dominio_morto:
    "Questo indirizzo non esiste: il dominio dopo la chiocciola non riceve posta. Controlla come l'hai scritto.",
};

/**
 * I tre cancelli che non toccano la rete. Sincrono di proposito: lo usa
 * anche il browser, per dire subito cosa non va invece di far aspettare
 * un giro sul server.
 */
export function controllaFormato(
  grezza: string,
  opzioni: { insisto?: boolean } = {},
): EsitoIndirizzo {
  const email = normalizza(grezza);
  if (!formaValida(email)) {
    return { ok: false, motivo: "formato", messaggio: MESSAGGI.formato };
  }

  const dominio = dominioDi(email);
  if (usaEGetta(dominio)) {
    return { ok: false, motivo: "usa_e_getta", messaggio: MESSAGGI.usa_e_getta };
  }

  if (!opzioni.insisto) {
    const giusto = refusoDominio(dominio);
    if (giusto) {
      const corretto = `${email.slice(0, email.lastIndexOf("@") + 1)}${giusto}`;
      return {
        ok: false,
        motivo: "refuso",
        messaggio: `Volevi dire ${corretto}?`,
        suggerimento: corretto,
      };
    }
  }

  return { ok: true, email };
}
