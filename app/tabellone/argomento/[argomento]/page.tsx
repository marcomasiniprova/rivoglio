import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import GrigliaArticoli from "@/components/tabellone/GrigliaArticoli";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import { PillolaTag } from "@/components/tabellone/CardArticolo";
import { NOME_BLOG, RADICE, perTag, tagUsati } from "@/lib/tabellone/indice";
import { datiBriciole, scriptDati } from "@/lib/tabellone/seo";
import { TAG, type ChiaveTag } from "@/lib/tabellone/tipi";

/**
 * LE PAGINE ARGOMENTO: sono gli "hub" del modello hub and spoke.
 * Ogni articolo linka la sua pagina argomento e ogni pagina argomento
 * linka i suoi articoli: è il collante che dice a Google che su questo
 * tema abbiamo una biblioteca, non un pezzo isolato.
 */

/** La riga sotto il titolo: cosa aspettarsi da questo argomento. */
const SPIEGA: Record<ChiaveTag, string> = {
  diritti:
    "Cosa prevede davvero il Regolamento CE 261/2004, in italiano e senza articoli di legge in mezzo alle frasi.",
  ritardo:
    "Il volo è arrivato tardi: quando conta, da che ora si misura e quanto vale a seconda della tratta.",
  cancellazione:
    "Il volo non è partito: cosa ti devono subito, cosa in più, e le due domande che decidono tutto.",
  compagnie:
    "Come si scrive a ogni compagnia, dove finisce il reclamo e cosa rispondono di solito.",
  scioperi:
    "Scioperi del personale, dei controllori e degli addetti di terra: quali fermano la compensazione e quali no.",
  rimborsi:
    "Rimborso del biglietto, compensazione, assistenza: tre cose diverse che quasi tutti confondono.",
  aeroporti: "Come si vola dagli scali italiani, scalo per scalo, coi dati che raccogliamo.",
  dati: "I numeri veri dei ritardi e delle cancellazioni, con le fonti aperte.",
  guida: "Le guide lunghe: si leggono una volta e servono per anni.",
  emergenza:
    "Sei bloccato adesso: le cose da fare al gate, prima di uscire dall'aeroporto.",
};

export function generateStaticParams() {
  return tagUsati().map((t) => ({ argomento: t.chiave }));
}

function valida(x: string): x is ChiaveTag {
  return Object.prototype.hasOwnProperty.call(TAG, x);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ argomento: string }>;
}): Promise<Metadata> {
  const { argomento } = await params;
  if (!valida(argomento)) return {};
  return {
    title: `${TAG[argomento]} | ${NOME_BLOG} di Rivolio`,
    description: SPIEGA[argomento],
    alternates: { canonical: `${RADICE}/argomento/${argomento}` },
    openGraph: { title: `${TAG[argomento]} | ${NOME_BLOG}`, description: SPIEGA[argomento] },
  };
}

export default async function PaginaArgomento({
  params,
}: {
  params: Promise<{ argomento: string }>;
}) {
  const { argomento } = await params;
  if (!valida(argomento)) notFound();

  const articoli = perTag(argomento);
  if (articoli.length === 0) notFound();

  const altri = tagUsati().filter((t) => t.chiave !== argomento);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: NOME_BLOG, percorso: RADICE },
            { nome: TAG[argomento], percorso: `${RADICE}/argomento/${argomento}` },
          ]),
        )}
      />

      <section className="px-5 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-[1216px]">
          <p className="text-[15px] font-semibold text-verde-scuro">{NOME_BLOG}</p>
          <h1 className="mt-2 max-w-[820px] font-display text-[clamp(2.1rem,5vw,3.2rem)] font-bold leading-[1.04] tracking-[-0.04em] text-verde-notte">
            {TAG[argomento]}
          </h1>
          <p className="mt-4 max-w-[620px] text-[17.5px] leading-relaxed text-verde-notte/70">
            {SPIEGA[argomento]}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {altri.map((t) => (
              <Link key={t.chiave} href={`${RADICE}/argomento/${t.chiave}`}>
                <PillolaTag testo={t.nome} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GrigliaArticoli
        titolo={`${articoli.length} ${articoli.length === 1 ? "articolo" : "articoli"}`}
        articoli={articoli}
        paginazione={false}
      />
      <SezioneNewsletter />
    </>
  );
}
