import Link from "next/link";
import MarchioTabellone from "./MarchioTabellone";
import { RADICE, tagUsati } from "@/lib/tabellone/indice";

/**
 * La testata del Tabellone, com'è nel riferimento: piatta, larga quanto la
 * pagina, filo sottile sotto. Non è la pillola fluttuante del sito, ed è
 * voluto: una rivista ha una testata, un prodotto ha una barra.
 *
 * Il menu "Argomenti" si apre senza una riga di JavaScript (group-hover più
 * focus-within): funziona col puntatore, con la tastiera, e non costa un
 * componente client.
 */

function Piu() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="opacity-55 transition-transform duration-300 group-hover:rotate-45"
    >
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Masthead() {
  const argomenti = tagUsati();

  return (
    <header className="sticky top-0 z-50 border-b border-verde-notte/10 bg-carta/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1216px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* la testata: dall'elenco riporta in cima scorrendo, da un
            articolo porta all'elenco (vedi MarchioTabellone) */}
        <MarchioTabellone />

        {/* le voci */}
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href={RADICE}
            className="text-[15px] font-medium text-verde-notte/75 transition-colors hover:text-verde-notte"
          >
            Tutti gli articoli
          </Link>

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[15px] font-medium text-verde-notte/75 transition-colors hover:text-verde-notte"
              aria-haspopup="true"
            >
              Argomenti
              <Piu />
            </button>
            <div className="invisible absolute left-1/2 top-full z-10 w-[240px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-[12px] border border-verde-notte/12 bg-white p-2 shadow-[0_20px_44px_-24px_rgba(5,46,31,.4)]">
                {argomenti.map((t) => (
                  <Link
                    key={t.chiave}
                    href={`${RADICE}/argomento/${t.chiave}`}
                    className="flex items-center justify-between rounded-[8px] px-3 py-2 text-[14.5px] text-verde-notte/80 transition-colors hover:bg-carta-2 hover:text-verde-notte"
                  >
                    {t.nome}
                    <span className="text-[12.5px] text-verde-notte/40">{t.quanti}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/#osservatorio"
            className="text-[15px] font-medium text-verde-notte/75 transition-colors hover:text-verde-notte"
          >
            Osservatorio
          </Link>
          <Link
            href="/#prezzi"
            className="text-[15px] font-medium text-verde-notte/75 transition-colors hover:text-verde-notte"
          >
            Prezzi
          </Link>
        </nav>

        {/* le azioni */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* ⚠️ LA VIA D'USCITA (richiesta di Valerio, 11/08): dal blog
              non si tornava al sito. Il Tabellone ha una testata sua e
              non la barra della landing, quindi il filo che riporta al
              check si spezzava e il visitatore restava dentro.
              È discreto di proposito: la freccia e due parole, non un
              bottone che compete con "Controlla il tuo volo". */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-2.5 text-[14px] font-medium text-verde-notte/70 transition-colors hover:text-verde-notte sm:px-3"
            aria-label="Torna al sito Rivolio"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M9.5 3.5L5 8l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Sotto i 640 punti resta la sola freccia: il testo pieno
                spingerebbe fuori il bottone del check. */}
            <span className="hidden sm:inline">Al sito</span>
          </Link>
          <Link
            href="/#come-funziona"
            className="hidden items-center gap-2 rounded-[9px] border border-verde-notte/22 bg-white px-4 py-2.5 text-[14px] font-semibold text-verde-notte transition-all duration-300 hover:-translate-y-0.5 hover:border-verde-notte/40 lg:inline-flex"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6.6 5.4l4 2.6-4 2.6V5.4z" fill="currentColor" />
            </svg>
            Come funziona
          </Link>
          <Link
            href="/#controllo"
            className="riflesso inline-flex items-center whitespace-nowrap rounded-[9px] bg-verde-notte px-4 py-2.5 text-[14px] font-semibold text-carta shadow-[0_10px_24px_-12px_rgba(5,46,31,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro sm:px-5"
          >
            {/* Sotto i 360 punti il testo pieno spinge la testata fuori
                dallo schermo e il blog scorre di lato. */}
            <span className="max-[359px]:hidden">Controlla il tuo volo</span>
            <span className="hidden max-[359px]:inline">Controlla</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
