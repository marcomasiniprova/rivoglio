import type { MetadataRoute } from "next";
import { RADICE, tagUsati, tutti } from "@/lib/tabellone/indice";
import { AEROPORTI_OSSERVATI } from "@/lib/osservatorio/ritardi";
import { dateConSciopero } from "@/lib/scioperi/scioperi";

/**
 * La mappa del sito. Il prodotto È la home col check; da lì scendono le
 * guide, il Tabellone con tutti i suoi articoli e le pagine legali.
 *
 * Il Tabellone entra qui per intero, articolo per articolo: è il canale
 * di acquisizione, e una pagina che Google non trova non porta nessuno.
 * Le pagine di archivio (2, 3, 4...) NON entrano: sono elenchi, non
 * contenuto, e in sitemap farebbero solo rumore.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const casa = (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const articoli = tutti();
  const ultimoArticolo = articoli[0]?.data;

  /* Le pagine evento vengono dal database. Se non risponde (o in una build
     senza credenziali) l'elenco esce vuoto e la sitemap resta valida: mai
     far fallire la mappa del sito per una tabella. */
  const dateSciopero = await dateConSciopero();

  return [
    {
      url: `${casa}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // il blog: l'indice vale quanto la home, si aggiorna ogni settimana
    {
      url: `${casa}${RADICE}`,
      lastModified: ultimoArticolo ? new Date(`${ultimoArticolo}T09:00:00Z`) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...articoli.map((a) => ({
      url: `${casa}${RADICE}/${a.slug}`,
      lastModified: new Date(`${a.aggiornato ?? a.data}T09:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: a.tipo === "pilastro" ? 0.8 : 0.7,
    })),
    // gli argomenti: sono gli hub del cluster, si aggiornano a ogni pezzo
    ...tagUsati().map((t) => ({
      url: `${casa}${RADICE}/argomento/${t.chiave}`,
      lastModified: ultimoArticolo ? new Date(`${ultimoArticolo}T09:00:00Z`) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // LE PAGINE EVENTO: si generano dai nostri dati e portano traffico nel
    // momento esatto in cui la gente cerca. La pagina fissa degli scioperi
    // vale quanto il blog, perché risponde a "sciopero aerei oggi".
    {
      url: `${casa}/sciopero-aerei`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...dateSciopero.map((giorno) => ({
      url: `${casa}/sciopero-aerei/${giorno}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...AEROPORTI_OSSERVATI.map((a) => ({
      url: `${casa}/aeroporto/${a.iata.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    // le guide: contenuto da ricerca, vale più delle pagine legali
    ...["/guida-bagagli", "/giudice-di-pace"].map((percorso) => ({
      url: `${casa}${percorso}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // le pagine legali: contenuto stabile, priorità bassa
    ...["/condizioni", "/rimborsi", "/privacy", "/cookie"].map((percorso) => ({
      url: `${casa}${percorso}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.2,
    })),
  ];
}
