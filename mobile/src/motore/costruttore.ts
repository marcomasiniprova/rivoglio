import { DESTINAZIONI, type Destinazione, type Tipo } from "./destinazioni";
import { contoViaggio, oreLeggibili, type Conto, type Punto } from "./viaggio";

/**
 * Il costruttore di micro-vacanze.
 *
 * Cosa fa: dato da dove parti, quanto puoi spendere e cosa ti va di fare,
 * trova i posti che rientrano DAVVERO nei tuoi limiti e ti dice quanto ti
 * resta per dormire, una volta pagata l'auto.
 *
 * Cosa NON fa e non farà mai: inventarsi il prezzo di un alloggio.
 * Un prezzo senza una struttura vera dietro è un numero falso (regola #2),
 * e questo prodotto vende proprio il contrario.
 */

/** Comuni di partenza. Coordinate del centro città. */
export const PARTENZE: (Punto & { nome: string; isola?: boolean })[] = [
  { nome: "Milano", lat: 45.464, lng: 9.19 },
  { nome: "Roma", lat: 41.903, lng: 12.496 },
  { nome: "Napoli", lat: 40.852, lng: 14.268 },
  { nome: "Torino", lat: 45.07, lng: 7.686 },
  { nome: "Genova", lat: 44.407, lng: 8.934 },
  { nome: "Bologna", lat: 44.494, lng: 11.343 },
  { nome: "Firenze", lat: 43.77, lng: 11.256 },
  { nome: "Bari", lat: 41.117, lng: 16.872 },
  { nome: "Venezia", lat: 45.44, lng: 12.316 },
  { nome: "Verona", lat: 45.438, lng: 10.993 },
  { nome: "Padova", lat: 45.407, lng: 11.876 },
  { nome: "Trieste", lat: 45.649, lng: 13.777 },
  { nome: "Brescia", lat: 45.539, lng: 10.22 },
  { nome: "Parma", lat: 44.801, lng: 10.328 },
  { nome: "Modena", lat: 44.647, lng: 10.925 },
  { nome: "Reggio Emilia", lat: 44.698, lng: 10.631 },
  { nome: "Perugia", lat: 43.112, lng: 12.389 },
  { nome: "Livorno", lat: 43.548, lng: 10.31 },
  { nome: "Rimini", lat: 44.06, lng: 12.565 },
  { nome: "Ferrara", lat: 44.836, lng: 11.619 },
  { nome: "Salerno", lat: 40.681, lng: 14.759 },
  { nome: "Bergamo", lat: 45.698, lng: 9.677 },
  { nome: "Pescara", lat: 42.464, lng: 14.214 },
  { nome: "Trento", lat: 46.067, lng: 11.122 },
  { nome: "Vicenza", lat: 45.546, lng: 11.535 },
  { nome: "Bolzano", lat: 46.498, lng: 11.355 },
  { nome: "Ancona", lat: 43.616, lng: 13.518 },
  { nome: "Udine", lat: 46.063, lng: 13.235 },
  { nome: "Pisa", lat: 43.716, lng: 10.396 },
  { nome: "Lucca", lat: 43.844, lng: 10.502 },
  { nome: "Como", lat: 45.808, lng: 9.085 },
  { nome: "Treviso", lat: 45.667, lng: 12.243 },
  { nome: "Varese", lat: 45.821, lng: 8.825 },
  { nome: "Novara", lat: 45.446, lng: 8.622 },
  { nome: "Piacenza", lat: 45.052, lng: 9.693 },
  { nome: "La Spezia", lat: 44.107, lng: 9.828 },
  { nome: "Arezzo", lat: 43.463, lng: 11.879 },
  { nome: "Terni", lat: 42.563, lng: 12.643 },
  { nome: "Lecce", lat: 40.352, lng: 18.174 },
  { nome: "Foggia", lat: 41.462, lng: 15.545 },
  { nome: "Potenza", lat: 40.639, lng: 15.805 },
  { nome: "L'Aquila", lat: 42.351, lng: 13.398 },
  { nome: "Aosta", lat: 45.735, lng: 7.313 },
  { nome: "Palermo", lat: 38.116, lng: 13.361, isola: true },
  { nome: "Catania", lat: 37.507, lng: 15.083, isola: true },
  { nome: "Cagliari", lat: 39.224, lng: 9.122, isola: true },
];

