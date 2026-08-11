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
  Semaforo,
  TestataEvento,
} from "@/components/eventi/Pezzi";
import { AEROPORTI_OSSERVATI, ritardiAeroporti } from "@/lib/osservatorio/ritardi";
import { dataInItaliano } from "@/lib/date";
import { oggiInItalia, scioperiInArrivo } from "@/lib/scioperi/scioperi";
import { CASA, datiBriciole, scriptDati } from "@/lib/tabellone/seo";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
/**
 * LA PAGINA DI UNO SCALO: com'è messo oggi.
 *
 * Otto pagine, una per aeroporto dell'Osservatorio, alimentate dalla
 * stessa rilevazione che gira già per la striscia in home. Non c'è una
 * riga di contenuto da scrivere a mano: quello che cambia sono i numeri
 * della giornata.
 *
 * Perché esistono: "ritardi Fiumicino oggi" si cerca 365 giorni all'anno,
 * anche quando non c'è nessuno sciopero. È il traffico di fondo che il
 * blog non intercetta.
 *
 * ⚠️ Onestà: l'indice AeroDataBox fotografa le ultime due ore, non è una
 * statistica storica. La pagina lo dice, e quando il dato manca lo dice
 * invece di inventarlo.
 */

export const revalidate = 1800; // mezz'ora: la rilevazione a monte dura 24 ore

type Parametri = { params: Promise<{ iata: string }> };

export function generateStaticParams() {
  return AEROPORTI_OSSERVATI.map((a) => ({ iata: a.iata.toLowerCase() }));
}

function scaloDi(iata: string) {
  return AEROPORTI_OSSERVATI.find((a) => a.iata === iata.toUpperCase());
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const { iata } = await params;
  const scalo = scaloDi(iata);
  if (!scalo) return {};
  return {
    title: `Ritardi e cancellazioni a ${scalo.nome}, oggi | Rivolio`,
    description: `Com'è messo l'aeroporto di ${scalo.nome} adesso: indice ritardi sugli arrivi, ritardo mediano e voli cancellati. E cosa ti spetta se il tuo volo è saltato.`,
    alternates: { canonical: `/aeroporto/${scalo.iata.toLowerCase()}` },
    openGraph: {
      title: `Ritardi a ${scalo.nome}, oggi`,
      description: `Indice ritardi, ritardo mediano e cancellati. E cosa ti spetta se il tuo volo è saltato.`,
      locale: "it_IT",
      type: "website",
    },
  };
}

