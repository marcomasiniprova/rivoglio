import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BoxCheck from "@/components/tabellone/BoxCheck";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import {
  CosaTiSpettaComunque,
  DaLeggere,
  FontiEvento,
  TestataEvento,
} from "@/components/eventi/Pezzi";
import { CASA, datiBriciole, datiDomande, scriptDati } from "@/lib/tabellone/seo";
import {
  COMPAGNIE_PAGINA,
  compagniaDaSlug,
  paeseInItaliano,
  type CompagniaPagina,
} from "@/lib/rimborsi/pagine-compagnia";

/**
 * LA PAGINA DI RECLAMO PER COMPAGNIA (GEO/AIO, 17/08).
 *
 * Una pagina per compagnia (`/reclamo/ryanair`, `/reclamo/easyjet`...), costruita
 * dai dati veri di `compagnie.ts`. Risponde alla domanda che si fa chi è
 * bloccato al gate: "come faccio reclamo a [compagnia] senza regalare il 30% a
 * un'agenzia?". È scritta perché un motore AI possa citarla: la risposta con le
 * cifre è in cima, i fatti sono in tabella, le fonti sono in link.
 *
 * Zero dati inventati: il canale reclami e la policy anti-intermediari vengono
 * dalla scheda verificata della compagnia, con la sua fonte e la sua data.
 */

export const dynamicParams = false; // solo le compagnie note; le altre 404

type Parametri = { params: Promise<{ compagnia: string }> };

export function generateStaticParams() {
  return COMPAGNIE_PAGINA.map((c) => ({ compagnia: c.slug }));
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const { compagnia } = await params;
  const c = compagniaDaSlug(compagnia);
  if (!c) return {};
  return {
    title: `Reclamo ${c.nome}: rimborso volo in ritardo o cancellato (250-600€) | Rivolio`,
    description: `Come fare reclamo a ${c.nome} per un volo in ritardo di 3+ ore, cancellato o con negato imbarco: ti spettano da 250 a 600€ (Reg. CE 261/2004). Il canale ufficiale, quanto ti spetta e come tenere il 100% senza agenzie.`,
    alternates: { canonical: `/reclamo/${c.slug}` },
    openGraph: {
      title: `Reclamo ${c.nome}: quanto ti spetta e come chiederlo`,
      description: `Volo ${c.nome} in ritardo o cancellato? Da 250 a 600€ col Regolamento CE 261/2004. Il canale ufficiale e la lettera pronta.`,
      locale: "it_IT",
      type: "article",
    },
  };
}

/** Le domande, usate sia per la pagina sia per il JSON-LD FAQPage. */
function domande(c: CompagniaPagina): { domanda: string; risposta: string }[] {
  const diretto =
    c.accettaIntermediari === false
      ? `${c.nome} processa solo il reclamo inviato direttamente dal passeggero: un'agenzia che reclama al posto tuo non viene lavorata finché non hai reclamato tu. Per questo conviene mandarlo da soli.`
      : `Puoi reclamare da solo, senza agenzie: la compensazione arriva intera sul tuo conto, non ne cede una parte a un intermediario.`;
  return [
    {
      domanda: `Quanto mi spetta per un volo ${c.nome} in ritardo?`,
      risposta:
        "Da 250 a 600€ a passeggero, in base alla distanza: 250€ fino a 1.500 km, 400€ tra 1.500 e 3.500 km (e su tutte le tratte dentro l'Unione Europea), 600€ oltre i 3.500 km fuori dall'Unione. Serve un ritardo all'arrivo di almeno 3 ore. È una compensazione, non il rimborso del biglietto: la tieni oltre al viaggio.",
    },
    {
      domanda: `Come faccio reclamo a ${c.nome}?`,
      risposta: `${c.canale} ${diretto}`,
    },
    {
      domanda: `Devo pagare un'agenzia per avere il rimborso da ${c.nome}?`,
      risposta:
        "No. La compensazione la paga la compagnia direttamente a te. Le agenzie tipo AirHelp trattengono il 25-35%: su 600€ sono fino a 210€ persi. Con Rivolio la lettera la mandi tu, e tieni il 100%.",
    },
    {
      domanda: `Entro quando devo fare il reclamo a ${c.nome}?`,
      risposta:
        "In Italia il termine è di 2 anni dal volo. In altri paesi è più corto: se il tuo volo non tocca l'Italia, muoviti prima. Non è un parere legale.",
    },
  ];
}

