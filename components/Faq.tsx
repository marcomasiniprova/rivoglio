import { Anima, AnimaLista, Figlio } from "./Anima";

/**
 * Le risposte restano oneste anche quando fanno perdere un'iscrizione.
 * In particolare quella sulle isole: la copertura lì è davvero sottile.
 */
const domande = [
  {
    d: "Devo abbonarmi?",
    r: "No. Non esiste nessun abbonamento e non si rinnova niente in automatico. Compri i crediti quando ti servono e smetti quando vuoi. Non c'è niente da disdire.",
  },
  {
    d: "Cosa succede quando finiscono i crediti?",
    r: "Ricevi un ultimo messaggio di avviso, gratuito, e poi le segnalazioni si fermano. Nessun addebito a sorpresa. Ricompri se e quando vuoi.",
  },
  {
    d: "Come faccio a sapere quanto spenderò?",
    r: "Lo decidi prima tu. Imposti quante destinazioni vuoi ricevere al massimo in una settimana: sopra quel tetto non parte niente e non paghi niente. Con 2 alert a settimana, sai già che di più non spendi.",
  },
  {
    d: "Da dove vengono i prezzi?",
    r: "Il prezzo dell'alloggio è quello reale della struttura e nel messaggio trovi sempre il link per verificarlo. Il costo dell'auto è una stima calcolata su distanza reale, prezzo medio nazionale del carburante e pedaggi, ed è indicata come stima. Sul treno non forniamo un prezzo: Trenitalia e Italo non pubblicano dati affidabili, quindi trovi il link per controllare.",
  },
  {
    d: "Funziona in tutta Italia?",
    r: "Sì, da qualsiasi comune. Un'avvertenza onesta: in Sicilia e Sardegna la copertura iniziale è più sottile, perché in auto non si raggiungono le offerte sul continente e servono strutture sulle isole. Se ti iscrivi da lì e non c'è nulla per te, te lo diciamo invece di lasciarti aspettare.",
  },
  {
    d: "Prenotate voi?",
    r: "No. Ti segnaliamo l'offerta e ti mandiamo sul sito che la vende: prenoti lì, con le loro condizioni e le loro tutele. Non tocchiamo i tuoi soldi e non ci mettiamo tra te e la struttura.",
  },
  {
    d: "E se per settimane non trovate niente?",
    r: "Allora non ricevi niente e non spendi niente: i crediti si consumano solo quando una destinazione parte davvero. Se la tua soglia è troppo bassa per la tua zona te lo diciamo, così puoi alzarla o allargare il raggio.",
  },
  {
    d: "Serve installare un'app?",
    r: "Sì. Rivoglio è un'app per iPhone e Android, in arrivo su App Store e Google Play. Le destinazioni ti arrivano come notifiche, con il conto già fatto. Lascia l'email qui sotto e ti avvisiamo il giorno in cui si può scaricare.",
  },
];

export default function Faq() {
  return (
    <section id="domande" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-20">
        <Anima>
          <h2 className="luce-testo text-[clamp(2rem,4.4vw,2.9rem)] leading-[1.02]">
            Le domande
            <br />
            <span className="corsivo text-verde-scuro">più frequenti.</span>
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-fumo">
            Se manca la tua, scrivici e la aggiungiamo.
          </p>
        </Anima>

        <AnimaLista className="divide-y divide-bordo border-y border-bordo" passo={0.05}>
          {domande.map((q) => (
            <Figlio key={q.d}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-medium leading-snug transition-colors marker:hidden hover:text-verde">
                  {q.d}
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-bordo text-fumo transition-all duration-300 group-open:rotate-45 group-open:border-verde group-open:bg-verde group-open:text-white">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                      <path
                        d="M6 1.5v9M1.5 6h9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl pr-12 text-[15.5px] leading-relaxed text-fumo">
                  {q.r}
                </p>
              </details>
            </Figlio>
          ))}
        </AnimaLista>
      </div>
    </section>
  );
}
