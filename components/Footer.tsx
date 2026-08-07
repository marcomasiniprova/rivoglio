import Image from "next/image";
import Link from "next/link";
import { Marchio } from "./Logo";
import BadgeStore from "./BadgeStore";
import { COPY } from "@/lib/copy";

/**
 * Il footer di Rivoglio.
 *
 * Struttura presa dai SaaS di riferimento: colonne di link in alto, riga
 * di crediti in basso, e il nome del marchio scritto enorme che chiude la
 * pagina. Testi e colonne vengono da COPY.footer; la colonna Trasparenza
 * porta con sé il disclaimer legale, perché è lì che uno va a cercarlo.
 *
 * Le icone dei social sono disegnate qui a mano, tutte con la stessa
 * costruzione. Le librerie di icone generiche hanno tolto i marchi per
 * questioni di licenza, e mettere una emoji al posto di un'icona è il
 * segno più veloce che un sito è stato assemblato invece che costruito.
 */

const F = COPY.footer;
const COLONNE = [F.colonne.prodotto, F.colonne.trasparenza, F.colonne.domande] as const;

/** Le ancore di pagina diventano assolute: il footer appare anche fuori dalla home. */
const casa = (ancora: string) => (ancora.startsWith("#") ? `/${ancora}` : ancora);

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
    href: "https://instagram.com/rivoglio",
    // disegnata a contorno, non a pieno: a pieno diventa una macchia
    contorno:
      "M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3Z",
    cerchio: { cx: 12, cy: 12, r: 3.9 },
    punto: { cx: 17.2, cy: 6.9, r: 1.15 },
  },
  {
    nome: "TikTok",
    href: "https://tiktok.com/@rivoglio",
    d: "M15.4 3.2h2.5a5.2 5.2 0 0 0 4.1 4.4v2.6a7.9 7.9 0 0 1-4.1-1.3v6.4a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.06v2.7a3.2 3.2 0 1 0 2.3 3.1V3.2Z",
  },
  {
    nome: "YouTube",
    href: "https://youtube.com/@rivoglio",
    d: "M21.6 7.4a2.5 2.5 0 0 0-1.75-1.76C18.3 5.2 12 5.2 12 5.2s-6.3 0-7.85.44A2.5 2.5 0 0 0 2.4 7.4C2 9 2 12 2 12s0 3 .4 4.6a2.5 2.5 0 0 0 1.75 1.76C5.7 18.8 12 18.8 12 18.8s6.3 0 7.85-.44a2.5 2.5 0 0 0 1.75-1.76C22 15 22 12 22 12s0-3-.4-4.6ZM10.1 15V9l5.2 3-5.2 3Z",
  },
  {
    nome: "Telegram",
    href: "https://t.me/rivoglio",
    d: "M21.3 4.3 2.9 11.4c-.9.35-.88 1.63.03 1.95l4.5 1.58 1.74 5.24c.24.72 1.16.92 1.68.36l2.5-2.66 4.7 3.46c.72.53 1.75.13 1.93-.75l3-14.3c.2-.94-.72-1.72-1.6-1.4ZM9.6 14.1l8.3-5.5-6.8 6.3-.3 3.2-1.2-4Z",
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-verde-notte px-5 pt-20 text-white/70 sm:px-8">
      {/* la lama di luce che separa il footer dal resto */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(127,232,174,.55),transparent)]"
      />
      <div className="mx-auto max-w-[1240px]">
        {/* La cartolina: card bianca sul fondo scuro, come i riferimenti
            scelti da Valerio. A destra il telefono in mano (foto sua,
            sfondo tolto): la mano entra dal bordo basso della card. */}
        <div className="mb-20 overflow-hidden rounded-[2rem] bg-white text-inchiostro">
          <div className="grid items-end gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="px-7 py-10 sm:px-12 sm:py-14 md:pb-16 md:pt-16">
              <h2 className="luce-testo text-[clamp(1.9rem,3.8vw,2.7rem)] leading-[1.06]">
                {F.cartolina.titolo}
                <br />
                <span className="corsivo text-verde-scuro">{F.cartolina.corsivo}</span>
              </h2>
              <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-fumo">
                {F.cartolina.testo}
              </p>
              <Link
                href="/#controllo"
                className="riflesso mt-8 inline-flex h-13 items-center gap-2 rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
              >
                {F.cartolina.bottone}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="relative flex items-end justify-center px-6 pt-2 md:pt-8">
              <Image
                src="/telefono-app.png"
                alt={F.cartolina.altTelefono}
                width={878}
                height={1257}
                className="h-[320px] w-auto object-contain object-bottom sm:h-[380px] md:h-[440px]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Marchio className="h-9 w-9" />
              <span className="font-display text-[17px] font-medium tracking-[-0.03em] text-white">
                {COPY.comune.marchio}
              </span>
            </Link>
            <p className="mt-5 text-[14.5px] leading-relaxed">{F.frase}</p>

            {/* I badge degli store sono inerti finché l'app non c'è davvero:
                vedi BadgeStore.tsx. Qui l'app è il tracker della pratica. */}
            <div className="mt-7">
              <p className="text-[13px] font-medium text-white/50">{F.app.titolo}</p>
              <div className="mt-3">
                <BadgeStore />
              </div>
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
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-menta/50">
                {c.titolo}
              </p>
              <ul className="mt-5 space-y-3">
                {c.voci.map((v) => (
                  <li key={v.testo}>
                    <Link
                      href={casa(v.ancora)}
                      className="inline-block text-[14.5px] transition-all duration-200 hover:translate-x-0.5 hover:text-menta"
                    >
                      {v.testo}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Il disclaimer vive sotto la colonna Trasparenza: è lì che
                  uno lo cerca, non nascosto nella riga dei crediti. */}
              {c.titolo === F.colonne.trasparenza.titolo && (
                <p className="mt-6 max-w-[26rem] text-[12px] leading-relaxed text-white/40">
                  {F.disclaimer}
                </p>
              )}
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-7 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{F.copyright} · Fatto in Italia</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {F.colonne.legale.voci.map((v) => (
              <Link
                key={v.testo}
                href={casa(v.ancora)}
                className="transition-colors hover:text-menta"
              >
                {v.testo}
              </Link>
            ))}
          </div>
        </div>

        {/* Il nome enorme che chiude la pagina. Sta su UNA riga sola e
            sfuma verso il basso: è una firma, non un titolo. Il nowrap non
            è estetica, è necessario: andando a capo diventa una parola
            orfana enorme in mezzo allo schermo. */}
        {/* Più grande e più presente per volere di Valerio (8/08), maiuscolo
            come nel lockup del marchio: occupa tutta la larghezza e viene
            tagliato dal bordo basso, come nei riferimenti. */}
        <div className="relative mt-10 select-none overflow-hidden" aria-hidden="true">
          <p className="translate-y-[24%] whitespace-nowrap bg-[linear-gradient(180deg,rgba(127,232,174,.5)_0%,rgba(127,232,174,.05)_85%)] bg-clip-text text-center font-display text-[clamp(3.4rem,13.5vw,15rem)] font-medium uppercase leading-[0.8] tracking-[-0.05em] text-transparent">
            {COPY.comune.marchio}
          </p>
        </div>
      </div>
    </footer>
  );
}
