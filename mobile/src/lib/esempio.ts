/**
 * LA PRATICA DIMOSTRATIVA.
 *
 * Esiste per un motivo solo: la lavagna del sito (/anteprima-app) deve
 * poter mostrare le schermate che vivono DENTRO una pratica pagata (i
 * quattro fogli, il no della compagnia, la conciliazione, gli esiti).
 * Senza un account e una pratica vera quelle schermate non si vedono, e
 * senza vederle non si possono giudicare.
 *
 * ⚠️ REGOLA 3 DEL PROGETTO: niente dati finti che sembrano veri. Per
 * questo la pratica qui sotto:
 * - ha l'identificativo `esempio`, che nessun database può produrre;
 * - vola su ZZ250, e ZZ non è un codice IATA assegnato a nessuno (sono i
 *   nostri voli dimostrativi, gli stessi della landing);
 * - porta `esempio: true`, e la schermata ci mette sopra un bollo
 *   "ESEMPIO DIMOSTRATIVO" che non si può togliere.
 * L'app non la carica MAI da sola: ci si arriva solo scrivendo
 * `/pratica/esempio` nell'indirizzo, cosa che fa la lavagna e nessun
 * altro.
 *
 * I testi dei fogli sono accorciati: il foglio vero lo scrive il server
 * col generatore deterministico, e riprodurlo qui parola per parola
 * significherebbe avere due lettere che possono divergere in silenzio.
 */
import type { SchedaPratica } from "@/lib/api";

/** L'identificativo che accende la pratica dimostrativa. */
export const ID_ESEMPIO = "esempio";

const GIORNO = 86_400_000;
/** Date costruite all'indietro dal momento in cui si guarda. */
function giorniFa(n: number): string {
  return new Date(Date.now() - n * GIORNO).toISOString();
}

const RECLAMO = `Spett.le Compagnia,

il sottoscritto Mario Rossi, passeggero del volo ZZ250 del 12 marzo 2026
da Bergamo a Lanzarote, richiede la compensazione pecuniaria di 400,00
euro prevista dall'articolo 7 del Regolamento CE 261/2004.

Il volo è atterrato con 3 ore e 20 minuti di ritardo rispetto all'orario
previsto, come risulta dai dati di tracciamento del volo.

In attesa di riscontro entro 30 giorni.

Questo documento non costituisce parere legale.`;

const SOLLECITO = `Spett.le Compagnia,

in data odierna non risulta pervenuto alcun riscontro alla richiesta
inviata il giorno indicato in oggetto.

Si rammenta che, ai sensi dell'articolo 5 paragrafo 3 del Regolamento,
l'onere della prova delle circostanze eccezionali è a carico del vettore,
e l'esonero richiede anche la dimostrazione di aver adottato tutte le
misure ragionevoli.

Questo documento non costituisce parere legale.`;

const SEGNALAZIONE = `All'Ente nazionale per l'aviazione civile,

si segnala la mancata risposta del vettore alla richiesta di
compensazione relativa al volo ZZ250 del 12 marzo 2026.

Si è consapevoli che l'accertamento dell'Ente non comporta la
liquidazione della compensazione.

Questo documento non costituisce parere legale.`;

/** La pratica dimostrativa, nello stato chiesto dalla lavagna. */
export function schedaEsempio(scena: string): SchedaPratica & { esempio: true } {
  const pagata = scena === "pagata";
  const rimborsata = scena === "rimborsata";
  const rifiutata = scena === "rifiuto" || scena === "conciliazione";

  const eventi = [
    { tipo: "creata", nota: null, creato_il: giorniFa(46) },
    { tipo: "pagata", nota: null, creato_il: giorniFa(45) },
    { tipo: "lettera_pronta", nota: null, creato_il: giorniFa(45) },
    { tipo: "inviata", nota: "Inviata dal passeggero", creato_il: giorniFa(44) },
  ];
  if (rifiutata) {
    eventi.push({ tipo: "rifiuto", nota: "Guasto tecnico dichiarato", creato_il: giorniFa(9) });
  }
  if (pagata) {
    eventi.push({ tipo: "pagata_compagnia", nota: "400,00 euro", creato_il: giorniFa(2) });
  }
  if (rimborsata) {
    eventi.push({ tipo: "garanzia_rimborsata", nota: null, creato_il: giorniFa(1) });
  }

  return {
    esempio: true,
    pratica: {
      id: ID_ESEMPIO,
      stato: pagata ? "esito_pagata" : rimborsata ? "rimborsata" : "inviata",
      tipo: "singola",
      importo: 400,
      passeggeri: 1,
      garanziaFinoAl: null,
      inviataIl: giorniFa(44),
      creataIl: giorniFa(46),
      volo: { iata: "ZZ250", data: "2026-03-12", da: "Bergamo", a: "Lanzarote" },
    },
    eventi,
    lettera: {
      oggetto: "Richiesta di compensazione ex Reg. CE 261/2004 - volo ZZ250 del 12/03/2026",
      corpo: RECLAMO,
      allegati: ["Carta d'imbarco", "Documento d'identità"],
      compagnia: {
        nome: "Compagnia dimostrativa",
        canale: "Modulo online",
        url: "https://example.com",
        email: null,
        indirizzoPostale: null,
      },
    },
    sollecito: { oggetto: "Sollecito - volo ZZ250 del 12/03/2026", corpo: SOLLECITO },
    segnalazione: {
      oggetto: "Segnalazione all'ente nazionale - volo ZZ250 del 12/03/2026",
      corpo: SEGNALAZIONE,
    },
    conciliazione: {
      nome: "Autorità di regolazione dei trasporti",
      sigla: "ART",
      url: "https://www.autorita-trasporti.it",
      titolo: "La conciliazione, gratuita e da casa",
      premessa:
        "È il passaggio che può farti arrivare i soldi senza andare dal giudice. Si fa online con SPID e non costa niente.",
      passi: [
        "Entra su ConciliaWeb con SPID o CIE.",
        "Apri una nuova istanza scegliendo il trasporto aereo.",
        "Allega il reclamo che hai già mandato e la risposta ricevuta.",
        "Segui gli incontri: si tengono online.",
      ],
      costo: "Gratuita",
      scadenza: "Entro un anno dal reclamo",
      avvertenza:
        "La domanda va presentata entro un anno dal reclamo: è più corto dei due anni per fare causa.",
      fonte: "Autorità di regolazione dei trasporti",
    },
    giorniDallInvio: 44,
    rifiutoMotivo: rifiutata ? "guasto_tecnico" : null,
  };
}

/** L'elenco dimostrativo per la schermata delle pratiche. */
export function praticheEsempio() {
  return [
    {
      id: ID_ESEMPIO,
      stato: "inviata",
      tipo: "singola" as const,
      importo_fascia: 400,
      creata_il: giorniFa(46),
      inviata_il: giorniFa(44),
      volo: { volo_iata: "ZZ250", data_locale: "2026-03-12" },
    },
    {
      id: `${ID_ESEMPIO}-2`,
      stato: "esito_pagata",
      tipo: "famiglia" as const,
      importo_fascia: 250,
      creata_il: giorniFa(120),
      inviata_il: giorniFa(118),
      volo: { volo_iata: "ZZ100", data_locale: "2026-01-04" },
    },
  ];
}
