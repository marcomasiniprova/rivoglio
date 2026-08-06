import Link from "next/link";
import { Anima } from "./Anima";

/**
 * L'ultima cosa che si vede prima del footer.
 *
 * Lo sfondo è una FOTOGRAFIA vera, non un gradiente: Manarola, Cinque Terre.
 * Foto di Vidar Nordli-Mathisen su Unsplash, licenza Unsplash (uso
 * commerciale consentito, nessuna attribuzione obbligatoria).
 * Servita dalla loro CDN già ridimensionata: non pesa sul nostro hosting.
 *
 * Perché una foto e non l'ennesimo fondo verde: fin qui la pagina ha
 * parlato di conti, chilometri e pedaggi. L'ultima immagine deve ricordare
 * perché uno esce di casa. Quello lo fa una fotografia, non il CSS.
 */
const FOTO =
  "https://images.unsplash.com/photo-1528645752497-dce79f475d63?auto=format&fit=crop&w=2000&q=70";

export default function Invito() {
  return (
    <section className="px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem]">
        {/* la fotografia */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${FOTO}")` }}
        />
        {/* Due veli, non uno. Il primo scurisce tutto, il secondo è un alone
            centrale sotto al testo. Con un velo solo il paragrafo cadeva
            sopra le case chiare della foto e scendeva sotto 4.5:1: si vedeva
            ma non si leggeva, che è peggio. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,46,31,.82)_0%,rgba(5,46,31,.62)_45%,rgba(5,46,31,.88)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(58%_52%_at_50%_46%,rgba(3,28,19,.72)_0%,transparent_75%)]"
        />

        <div className="relative px-6 py-24 text-center sm:px-10 sm:py-36">
          <Anima>
            <h2 className="mx-auto max-w-3xl text-[clamp(2.1rem,5.6vw,3.9rem)] leading-[1.02] text-white">
              La prossima fuga esiste già.
              <br />
              <span className="corsivo text-menta">Manca solo chi te lo dice.</span>
            </h2>
          </Anima>

          <Anima ritardo={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-white/75 sm:text-[17px]">
              Imposti da dove parti e la tua soglia. Al resto pensiamo noi: chilometri,
              benzina, pedaggi e il conto totale, aperto riga per riga.
            </p>
          </Anima>

          <Anima ritardo={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/entra?modo=registrati"
                className="riflesso group inline-flex w-full items-center justify-center gap-2 rounded-bottone bg-white px-8 py-4 text-[16px] font-medium text-verde-notte shadow-[0_18px_40px_-16px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
              >
                Inizia gratis
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/entra"
                className="vetro-scuro inline-flex w-full items-center justify-center rounded-bottone px-8 py-4 text-[16px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
              >
                Ho già un account
              </Link>
            </div>
          </Anima>

          <Anima ritardo={0.28}>
            <p className="mt-6 text-[13.5px] text-white/60">
              3 alert gratis. Nessuna carta, nessun abbonamento.
            </p>
          </Anima>
        </div>
      </div>
    </section>
  );
}
