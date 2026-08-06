import { accettabile, type Offerta, type Raccoglitore } from "../tipi";
import { DESTINAZIONI } from "../../destinazioni";
import type { Tipo } from "../../destinazioni";

/**
 * Raccoglitore su Exa.
 *
 * Exa è un motore di ricerca fatto per le macchine: gli chiedi una cosa in
 * italiano e ti restituisce pagine col contenuto già estratto, invece di
 * dieci link blu da aprire uno per uno. Per noi vuol dire non dover scrivere
 * un browser automatico per ogni sito.
 *
 * COSA CERCA: strutture INDIPENDENTI italiane. Mai Booking, Airbnb o Expedia:
 * lo vietano le loro condizioni, hanno sistemi anti-bot seri, e in Europa i
 * loro elenchi sono protetti dal diritto sui database. Il giacimento vero
 * sono le decine di migliaia di hotel, B&B e agriturismi che hanno il prezzo
 * sul proprio sito e nessuno che li aggreghi.
 *
 * COSA NON FA: non si fida di quello che legge. Ogni offerta esce da qui con
 * stato `demo` e nessun alert può partire da un'offerta `demo`. La verifica
 * è un passaggio separato, ed è il punto in cui un umano o un controllo
 * automatico apre il link e conferma il prezzo.
 */

const EXA = "https://api.exa.ai/search";

/** I domini che non tocchiamo, mai. */
const VIETATI = [
  "booking.com",
  "airbnb.",
  "expedia.",
  "hotels.com",
  "agoda.",
  "trivago.",
  "tripadvisor.",
  "kayak.",
];

type RispostaExa = {
  results?: {
    url?: string;
    title?: string;
    text?: string;
    publishedDate?: string;
  }[];
};

function vietato(url: string): boolean {
  const u = url.toLowerCase();
  return VIETATI.some((d) => u.includes(d));
}

/**
 * Tira fuori un prezzo dal testo della pagina.
 *
 * Volutamente prudente: prende solo cifre scritte come prezzi veri
 * (99€, € 99, 99,50 euro) e scarta tutto il resto. Meglio perdere
 * un'offerta che inventarne una: un prezzo sbagliato in un alert è
 * l'unico errore da cui questo prodotto non si riprende.
 */
export function leggiPrezzo(testo: string): number | null {
  const trovati: number[] = [];
  const schema = /(?:€\s?|EUR\s?)(\d{1,4}(?:[.,]\d{1,2})?)|(\d{1,4}(?:[.,]\d{1,2})?)\s?(?:€|euro\b)/gi;

  for (const m of testo.matchAll(schema)) {
    const grezzo = (m[1] ?? m[2] ?? "").replace(",", ".");
    const n = Number.parseFloat(grezzo);
    // sotto i 20€ non è una notte, sopra i 1.500 non è una micro-vacanza
    if (Number.isFinite(n) && n >= 20 && n <= 1500) trovati.push(n);
  }

  if (!trovati.length) return null;
  // il più basso: le pagine mostrano spesso "a partire da"
  return Math.min(...trovati);
}

/** Che tipo di posto è, dedotto dal comune che già conosciamo. */
function tipoDi(comune: string): Tipo {
  return DESTINAZIONI.find((d) => d.nome === comune)?.tipo ?? "citta";
}

export function raccoglitoreExa(chiave: string): Raccoglitore {
  return {
    nome: "exa",
    budgetSecondi: 8,

    async raccogli({ comuni, scaduto }) {
      const raccolte: Offerta[] = [];

      for (const comune of comuni) {
        if (scaduto()) break;

        const posto = DESTINAZIONI.find((d) => d.nome === comune);
        if (!posto) continue;

        try {
          const r = await fetch(EXA, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": chiave },
            body: JSON.stringify({
              query: `hotel o B&B a ${comune} con prezzi e disponibilità, sito ufficiale della struttura`,
              numResults: 10,
              type: "auto",
              contents: { text: { maxCharacters: 2500 } },
              excludeDomains: VIETATI,
            }),
          });

          if (!r.ok) {
            console.warn(`[exa] ${comune}: HTTP ${r.status}`);
            continue;
          }

          const dati = (await r.json()) as RispostaExa;

          for (const ris of dati.results ?? []) {
            if (!ris.url || vietato(ris.url)) continue;

            const prezzo = leggiPrezzo(ris.text ?? "");
            if (prezzo === null) continue;

            /* Le date non le sappiamo leggere in modo affidabile da una
               pagina qualsiasi, e inventarle sarebbe peggio che non averle.
               Mettiamo un fine settimana vicino come segnaposto: la verifica
               le conferma o butta via l'offerta. */
            const oggi = new Date();
            const venerdi = new Date(oggi);
            venerdi.setDate(oggi.getDate() + ((5 - oggi.getDay() + 7) % 7 || 7));
            const domenica = new Date(venerdi);
            domenica.setDate(venerdi.getDate() + 2);

            const grezza: Partial<Offerta> = {
              struttura: (ris.title ?? "").slice(0, 120).trim() || `Struttura a ${comune}`,
              comune,
              lat: posto.lat,
              lng: posto.lng,
              checkIn: venerdi.toISOString().slice(0, 10),
              checkOut: domenica.toISOString().slice(0, 10),
              prezzoAlloggio: prezzo * 2, // il prezzo letto è per notte
              link: ris.url,
              tipo: tipoDi(comune),
              fonte: "exa",
              stato: "demo",
            };

            if (accettabile(grezza)) raccolte.push(grezza);
          }
        } catch (e) {
          console.warn(`[exa] ${comune} fallito:`, e);
        }
      }

      return raccolte;
    },
  };
}
