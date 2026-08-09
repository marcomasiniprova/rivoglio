import type { MetadataRoute } from "next";
import { RADICE, tagUsati, tutti } from "@/lib/tabellone/indice";

/**
 * La mappa del sito. Il prodotto È la home col check; da lì scendono le
 * guide, il Tabellone con tutti i suoi articoli e le pagine legali.
 *
 * Il Tabellone entra qui per intero, articolo per articolo: è il canale
 * di acquisizione, e una pagina che Google non trova non porta nessuno.
 * Le pagine di archivio (2, 3, 4...) NON entrano: sono elenchi, non
 * contenuto, e in sitemap farebbero solo rumore.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const casa = (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const articoli = tutti();
  const ultimoArticolo = articoli[0]?.data;

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
    // le guide: contenuto da ricerca, vale più delle pagine legali
    {
      url: `${casa}/guida-bagagli`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    // le pagine legali: contenuto stabile, priorità bassa
    ...["/condizioni", "/privacy", "/cookie"].map((percorso) => ({
      url: `${casa}${percorso}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.2,
    })),
  ];
}
