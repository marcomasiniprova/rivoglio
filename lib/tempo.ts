/**
 * IL TEMPO, IN UN POSTO SOLO.
 *
 * 🔴 Valerio, 12/08: «guarda il mio prodotto come un insieme: c'è un
 * orario corretto? Una data e ora precisa di riferimento sempre? Nessuna
 * data o conto cannato? Non possiamo dire "inviala domani domenica"
 * quando domani è giovedì».
 *
 * Aveva ragione a chiederlo, e cercando è saltato fuori un difetto vero
 * che nessuno avrebbe visto fino a fine ottobre: vedi `oraDiRoma`.
 *
 * Le tre regole di questo file, e sono tutte e tre nate da un errore
 * possibile, non da un gusto:
 *
 * 1. **L'orologio del server è UTC, quello dell'utente no.** Netlify
 *    esegue tutto in UTC. Ogni data che finisce sotto gli occhi di una
 *    persona va scritta in ora italiana, dichiarandolo, se no d'estate
 *    balla di due ore e a mezzanotte cambia proprio il giorno.
 *
 * 2. **I giorni si contano sul calendario, non a colpi di 24 ore.** Chi
 *    manda il reclamo alle 23:50 e riguarda la pagina venti minuti dopo
 *    è al giorno DOPO, non ancora al giorno zero. Dividere i millisecondi
 *    per 86.400.000 dice il contrario, e su un conto alla rovescia che
 *    promette una data a un cliente pagante è un errore che si vede.
 *
 * 3. **Il giorno della settimana non si scrive MAI a mano.** Si calcola
 *    dalla data, sempre. È letteralmente la cosa che Valerio ha chiesto
 *    di non fare: "domani domenica" quando domani è giovedì.
 */

/** Il fuso di riferimento del prodotto: i nostri utenti sono in Italia. */
export const FUSO = "Europe/Rome";

/**
 * Adesso. Esiste come funzione e non come `new Date()` sparso ovunque
 * perché è l'unico punto da cui il resto del file legge l'orologio: se
 * un domani serve fingere un'ora in una prova, si tocca qui.
 */
export function adesso(): Date {
  return new Date();
}

/**
 * L'ORA ITALIANA, quella vera, con l'ora legale già dentro.
 *
 * 🔴 IL DIFETTO CHE HA FATTO NASCERE QUESTA FUNZIONE. Il riepilogo della
 * sera su Telegram era programmato alle `0 19 * * *`, cioè le 19 UTC,
 * "così arriva alle 21". Vero da marzo a ottobre. Da fine ottobre
 * l'Italia torna all'ora solare e quello stesso momento diventa le
 * **20:00**: il riepilogo della sera arriverebbe un'ora prima per metà
 * anno, senza che nessun errore lo segnali, perché non è un errore per
 * nessuno tranne che per chi lo aspetta.
 *
 * Il cron di Netlify sa solo l'UTC. Quindi il mestiere di sapere che ore
 * sono in Italia tocca al codice, ed è questo.
 */
export function oraDiRoma(d: Date = adesso()): number {
  return Number(
    new Intl.DateTimeFormat("it-IT", { hour: "2-digit", hour12: false, timeZone: FUSO }).format(d),
  );
}

/** Il giorno in Italia, in forma "2026-08-12". Ordinabile e confrontabile. */
export function giornoDiRoma(d: Date = adesso()): string {
  /* `en-CA` perché dà proprio "AAAA-MM-GG": è il modo più corto di avere
     una data ISO nel fuso giusto senza fare i conti a mano. */
  return new Date(d).toLocaleDateString("en-CA", { timeZone: FUSO });
}

/**
 * Quanti GIORNI DI CALENDARIO ci sono fra due istanti, in Italia.
 *
 * Positivo se `poi` viene dopo `da`. Conta i giorni veri, non i blocchi
 * di 24 ore: dal 12 alle 23:50 al 13 alle 00:10 è **1**, non 0.
 */
export function giorniFra(da: Date | string, poi: Date | string = adesso()): number {
  const a = giornoDiRoma(new Date(da));
  const b = giornoDiRoma(new Date(poi));
  /* Mezzogiorno UTC: mette il confronto lontano da qualsiasi bordo di
     fuso, così la differenza è sempre un numero intero di giorni. */
  const ms = Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Il giorno che cade `giorni` dopo, in forma "2026-09-23". */
export function giornoPiu(giorni: number, da: Date | string = adesso()): string {
  const base = Date.parse(`${giornoDiRoma(new Date(da))}T12:00:00Z`);
  return new Date(base + giorni * 86_400_000).toISOString().slice(0, 10);
}

/** "23 settembre 2026". Accetta sia un giorno ISO che un istante. */
export function dataIt(iso: string | Date): string {
  const d = typeof iso === "string" && iso.length === 10 ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: FUSO,
  });
}

/**
 * Quanti giorni di calendario sono passati da una data. `null` se la data
 * non c'è o non si legge.
 *
 * Serve ai passi della pratica: il ramo del silenzio (sollecito al 42,
 * ente al 56) non produce nessun evento, lo decide il tempo. Sta qui e
 * non dentro una pagina perché l'orologio si legge in un posto solo.
 */
export function giorniDaQuando(quando: string | null | undefined): number | null {
  if (!quando) return null;
  const t = Date.parse(quando);
  if (!Number.isFinite(t)) return null;
  return giorniFra(new Date(t), adesso());
}

/**
 * "l'11 novembre 2026", "il 12 novembre 2026": la data con l'articolo
 * giusto davanti.
 *
 * 🔴 Serve perché in italiano l'articolo si mangia la vocale, e i testi
 * lo scrivevano a mano: sulla pratica si leggeva «Se entro il 11 novembre
 * 2026 la compagnia non ti ha pagato», trovato guardando la pagina vera
 * il 13/08. È la riga della garanzia, cioè quella che una persona rilegge
 * due volte prima di fidarsi: scritta male vale meno.
 *
 * Elidono solo i giorni che si pronunciano con una vocale davanti: l'8 e
 * l'11. Il 18 no ("il diciotto"), e nemmeno l'1, che nelle date si legge
 * "il primo".
 */
export function dataItArticolo(iso: string | Date): string {
  const testo = dataIt(iso);
  const giorno = Number.parseInt(testo, 10);
  return `${giorno === 8 || giorno === 11 ? "l'" : "il "}${testo}`;
}

/**
 * "mercoledì 23 settembre 2026".
 *
 * Si usa dove la data è una cosa DA FARE, non una da leggere: il giorno
 * della settimana è come le persone si orientano davvero, e calcolarlo
 * dalla data è l'unico modo di non scrivere mai un giorno sbagliato.
 */
export function dataConGiorno(iso: string | Date): string {
  const d = typeof iso === "string" && iso.length === 10 ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: FUSO,
  });
}

/** "12 agosto 2026 alle 23:47", ora italiana. Per la cronologia. */
export function dataOraIt(iso: string | Date): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  });
}

/**
 * "domani", "fra 3 giorni", "oggi". Solo per numeri piccoli.
 *
 * ⚠️ Oltre la settimana torna `null` di proposito: "fra 42 giorni" non
 * lo sa collocare nessuno, e in quel caso serve la data col suo giorno
 * della settimana. Una parola comoda che non si capisce è peggio di una
 * data lunga che si capisce.
 */
export function fraQuanto(giorni: number): string | null {
  if (giorni < 0) return null;
  if (giorni === 0) return "oggi";
  if (giorni === 1) return "domani";
  if (giorni <= 7) return `fra ${giorni} giorni`;
  return null;
}
