/**
 * I numeri qui sono VERI e hanno una fonte. Regola CLAUDE.md #2.
 * Zentivo mette "50.000+ utenti": noi non li abbiamo, e inventarli
 * costerebbe la fiducia — che è l'unica cosa che vendiamo.
 * Quindi mostriamo i numeri del PROBLEMA, non del prodotto.
 */
const numeri = [
  {
    cifra: "40 mln",
    testo: "di italiani non partiranno ad agosto 2026. Il motivo dichiarato è il prezzo.",
    fonte: "Conflavoro",
    link: "https://www.repubblica.it/economia/rapporti/osserva-italia/trend/2026/07/27/news/capobianco_conflavoro_40_milioni_di_italiani_non_partiranno_ad_agosto_due_su_tre-425496100/",
  },
  {
    cifra: "2,7",
    testo: "giorni: la durata media di un soggiorno in Italia. Le vacanze si sono accorciate.",
    fonte: "Tgcom24",
    link: "https://www.tgcom24.mediaset.it/tgcomlab/trend/vacanze-estate-2026-viaggi-sempre-piu-brevi_112916341-202602k.shtml",
  },
  {
    cifra: "72%",
    testo: "delle prenotazioni è da 1 a 4 notti. Le micro-vacanze non sono una nicchia: sono la norma.",
    fonte: "Guidaviaggi",
    link: "https://www.guidaviaggi.it/2026/06/22/il-polso-delle-ota-mare-city-break-e-mediterraneo-guidano-le-prenotazioni/",
  },
  {
    cifra: "1,994 €",
    testo: "al litro la benzina self. È il prezzo che uso per calcolare il tuo viaggio, aggiornato ogni settimana.",
    fonte: "Osservatorio MIMIT",
    link: "https://www.mimit.gov.it/it/prezzo-medio-carburanti/regioni",
  },
];

export default function Numeri() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">
            Non me lo sto
            <br />
            inventando.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Ogni numero qui sotto ha una fonte, e puoi cliccarla. Se un giorno leggi un
            dato su questo sito senza fonte, scrivimi: è un errore mio.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {numeri.map((n) => (
            <div
              key={n.cifra}
              className="flex flex-col rounded-[1.5rem] border border-bordo/70 bg-white p-7"
            >
              <p className="font-display text-[42px] font-medium leading-none tracking-[-0.04em] text-verde">
                {n.cifra}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
