/**
 * Calcolo del viaggio in auto.
 *
 * Funzione pura: stessi input, stesso output. Qui un errore significa prezzi
 * sbagliati mostrati agli utenti, quindi è coperta da test (prove/viaggio.spec.ts).
 *
 * TUTTI i valori qui sotto sono STIME e vanno presentati come tali.
 * Non sono prezzi garantiti e il sito deve dirlo.
 */

export type Punto = { lat: number; lng: number };

/** Costanti dichiarate, non nascoste nel codice. */
export const IPOTESI = {
  /** Le strade non sono linee rette. Fattore di allungamento medio italiano. */
  fattoreStrada: 1.25,
  /** Utilitaria a benzina, valore prudenziale (meglio sovrastimare il costo). */
  consumoKmL: 15,
  /** Tariffa autostradale media per veicolo di classe A, ordine di grandezza. */
  pedaggioAlKm: 0.08,
  /** Sotto questa distanza si assume percorso urbano/extraurbano, senza pedaggi. */
  kmSenzaPedaggio: 30,
  /** Velocità media reale porta a porta, soste escluse. */
  kmOrari: 78,
} as const;

const R_TERRA_KM = 6371;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distanza in linea d'aria fra due punti (formula dell'emisenoverso). */
export function distanzaAria(a: Punto, b: Punto): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** Chilometri di strada stimati a partire dalla linea d'aria. */
export function kmStrada(a: Punto, b: Punto): number {
  return distanzaAria(a, b) * IPOTESI.fattoreStrada;
}

export type Conto = {
  kmSolaAndata: number;
  kmTotali: number;
  ore: number;
  litri: number;
  benzina: number;
  pedaggi: number;
  totale: number;
  aPersona: number;
};

/**
 * Costo dell'andata e ritorno in auto.
 * @param prezzoBenzina euro al litro. VA LETTO DALL'OSSERVATORIO MIMIT,
 *        non scritto fisso da nessuna parte.
 */
export function contoViaggio({
  da,
  a,
  persone,
  prezzoBenzina,
  consumoKmL = IPOTESI.consumoKmL,
}: {
  da: Punto;
  a: Punto;
  persone: number;
  prezzoBenzina: number;
  consumoKmL?: number;
}): Conto {
  if (persone < 1) throw new Error("Le persone devono essere almeno 1.");
  if (prezzoBenzina <= 0) throw new Error("Il prezzo della benzina deve essere positivo.");
  if (consumoKmL <= 0) throw new Error("Il consumo deve essere positivo.");

  const kmSolaAndata = kmStrada(da, a);
  const kmTotali = kmSolaAndata * 2;
  const litri = kmTotali / consumoKmL;
  const benzina = litri * prezzoBenzina;

  // I pedaggi si pagano solo sulla parte autostradale: sotto la soglia, zero.
  const kmPedaggio = Math.max(0, kmSolaAndata - IPOTESI.kmSenzaPedaggio) * 2;
  const pedaggi = kmPedaggio * IPOTESI.pedaggioAlKm;

  const totale = benzina + pedaggi;

  return {
    kmSolaAndata,
    kmTotali,
    ore: kmSolaAndata / IPOTESI.kmOrari,
    litri,
    benzina,
    pedaggi,
    totale,
    aPersona: totale / persone,
  };
}

/** 2.35 ore -> "2h21". Le ore di viaggio si mostrano così, mai in decimali. */
export function oreLeggibili(ore: number): string {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  if (m === 60) return `${h + 1}h00`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
