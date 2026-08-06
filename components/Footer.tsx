import Link from "next/link";
import { Marchio } from "./Logo";
import BadgeStore from "./BadgeStore";

/**
 * Il footer.
 *
 * Struttura presa dai SaaS di riferimento: colonne di link in alto, riga
 * di crediti in basso, e il nome del marchio scritto enorme che chiude la
 * pagina. Quel nome gigante non è decorazione: è l'ultima cosa che resta
 * in testa dopo che uno ha scrollato tutto.
 *
 * Le icone dei social sono disegnate qui a mano, tutte con la stessa
 * costruzione. Le librerie di icone generiche hanno tolto i marchi per
 * questioni di licenza, e mettere una emoji al posto di un'icona è il
 * segno più veloce che un sito è stato assemblato invece che costruito.
 */

const COLONNE: { titolo: string; voci: { testo: string; href: string }[] }[] = [
  {
    titolo: "Prodotto",
    voci: [
      { testo: "Come funziona", href: "/#funzioni" },
      { testo: "Com'è dentro", href: "/#dentro" },
      { testo: "Il conto aperto", href: "/#conto" },
      { testo: "Prezzi", href: "/#prezzi" },
    ],
  },
  {
    titolo: "Inizia",
    voci: [
      { testo: "Crea un account", href: "/entra?modo=registrati" },
      { testo: "Entra", href: "/entra" },
      { testo: "Prova il costruttore", href: "/#costruttore" },
      { testo: "Domande", href: "/#domande" },
    ],
  },
  {
    titolo: "Trasparenza",
    voci: [
      { testo: "Come calcoliamo l'auto", href: "/#conto" },
      { testo: "Da dove arrivano i prezzi", href: "/#conto" },
      { testo: "Cosa non facciamo", href: "/#domande" },
    ],
  },
];

type Social = {
  nome: string;
  href: string;
  /** forma piena */
  d?: string;
  /** forma a contorno */
  contorno?: string;
  cerchio?: { cx: number; cy: number; r: number };
  punto?: { cx: number; cy: number; r: number };
};

const SOCIAL: Social[] = [
  {
    nome: "Instagram",
    href: "https://instagram.com/viaggioancheio",
    // disegnata a contorno, non a pieno: a pieno diventa una macchia
    contorno: "M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3Z",
    cerchio: { cx: 12, cy: 12, r: 3.9 },
    punto: { cx: 17.2, cy: 6.9, r: 1.15 },
  },
  {
    nome: "TikTok",
    href: "https://tiktok.com/@viaggioancheio",
    d: "M15.4 3.2h2.5a5.2 5.2 0 0 0 4.1 4.4v2.6a7.9 7.9 0 0 1-4.1-1.3v6.4a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.06v2.7a3.2 3.2 0 1 0 2.3 3.1V3.2Z",
  },
  {
    nome: "YouTube",
    href: "https://youtube.com/@viaggioancheio",
    d: "M21.6 7.4a2.5 2.5 0 0 0-1.75-1.76C18.3 5.2 12 5.2 12 5.2s-6.3 0-7.85.44A2.5 2.5 0 0 0 2.4 7.4C2 9 2 12 2 12s0 3 .4 4.6a2.5 2.5 0 0 0 1.75 1.76C5.7 18.8 12 18.8 12 18.8s6.3 0 7.85-.44a2.5 2.5 0 0 0 1.75-1.76C22 15 22 12 22 12s0-3-.4-4.6ZM10.1 15V9l5.2 3-5.2 3Z",
  },
  {
    nome: "Telegram",
    href: "https://t.me/viaggioancheio",
    d: "M21.3 4.3 2.9 11.4c-.9.35-.88 1.63.03 1.95l4.5 1.58 1.74 5.24c.24.72 1.16.92 1.68.36l2.5-2.66 4.7 3.46c.72.53 1.75.13 1.93-.75l3-14.3c.2-.94-.72-1.72-1.6-1.4ZM9.6 14.1l8.3-5.5-6.8 6.3-.3 3.2-1.2-4Z",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-verde-notte px-5 pt-20 text-white/70 sm:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Marchio className="h-9 w-9" />
              <span className="font-display text-[17px] font-medium tracking-[-0.03em] text-white">
                Viaggio Anche Io
              </span>
            </Link>
            <p className="mt-5 text-[14.5px] leading-relaxed">
              Ti avviso quando esiste una fuga di 1-3 notti sotto il tuo budget, col conto
              totale già fatto. Da qualsiasi comune d&apos;Italia.
            </p>

            {/* I badge degli store stanno SOLO qui, non nella hero: qui si
                leggono come "arriveranno", lassù si leggerebbero come
                "ci sono già". Non sono cliccabili: vedi BadgeStore.tsx. */}
            <div className="mt-7">
              <BadgeStore />
            </div>

            <div className="mt-6 flex gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.nome}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.nome}
                  className="grid size-10 place-items-center rounded-xl border border-white/12 bg-white/6 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-menta/40 hover:bg-menta/12 hover:text-menta"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
                    {s.d && <path d={s.d} fill="currentColor" />}
                    {s.contorno && (
                      <path
                        d={s.contorno}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    )}
                    {s.cerchio && (
                      <circle
                        {...s.cerchio}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    )}
                    {s.punto && <circle {...s.punto} fill="currentColor" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {COLONNE.map((c) => (
            <nav key={c.titolo} aria-label={c.titolo}>
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/40">
                {c.titolo}
              </p>
              <ul className="mt-5 space-y-3">
                {c.voci.map((v) => (
                  <li key={v.testo}>
                    <Link
                      href={v.href}
                      className="text-[14.5px] transition-colors duration-200 hover:text-menta"
                    >
                      {v.testo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-7 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Viaggio Anche Io</p>
          <p className="max-w-2xl leading-relaxed">
            Segnaliamo offerte di terzi e non vendiamo viaggi: si prenota sul sito della
            struttura, con le sue condizioni. I costi di viaggio sono stime calcolate, non
            prezzi garantiti.
          </p>
        </div>

        {/* Il nome enorme che chiude la pagina. Sta su UNA riga sola e
            sfuma verso il basso: è una firma, non un titolo. Il nowrap non
            è estetica, è necessario: andando a capo diventa una parola
            orfana enorme in mezzo allo schermo. */}
        <div className="relative mt-8 select-none overflow-hidden" aria-hidden="true">
          <p className="translate-y-[16%] whitespace-nowrap bg-[linear-gradient(180deg,rgba(127,232,174,.4)_0%,rgba(127,232,174,.04)_82%)] bg-clip-text text-center font-display text-[clamp(2.4rem,8.6vw,8.4rem)] font-medium leading-[0.84] tracking-[-0.06em] text-transparent">
            Viaggio Anche Io
          </p>
        </div>
      </div>
    </footer>
  );
}
