import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroCheck from "@/components/rivoglio/HeroCheck";
import ComeFunziona from "@/components/rivoglio/ComeFunziona";
import DatoOggettivo from "@/components/rivoglio/DatoOggettivo";
import Garanzia from "@/components/rivoglio/Garanzia";
import Retroattivo from "@/components/rivoglio/Retroattivo";
import PrezziRivoglio from "@/components/rivoglio/PrezziRivoglio";
import NumeriMercato from "@/components/rivoglio/NumeriMercato";
import FaqRivoglio from "@/components/rivoglio/FaqRivoglio";
import Osservatorio from "@/components/rivoglio/Osservatorio";
import { Anima } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * La home di Rivoglio: lo scanner dei rimborsi (SPEC §1).
 *
 * L'ordine delle sezioni segue il funnel (SPEC §3): prima il check, che è
 * il prodotto; poi come funziona, cosa c'è dietro il verdetto, la garanzia,
 * il gancio retroattivo, i prezzi col confronto, i numeri del problema, le
 * domande e l'Osservatorio. I vecchi componenti viaggi restano nel
 * repository ma la pagina non li importa più.
 */

export const metadata: Metadata = {
  title: `${COPY.comune.marchio} | ${COPY.tagline}`,
  description: `${COPY.hero.titolo} ${COPY.hero.sottotitolo} ${COPY.hero.form.rassicurazione}`,
  alternates: { canonical: "/" },
  openGraph: {
    title: COPY.comune.marchio,
    description: `${COPY.hero.titolo} ${COPY.hero.sottotitolo}`,
    locale: "it_IT",
    type: "website",
  },
};

/** L'invito breve che chiude la pagina: un titolo, una riga, il bottone. */
function InvitoBreve() {
  return (
    <section className="px-5 pb-24 pt-4 text-center sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Anima>
          <h2 className="luce-testo text-[clamp(2rem,4.8vw,3.15rem)] leading-[1.06]">
            {COPY.invito.titolo}
            <br />
            <span className="corsivo text-verde-scuro">{COPY.invito.corsivo}</span>
          </h2>
        </Anima>
        <Anima ritardo={0.1}>
          <p className="mx-auto mt-4 max-w-md text-[15.5px] leading-relaxed text-fumo">
            {COPY.invito.testo}
          </p>
        </Anima>
        <Anima ritardo={0.18}>
          <a
            href="#controllo"
            className="riflesso group mt-8 inline-flex items-center gap-2 rounded-bottone bg-verde px-8 py-4 text-[16px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
          >
            {COPY.invito.cta}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </Anima>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroCheck />
        <ComeFunziona />
        <DatoOggettivo />
        <Garanzia />
        <Retroattivo />
        <PrezziRivoglio />
        <NumeriMercato />
        <FaqRivoglio />
        <Osservatorio />
        <InvitoBreve />
      </main>
      <Footer />
    </>
  );
}
