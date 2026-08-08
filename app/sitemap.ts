import type { MetadataRoute } from "next";

/**
 * La mappa del sito. Oggi una pagina sola: il prodotto È la home col check.
 * Quando arriveranno il diario e le pagine dei verticali, si aggiungono qui.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const casa = (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return [
    {
      url: `${casa}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
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
