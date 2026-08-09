import { ARTICOLI } from "./articoli";
import { TAG, type Articolo, type ChiaveTag } from "./tipi";

/**
 * L'indice del Tabellone: le sole funzioni con cui le pagine leggono
 * gli articoli. Nessuna pagina tocca l'array direttamente, così l'ordine
 * e la paginazione hanno un posto solo dove essere sbagliati.
 */

/** Sei card per pagina: due file da tre, come nel riferimento. */
export const PER_PAGINA = 6;

export const NOME_BLOG = "Il Tabellone";
export const RADICE = "/tabellone";
/** La firma degli articoli (scelta di Valerio, 9/08). */
export const FIRMA = "La redazione di Rivolio";

/** Gli indirizzi, per generare le pagine in fase di build. */
export const ARTICOLI_SLUG: string[] = ARTICOLI.map((a) => a.slug);

/** Dal più recente al più vecchio. È l'unico ordine che esiste. */
export function tutti(): Articolo[] {
  return [...ARTICOLI].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
}

export function perSlug(slug: string): Articolo | undefined {
  return ARTICOLI.find((a) => a.slug === slug);
}

/** I tre in evidenza: quelli marcati, completati coi più recenti. */
export function inEvidenza(): Articolo[] {
  const ordinati = tutti();
  const marcati = ordinati.filter((a) => a.inEvidenza);
  const resto = ordinati.filter((a) => !a.inEvidenza);
  return [...marcati, ...resto].slice(0, 3);
}

export function perTag(tag: ChiaveTag): Articolo[] {
  return tutti().filter((a) => a.tag.includes(tag));
}

/** I tag effettivamente usati, con quanti articoli hanno dentro. */
export function tagUsati(): { chiave: ChiaveTag; nome: string; quanti: number }[] {
  const conto = new Map<ChiaveTag, number>();
  for (const a of ARTICOLI) {
    for (const t of a.tag) conto.set(t, (conto.get(t) ?? 0) + 1);
  }
  return [...conto.entries()]
    .map(([chiave, quanti]) => ({ chiave, nome: TAG[chiave], quanti }))
    .sort((a, b) => b.quanti - a.quanti || a.nome.localeCompare(b.nome, "it"));
}

export function quantePagine(totale = ARTICOLI.length): number {
  return Math.max(1, Math.ceil(totale / PER_PAGINA));
}

/** La fetta della pagina n (1 based). Fuori intervallo torna vuoto. */
export function pagina(n: number, elenco: Articolo[] = tutti()): Articolo[] {
  if (!Number.isInteger(n) || n < 1) return [];
  return elenco.slice((n - 1) * PER_PAGINA, n * PER_PAGINA);
}

/**
 * Gli articoli correlati: prima quelli dichiarati a mano dall'autore,
 * poi si completa con chi condivide i tag. Sono i link interni del
 * cluster: senza, ogni articolo è un vicolo cieco.
 */
export function correlati(articolo: Articolo, quanti = 3): Articolo[] {
  const dichiarati = (articolo.correlati ?? [])
    .map((s) => perSlug(s))
    .filter((a): a is Articolo => Boolean(a));

  if (dichiarati.length >= quanti) return dichiarati.slice(0, quanti);

  const presi = new Set([articolo.slug, ...dichiarati.map((a) => a.slug)]);
  const affini = tutti()
    .filter((a) => !presi.has(a.slug))
    .map((a) => ({ a, punti: a.tag.filter((t) => articolo.tag.includes(t)).length }))
    .filter((x) => x.punti > 0)
    .sort((x, y) => y.punti - x.punti)
    .map((x) => x.a);

  return [...dichiarati, ...affini].slice(0, quanti);
}

/* Le date stanno in `lib/date.ts`: le usano anche le pagine evento, e
   importarle da qui si tirerebbe dietro tutti e dieci gli articoli per
   formattare un giorno. Qui si ri-esportano e basta. */
export { dataInItaliano, dataCorta } from "../date";
