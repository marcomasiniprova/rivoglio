import Link from "next/link";
import { Car, Clock, Users, Wallet } from "lucide-react";
import { costruisci } from "@/lib/costruttore";
import { Anima } from "@/components/Anima";

/**
 * «Ecco com'è dentro»: la schermata vera dell'app, non un disegno.
 *
 * Le tre destinazioni qui sotto NON sono scritte a mano: escono da
 * `costruisci()`, lo stesso motore che gira dentro /app. Se domani cambio il
 * calcolo della benzina, questa sezione cambia da sola. Se un giorno il motore
 * si rompe, questa sezione lo mostra invece di nasconderlo.
 *
 * Prezzo benzina: media nazionale self service, osservatorio MIMIT 06/08/2026.
 */
const RICHIESTA = {
  partenza: "Bologna",
  budgetPersona: 120,
  notti: 2,
  persone: 2,
  tipi: [],
  oreMax: 2.5,
  prezzoBenzina: 1.994,
} as const;

export default function DentroApp() {
  const esito = costruisci({ ...RICHIESTA, tipi: [] });
  if (!esito.ok) return null;

  return (
    <section id="dentro" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <Anima>
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.2em] text-verde">
            Ecco com&apos;è dentro
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-[2.3rem] leading-[1.05] tracking-[-0.04em] sm:text-[3.1rem]">
            Non ti chiedo di fidarti. Ti faccio vedere lo schermo.
          </h2>
          <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-fumo">
            Questa è la schermata che vedi dopo l&apos;accesso. I tre posti qui sotto
            sono calcolati adesso, mentre leggi, dallo stesso motore che gira
            dentro l&apos;app.
          </p>
        </Anima>

        <Anima ritardo={0.1}>
          <div className="mt-12 overflow-hidden rounded-[1.8rem] border border-bordo bg-white shadow-[0_40px_90px_-40px_rgba(5,46,31,.35)] sm:rounded-[2.2rem]">
            {/* barra della finestra: fa leggere «software», non «immagine» */}
            <div className="flex items-center gap-2 border-b border-bordo bg-nebbia-2/60 px-4 py-3 sm:px-5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 truncate rounded-pillola bg-white px-3 py-1 text-[11px] text-fumo-2 sm:text-xs">
                viaggioancheio.it/app
              </span>
            </div>

            <div className="bg-nebbia p-5 sm:p-8">
              <p className="font-display text-2xl tracking-[-0.03em] sm:text-3xl">
                Parti da {RICHIESTA.partenza}.
              </p>
              <p className="mt-2 text-sm text-fumo">
                Imposta quanto vuoi spendere e quanto sei disposto a guidare. Ti scrivo io
                quando il conto torna.
              </p>

              {/* la scheda di una ricerca, com'è nell'app */}
              <div className="mt-6 overflow-hidden rounded-3xl border border-bordo bg-white">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-verde" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-fumo">
                      In ascolto
                    </span>
                  </div>

                  <p className="mt-3 font-display text-2xl tracking-[-0.03em]">
                    Fino a {RICHIESTA.budgetPersona}€ a testa
                  </p>

                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fumo">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Viaggio</dt>
                      <dd>max 2h30 di auto</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-4 shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Persone</dt>
                      <dd>{RICHIESTA.persone} persone</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="size-4 shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Notti</dt>
                      <dd>1-{RICHIESTA.notti} notti</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="size-4 shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Tipo</dt>
                      <dd>Tutto</dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-bordo bg-nebbia-2/40 px-5 py-5 sm:px-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fumo-2">
                    Con questi limiti, oggi ci arrivi
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {esito.proposte.map((p) => (
                      <li
                        key={p.destinazione.nome}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-white px-4 py-3"
                      >
                        <span className="font-medium">
                          {p.destinazione.nome}
                          <span className="ml-2 text-sm font-normal text-fumo-2">
                            {p.destinazione.regione}
                          </span>
                        </span>
                        <span className="text-sm text-fumo">
                          {p.ore} · auto {Math.round(p.conto.aPersona)}€ ·{" "}
                          <span className="font-medium text-verde">
                            restano {Math.round(p.restaPerDormire)}€ per dormire
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-fumo-2">
                    Stima del viaggio, non un&apos;offerta. Ti segnalo la destinazione quando esiste
                    una struttura vera che ci sta dentro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Anima>

        <Anima ritardo={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/entra?modo=registrati"
              className="group inline-flex items-center gap-2 rounded-pillola bg-verde px-7 py-4 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(10,157,92,.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
            >
              Provala tu, 3 destinazioni gratis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <p className="text-sm text-fumo">
              Nessuna carta. Nessun abbonamento. Si paga solo quando ti serve.
            </p>
          </div>
        </Anima>
      </div>
    </section>
  );
}