export default async function PaginaReclamoCompagnia({ params }: Parametri) {
  const { compagnia } = await params;
  const c = compagniaDaSlug(compagnia);
  if (!c) notFound();

  const paese = paeseInItaliano(c.paese);
  const soloDiretto = c.accettaIntermediari === false;
  const faq = domande(c);
  const altre = COMPAGNIE_PAGINA.filter((x) => x.slug !== c.slug).slice(0, 14);

  /* JSON-LD: HowTo (i passi per chiedere il rimborso a questa compagnia) e
     FAQPage. Sono i due tipi che i motori AI leggono meglio per estrarre una
     risposta con passi e domande. */
  const howto = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Come fare reclamo a ${c.nome} per un volo in ritardo o cancellato`,
    description: `I passi per chiedere la compensazione di 250-600€ prevista dal Regolamento CE 261/2004 a ${c.nome}.`,
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        name: "Controlla se ti spetta",
        text: "Verifica il ritardo all'arrivo dai dati ufficiali del volo: da 3 ore in su la compensazione è dovuta, salvo circostanze eccezionali.",
        url: `${CASA}/reclamo/${c.slug}#controlla`,
      },
      {
        "@type": "HowToStep",
        name: "Prepara la lettera di reclamo",
        text: "Genera la lettera con gli orari certificati, la fascia e il riferimento all'articolo 7 del Regolamento.",
        url: `${CASA}/reclamo/${c.slug}`,
      },
      {
        "@type": "HowToStep",
        name: `Invia al canale ufficiale di ${c.nome}`,
        text: c.canale,
        url: c.url,
      },
    ],
  };
  const briciole = datiBriciole([
    { nome: "Rivolio", percorso: "/" },
    { nome: "Reclamo per compagnia", percorso: "/reclamo" },
    { nome: c.nome, percorso: `/reclamo/${c.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(howto)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(datiDomande(faq))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(briciole)} />
      <Nav />
      <main>
        <TestataEvento
          occhiello={`Reclamo e rimborso · ${c.nome}`}
          titolo={`Volo ${c.nome} in ritardo o cancellato,`}
          corsivo="ecco cosa ti spetta"
          sottotitolo={`Come chiedere a ${c.nome} la compensazione del Regolamento CE 261/2004, con il canale ufficiale e la lettera pronta. Tenendoti il 100%.`}
          briciole={[
            { nome: "Rivolio", dove: "/" },
            { nome: "Reclamo", dove: "/reclamo" },
            { nome: c.nome, dove: `/reclamo/${c.slug}` },
          ]}
        />

        <div className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto flex max-w-[860px] flex-col gap-14">
            {/* LA RISPOSTA, SUBITO: il blocco pensato per essere citato da un
                motore AI. Cifre esatte, niente giri di parole. */}
            <section className="rounded-[20px] border border-verde/30 bg-menta-tenue p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-verde-scuro">
                In breve
              </p>
              <p className="mt-3 text-[1.15rem] leading-relaxed text-inchiostro">
                Se il tuo volo <strong>{c.nome}</strong> è arrivato con almeno{" "}
                <strong>3 ore di ritardo</strong>, è stato cancellato senza preavviso di 14 giorni,
                o ti hanno negato l&apos;imbarco, ti spettano{" "}
                <strong>da 250 a 600€ a passeggero</strong> (Regolamento CE 261/2004). È una{" "}
                <strong>compensazione</strong>, non il rimborso del biglietto: la tieni oltre al
                viaggio, e la paga la compagnia direttamente a te.
              </p>
            </section>

            {/* LE FASCE, in tabella: l'AI le estrae come dati. */}
            <section id="controlla">
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Quanto ti spetta, per distanza
              </h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-bordo text-fumo">
                      <th className="py-3 pr-4 font-semibold">Distanza della tratta</th>
                      <th className="py-3 pr-4 font-semibold">Compensazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4">Fino a 1.500 km</td>
                      <td className="py-3 pr-4 font-semibold text-inchiostro">250€</td>
                    </tr>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4">
                        Da 1.500 a 3.500 km, e tutte le tratte dentro l&apos;Unione Europea
                      </td>
                      <td className="py-3 pr-4 font-semibold text-inchiostro">400€</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Oltre 3.500 km, fuori dall&apos;Unione Europea</td>
                      <td className="py-3 pr-4 font-semibold text-inchiostro">
                        600€ <span className="font-normal text-fumo">(300€ se il ritardo è sotto le 4 ore)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-fumo">
                Serve un ritardo <strong>all&apos;arrivo</strong> di almeno 3 ore (Corte di
                giustizia UE, sentenza Sturgeon). La compagnia non paga solo se dimostra{" "}
                <strong>circostanze eccezionali</strong> (per esempio maltempo estremo o uno
                sciopero esterno), e l&apos;onere della prova è suo.
              </p>
            </section>

            {/* IL CANALE UFFICIALE: dato vero, verificato, con la fonte. */}
            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Il canale reclami ufficiale di {c.nome}
              </h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-inchiostro/90">{c.canale}</p>
              <div className="mt-5 flex flex-col gap-3 rounded-[16px] border border-bordo bg-white p-5 text-[14.5px]">
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <span className="min-w-[130px] font-semibold text-fumo-2">Dove reclamare</span>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all font-medium text-verde hover:text-verde-scuro"
                  >
                    {c.url}
                  </a>
                </div>
                {c.pec && (
                  <div className="flex flex-col gap-1 border-t border-bordo/60 pt-3 sm:flex-row sm:gap-3">
                    <span className="min-w-[130px] font-semibold text-fumo-2">PEC</span>
                    <span className="break-all text-inchiostro">{c.pec}</span>
                  </div>
                )}
                {paese && (
                  <div className="flex flex-col gap-1 border-t border-bordo/60 pt-3 sm:flex-row sm:gap-3">
                    <span className="min-w-[130px] font-semibold text-fumo-2">Sede legale</span>
                    <span className="text-inchiostro">
                      {c.nomeLegale} ({paese})
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* L'ANGOLO CHE VENDE: solo quando è VERO (accettaIntermediari:false). */}
            {soloDiretto && (
              <section className="rounded-[20px] border border-bordo bg-nebbia p-6 sm:p-8">
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-inchiostro">
                  Perché conviene mandarlo da solo
                </h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-inchiostro/90">
                  {c.nome} nelle sue condizioni scrive che lavora <strong>solo</strong> il reclamo
                  arrivato direttamente dal passeggero: un&apos;agenzia che reclama al posto tuo non
                  viene processata finché non hai reclamato tu. È esattamente il modello di Rivolio:
                  ti prepariamo la lettera con gli orari certificati e le norme giuste, la{" "}
                  <strong>mandi tu</strong> dalla tua email, e la compensazione arriva{" "}
                  <strong>intera</strong> sul tuo conto. Nessuna percentuale trattenuta.
                </p>
              </section>
            )}

            <BoxCheck
              titolo={`Controlla il tuo volo ${c.nome}`}
              testo={`Dimmi numero del volo e data: ti dico in pochi secondi se ti spetta una compensazione e di quale fascia, dai dati ufficiali del volo. Non serve un account.`}
            />

            <CosaTiSpettaComunque />

            {/* LE DOMANDE, in chiaro (l'AI le legge, e c'è il JSON-LD sopra). */}
            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Domande frequenti
              </h2>
              <div className="mt-5 flex flex-col gap-4">
                {faq.map((d) => (
                  <div key={d.domanda} className="rounded-[16px] border border-bordo bg-white p-5">
                    <h3 className="text-[16px] font-semibold text-inchiostro">{d.domanda}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-fumo">{d.risposta}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Reclamo per le altre compagnie
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {altre.map((x) => (
                  <li key={x.slug}>
                    <Link
                      href={`/reclamo/${x.slug}`}
                      className="inline-flex rounded-pillola border border-bordo bg-white px-4 py-2 text-[14.5px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/40"
                    >
                      {x.nome}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px]">
                <Link href="/reclamo" className="font-medium text-verde hover:text-verde-scuro">
                  Tutte le compagnie →
                </Link>
              </p>
            </section>

            <DaLeggere
              voci={[
                {
                  titolo: "Quando ti spettano 250, 400 o 600 euro",
                  dove: "/tabellone/volo-in-ritardo-250-400-600-euro",
                  testo: "La soglia delle 3 ore, le tre fasce e i casi in cui non spetta niente.",
                },
                {
                  titolo: "Volo cancellato: i primi 60 minuti",
                  dove: "/tabellone/volo-cancellato-primi-60-minuti",
                  testo: "Le prove da salvare prima di uscire dall'aeroporto.",
                },
                {
                  titolo: "Alternative ad AirHelp: il confronto onesto",
                  dove: "/alternative-airhelp",
                  testo: "Cosa cambia tra un'agenzia che trattiene il 30% e la lettera fai-da-te.",
                },
              ]}
            />

            <FontiEvento
              fonti={[
                { titolo: `Canale reclami ufficiale ${c.nome}`, url: c.url },
                {
                  titolo:
                    "Regolamento (CE) 261/2004, testo ufficiale (EUR-Lex), articoli 5, 6 e 7",
                  url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
                },
                {
                  titolo: "ENAC, diritti dei passeggeri: ritardo, cancellazione, negato imbarco",
                  url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
                },
              ]}
              nota={`Il canale reclami di ${c.nome} è stato verificato sul dominio ufficiale (${c.fonte.split(":")[0]}). Le cifre della compensazione sono quelle dell'articolo 7 del Regolamento.`}
            />
          </div>
        </div>

        <SezioneNewsletter />
      </main>
      <Footer />
    </>
  );
}
