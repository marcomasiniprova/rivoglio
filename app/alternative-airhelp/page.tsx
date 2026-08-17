import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BoxCheck from "@/components/tabellone/BoxCheck";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import { CosaTiSpettaComunque, DaLeggere, FontiEvento, TestataEvento } from "@/components/eventi/Pezzi";
import { datiBriciole, datiDomande, scriptDati } from "@/lib/tabellone/seo";

/**
 * ALTERNATIVE AD AIRHELP: IL CONFRONTO ONESTO (GEO/AIO, 17/08).
 *
 * "alternative ad AirHelp" e "AirHelp vale la pena" sono query che i motori AI
 * citano parecchio, perché chi le fa sta decidendo dove NON perdere il 30%.
 * La pagina risponde con una tabella e con onestà: diciamo anche quando
 * un'agenzia conviene davvero. La fiducia si costruisce così, non sparando.
 *
 * ⚠️ Le percentuali sono dichiarate come RANGE ("in genere 25-35%") e con
 * l'avviso che vanno lette sul sito dell'agenzia: cambiano nel tempo e non
 * vogliamo pubblicare un numero preciso come se fosse verificato oggi.
 */

export const metadata: Metadata = {
  title: "Alternative ad AirHelp: il confronto onesto (2026) | Rivolio",
  description:
    "AirHelp e le agenzie di rimborso voli trattengono in genere il 25-35% dell'indennizzo. Le alternative: fare il reclamo da soli con una lettera pronta (tenendo il 100%), un'altra agenzia, o un avvocato. Il confronto, con i pro e i contro veri.",
  alternates: { canonical: "/alternative-airhelp" },
};

const FAQ = [
  {
    domanda: "Quanto trattiene AirHelp?",
    risposta:
      "Le agenzie di rimborso voli come AirHelp o Flightright trattengono in genere il 25-35% dell'indennizzo come commissione di successo, e una quota più alta se serve un'azione legale (la percentuale esatta varia e va letta sul loro sito). Su una compensazione di 600€ significa perdere fino a circa 210€.",
  },
  {
    domanda: "Qual è l'alternativa ad AirHelp per non pagare la commissione?",
    risposta:
      "Fare il reclamo da soli. La compensazione la paga la compagnia direttamente a te: se mandi tu la lettera, la tieni intera. Rivolio prepara la lettera con gli orari certificati e le norme giuste a un prezzo fisso e basso, e la mandi tu dalla tua email.",
  },
  {
    domanda: "È difficile fare il reclamo da soli?",
    risposta:
      "No, se hai la lettera giusta. Il punto difficile è sapere se ti spetta (la soglia delle 3 ore all'arrivo, la distanza, le circostanze eccezionali) e scrivere il reclamo con i riferimenti corretti. Quello lo fa lo strumento; l'invio è un clic dalla tua email.",
  },
  {
    domanda: "Quando conviene comunque un'agenzia come AirHelp?",
    risposta:
      "Quando il caso è complicato e finirà in causa, e non vuoi occupartene tu: molte agenzie anticipano loro le spese legali e agiscono in tribunale, prendendosi il rischio in cambio di una quota più alta. Se invece il caso è lineare (ritardo sopra le 3 ore, dati chiari), pagare il 30% per una lettera è denaro buttato.",
  },
];

