import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, firma, vestito } from "./modello";

/**
 * LE EMAIL DI RECUPERO: chi ha controllato un volo e non ha aperto la
 * pratica riceve un promemoria (framework CONVERTI, "recupera chi non ha
 * comprato"). Fino a due, al giorno 1 e al giorno 4; poi basta.
 *
 * DUE VOCI, MAI la stessa (scelta di Valerio):
 * - IDONEO: c'è un diritto certo, quindi la cifra si dice ("ti spettano X€,
 *   ti manca un passaggio").
 * - INCERTO: NON c'è un diritto certo, quindi NON si nomina MAI una cifra.
 *   Si propone la cosa onesta: rifare il controllo (il dato spesso si sblocca)
 *   e, se ce l'ha, caricare la carta d'imbarco.
 *
 * La seconda email aggiunge la scadenza ONESTA: due anni per legge, ma i
 * documenti del volo si recuperano sempre peggio col tempo. Una spinta vera,
 * non un'urgenza finta.
 *
 * Ogni email porta il link per disiscriversi: promemoria commerciali, la
 * legge lo vuole e la buona educazione anche.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:26px;line-height:1.22;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

const euro = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + "€";

const CODA = "Ricevi questa email perché hai controllato un volo su Rivolio e hai lasciato il tuo indirizzo.";

/** La riga di disiscrizione, se possiamo firmare il link. */
function rigaStop(linkStop: string | null): string {
  if (!linkStop) return "";
  return `<p style="margin:22px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.fumo};">Non vuoi più questi promemoria? <a href="${linkStop}" style="color:${C.fumo};">Basta un clic</a>.</p>`;
}

function stopTesto(linkStop: string | null): string {
  return linkStop ? `\n\nNon vuoi più questi promemoria? Basta un clic: ${linkStop}` : "";
}

export type DatiRecuperoIdoneo = {
  passo: 1 | 2;
  idVerifica: string;
  volo: string;
  tratta: string | null;
  importo: number;
  linkStop: string | null;
};

export type DatiRecuperoIncerto = {
  passo: 1 | 2;
  idVerifica: string;
  volo: string;
  tratta: string | null;
  linkStop: string | null;
};

type Costruita = { oggetto: string; html: string; testo: string };

/** IDONEO: il messaggio pronto, con la cifra. Separato dall'invio per poterlo
 *  provare senza spedire niente. */
export function costruisciRecuperoIdoneo(d: DatiRecuperoIdoneo): Costruita {
  const dove = d.tratta ?? `Volo ${d.volo}`;
  const link = `${casa()}/verifica/${d.idVerifica}`;
  const cifra = euro(d.importo);

  if (d.passo === 1) {
    return {
      oggetto: `${dove}: ti manca un passaggio per ${cifra}`,
      html: vestito({
        titolo: `${dove}: ti manca un passaggio`,
        corpo:
          h(`Hai controllato, ma non hai ancora aperto la pratica.`) +
          p(
            `Il tuo volo <strong style="color:${C.inchiostro}">${d.volo}</strong> ha diritto a <strong style="color:${C.inchiostro}">${cifra}</strong>. La parte difficile l'abbiamo già fatta noi: il reclamo è pronto, ti manca solo mandarlo.`,
          ) +
          bottone("Riprendi da dove eri", link) +
          p(
            `Paghi solo a risultato: se non ottieni la compensazione, la prossima pratica è su di noi.`,
          ) +
          firma() +
          rigaStop(d.linkStop),
        coda: CODA,
      }),
      testo: `${dove}: ti manca un passaggio.

Il tuo volo ${d.volo} ha diritto a ${cifra}. Il reclamo è pronto, ti manca solo mandarlo.

Riprendi da dove eri: ${link}

Paghi solo a risultato: se non ottieni la compensazione, la prossima pratica è su di noi.

Valerio
Rivolio${stopTesto(d.linkStop)}`,
    };
  }

  // passo 2: la scadenza onesta.
  return {
    oggetto: `${dove}: ${cifra} che stai lasciando alla compagnia`,
    html: vestito({
      titolo: `${dove}: ${cifra} ti aspettano ancora`,
      corpo:
        h(`Il tempo gioca a favore della compagnia.`) +
        p(
          `Per il volo <strong style="color:${C.inchiostro}">${d.volo}</strong> ti spettano <strong style="color:${C.inchiostro}">${cifra}</strong>. La legge ti dà due anni per chiederli, quindi non c'è fretta di ore. Ma più passa il tempo, più diventa difficile recuperare i documenti del volo, e la compagnia lo sa.`,
        ) +
        bottone("Riprendi il tuo caso", link) +
        p(`Due minuti tuoi, il resto lo facciamo noi. Paghi solo se i soldi arrivano.`) +
        firma() +
        rigaStop(d.linkStop),
      coda: CODA,
    }),
    testo: `${dove}: ${cifra} ti aspettano ancora.

Per il volo ${d.volo} ti spettano ${cifra}. La legge ti dà due anni, ma più passa il tempo più è difficile recuperare i documenti del volo.

Riprendi il tuo caso: ${link}

Due minuti tuoi, il resto lo facciamo noi. Paghi solo se i soldi arrivano.

Valerio
Rivolio${stopTesto(d.linkStop)}`,
  };
}

