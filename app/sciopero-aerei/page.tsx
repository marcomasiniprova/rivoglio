import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BoxCheck from "@/components/tabellone/BoxCheck";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import {
  CosaTiSpettaComunque,
  DaLeggere,
  FontiEvento,
  SchedaSciopero,
  Semaforo,
  TabellaTipiSciopero,
  TestataEvento,
} from "@/components/eventi/Pezzi";
import { FONTI_SCIOPERO } from "@/lib/eventi/significato";
import { dataInItaliano, giorniDa, giornoEData } from "@/lib/date";
import { oggiInItalia, scioperiInArrivo, scioperiPassati } from "@/lib/scioperi/scioperi";
import { datiBriciole, scriptDati } from "@/lib/tabellone/seo";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
/**
 * LA PAGINA FISSA DEGLI SCIOPERI.
 *
 * È la più importante delle tre famiglie di pagine evento, ed è quella
 * che porta traffico tutto l'anno: risponde a "sciopero aerei oggi", che
 * la gente cerca nel momento esatto in cui è bloccata in aeroporto.
 * Il blog quella ricerca non la prende, perché non può avere un articolo
 * per ogni giorno del calendario.
 *
 * Si aggiorna da sola: legge la tabella `scioperi` e dice com'è messa
 * oggi. Se il database non risponde, la pagina resta viva lo stesso con
 * le regole, le fasce garantite e il check: non muore mai.
 */

export const revalidate = 900; // un quarto d'ora: uno sciopero non nasce ogni minuto

export const metadata: Metadata = {
  title: "Sciopero aerei oggi: cosa succede al tuo volo | Rivolio",
  description:
    seSiPaga(
      "Le date degli scioperi aerei in Italia, cosa ti spetta se il tuo volo salta e quando la compagnia deve pagarti lo stesso. Con l'analisi del volo sul dato ufficiale.",
      "Le date degli scioperi aerei in Italia, cosa ti spetta se il tuo volo salta e quando la compagnia deve pagarti lo stesso. Con il controllo gratuito del volo.",
    ),
  alternates: { canonical: "/sciopero-aerei" },
  openGraph: {
    title: "Sciopero aerei: cosa succede al tuo volo",
    description:
      seSiPaga(
        "Le date, cosa ti spetta comunque e quando la compensazione spetta lo stesso. Analisi del volo sul dato ufficiale.",
        "Le date, cosa ti spetta comunque e quando la compensazione spetta lo stesso. Controllo del volo gratuito.",
      ),
    locale: "it_IT",
    type: "website",
  },
};

