import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BoxCheck from "@/components/tabellone/BoxCheck";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import { CosaTiSpettaComunque, TestataEvento } from "@/components/eventi/Pezzi";
import { CASA, datiBriciole, scriptDati } from "@/lib/tabellone/seo";
import { COMPAGNIE_PAGINA } from "@/lib/rimborsi/pagine-compagnia";

/**
 * L'INDICE DELLE PAGINE DI RECLAMO PER COMPAGNIA (GEO/AIO).
 *
 * Il ponte verso le pagine per compagnia, e una pagina a sé che risponde a
 * "come fare reclamo alla compagnia aerea" con le cifre in cima.
 */

export const metadata: Metadata = {
  title: "Reclamo compagnia aerea: rimborso volo in ritardo o cancellato | Rivolio",
  description:
    "Come fare reclamo alla tua compagnia aerea per un volo in ritardo di 3+ ore, cancellato o con negato imbarco: da 250 a 600€ col Regolamento CE 261/2004. Scegli la compagnia e trovi il canale ufficiale e la lettera pronta.",
  alternates: { canonical: "/reclamo" },
};

export default function PaginaReclamoIndice() {
  const lista = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Reclamo per compagnia aerea",
    itemListElement: COMPAGNIE_PAGINA.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Reclamo ${c.nome}`,
      url: `${CASA}/reclamo/${c.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(lista)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: "Reclamo per compagnia", percorso: "/reclamo" },
          ]),
        )}
      />
      <Nav />
      <main>
        <TestataEvento
          occhiello="Reclamo per compagnia"
          titolo="Reclamo alla compagnia aerea,"
          corsivo="fatto bene"
          sottotitolo="Scegli la compagnia: trovi il canale reclami ufficiale, quanto ti spetta e la lettera pronta. La mandi tu, ti tieni il 100%."
          briciole={[
            { nome: "Rivolio", dove: "/" },
            { nome: "Reclamo", dove: "/reclamo" },
          ]}
        />

        <div className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto flex max-w-[860px] flex-col gap-14">
            <section className="rounded-[20px] border border-verde/30 bg-menta-tenue p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-verde-scuro">
                In breve
              </p>
              <p className="mt-3 text-[1.15rem] leading-relaxed text-inchiostro">
                Per un volo in ritardo di almeno 3 ore, cancellato senza preavviso di 14 giorni o
                con negato imbarco, ti spettano <strong>da 250 a 600€ a passeggero</strong>{" "}
                (Regolamento CE 261/2004), a seconda della distanza. La paga la compagnia
                direttamente a te: se la chiedi da solo, la tieni <strong>intera</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Scegli la tua compagnia
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {COMPAGNIE_PAGINA.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/reclamo/${c.slug}`}
                      className="inline-flex rounded-pillola border border-bordo bg-white px-4 py-2 text-[14.5px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/40"
                    >
                      {c.nome}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-relaxed text-fumo">
                Non trovi la tua compagnia? Il controllo del volo funziona lo stesso: trova il
                canale reclami giusto in automatico dal numero del volo.
              </p>
            </section>

            <BoxCheck
              titolo="Controlla il tuo volo"
              testo="Dimmi numero del volo e data: ti dico in pochi secondi se ti spetta una compensazione e di quale fascia. Non serve un account."
            />

            <CosaTiSpettaComunque />
          </div>
        </div>

        <SezioneNewsletter />
      </main>
      <Footer />
    </>
  );
}