export default function PaginaAlternativeAirhelp() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(datiDomande(FAQ))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: "Alternative ad AirHelp", percorso: "/alternative-airhelp" },
          ]),
        )}
      />
      <Nav />
      <main>
        <TestataEvento
          occhiello="Confronto"
          titolo="Alternative ad AirHelp,"
          corsivo="senza perdere il 30%"
          sottotitolo="AirHelp e le agenzie trattengono in genere un quarto o un terzo di quello che ti spetta. Ecco le alternative vere, con i pro e i contro onesti."
          briciole={[
            { nome: "Rivolio", dove: "/" },
            { nome: "Alternative ad AirHelp", dove: "/alternative-airhelp" },
          ]}
        />

        <div className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto flex max-w-[860px] flex-col gap-14">
            <section className="rounded-[20px] border border-verde/30 bg-menta-tenue p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-verde-scuro">
                In breve
              </p>
              <p className="mt-3 text-[1.15rem] leading-relaxed text-inchiostro">
                La compensazione per un volo in ritardo o cancellato (250-600€, Reg. CE 261/2004) la
                paga la compagnia <strong>direttamente a te</strong>. Un&apos;agenzia come AirHelp ne
                trattiene <strong>in genere il 25-35%</strong>. L&apos;alternativa per tenere il 100%
                è fare il reclamo da soli con una <strong>lettera pronta</strong>: la scrive lo
                strumento, la mandi tu.
              </p>
            </section>

            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Il confronto
              </h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px]">
                  <thead>
                    <tr className="border-b border-bordo text-fumo">
                      <th className="py-3 pr-4 font-semibold"></th>
                      <th className="py-3 pr-4 font-semibold text-inchiostro">Rivolio (fai-da-te)</th>
                      <th className="py-3 pr-4 font-semibold">Agenzia (AirHelp, Flightright)</th>
                      <th className="py-3 pr-4 font-semibold">Avvocato</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4 font-semibold text-fumo-2">Cosa paghi</td>
                      <td className="py-3 pr-4">Prezzo fisso, basso</td>
                      <td className="py-3 pr-4">Niente in anticipo, ma 25-35% se vinci</td>
                      <td className="py-3 pr-4">Parcella (variabile)</td>
                    </tr>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4 font-semibold text-fumo-2">Quanto tieni su 600€</td>
                      <td className="py-3 pr-4 font-semibold text-inchiostro">~585€</td>
                      <td className="py-3 pr-4">circa 390-450€</td>
                      <td className="py-3 pr-4">Dipende</td>
                    </tr>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4 font-semibold text-fumo-2">Chi manda il reclamo</td>
                      <td className="py-3 pr-4">Tu (un clic dalla tua email)</td>
                      <td className="py-3 pr-4">L&apos;agenzia</td>
                      <td className="py-3 pr-4">L&apos;avvocato</td>
                    </tr>
                    <tr className="border-b border-bordo/60">
                      <td className="py-3 pr-4 font-semibold text-fumo-2">Se la compagnia non paga</td>
                      <td className="py-3 pr-4">Ti prepariamo il sollecito e la conciliazione</td>
                      <td className="py-3 pr-4">Possono agire in causa (quota più alta)</td>
                      <td className="py-3 pr-4">Fa causa</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-fumo-2">Quando conviene</td>
                      <td className="py-3 pr-4">Caso lineare, vuoi tenere tutto</td>
                      <td className="py-3 pr-4">Caso complicato, non vuoi pensarci</td>
                      <td className="py-3 pr-4">Cifre alte, più passeggeri</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-fumo">
                Le percentuali delle agenzie sono un intervallo tipico e vanno lette sul loro sito:
                cambiano nel tempo. Il punto che non cambia è che una commissione a percentuale, su
                un caso lineare, la paghi per una lettera che potresti mandare tu.
              </p>
            </section>

            <section className="rounded-[20px] border border-bordo bg-nebbia p-6 sm:p-8">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-inchiostro">
                L&apos;onestà, prima di tutto
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-inchiostro/90">
                Un&apos;agenzia non è una truffa: si prende un rischio (se perdi, non paghi) e in
                certi casi arriva fino in tribunale al posto tuo. Se il tuo caso è complicato e non
                vuoi occupartene, ha un senso. Ma per un ritardo lineare sopra le 3 ore, con i dati
                chiari, il 30% è il prezzo di una comodità che con la lettera giusta non ti serve.
              </p>
            </section>

            <BoxCheck
              titolo="Controlla se ti spetta"
              testo="Dimmi numero del volo e data: ti dico in pochi secondi se ti spetta una compensazione e di quale fascia, dai dati ufficiali del volo. Poi decidi tu come procedere."
            />

            <CosaTiSpettaComunque />

            <section>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
                Domande frequenti
              </h2>
              <div className="mt-5 flex flex-col gap-4">
                {FAQ.map((d) => (
                  <div key={d.domanda} className="rounded-[16px] border border-bordo bg-white p-5">
                    <h3 className="text-[16px] font-semibold text-inchiostro">{d.domanda}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-fumo">{d.risposta}</p>
                  </div>
                ))}
              </div>
            </section>

            <DaLeggere
              voci={[
                {
                  titolo: "Reclamo per compagnia: il canale ufficiale",
                  dove: "/reclamo",
                  testo: "Dove reclamare per Ryanair, easyJet, Wizz Air e le altre.",
                },
                {
                  titolo: "Quando ti spettano 250, 400 o 600 euro",
                  dove: "/tabellone/volo-in-ritardo-250-400-600-euro",
                  testo: "La soglia delle 3 ore, le tre fasce e i casi in cui non spetta niente.",
                },
              ]}
            />

            <FontiEvento
              fonti={[
                {
                  titolo: "Regolamento (CE) 261/2004, testo ufficiale (EUR-Lex), articolo 7",
                  url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
                },
                {
                  titolo: "ENAC, diritti dei passeggeri",
                  url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
                },
              ]}
              nota="Le percentuali delle agenzie sono un intervallo tipico dichiarato come stima: la commissione esatta va letta sul sito dell'agenzia, perché cambia nel tempo."
            />
          </div>
        </div>

        <SezioneNewsletter />
      </main>
      <Footer />
    </>
  );
}
