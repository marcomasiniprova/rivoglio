import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-bordo px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-[13px] font-medium uppercase tracking-[.13em] text-fumo-2">
            La tua fuga, al prezzo giusto
          </p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-fumo">
            Ti avviso quando esiste una fuga di 1–3 notti sotto il tuo budget. Da qualsiasi
            comune d&apos;Italia.
          </p>
        </div>

        <ul className="space-y-2.5 text-[14.5px] text-fumo">
          {[
            ["#funzioni", "Come funziona"],
            ["#conto", "Il conto aperto"],
            ["#prezzi", "Prezzi"],
            ["#domande", "Domande"],
          ].map(([h, t]) => (
            <li key={h}>
              <a href={h} className="transition-colors hover:text-inchiostro">
                {t}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-10 max-w-[1120px] border-t border-bordo pt-6">
        <p className="text-[13px] leading-relaxed text-fumo-2">
          Viaggio Anche Io segnala offerte di terzi e non vende viaggi: la prenotazione
          avviene sul sito della struttura, con le sue condizioni. I costi di viaggio
          mostrati sono stime calcolate, non prezzi garantiti.
        </p>
      </div>
    </footer>
  );
}
