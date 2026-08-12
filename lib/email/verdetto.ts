import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, vestito } from "./modello";

/**
 * L'EMAIL DEL VERDETTO: quella che l'utente aspetta e che non arrivava.
 *
 * 🔴 Valerio, 12/08: «quando uno ha diritto ai soldi e gli dice spunta la
 * casella e lascia la tua email, che succede? Quella esatta email perché
 * serve, come viene usata e dove viene usata? Cioè se metto una email e
 * controllo la posta non vedo nulla, non arriva letteralmente niente».
 *
 * Aveva ragione, e la cosa peggiore è che l'indirizzo lo usavamo davvero:
 * lo scrivevamo sulla riga della verifica e lo riprendevamo al pagamento
 * per aprire l'account. Solo che fino a quel momento, per chi l'aveva
 * lasciato, non succedeva niente di visibile. Chiedere un indirizzo e non
 * scrivere è il modo più veloce per far pensare che il sito sia finto.
 *
 * Adesso l'email parte subito, e fa tre lavori in uno:
 * 1. **Dà la prova che il sito funziona.** Trenta secondi dopo il check
 *    c'è una cosa vera nella posta, con dentro il numero del volo.
 * 2. **Riporta l'utente dov'era.** Il link riapre la pagina esatta del
 *    verdetto. È anche l'unico modo di riprendere da un altro
 *    dispositivo: il check non ha account, quindi senza questa email chi
 *    chiude la pagina ha perso tutto.
 * 3. **Dice cosa succede all'indirizzo**, per iscritto: serve a
 *    riprendere e, se apre la pratica, a mandargli gli aggiornamenti.
 *    Niente altro.
 *
 * ⚠️ Nel titolo NON c'è il numero del volo, c'è la tratta. «FR4001» è un
 * codice da pilota; «Bergamo → Lanzarote» lo riconosce chiunque
 * dall'anteprima della posta, senza aprire (regola dell'utente medio,
 * 8/08).
 *
 * ⚠️ Se la spedizione fallisce, chi chiama NON deve fallire: l'email è un
 * di più, il verdetto è già sullo schermo. Vedi la rotta che la usa.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

const euro = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + "€";

const CODA =
  "Ricevi questa email perché l'hai lasciata dopo un controllo su Rivolio. Non ti iscrive a niente.";

export type DatiVerdetto = {
  /** L'id della verifica: da qui esce il link che riapre il verdetto. */
  idVerifica: string;
  /** "FR4001". Serve dentro l'email, non nel titolo. */
  volo: string;
  /** "Bergamo → Lanzarote", già in italiano. Senza, si ripiega sul volo. */
  tratta: string | null;
  /** La fascia dell'art. 7, a passeggero. */
  importo: number;
  /** Il ritardo già scritto in parole ("3 ore e 52 minuti"). */
  ritardo: string | null;
};

/**
 * Parte subito dopo che l'utente ha lasciato l'indirizzo su un verdetto
 * idoneo. Solo sugli idonei: su un incerto scriveremmo per dire "non lo
 * so", che è un'email che nessuno vuole ricevere.
 */
export function verdettoIdoneo(a: string, d: DatiVerdetto): Promise<Esito> {
  const dove = d.tratta ?? `Volo ${d.volo}`;
  const link = `${casa()}/verifica/${d.idVerifica}`;
  const ritardo = d.ritardo
    ? ` Il ritardo verificato all'arrivo è di <strong style="color:${C.inchiostro}">${d.ritardo}</strong>.`
    : "";

  return spedisci({
    a,
    oggetto: `${dove}: ti spettano ${euro(d.importo)}`,
    html: vestito({
      titolo: `${dove}: ${euro(d.importo)}`,
      corpo:
        h(`Il tuo volo vale ${euro(d.importo)}.`) +
        p(
          `${dove}, volo <strong style="color:${C.inchiostro}">${d.volo}</strong>.${ritardo} La fascia la fissa l'articolo 7 del Regolamento CE 261/2004, in base al ritardo e alla distanza della tratta.`,
        ) +
        bottone("Riapri il tuo risultato", link) +
        p(
          "Questo link riapre la pagina esatta dove eri, anche da un altro telefono o computer. Tienilo: senza, il risultato lo ritrovi solo rifacendo il controllo.",
        ) +
        p(
          `<strong style="color:${C.inchiostro}">A cosa serve il tuo indirizzo:</strong> a mandarti questo link, e a tenerti aggiornato sulla pratica se decidi di aprirla. A nient'altro. Non finisci in nessuna lista.`,
        ) +
        p(
          `<strong style="color:${C.inchiostro}">Una cosa da sapere sui tempi:</strong> le compagnie rispondono in otto-quattordici settimane, e la legge dà due anni per far valere il diritto. Non c'è fretta di ore, ma più passa il tempo più è difficile recuperare i documenti del volo.`,
        ),
      coda: CODA,
    }),
    testo: `Il tuo volo vale ${euro(d.importo)}.

${dove}, volo ${d.volo}.${d.ritardo ? ` Ritardo verificato all'arrivo: ${d.ritardo}.` : ""}
La fascia la fissa l'articolo 7 del Regolamento CE 261/2004, in base al ritardo e alla distanza della tratta.

Riapri il tuo risultato: ${link}

Questo link riapre la pagina esatta dove eri, anche da un altro dispositivo.

A cosa serve il tuo indirizzo: a mandarti questo link, e a tenerti aggiornato sulla pratica se decidi di aprirla. A nient'altro.

Le compagnie rispondono in otto-quattordici settimane; la legge dà due anni per far valere il diritto.`,
  });
}
