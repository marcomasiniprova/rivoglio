import type { Metadata } from "next";
import { contenutoVerifica } from "../contenuto";

/**
 * /verifica/[id]: la pagina del risultato con l'id NELL'INDIRIZZO.
 * La usano i link demo, quelli via email e quelli condivisi, dove l'id serve
 * per ritrovare il risultato da qualsiasi dispositivo. Dopo un check appena
 * fatto, invece, si passa da `/verifica` (indirizzo pulito): vedi
 * app/verifica/page.tsx. Il contenuto è lo stesso, sta in ../contenuto.tsx.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Il titolo non anticipa il verdetto: il reveal avviene nella pagina.
  title: "Il risultato del tuo check | Rivolio",
  robots: { index: false },
};

export default async function PaginaVerificaId({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { checkout } = await searchParams;
  return contenutoVerifica(id, checkout);
}
