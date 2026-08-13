import { casa } from "@/lib/sito";
import { supabaseServizio } from "@/lib/supabase/servizio";

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

/** Dove far atterrare l'utente dopo l'accesso. Solo percorsi interni. */
function conferma(percorso: string): string {
  return `${casa()}/auth/conferma?poi=${encodeURIComponent(percorso)}`;
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
  if (emailCollegata && emailCollegata.toLowerCase() === emailPratica.toLowerCase()) {
    return percorso;
  }
  return linkDiIngresso(emailPratica, percorso);
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
      options: { redirectTo: conferma(percorso) },
    });
    if (error) {
      console.error("[ingresso] link di accesso non generato:", error.message);
      return semplice;
    }
    return data.properties?.action_link || semplice;
  } catch (e) {
    console.error("[ingresso] link di accesso non generato:", e);
    return semplice;
  }
}