export type Richiesta = {
  partenza: string;
  budgetPersona: number;
  notti: number;
  persone: number;
  tipi: Tipo[];
  oreMax: number;
  prezzoBenzina: number;
};

export type Proposta = {
  destinazione: Destinazione;
  conto: Conto;
  ore: string;
  restaPerDormire: number;
  restaPerNotte: number;
};

export type Esito =
  | { ok: true; proposte: Proposta[]; avviso?: string }
  | { ok: false; motivo: string };

/** Sotto questa cifra a notte a testa non si trova niente di decente. */
const MINIMO_A_NOTTE = 22;

export function costruisci(r: Richiesta): Esito {
  const partenza = PARTENZE.find((p) => p.nome.toLowerCase() === r.partenza.toLowerCase());
  if (!partenza) return { ok: false, motivo: `Non conosco ancora "${r.partenza}".` };

  if (partenza.isola) {
    return {
      ok: false,
      motivo:
        "Parti da un'isola: in auto non raggiungi la penisola senza traghetto, e per ora non calcolo i traghetti. La copertura per le isole arriverà, ma non ti prendo in giro adesso.",
    };
  }

  const candidate = DESTINAZIONI.filter((d) => {
    if (d.isola) return false;
    if (r.tipi.length && !r.tipi.includes(d.tipo)) return false;
    // non proporre il posto da cui parti
    return d.nome.toLowerCase() !== partenza.nome.toLowerCase();
  });

  const valutate = candidate
    .map((destinazione) => {
      const conto = contoViaggio({
        da: partenza,
        a: destinazione,
        persone: r.persone,
        prezzoBenzina: r.prezzoBenzina,
      });
      const restaPerDormire = r.budgetPersona - conto.aPersona;
      return {
        destinazione,
        conto,
        ore: oreLeggibili(conto.ore),
        restaPerDormire,
        restaPerNotte: restaPerDormire / r.notti,
      };
    })
    .filter((p) => p.conto.ore <= r.oreMax)
    .filter((p) => p.restaPerNotte >= MINIMO_A_NOTTE);

  if (!valutate.length) {
    const soloOre = candidate
      .map((d) => contoViaggio({ da: partenza, a: d, persone: r.persone, prezzoBenzina: r.prezzoBenzina }))
      .filter((c) => c.ore <= r.oreMax);

    return {
      ok: false,
      motivo: soloOre.length
        ? `Entro ${r.oreMax}h da ${partenza.nome} ci sono posti, ma con ${r.budgetPersona}€ a persona dopo l'auto non ti resterebbe abbastanza per dormire. Prova ad alzare il budget o a partire in più persone: l'auto si divide.`
        : `Entro ${r.oreMax}h da ${partenza.nome} non ho ancora destinazioni di questo tipo. Prova ad allargare il raggio o a togliere qualche filtro.`,
    };
  }

  // il posto migliore è quello che ti lascia più soldi per dormire
  valutate.sort((a, b) => b.restaPerNotte - a.restaPerNotte);

  // meglio tre regioni diverse che tre paesi della stessa valle
  const scelte: Proposta[] = [];
  const regioniUsate = new Set<string>();
  for (const p of valutate) {
    if (regioniUsate.has(p.destinazione.regione)) continue;
    scelte.push(p);
    regioniUsate.add(p.destinazione.regione);
    if (scelte.length === 3) break;
  }
  for (const p of valutate) {
    if (scelte.length === 3) break;
    if (!scelte.includes(p)) scelte.push(p);
  }

  return { ok: true, proposte: scelte };
}
