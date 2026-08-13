import { Check } from "lucide-react";
import type { Passo } from "@/lib/pratiche/passi";

/**
 * DOVE SEI, IN UNA RIGA.
 *
 * Serve a rispondere alla domanda che Valerio si è fatto guardando una
 * pratica vera: «a che punto sono, e cosa devo fare adesso?». Prima la
 * risposta c'era, ma sparsa in cinque riquadri che potevano essere accesi
 * tutti insieme.
 *
 * ⚠️ NON È UNA BARRA DI CARICAMENTO. Una pratica non è una percentuale:
 * il passo attivo è marcato, i passi fatti hanno la spunta, quelli dopo
 * restano grigi. Chi guarda deve poter dire «sono al terzo di cinque»
 * senza leggere una parola.
 *
 * ⚠️ Su telefono scorre da sé invece di far scorrere la pagina: il danno
 * di un elenco troppo lungo resta dentro la barra. Ed è per questo che i
 * nomi sono corti: cinque tappe con nomi da otto lettere ci stanno, con
 * nomi da venti no.
 */
export default function BarraPassi({ passi }: { passi: Passo[] }) {
  return (
    <nav
      aria-label="I passi della pratica"
      className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0"
    >
      <ol className="flex min-w-max items-center gap-0 sm:min-w-0">
        {passi.map((p, i) => {
          const fatto = p.stato === "fatto";
          const adesso = p.stato === "adesso";
          return (
            <li key={p.chiave} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    fatto
                      ? "bg-verde text-white"
                      : adesso
                        ? "bg-verde text-white shadow-[0_0_0_4px_var(--color-menta-tenue)]"
                        : "border border-bordo bg-white text-fumo-2"
                  }`}
                >
                  {fatto ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-[13px] ${
                    adesso
                      ? "font-semibold text-inchiostro"
                      : fatto
                        ? "font-medium text-fumo"
                        : "text-fumo-2"
                  }`}
                >
                  {p.nome}
                  {adesso && <span className="sr-only"> (sei qui)</span>}
                </span>
              </div>
              {i < passi.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-2.5 h-px w-6 shrink-0 sm:w-8 ${fatto ? "bg-verde/45" : "bg-bordo"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
