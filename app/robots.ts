import type { MetadataRoute } from "next";

/**
 * Chi può leggere cosa. La landing e i risultati condivisi sono pubblici;
 * l'area utente, l'admin e le API no. I crawler delle AI restano AMMESSI
 * di proposito: quando qualcuno chiede a un'AI "come mi faccio rimborsare
 * un volo", vogliamo essere la risposta citata.
 */
export default function robots(): MetadataRoute.Robots {
  const casa = (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/app", "/entra", "/pratica/", "/api/"],
      },
    ],
    sitemap: `${casa}/sitemap.xml`,
  };
}