/** INCERTO: il messaggio pronto, MAI una cifra. */
export function costruisciRecuperoIncerto(d: DatiRecuperoIncerto): Costruita {
  const dove = d.tratta ?? `Volo ${d.volo}`;
  const link = `${casa()}/verifica/${d.idVerifica}`;

  if (d.passo === 1) {
    return {
      oggetto: `${dove}: riprova, il dato spesso si sblocca`,
      html: vestito({
        titolo: `${dove}: vale la pena riprovare`,
        corpo:
          h(`Il tuo controllo era rimasto incerto.`) +
          p(
            `Sul volo <strong style="color:${C.inchiostro}">${d.volo}</strong> non avevamo ancora una prova abbastanza solida. Quasi sempre è solo un volo troppo recente: l'orario ufficiale di atterraggio arriva in un paio di giorni, e allora il verdetto cambia.`,
          ) +
          p(
            `Due cose che puoi fare: <strong style="color:${C.inchiostro}">rifai il controllo</strong> fra qualche giorno, oppure, se ce l'hai, <strong style="color:${C.inchiostro}">carica la carta d'imbarco</strong> e riguardiamo il tuo caso coi tuoi documenti.`,
          ) +
          bottone("Rifai il controllo", link) +
          firma() +
          rigaStop(d.linkStop),
        coda: CODA,
      }),
      testo: `${dove}: vale la pena riprovare.

Sul volo ${d.volo} non avevamo ancora una prova abbastanza solida. Quasi sempre è solo un volo troppo recente: l'orario ufficiale arriva in un paio di giorni e il verdetto cambia.

Due cose che puoi fare: rifai il controllo fra qualche giorno, oppure carica la carta d'imbarco e riguardiamo il tuo caso.

Rifai il controllo: ${link}

Valerio
Rivolio${stopTesto(d.linkStop)}`,
    };
  }

  // passo 2: la scadenza onesta, sempre senza cifre.
  return {
    oggetto: `${dove}: un'ultima cosa sul tuo volo`,
    html: vestito({
      titolo: `${dove}: prima che sia tardi`,
      corpo:
        h(`Un promemoria, poi non ti scriviamo più.`) +
        p(
          `Il controllo sul volo <strong style="color:${C.inchiostro}">${d.volo}</strong> era rimasto incerto. Se nel frattempo il dato si è sbloccato, il verdetto potrebbe essere cambiato: vale un secondo controllo.`,
        ) +
        p(
          `La legge dà due anni per far valere questi diritti, ma i documenti del volo si recuperano sempre peggio col tempo. Se ce l'hai, la carta d'imbarco ci aiuta a riguardare il tuo caso adesso.`,
        ) +
        bottone("Ricontrolla il volo", link) +
        firma() +
        rigaStop(d.linkStop),
      coda: CODA,
    }),
    testo: `${dove}: prima che sia tardi.

Il controllo sul volo ${d.volo} era rimasto incerto. Se il dato si è sbloccato, il verdetto potrebbe essere cambiato.

La legge dà due anni, ma i documenti del volo si recuperano sempre peggio col tempo. Se ce l'hai, la carta d'imbarco ci aiuta a riguardare il tuo caso adesso.

Ricontrolla il volo: ${link}

Valerio
Rivolio${stopTesto(d.linkStop)}`,
  };
}

export function recuperoIdoneo(a: string, d: DatiRecuperoIdoneo): Promise<Esito> {
  const m = costruisciRecuperoIdoneo(d);
  return spedisci({ a, oggetto: m.oggetto, html: m.html, testo: m.testo });
}

export function recuperoIncerto(a: string, d: DatiRecuperoIncerto): Promise<Esito> {
  const m = costruisciRecuperoIncerto(d);
  return spedisci({ a, oggetto: m.oggetto, html: m.html, testo: m.testo });
}
