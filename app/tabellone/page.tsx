import type { Metadata } from "next";
import GrigliaArticoli from "@/components/tabellone/GrigliaArticoli";
import HeroTabellone from "@/components/tabellone/HeroTabellone";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import SezioneUltimi from "@/components/tabellone/SezioneUltimi";
import StrisciaArgomenti from "@/components/tabellone/StrisciaArgomenti";
import { NOME_BLOG, RADICE, inEvidenza, pagina, quantePagine } from "@/lib/tabellone/indice";
import { datiBlog, datiBriciole, scriptDati } from "@/lib/tabellone/seo";

/**
 * LA HOME DEL TABELLONE.
 *
 * L'ordine è quello del riferimento, e non è casuale: prima chi siamo e
 * il campo email (chi arriva da Google non torna mai, se non lo prendi
 * subito), poi i tre pezzi in evidenza, poi tutto il resto.
 */

export const metadata: Metadata = {
  title: `${NOME_BLOG} | Il blog di Rivolio sui diritti del passeggero`,
  description:
    "Ritardi, cancellazioni e rimborsi aerei spiegati senza gergo. Cosa prevede il Regolamento CE 261/2004, come si chiede e cosa fanno le compagnie per non pagare.",
  alternates: { canonical: RADICE, types: { "application/rss+xml": `${RADICE}/feed.xml` } },
  openGraph: {
    title: `${NOME_BLOG} di Rivolio`,
    description:
      "Ritardi, cancellazioni e rimborsi aerei spiegati senza gergo. Una cosa alla settimana, fatta bene.",
    locale: "it_IT",
    type: "website",
  },
};

export default function Tabellone() {
  const totale = quantePagine();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(datiBlog())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: NOME_BLOG, percorso: RADICE },
          ]),
        )}
      />

      <HeroTabellone />
      <StrisciaArgomenti />
      <SezioneUltimi articoli={inEvidenza()} />
      <GrigliaArticoli articoli={pagina(1)} corrente={1} totalePagine={totale} />
      <SezioneNewsletter />
    </>
  );
}
