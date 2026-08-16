import { casa } from "@/lib/sito";
import { supabaseServizio } from "@/lib/supabase/servizio";
import { linkPerEntrare } from "@/lib/email/pratiche";

/**
 * IL LINK CHE FA ENTRARE CHI HA APPENA PAGATO.
 *
 * 🔴 Valerio, 12/08: «non ho capito bene il flusso, e perché quando pago
 * per la pratica mi reindirizza nella pagina login Entra. Cosa succede?
 * Perché proprio lì? E devo accedere o creare un nuovo account? E devo
 * usare la stessa identica email che ho lasciato quando ero idoneo?».
 *
 * Le risposte, nell'ordine: la pratica è legata a un account, se no
 * chiunque avesse il link la leggerebbe; l'account **esiste già** (lo
 * apriamo noi col suo indirizzo nel momento in cui la pratica nasce);
 * quindi non deve né accedere né registrarsi, e sì, è la stessa email.
 * Il punto è che tutto questo non gliel'ha mai detto nessuno: si è
 * trovato davanti a un muro un secondo dopo aver pagato, che è il
 * momento peggiore possibile.
 *
 * Adesso l'ingresso è automatico: si chiede a Supabase un link di accesso
 * per quell'indirizzo e ci si rimbalza dentro. L'utente non vede nessun
 * login.
 *
 * 🔴 E QUI C'ERA UN SECONDO DIFETTO, PIÙ SILENZIOSO, che valeva il primo
 * cliente pagante. Il webhook passava `redirectTo: /pratica/<id>`. Ma
 * Supabase, dopo aver consumato il codice, rimbalza su quell'indirizzo
 * mettendo la sessione **nel frammento** (la parte dopo il cancelletto),
 * e la pagina della pratica non ha nessun codice per raccoglierla: vede
 * un utente non collegato e lo manda a `/entra`. Cioè il bottone
 * «Apri la tua pratica» dell'email di benvenuto, dopo un pagamento VERO,
 * avrebbe fatto esattamente quello che Valerio ha visto con la cassa di
 * prova. Il rimbalzo deve passare da `/auth/conferma`, che quel
 * frammento lo sa leggere ed è l'unico punto del sito che lo fa.
 */

/**
 * 🔴 E POI HO ROTTO IO IL PAGAMENTO, il 12/08 sera. Valerio preme «Paga
 * 14,90 e genera la pratica» dal telefono e si ritrova su
 * `localhost:3000`, cioè su niente.
 *
 * Il motivo. La prima versione di questo file usava `action_link`, cioè
 * l'indirizzo di Supabase che consuma il gettone e POI rimbalza dove
 * gli abbiamo detto. Ma Supabase quel rimbalzo lo fa solo se
 * l'indirizzo è nella sua lista bianca; se non c'è, non dà errore:
 * **scarica l'utente sul "Site URL" del progetto**, che di default è
 * `http://localhost:3000`. In locale non si vede, perché lì localhost è
 * davvero il sito.
 *
 * ⚠️ La lezione vale oltre questo caso: un rimbalzo che passa da un
 * servizio esterno dipende da un'impostazione che vive in un pannello,
 * non nel repository. Nessuna prova la vede, nessuna revisione la
 * legge, e si rompe il giorno del dominio nuovo.
 *
 * Adesso da Supabase si prende **solo il gettone** (`hashed_token`) e
 * l'indirizzo lo costruiamo noi su casa nostra: chi lo apre arriva su
 * `/auth/conferma`, che il gettone lo sa consumare da sé
 * (`verifyOtp`). Nessun rimbalzo esterno, nessuna lista bianca, e il
 * link non può più portare da nessun'altra parte che qui.
 */
function ingressoNostro(token: string, percorso: string): string {
  const p = new URLSearchParams({
    token_hash: token,
    type: "magiclink",
    poi: percorso,
  });
  return `${casa()}/auth/conferma?${p}`;
}

