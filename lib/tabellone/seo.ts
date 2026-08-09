import { NOME_BLOG, RADICE, dataInItaliano } from "./indice";
import type { Articolo } from "./tipi";
import { TAG } from "./tipi";

/**
 * I dati strutturati del Tabellone.
 *
 * Cosa mettiamo e cosa no. `BlogPosting` e `BreadcrumbList` servono e sono
 * supportati. `FAQPage` lo mettiamo SOLO dove le domande esistono davvero
 * nell'articolo: Google ne ha ridotto la resa ai siti istituzionali, ma
 * resta il modo più chiaro per far leggere le risposte a un'AI, e non
 * costa niente. Niente `HowTo` (Google l'ha ritirato) e niente
 * `AggregateRating` (non abbiamo recensioni: sarebbe un dato finto).
 */

export const CASA = (
  process.env.NEXT_PUBLIC_SITO ??
  process.env.URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export const indirizzoArticolo = (slug: string) => `${CASA}${RADICE}/${slug}`;

export function datiBlog() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${CASA}${RADICE}#blog`,
    name: `${NOME_BLOG} di Rivolio`,
    description:
      "Il blog di Rivolio sui diritti del passeggero aereo: ritardi, cancellazioni, rimborsi e Regolamento CE 261/2004, spiegati senza gergo.",
    url: `${CASA}${RADICE}`,
    inLanguage: "it-IT",
    publisher: { "@id": `${CASA}/#organizzazione` },
  };
}

export function datiArticolo(a: Articolo) {
  const dati: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${indirizzoArticolo(a.slug)}#articolo`,
    headline: a.titoloSeo,
    name: a.titolo,
    description: a.descrizione,
    inLanguage: "it-IT",
    datePublished: a.data,
    dateModified: a.aggiornato ?? a.data,
    url: indirizzoArticolo(a.slug),
    mainEntityOfPage: indirizzoArticolo(a.slug),
    image: `${indirizzoArticolo(a.slug)}/opengraph-image`,
    keywords: a.tag.map((t) => TAG[t]).join(", "),
    author: { "@type": "Organization", name: "Rivolio", url: `${CASA}/` },
    publisher: { "@id": `${CASA}/#organizzazione` },
    isPartOf: { "@id": `${CASA}${RADICE}#blog` },
  };

  /* Le fonti, dichiarate: è il modo in cui un'AI capisce da dove viene
     un numero, ed è la stessa promessa che facciamo ai lettori. */
  if (a.fonti.length > 0) {
    dati.citation = a.fonti.map((f) => ({
      "@type": "CreativeWork",
      name: f.titolo,
      url: f.url,
    }));
  }

  return dati;
}

export function datiBriciole(pezzi: { nome: string; percorso: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pezzi.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.nome,
      item: `${CASA}${p.percorso}`,
    })),
  };
}

export function datiDomande(voci: { domanda: string; risposta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: voci.map((v) => ({
      "@type": "Question",
      name: v.domanda,
      acceptedAnswer: {
        "@type": "Answer",
        /* Il testo va pulito dal formato inline: **grassetto** e i link
           in Markdown dentro uno snippet di Google sono spazzatura. */
        text: v.risposta.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
      },
    })),
  };
}

/** Lo stesso escape del layout: un "<" dentro uno script non chiude il tag. */
export function scriptDati(dati: unknown): { __html: string } {
  return { __html: JSON.stringify(dati).replace(/</g, "\\u003c") };
}

/** "9 agosto 2026", per l'occhiello sotto il titolo. */
export const dataLunga = dataInItaliano;