export default async function PaginaAeroporto({ params }: Parametri) {
  const { iata } = await params;
  const scalo = scaloDi(iata);
  if (!scalo) notFound();

  const [misure, scioperi] = await Promise.all([ritardiAeroporti(), scioperiInArrivo(4)]);
  const mio = misure.find((m) => m.iata === scalo.iata);
  const oggi = oggiInItalia();
  /* `null` = calendario non letto: in quel caso non si dice niente, invece
     di dire che oggi va tutto bene. */
  const scioperoOggi = (scioperi ?? []).some((s) => s.data === oggi);

  const indice = mio?.indice ?? null;
  const semaforo =
    indice === null
      ? {
          stato: "calmo" as const,
          titolo: `Su ${scalo.nome} non abbiamo una rilevazione fresca`,
          testo:
            "Succede quando in questo momento non ci sono abbastanza arrivi da misurare, per esempio di notte. Il controllo del tuo volo funziona lo stesso: guarda il dato del volo, non quello dello scalo.",
        }
      : indice < 1
        ? {
            stato: "calmo" as const,
            titolo: `A ${scalo.nome} si vola liscio`,
            testo: `Indice ritardi ${indice.toFixed(1)} su 5 sugli arrivi delle ultime due ore. Se il tuo volo è saltato lo stesso, il motivo è specifico: controllalo qui sotto.`,
          }
        : indice < 2.5
          ? {
              stato: "attenzione" as const,
              titolo: `A ${scalo.nome} c'è qualche ritardo`,
              testo: `Indice ritardi ${indice.toFixed(1)} su 5 sugli arrivi delle ultime due ore. Non è una giornata nera, ma qualche volo sta accumulando.`,
            }
          : {
              stato: "brutto" as const,
              titolo: `Giornata storta a ${scalo.nome}`,
              testo: `Indice ritardi ${indice.toFixed(1)} su 5 sugli arrivi delle ultime due ore. Se il tuo volo è arrivato oltre le tre ore, vale la pena controllarlo subito.`,
            };

  const numeri = [
    {
      etichetta: "Indice ritardi",
      valore: indice === null ? "non rilevato" : `${indice.toFixed(1)} / 5`,
      nota: "sugli arrivi delle ultime due ore",
    },
    {
      etichetta: "Ritardo mediano",
      valore: mio?.medianaMinuti === null || mio?.medianaMinuti === undefined
        ? "non rilevato"
        : `${mio.medianaMinuti} min`,
      nota: "metà degli arrivi sta sotto, metà sopra",
    },
    {
      etichetta: "Voli cancellati",
      valore:
        mio?.cancellati === null || mio?.cancellati === undefined
          ? "non rilevato"
          : String(mio.cancellati),
      nota: "nella stessa finestra di rilevazione",
    },
  ];

  const altri = AEROPORTI_OSSERVATI.filter((a) => a.iata !== scalo.iata);

  const datiLuogo = {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: scalo.nome,
    iataCode: scalo.iata,
    url: `${CASA}/aeroporto/${scalo.iata.toLowerCase()}`,
    address: { "@type": "PostalAddress", addressCountry: "IT" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(datiLuogo)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: scalo.nome, percorso: `/aeroporto/${scalo.iata.toLowerCase()}` },
          ]),
        )}
      />
      <Nav />
      <main>
        <TestataEvento
          occhiello={`Aeroporto di ${scalo.nome} · ${scalo.iata}`}
          titolo="Ritardi e cancellazioni,"
          corsivo="adesso"
          sottotitolo={`Com'è messo ${scalo.nome} in questo momento, dai dati di tracciamento degli arrivi. E cosa ti spetta se il tuo volo è saltato.`}
          briciole={[
            { nome: "Rivolio", dove: "/" },
            { nome: scalo.nome, dove: `/aeroporto/${scalo.iata.toLowerCase()}` },
          ]}
        />

        <div className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto flex max-w-[860px] flex-col gap-14">
            <Semaforo {...semaforo} />

            <section>
              <div className="grid gap-4 sm:grid-cols-3">
                {numeri.map((n) => (
                  <div
                    key={n.etichetta}
                    className="rounded-[16px] border border-bordo bg-white p-5 text-center"
                  >
                    <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-fumo-2">
                      {n.etichetta}
                    </p>
                    <p className="numeri mt-2 font-display text-[30px] font-semibold tracking-[-0.03em] text-inchiostro">
                      {n.valore}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-fumo">{n.nota}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-fumo">
                Indice da 0 (tutto in orario) a 5, calcolato sugli arrivi delle ultime due
                ore dal tracciamento AeroDataBox. È una fotografia del momento, non una
                statistica dell&apos;anno, e si aggiorna al massimo una volta al giorno.
                {mio?.rilevatoIl && ` Ultima rilevazione: ${dataInItaliano(mio.rilevatoIl.slice(0, 10))}.`}
              </p>
            </section>

            {scioperoOggi && (
              <Semaforo
                stato="brutto"
                titolo="Oggi c'è uno sciopero del trasporto aereo"
                testo="Vale su tutti gli scali italiani, non solo qui. Sulla pagina degli scioperi trovi chi si è fermato e cosa cambia per la compensazione."
              />
            )}

            <BoxCheck
              titolo={`Il tuo volo da o per ${scalo.nome}`}
              testo={seSiPaga(
                `L'indice dello scalo dice com'è la giornata, non cosa ti spetta: quello dipende dal TUO volo. L'analisi costa ${euro(PREZZO_LANCIO)} e non serve un account.`,
                "L'indice dello scalo dice com'è la giornata, non cosa ti spetta: quello dipende dal TUO volo. Il controllo è gratuito, non serve un account e non serve la carta.",
              )}
            />

            <CosaTiSpettaComunque />

            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Gli altri scali italiani
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {altri.map((a) => (
                  <li key={a.iata}>
                    <Link
                      href={`/aeroporto/${a.iata.toLowerCase()}`}
                      className="inline-flex rounded-pillola border border-bordo bg-white px-4 py-2 text-[14.5px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/40"
                    >
                      {a.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <DaLeggere
              voci={[
                {
                  titolo: "Ritardi e cancellazioni: gli scali italiani nel 2026",
                  dove: "/tabellone/scali-italiani-ritardi-2026",
                  testo: "I numeri dell'anno, con le fonti aperte.",
                },
                {
                  titolo: "Quando ti spettano 250, 400 o 600 euro",
                  dove: "/tabellone/volo-in-ritardo-250-400-600-euro",
                  testo: "La soglia, le tre fasce e i casi in cui non spetta niente.",
                },
                {
                  titolo: "Sciopero aerei: le date e cosa succede",
                  dove: "/sciopero-aerei",
                  testo: "Il calendario aggiornato delle agitazioni.",
                },
                {
                  titolo: "Volo cancellato: i primi 60 minuti",
                  dove: "/tabellone/volo-cancellato-primi-60-minuti",
                  testo: "Le prove da salvare prima di uscire dall'aeroporto.",
                },
              ]}
            />

            <FontiEvento
              fonti={[
                {
                  titolo:
                    "AeroDataBox, indice ritardi per aeroporto (arrivi delle ultime due ore)",
                  url: "https://www.aerodatabox.com/",
                },
                {
                  titolo:
                    "ENAC, Ritardo prolungato del volo: compensazione, assistenza e rimborso",
                  url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
                },
              ]}
              nota="I numeri di questa pagina vengono dalla stessa rilevazione che alimenta l'Osservatorio dei Disservizi. Quando un dato non c'è, scriviamo che non c'è."
            />
          </div>
        </div>

        <SezioneNewsletter />
      </main>
      <Footer />
    </>
  );
}