/**
 * 🔴 E CHI ERA GIÀ COLLEGATO VENIVA MANDATO FUORI DAL SITO PER RIENTRARE.
 *
 * Valerio, 13/08: «quando rifai un'altra analisi loggato nella web app e
 * paghi, vieni fatto uscire dalla web app e fatto ritornare nel sito».
 * Il link di accesso qui sopra è nato per chi paga SENZA sessione, e per
 * quello è giusto. Ma veniva usato sempre: chi stava già dentro la web
 * app usciva su supabase.co, tornava su /auth/conferma e atterrava sulla
 * pagina della pratica come un estraneo appena arrivato. Tre indirizzi,
 * due domini, per una sessione che c'era già.
 *
 * ⚠️ E NON ERA SOLO UN GIRO INUTILE. Il link accede come l'email lasciata
 * sulla verifica: se quella è diversa da quella con cui sei collegato, ti
 * cambiava account sotto i piedi senza dirtelo. Con due indirizzi in
 * casa (uno tuo e uno di tua moglie) è esattamente quello che succede.
 *
 * Quindi: la sessione giusta c'è già → si va dritti alla pratica. In
 * tutti gli altri casi si passa dal link, come prima.
 */
export async function ingressoDopoPagamento(
  emailPratica: string,
  percorso: string,
  emailCollegata: string | null | undefined,
): Promise<string> {
  // Già dentro con quell'email: si va dritti. È sicuro, perché il browser È
  // già quell'utente (ha una sessione valida per quell'indirizzo).
  if (emailCollegata && emailCollegata.toLowerCase() === emailPratica.toLowerCase()) {
    return percorso;
  }
  /* 🔴 IL BUCO DELL'ACCOUNT (Valerio, 16/08: «uno paga, mette l'email di un
     altro al verdetto, ed entra nell'account dell'altro»). Aveva ragione, ed
     era un furto d'account: prima qui si tornava `linkDiIngresso(...)`, cioè
     un `/auth/conferma?token_hash=...` su cui il BROWSER veniva rimandato,
     che consumava il gettone e faceva entrare come quell'email SENZA
     possederla. Con la cassa di prova aperta a tutti bastava un check,
     l'email di un altro e un pagamento (anche finto) per entrare nel suo
     account e vedere tutte le sue pratiche.
     Adesso il gettone NON tocca mai il browser di chi paga: si manda il link
     nella POSTA di quell'indirizzo (`linkPerEntrare`) e il browser va su una
     pagina che dice «controlla la posta». Entra solo chi apre quella
     casella. È lo standard dei siti seri.
     ⚠️ `linkDiIngresso` su errore torna l'indirizzo semplice SENZA gettone,
     quindi anche il ripiego non fa mai trapelare un accesso. */
  const link = await linkDiIngresso(emailPratica, percorso);
  await linkPerEntrare(emailPratica, { link });
  return `/entra?pratica=1&poi=${encodeURIComponent(percorso)}`;
}

/**
 * Torna un indirizzo che, aperto in un browser, collega l'utente e lo
 * porta su `percorso`.
 *
 * Se il link non si riesce a generare (Supabase giù, indirizzo strano),
 * torna comunque un indirizzo valido: quello della pagina, senza
 * accesso automatico. Meglio un login da fare che un errore: la pratica
 * è pagata e deve restare raggiungibile in ogni caso.
 */
export async function linkDiIngresso(email: string, percorso: string): Promise<string> {
  const semplice = `${casa()}${percorso}`;
  try {
    const db = supabaseServizio();
    const { data, error } = await db.auth.admin.generateLink({
      type: "magiclink",
      email,
      /* `redirectTo` resta, ma non ci contiamo più: serve solo a chi
         aprisse per sbaglio l'action_link. La strada vera è il gettone
         qui sotto. */
      options: { redirectTo: `${casa()}/auth/conferma` },
    });
    if (error) {
      console.error("[ingresso] link di accesso non generato:", error.message);
      return semplice;
    }
    const gettone = data.properties?.hashed_token;
    /* Senza gettone si torna all'indirizzo semplice, che vuol dire
       passare dal login: una scocciatura, non un vicolo cieco. Mai
       l'action_link, che è quello che scaricava su localhost. */
    return gettone ? ingressoNostro(gettone, percorso) : semplice;
  } catch (e) {
    console.error("[ingresso] link di accesso non generato:", e);
    return semplice;
  }
}