export default async function PaginaScioperi() {
  const oggi = oggiInItalia();
  const [inArrivo, passati] = await Promise.all([scioperiInArrivo(10), scioperiPassati(6)]);

  /* `null` vuol dire che il calendario non si è aperto, e non che non ci
     siano scioperi: sono due cose diverse e la pagina non deve confonderle.
     Scrivere "oggi non risultano scioperi" mentre il database è giù
     sarebbe una certezza inventata. */
  const letto = inArrivo !== null;
  const diOggi = (inArrivo ?? []).filter((s) => s.data === oggi);
  const prossimi = (inArrivo ?? []).filter((s) => s.data !== oggi);
  const primo = prossimi[0];

  /* Il semaforo in cima: è la prima cosa che uno legge, e deve rispondere
     alla domanda con cui è arrivato, cioè "oggi si vola o no". */
  const semaforo = !letto
    ? {
        stato: "attenzione" as const,
        titolo: "Il calendario non si apre in questo momento",
        testo:
          "Non riusciamo a leggere l'elenco delle agitazioni proclamate, quindi non possiamo dirti se oggi ce n'è una. Riprova fra poco. Il controllo del tuo volo qui sotto funziona lo stesso: guarda il dato del volo, non quello del calendario.",
      }
    : diOggi.length
    ? {
        stato: "brutto" as const,
        titolo: `Oggi, ${dataInItaliano(oggi)}, c'è uno sciopero del trasporto aereo`,
        testo:
          seSiPaga(
            `Sotto trovi chi si è fermato e cosa vuol dire per il tuo volo. Se il tuo volo è saltato o è arrivato tardi, l'analisi qui sotto costa ${euro(PREZZO_LANCIO)}.`,
            "Sotto trovi chi si è fermato e cosa vuol dire per il tuo volo. Se il tuo volo è saltato o è arrivato tardi, il controllo qui sotto è gratuito.",
          ),
      }
    : primo
      ? {
          stato: "attenzione" as const,
          titolo: `Oggi non risultano scioperi aerei. Il prossimo è ${giornoEData(primo.data)}`,
          testo: `${giorniDa(primo.data, oggi) === 1 ? "Manca 1 giorno" : `Mancano ${giorniDa(primo.data, oggi)} giorni`}. Se hai un volo quel giorno, sotto trovi chi sciopera e cosa puoi fare adesso.`,
        }
      : {
          stato: "calmo" as const,
          titolo: `Oggi, ${dataInItaliano(oggi)}, non risultano scioperi del trasporto aereo`,
          testo:
            seSiPaga(
              "Nel nostro calendario non ci sono agitazioni proclamate nei prossimi giorni. Se il tuo volo è saltato lo stesso, il motivo è un altro: controllalo qui sotto.",
              "Nel nostro calendario non ci sono agitazioni proclamate nei prossimi giorni. Se il tuo volo è saltato lo stesso, il motivo è un altro: controllalo qui sotto, è gratis.",
            ),
        };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: "Sciopero aerei", percorso: "/sciopero-aerei" },
          ]),
        )}
      />
      <Nav />
      <main>
        <TestataEvento
          occhiello="Aggiornato ogni giorno"
          titolo="Sciopero aerei:"
          corsivo="cosa succede al tuo volo"
          sottotitolo="Le date proclamate, cosa ti spetta se il tuo volo salta, e i casi in cui la compagnia deve pagarti lo stesso. Senza gergo e senza promesse."
          briciole={[
            { nome: "Rivolio", dove: "/" },
            { nome: "Sciopero aerei", dove: "/sciopero-aerei" },
          ]}
        />

        <div className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto flex max-w-[860px] flex-col gap-14">
            <Semaforo {...semaforo} />

            {diOggi.length > 0 && (
              <section>
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                  Oggi
                </h2>
                <div className="mt-5 flex flex-col gap-4">
                  {diOggi.map((s) => (
                    <SchedaSciopero key={s.id} sciopero={s} />
                  ))}
                </div>
              </section>
            )}

            <BoxCheck
              titolo="Il tuo volo è saltato? Guarda cosa dicono i dati"
              testo={seSiPaga(
                `Analisi ${euro(PREZZO_LANCIO)}, senza account. Ti diciamo l'orario di arrivo effettivo registrato e se il caso regge. Nei giorni di sciopero il verdetto resta prudente per costruzione: se dipende da chi si è fermato, il caso esce incerto e l'analisi non si consuma.`,
                "Controllo gratuito, senza account e senza carta. Ti diciamo l'orario di arrivo effettivo registrato e se il caso regge. Nei giorni di sciopero il verdetto resta prudente per costruzione: se dipende da chi si è fermato, non ti vendiamo niente.",
              )}
            />

            {prossimi.length > 0 ? (
              <section>
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                  I prossimi scioperi
                </h2>
                <p className="mt-3 text-[16px] leading-relaxed text-fumo">
                  Le date che risultano proclamate. Ognuna ha la sua pagina, con chi si ferma
                  e cosa vuol dire.
                </p>
                <div className="mt-6 flex flex-col gap-4">
                  {prossimi.map((s) => (
                    <SchedaSciopero key={s.id} sciopero={s} />
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-[16px] border border-bordo bg-white p-6">
                <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em] text-inchiostro">
                  {letto ? "Nessuno sciopero in calendario" : "Il calendario non è leggibile adesso"}
                </h2>
                <p className="mt-2 text-[15.5px] leading-relaxed text-fumo">
                  {letto
                    ? "Al momento non risultano agitazioni proclamate nel trasporto aereo. La pagina si aggiorna da sola appena ne arriva una."
                    : "Torna fra poco. Nel frattempo le regole qui sotto valgono comunque, e il controllo del volo funziona."}
                </p>
              </section>
            )}

            <CosaTiSpettaComunque />
            <TabellaTipiSciopero />

            {passati !== null && passati.length > 0 && (
              <section>
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                  Gli scioperi già passati
                </h2>
                <p className="mt-3 text-[16px] leading-relaxed text-fumo">
                  Servono ancora: la finestra per chiedere alla compagnia non si chiude il
                  giorno dopo. Se avevi un volo in una di queste date, controllalo.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {passati.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/sciopero-aerei/${s.data}`}
                        className="inline-flex rounded-pillola border border-bordo bg-white px-4 py-2 text-[14.5px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/40"
                      >
                        {giornoEData(s.data)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <DaLeggere
              voci={[
                {
                  titolo: "Sciopero aerei: cosa fare mentre sei in aeroporto",
                  dove: "/tabellone/sciopero-aerei-cosa-fare-in-aeroporto",
                  testo: "Cinque mosse in ordine, scritte per essere lette in piedi.",
                },
                {
                  titolo: "Volo cancellato adesso: i primi 60 minuti",
                  dove: "/tabellone/volo-cancellato-primi-60-minuti",
                  testo: "Le prove da salvare prima di uscire dall'aeroporto.",
                },
                {
                  titolo: "Quando ti spettano 250, 400 o 600 euro",
                  dove: "/tabellone/volo-in-ritardo-250-400-600-euro",
                  testo: "La soglia esatta, le tre fasce e i casi in cui non spetta niente.",
                },
                {
                  titolo: "La compagnia dice no: cosa puoi fare davvero",
                  dove: "/tabellone/compagnia-dice-no-cosa-puoi-fare",
                  testo: "La scala completa dopo il rifiuto, con i costi in euro.",
                },
              ]}
            />

            <FontiEvento
              fonti={FONTI_SCIOPERO}
              nota="Le date delle agitazioni arrivano dalle proclamazioni pubbliche, e ogni scheda porta il link alla sua. Le regole vengono dall'ENAC e dalle pronunce citate qui sotto."
            />
          </div>
        </div>

        <SezioneNewsletter />
      </main>
      <Footer />
    </>
  );
}
