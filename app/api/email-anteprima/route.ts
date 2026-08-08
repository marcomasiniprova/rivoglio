import { componiBenvenuto, componiConferma } from "@/lib/email/messaggi";

/**
 * Banco di prova delle email: si aprono nel browser invece di doverle
 * spedire per vederle. SOLO in sviluppo.
 *
 * Chiama le STESSE funzioni che compongono le email vere: se un giorno
 * il testo cambia, qui cambia da solo. Un'anteprima che si ricopia i
 * testi a mano è un'anteprima che mente dopo due settimane.
 *
 *   /api/email-anteprima?q=conferma
 *   /api/email-anteprima?q=benvenuto
 */
const SCALI = [
  { nome: "Roma Fiumicino", indice: 1.9, medianaMinuti: 33 },
  { nome: "Milano Malpensa", indice: 3.3, medianaMinuti: 58 },
  { nome: "Bergamo", indice: 2.2, medianaMinuti: 39 },
  { nome: "Venezia", indice: 1.1, medianaMinuti: 19 },
];

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Non disponibile.", { status: 404 });
  }
  const url = new URL(req.url);
  const quale = url.searchParams.get("q") ?? "benvenuto";
  const { html } =
    quale === "conferma"
      ? componiConferma(`${url.origin}/api/iscriviti/conferma?g=esempio`)
      : componiBenvenuto(SCALI, `${url.origin}/api/iscriviti/disdetta?g=esempio`);

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
