import { Anima, AnimaLista, CardViva, Contatore } from "./Anima";

/**
 * Numeri VERI con fonte cliccabile. Regola CLAUDE.md #2.
 * Zentivo mette "50.000+ utenti": noi non li abbiamo, e inventarli costerebbe
 * la fiducia, che è l'unica cosa che vendiamo. Quindi mostriamo i numeri del
 * PROBLEMA, non del prodotto.
 */
const numeri = [
  {
    valore: 40,
    suffisso: " mln",
    testo: "di italiani non partiranno ad agosto 2026. Il motivo dichiarato è il prezzo.",
    fonte: "Conflavoro",
    link: "https://www.repubblica.it/economia/rapporti/osserva-italia/trend/2026/07/27/news/capobianco_conflavoro_40_milioni_di_italiani_non_partiranno_ad_agosto_due_su_tre-425496100/",
  },
  {
    valore: 2.7,
    decimali: 1,
    testo: "giorni: la durata media di un soggiorno in Italia. Le vacanze si sono accorciate.",
    fonte: "Tgcom24",
    link: "https://www.tgcom24.mediaset.it/tgcomlab/trend/vacanze-estate-2026-viaggi-sempre-piu-brevi_112916341-202602k.shtml",
  },
  {
    valore: 72,
    suffisso: "%",
    testo: "delle prenotazioni è da 1 a 4 notti. Le micro-vacanze sono la norma, non una nicchia.",
    fonte: "Guidaviaggi",
    link: "https://www.guidaviaggi.it/2026/06/22/il-polso-delle-ota-mare-city-break-e-mediterraneo-guidano-le-prenotazioni/",
  },
  {
    valore: 1.994,
    decimali: 3,
    suffisso: " €",
    // Non si anima: è un prezzo preciso a tre decimali con una fonte sotto.
    // Vederlo ballare su valori sbagliati contraddice la promessa della sezione.
    fermo: true,
    testo: "al litro la benzina self. È il prezzo usato per calcolare il tuo viaggio, aggiornato ogni settimana.",
    fonte: "Osservatorio MIMIT",
    link: "https://www.mimit.gov.it/it/prezzo-medio-carburanti/regioni",
  },
];

export default function Numeri() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">
            Ogni numero
            <br />
            ha una fonte.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Su questo sito non trovi dati inventati. Ogni cifra qui sotto rimanda alla
            fonte originale, e puoi verificarla in un clic.
          </p>
        </Anima>

        <AnimaLista className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {numeri.map((n) => (
            <CardViva
              key={n.fonte}
              className="flex h-full flex-col rounded-[1.5rem] border border-bordo/70 bg-white p-7 transition-shadow duration-300 hover:shadow-[0_20px_45px_-24px_rgba(5,46,31,.35)]"
            >
              <p className="font-display text-[42px] font-medium leading-none tracking-[-0.04em] text-verde">
                {n.fermo ? (
                  <span className="tabular-nums">
                    {n.valore.toLocaleString("it-IT", {
                      minimumFractionDigits: n.decimali ?? 0,
                      maximumFractionDigits: n.decimali ?? 0,
                    })}
                    {n.suffisso ?? ""}
                  </span>
                ) : (
                  <Contatore
                    a={n.valore}
                    decimali={n.decimali ?? 0}
                    suffisso={n.suffisso ?? ""}
                  />
                )}
              </p>
              <p className="mt-3.5 flex-1 text-[14.5px] leading-relaxed text-fumo">{n.testo}</p>
              <a
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-fumo-2 underline-offset-4 transition-colors hover:text-verde hover:underline"
              >
                {n.fonte} ↗
              </a>
            </CardViva>
          ))}
        </AnimaLista>
      </div>
    </section>
  );
}
