import { contoViaggio, oreLeggibili, type Punto } from "../viaggio";
import { notti, type Offerta } from "./tipi";
import type { Tipo } from "../destinazioni";

/**
 * IL MOTORE. Data una ricerca e un mucchio di offerte, decide quali meritano
 * un alert e quali no.
 *
 * È deliberatamente PURO: niente database, niente rete, niente orologio.
 * Tutto quello che gli serve glielo passi. Così si prova per intero senza
 * mettere in piedi niente, ed è l'unico pezzo del prodotto che non può
 * permettersi di sbagliare: ogni suo sì costa un credito all'utente.
 */

export type Ricerca = {
  id: string;
  utenteId: string;
  partenza: Punto & { nome: string };
  budgetPersona: number;
  nottiMin: number;
  nottiMax: number;
  oreMax: number;
  persone: number;
  tipi: Tipo[];
};

export type Abbinamento = {
  ricercaId: string;
  utenteId: string;
  offerta: Offerta;
  notti: number;
  /** Alloggio a testa. */
  alloggioPersona: number;
  /** Auto a testa: benzina + pedaggi, andata e ritorno, diviso le persone. */
  autoPersona: number;
  totalePersona: number;
  /** Quanto resta sotto la soglia. Sempre ≥ 0 negli abbinamenti restituiti. */
  avanzo: number;
  km: number;
  ore: string;
};

/**
 * Quanto deve stare SOTTO la soglia perché valga la pena disturbare.
 *
 * Un'offerta a 119,50€ contro una soglia di 120€ tecnicamente passa, ma
 * bruciare un credito per 50 centesimi di margine fa sentire truffato
 * l'utente. Il margine minimo protegge lui, e quindi noi.
 */
export const MARGINE_MINIMO = 3;

export function abbina({
  ricerca,
  offerte,
  prezzoBenzina,
  giaInviate = new Set<string>(),
}: {
  ricerca: Ricerca;
  offerte: Offerta[];
  prezzoBenzina: number;
  /** Link già mandati a questo utente: non si manda due volte la stessa cosa. */
  giaInviate?: Set<string>;
}): Abbinamento[] {
  const esiti: Abbinamento[] = [];

  for (const o of offerte) {
    // 1. Solo offerte verificate. Una `demo` non esce MAI verso un utente.
    if (o.stato !== "attiva") continue;

    // 2. Niente doppioni.
    if (giaInviate.has(o.link)) continue;

    // 3. Il tipo che ha chiesto (lista vuota = tutto va bene).
    if (ricerca.tipi.length && !ricerca.tipi.includes(o.tipo)) continue;

    // 4. Le notti che voleva.
    const n = notti(o.checkIn, o.checkOut);
    if (n < ricerca.nottiMin || n > ricerca.nottiMax) continue;

    // 5. Il viaggio: distanza, ore, costo dell'auto diviso le persone.
    const conto = contoViaggio({
      da: ricerca.partenza,
      a: o,
      persone: ricerca.persone,
      prezzoBenzina,
    });
    if (conto.ore > ricerca.oreMax) continue;

    // 6. Il conto vero. Il prezzo della struttura è per l'intera camera:
    //    va diviso per le persone, non usato così com'è.
    const alloggioPersona = o.prezzoAlloggio / ricerca.persone;
    const totalePersona = alloggioPersona + conto.aPersona;
    const avanzo = ricerca.budgetPersona - totalePersona;
    if (avanzo < MARGINE_MINIMO) continue;

    esiti.push({
      ricercaId: ricerca.id,
      utenteId: ricerca.utenteId,
      offerta: o,
      notti: n,
      alloggioPersona,
      autoPersona: conto.aPersona,
      totalePersona,
      avanzo,
      km: conto.kmSolaAndata,
      ore: oreLeggibili(conto.ore),
    });
  }

  /* Il migliore è quello che lascia più soldi in tasca. Non il più vicino,
     non il più economico in assoluto: quello con più avanzo, perché è la
     promessa che abbiamo fatto sulla landing. */
  esiti.sort((a, b) => b.avanzo - a.avanzo);
  return esiti;
}

/**
 * Il migliore, e uno solo.
 *
 * Perché uno: ogni alert costa un credito. Mandarne cinque insieme svuota il
 * portafoglio dell'utente in un colpo e lo fa sentire derubato, che è il modo
 * più veloce per non farlo tornare mai più.
 */
export function ilMigliore(a: Abbinamento[]): Abbinamento | null {
  return a[0] ?? null;
}
