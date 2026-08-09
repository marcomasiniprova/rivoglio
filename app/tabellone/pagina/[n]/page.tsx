import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GrigliaArticoli from "@/components/tabellone/GrigliaArticoli";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import StrisciaArgomenti from "@/components/tabellone/StrisciaArgomenti";
import { NOME_BLOG, RADICE, pagina, quantePagine } from "@/lib/tabellone/indice";
import { datiBriciole, scriptDati } from "@/lib/tabellone/seo";

/**
 * Le pagine dell'archivio, dalla seconda in poi. La prima è la home del
 * Tabellone: se `/tabellone/pagina/1` fosse una pagina vera avremmo due
 * indirizzi con lo stesso contenuto, cioè un doppione agli occhi di
 * Google. Quindi la 1 non esiste e chi ci arriva trova un 404.
 */

export function generateStaticParams() {
  const totale = quantePagine();
  return Array.from({ length: Math.max(0, totale - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `${NOME_BLOG}, pagina ${n} | Rivolio`,
    description: `L'archivio del ${NOME_BLOG}, il blog di Rivolio sui diritti del passeggero aereo. Pagina ${n}.`,
    alternates: { canonical: `${RADICE}/pagina/${n}` },
    robots: { index: false, follow: true },
  };
}

export default async function PaginaArchivio({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const numero = Number(n);
  const totale = quantePagine();

  if (!Number.isInteger(numero) || numero < 2 || numero > totale) notFound();

  const articoli = pagina(numero);
  if (articoli.length === 0) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: NOME_BLOG, percorso: RADICE },
            { nome: `Pagina ${numero}`, percorso: `${RADICE}/pagina/${numero}` },
          ]),
        )}
      />

      <section className="px-5 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-[1216px]">
          <p className="text-[15px] font-semibold text-verde-scuro">{NOME_BLOG}</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4.6vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.035em] text-verde-notte">
            L&apos;archivio, <span className="corsivo font-normal">pagina {numero}</span>
          </h1>
        </div>
      </section>

      <StrisciaArgomenti />

      <GrigliaArticoli
        titolo="Tutti gli articoli"
        articoli={articoli}
        corrente={numero}
        totalePagine={totale}
      />
      <SezioneNewsletter />
    </>
  );
}
