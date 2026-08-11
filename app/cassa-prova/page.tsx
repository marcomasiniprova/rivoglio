import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CassaProva from "@/components/rivolio/CassaProva";
import { conteggioCheck } from "@/lib/check/conteggio";
import { prezzoCheck } from "@/lib/check/ingresso";

/**
 * LA CASSA DI PROVA: la pagina.
 *
 * Fa vedere il giro intero senza un venditore vero. Non è una
 * simulazione "quasi vera": porta un bollo giallo che dice cos'è, e la
 * porta si apre solo con la chiave che sa Valerio.
 *
 * Senza `CASSA_PROVA_SEGRETO` la pagina NON esiste: 404, come qualsiasi
 * indirizzo inventato. Il giorno del venditore vero si toglie la
 * variabile e sparisce da sola.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cassa di prova | Rivolio",
  robots: { index: false, follow: false },
};

export default async function PaginaCassaProva({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const segreto = process.env.CASSA_PROVA_SEGRETO ?? "";
  const { s } = await searchParams;
  if (!segreto || s !== segreto) notFound();

  const { pagati } = await conteggioCheck();
  const prezzo = prezzoCheck(pagati);

  return <CassaProva prezzoTesto={prezzo.prezzoTesto} segreto={segreto} />;
}
