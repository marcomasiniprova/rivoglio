import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import ModuloEntra from "@/components/ModuloEntra";
import AspettaAccesso from "@/components/AspettaAccesso";
import { percorsoInterno } from "@/lib/api/percorso";

export const metadata: Metadata = {
  title: "Entra | Rivolio",
  description: "Entra nel tuo account e segui le tue pratiche.",
  robots: { index: false },
};

/**
 * L'ingresso, sul riferimento scelto da Valerio (8/08): la pagina è una
 * cornice scura con dentro UNA carta chiara divisa in due. A sinistra il
 * modulo; a destra la promessa in grande, come una citazione, e una
 * skyline aeroportuale disegnata a linee.
 *
 * Il riferimento aveva la recensione di un cliente: noi clienti ancora
 * non ne abbiamo, e le recensioni non si inventano (regola 3). Al suo
 * posto c'è la promessa del prodotto, firmata dal prodotto.
 */
export default async function PaginaEntra({ searchParams }: PageProps<"/entra">) {
  const p = await searchParams;
  const poi = percorsoInterno(p.poi);
  const modo = p.modo === "registrati" ? "registrati" : "accedi";
  const errore = typeof p.errore === "string" ? p.errore : null;
  /* Si arriva qui dopo aver aperto una pratica senza essere già collegati:
     il link d'ingresso è stato mandato nella posta di quell'indirizzo, non
     dato al browser (sicurezza, vedi lib/pratiche/ingresso.ts). */
  const postaPratica = p.pratica === "1";

  return (
    <main className="grid min-h-dvh place-items-center bg-verde-notte px-4 py-6 sm:px-8 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_60px_120px_-40px_rgba(0,0,0,.6)] lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- sinistra: il modulo ---------- */}
        <div className="flex flex-col bg-nebbia px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between">
            <Logo />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Torna al sito
            </Link>
          </div>

          {postaPratica && (
            <div className="mt-6 rounded-2xl border border-verde/30 bg-menta-tenue px-5 py-4">
              <p className="text-[0.95rem] leading-relaxed text-verde-notte">
                <strong>Ti abbiamo mandato il link per entrare nella tua pratica.</strong> Controlla
                la posta dell&apos;indirizzo che hai usato: per la tua sicurezza si entra solo da lì,
                così nessuno può aprire la tua pratica al posto tuo.
              </p>
              <AspettaAccesso poi={poi || "/app"} />
            </div>
          )}

          <div className="flex flex-1 items-center justify-center py-12">
            <ModuloEntra modoIniziale={modo} poi={poi} errore={errore} />
          </div>

          <p className="text-center text-xs leading-relaxed text-fumo-2">
            Entrando accetti che ti scriviamo solo per le tue pratiche.
            Niente pubblicità, niente liste vendute a nessuno.
          </p>
        </div>

        {/* ---------- destra: la promessa e la skyline ---------- */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-white lg:flex">
          <div className="px-12 pt-16">
            {/* le virgolette, come nel riferimento, nel nostro verde */}
            <span aria-hidden="true" className="font-display text-[64px] leading-none text-verde">
              &ldquo;
            </span>
            <blockquote className="mt-2 max-w-md font-display text-[1.75rem] leading-[1.3] tracking-[-0.02em] text-inchiostro">
              Controlli il volo in trenta secondi, coi dati certificati. Se ti
              spetta una fascia, la lettera è pronta: la invii tu e la
              compensazione arriva a te. Fino a 600€ a passeggero.
            </blockquote>
            <div className="mt-7 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-menta-tenue">
                <span className="size-4 rounded-full bg-verde" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-inchiostro">Rivolio</p>
                <p className="text-[13px] text-fumo">Regolamento CE 261/2004</p>
              </div>
            </div>
          </div>

          {/* la skyline aeroportuale, a linee: torre, terminal, aereo in decollo */}
          <svg
            viewBox="0 0 560 300"
            aria-hidden="true"
            className="mt-10 w-full"
            fill="none"
            stroke="var(--color-verde-notte)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* il terminal */}
            <rect x="60" y="190" width="150" height="110" fill="#E6FAF0" />
            <path d="M60 190h150" />
            <path d="M60 190 135 158l75 32" />
            <path d="M80 215h110M80 240h110M80 265h110" strokeWidth="1.8" opacity=".55" />
            {/* la torre di controllo */}
            <rect x="258" y="120" width="34" height="180" fill="#FDF3D7" />
            <path d="M246 120h58l-10-34h-38z" fill="white" />
            <path d="M251 100h48" strokeWidth="1.8" />
            <path d="M267 140v140M283 140v140" strokeWidth="1.6" opacity=".45" />
            {/* i palazzi dietro */}
            <rect x="330" y="170" width="70" height="130" fill="white" />
            <path d="M342 190h46M342 212h46M342 234h46M342 256h46" strokeWidth="1.6" opacity=".5" />
            <rect x="418" y="140" width="58" height="160" fill="#FBE9E4" />
            <path d="M428 160h38M428 184h38M428 208h38M428 232h38M428 256h38" strokeWidth="1.6" opacity=".5" />
            {/* la pista */}
            <path d="M20 300h520" strokeWidth="3" />
            <path d="M40 288h30M96 288h30M152 288h30M208 288h30M264 288h30M320 288h30M376 288h30M432 288h30M488 288h30" strokeWidth="2" opacity=".5" />
            {/* l'aereo in decollo */}
            <g transform="translate(392 60) rotate(-14)">
              <path
                d="M0 18c34-8 74-10 96-6 12 2 18 8 12 12-10 7-38 8-62 4L8 24c-6-1-10-4-8-6z"
                fill="white"
              />
              <path d="M34 14 58 -6l10 2-16 20" fill="#E6FAF0" />
              <path d="M40 26l30 14 10-2-24-16" fill="#E6FAF0" />
              <path d="M96 10l14-10 6 2-10 12" fill="#E6FAF0" />
              <circle cx="20" cy="20" r="1.6" fill="var(--color-verde-notte)" stroke="none" />
              <circle cx="30" cy="19" r="1.6" fill="var(--color-verde-notte)" stroke="none" />
              <circle cx="40" cy="18" r="1.6" fill="var(--color-verde-notte)" stroke="none" />
            </g>
            {/* la scia */}
            <path d="M300 132c30-18 62-34 96-46" strokeDasharray="2 10" strokeWidth="2.4" opacity=".6" />
          </svg>
        </aside>
      </div>
    </main>
  );
}
