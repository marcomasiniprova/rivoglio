import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-sabbia-3 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[14.5px] leading-relaxed text-fumo">
            Ti avviso quando esiste una fuga di 1–3 notti sotto il tuo budget. Da
            qualsiasi comune d&apos;Italia.
          </p>
        </div>

        <div className="flex gap-14">
          <ul className="space-y-2.5 text-[14.5px] text-fumo">
            <li>
              <a href="#come-funziona" className="transition-colors hover:text-inchiostro">
                Come funziona
              </a>
            </li>
            <li>
              <a href="#prezzi" className="transition-colors hover:text-inchiostro">
                Prezzi
              </a>
            </li>
            <li>
              <a href="#domande" className="transition-colors hover:text-inchiostro">
                Domande
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-sabbia-3 pt-6">
        <p className="text-[13px] leading-relaxed text-fumo-2">
          Viaggio Anche Io segnala offerte di terzi e non vende viaggi: la prenotazione
          avviene sul sito della struttura, con le sue condizioni. I costi di viaggio
          mostrati sono stime calcolate, non prezzi garantiti.
        </p>
      </div>
    </footer>
  );
}
