/**
 * Le risposte qui devono restare ONESTE anche quando fanno perdere un'iscrizione.
 * In particolare quella sulle isole: la copertura lì è davvero sottile.
 */
const domande = [
  {
    d: "Devo abbonarmi?",
    r: "No. Non esiste nessun abbonamento e non si rinnova niente in automatico. Compri dei crediti quando ti servono, e quando non ti servono più semplicemente smetti. Non devi disdire nulla perché non c'è nulla da disdire.",
  },
  {
    d: "Cosa succede quando finiscono i crediti?",
    r: "Ti mando un ultimo messaggio per avvisarti — quello è gratis, non consuma niente — e poi gli alert si fermano lì. Nessun addebito a sorpresa. Ricompri se e quando vuoi.",
  },
  {
    d: "Come faccio a sapere quanto spenderò?",
    r: "Lo decidi tu prima: imposti quanti alert vuoi ricevere al massimo in una settimana. Sopra quel tetto non parte niente e non paghi niente. Se metti 2 alert a settimana, sai già che di più non spendi.",
  },
  {
    d: "Da dove vengono i prezzi?",
    r: "Il prezzo dell'alloggio è quello reale della struttura, e nell'alert trovi il link per verificarlo tu stesso. Il costo dell'auto è una stima calcolata su distanza reale, prezzo medio nazionale del carburante e pedaggi — e la chiamo stima perché è una stima. Sul treno non ti do un prezzo: Trenitalia e Italo non pubblicano dati affidabili, quindi preferisco metterti il link invece di inventarmi un numero.",
  },
  {
    d: "Funziona in tutta Italia?",
    r: "Sì, da qualsiasi comune. Con un'avvertenza onesta: se vivi in Sicilia o in Sardegna la copertura all'inizio è più sottile, perché in auto non raggiungi le offerte sul continente e servono strutture sulle isole. Se ti iscrivi da lì e non trovo niente per te, te lo dico invece di lasciarti aspettare.",
  },
  {
    d: "Prenotate voi?",
    r: "No, e non è pigrizia. Io ti segnalo l'offerta e ti mando sul sito che la vende: prenoti lì, con le loro condizioni e le loro tutele. Non tocco i tuoi soldi per il viaggio e non entro fra te e la struttura.",
  },
  {
    d: "E se per settimane non trovate niente?",
    r: "Allora non ti scrivo, e non spendi niente: i crediti si consumano solo quando un alert parte davvero. Se la tua soglia è troppo bassa per la tua zona te lo dico chiaramente, così puoi alzarla o allargare il raggio invece di aspettare a vuoto.",
  },
  {
    d: "Serve installare un'app?",
    r: "No. Viaggio Anche Io si usa dal browser, sul telefono e sul computer, e se vuoi puoi aggiungerlo alla schermata Home così ha la sua icona come le altre app. Gli alert li ricevi su Telegram o per email, cioè dove sei già.",
  },
];

export default function Faq() {
  return (
    <section id="domande" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-20">
        <div>
          <h2 className="text-[clamp(2rem,4.4vw,2.9rem)]">
            Le cose che
            <br />
            chiedono tutti.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-fumo">
            Se manca la tua, scrivimi e la aggiungo qui.
          </p>
        </div>

        <div className="divide-y divide-bordo border-y border-bordo">
          {domande.map((q) => (
            <details key={q.d} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-medium leading-snug marker:hidden">
                {q.d}
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-bordo text-fumo transition-all group-open:rotate-45 group-open:border-verde group-open:bg-verde group-open:text-white">
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
          ))}
        </div>
      </div>
    </section>
  );
}
