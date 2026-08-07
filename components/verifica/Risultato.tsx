"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Anima } from "@/components/Anima";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY } from "@/lib/copy";
import CardCondivisione from "./CardCondivisione";

/**
 * La pagina del risultato, lato client. TRE stati, mai due (SPEC §4):
 * IDONEO (il reveal, si vende) · INCERTO (si spiega, MAI vendere) ·
 * NON_IDONEO (risposta chiara, gratis).
 *
 * Regole rispettate qui dentro:
 * - Il claim è sempre fatto oggettivo + fascia + cose da verificare.
 *   MAI "hai diritto a" (SPEC §3): i testi vengono tutti da COPY.
 * - Ogni numero è apribile: la fascia ha "Come nasce questa cifra",
 *   la scadenza porta l'avvertenza del motore.
 * - demo = badge visibile e onesto, pagamento e salvataggio spenti.
 * - Shadow mode: bottoni sostituiti dall'avviso del controllo umano.
 */

export type DatiVerifica = {
  /** Il segmento [id] dell'URL: serve ai link di checkout per tornare qui. */
  idPagina: string;
  /** UUID vero della riga `verifiche`; null per gli esempi dimostrativi. */
  idVerifica: string | null;
  esito: "idoneo" | "incerto" | "non_idoneo";
  volo: string;
  /** "aaaa-mm-gg", la data locale di partenza. */
  dataVolo: string;
  importo: number | null;
  ritardoMinuti: number | null;
  motivo: string | null;
  /** Vero se il dato viene dal fornitore dimostrativo: il badge è obbligatorio. */
  demo: boolean;
  /** Shadow mode: verdetto in attesa della conferma umana, niente vendita. */
  inAttesa: boolean;
  arrivoPrevistoUtc: string | null;
  arrivoEffettivoUtc: string | null;
  km: number | null;
  scadenza: { dataStimata: string; avvertenza: string } | null;
  /** Quali checkout link Polar sono configurati lato server. */
  checkout: { singola: boolean; famiglia: boolean };
  /** Rimbalzo dalla rotta di checkout: cosa dire e perché. */
  avvisoCheckout: "demo" | "non-attivo" | "errore" | null;
};

/* ------------------------------------------------------------ attrezzi */

/** "{volo} del {data}" → testo pieno. Segnaposto senza valore: stringa vuota. */
function riempi(modello: string, valori: Record<string, string>): string {
  return modello.replace(/\{(\w+)\}/g, (_, chiave: string) => valori[chiave] ?? "");
}

/** 200 → "3h20". */
function ritardoUmano(minuti: number): string {
  const m = Math.abs(Math.round(minuti));
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
}

/** "2026-08-06" → "6 agosto 2026". */
function dataIt(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** ISO UTC → "23:20" in ora italiana (dichiarato accanto: notaOrari). */
function oraIt(utc: string): string {
  return new Date(utc).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

/* ------------------------------------------------------------- pezzi */

function BadgeDemo() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pillola bg-sole/25 px-3 py-1 text-xs font-medium text-inchiostro">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sole" aria-hidden="true" />
      {COPY.comune.demo}
    </span>
  );
}

function Occhiello({ testo, demo }: { testo: string; demo: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <p className="text-[13px] font-medium uppercase tracking-wider text-fumo-2">{testo}</p>
      {demo && <BadgeDemo />}
    </div>
  );
}

/**
 * IL REVEAL: l'importo che sale da 0 alla fascia. Vale metà del progetto
 * (SPEC §8, animazione 4). Motion anima un MotionValue e noi mostriamo
 * il numero arrotondato; chi ha chiesto meno animazioni vede subito la
 * cifra finale, senza corsa.
 */
function ContatoreReveal({ importo }: { importo: number }) {
  const ridotto = useReducedMotion();
  const valore = useMotionValue(0);
  const [mostrato, setMostrato] = useState(0);

  useEffect(() => {
    if (ridotto) {
      // Un setState sincrono dentro l'effect fa partire render a catena:
      // si passa da requestAnimationFrame (stessa scelta di Anima.Contatore).
      const frame = requestAnimationFrame(() => setMostrato(importo));
      return () => cancelAnimationFrame(frame);
    }
    const corsa = animate(valore, importo, {
      delay: 0.35,
      duration: 2.2,
      // la curva unica del sito: parte veloce e si posa piano
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setMostrato(Math.round(v)),
    });
    return () => corsa.stop();
  }, [importo, ridotto, valore]);

  return (
    <span className="numeri luce-testo-chiaro block font-display text-[clamp(4.6rem,17vw,7.5rem)] font-medium leading-none tracking-[-0.05em] text-menta">
      {mostrato}€
    </span>
  );
}

/**
 * La cattura email, DOPO il reveal (SPEC §3, passo 4). Una sola meccanica
 * per idoneo e incerto, cambiano solo i testi. Sui casi demo non chiama
 * nessuna API: dice onestamente che non c'è niente da salvare.
 */
function CatturaEmail({
  idVerifica,
  demo,
  titolo,
  testo,
  etichetta,
  segnaposto,
  bottone,
  conferma,
  rassicurazione,
}: {
  idVerifica: string | null;
  demo: boolean;
  titolo?: string;
  testo: string;
  etichetta: string;
  segnaposto: string;
  bottone: string;
  conferma: string;
  rassicurazione?: string;
}) {
  const idCampo = useId();
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "demo" | "errore">("fermo");
  const [errore, setErrore] = useState("");

  async function invia(evento: FormEvent) {
    evento.preventDefault();
    if (demo || !idVerifica) {
      setStato("demo");
      return;
    }
    setStato("invio");
    try {
      const risposta = await fetch("/api/verifica/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idVerifica, email }),
      });
      const corpo = (await risposta.json().catch(() => null)) as {
        ok?: boolean;
        errore?: string;
      } | null;
      if (risposta.ok && corpo?.ok) {
        setStato("fatto");
        return;
      }
      setErrore(corpo?.errore ?? COPY.comune.erroreGenerico);
      setStato("errore");
    } catch {
      setErrore(COPY.comune.erroreGenerico);
      setStato("errore");
    }
  }

  if (stato === "fatto") {
    return (
      <div className="rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-5">
        <p className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-verde-notte">
          <SpuntaVerde />
          {conferma}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-bordo bg-white px-6 py-6">
      {titolo && <h2 className="font-display text-xl tracking-[-0.03em]">{titolo}</h2>}
      <p className={`${titolo ? "mt-2" : ""} text-[0.95rem] leading-relaxed text-fumo`}>{testo}</p>

      <form onSubmit={invia} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor={idCampo} className="sr-only">
            {etichetta}
          </Label>
          <Input
            id={idCampo}
            type="email"
            required
            placeholder={segnaposto}
            aria-label={etichetta}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={stato === "invio"}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 shrink-0" disabled={stato === "invio"}>
          {stato === "invio" ? COPY.comune.caricamento : bottone}
        </Button>
      </form>

      {stato === "errore" && (
        <p role="alert" className="mt-3 text-sm leading-relaxed text-red-600">
          {errore}
        </p>
      )}
      {stato === "demo" && (
        <p role="status" className="mt-3 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed">
          {COPY.catturaEmail.demoNota}
        </p>
      )}
      {rassicurazione && stato !== "demo" && (
        <p className="mt-3 text-[13px] text-fumo-2">{rassicurazione}</p>
      )}
    </div>
  );
}

function SpuntaVerde() {
  return (
    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verde" aria-hidden="true">
      <svg viewBox="0 0 12 12" className="h-3 w-3">
        <path
          d="M2.5 6.2 5 8.6l4.5-5.2"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-bordo bg-white px-6 py-6 ${className}`}>
      {children}
    </section>
  );
}

/* ============================================================= IDONEO */

function Idoneo({ dati, importo }: { dati: DatiVerifica; importo: number }) {
  const t = COPY.risultato.idoneo;
  const ritardo = dati.ritardoMinuti !== null ? ritardoUmano(dati.ritardoMinuti) : null;
  const avviso = dati.avvisoCheckout;
  const compraSingola = dati.demo || dati.checkout.singola;
  const compraFamiglia = dati.demo || dati.checkout.famiglia;

  const testoAvviso =
    avviso === "demo"
      ? t.checkoutDemo
      : avviso === "non-attivo"
        ? t.checkoutNonAttivo
        : avviso === "errore"
          ? COPY.comune.erroreGenerico
          : null;

  return (
    <div className="flex flex-col gap-6">
      <Anima>
        <Occhiello testo={t.occhiello} demo={dati.demo} />
        {ritardo && (
          /* Il fatto oggettivo bene in vista: è il titolo, non una nota. */
          <h1 className="luce-testo mt-4 font-display text-[clamp(1.9rem,6.4vw,2.9rem)] leading-[1.04] tracking-[-0.04em]">
            {riempi(t.titoloTemplate, { ritardo })}
          </h1>
        )}
      </Anima>

      {/* ------------------------------------------------ IL REVEAL */}
      <Anima ritardo={0.1}>
        <section className="relative overflow-hidden rounded-[2rem] bg-verde-notte px-6 py-10 text-center text-white sm:px-10">
          {/* un alone di luce dietro la cifra, come sui titoli della landing */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-56 w-[130%] -translate-x-1/2 -translate-y-1/3 rounded-full bg-menta/20 blur-3xl"
          />
          {/* La frase della fascia, senza la cifra: la cifra È il contatore. */}
          <p className="relative text-[0.95rem] text-white/75">
            {t.fasciaTemplate.split("{importo}")[0].trim()}
          </p>
          <div className="relative mt-3">
            <ContatoreReveal importo={importo} />
            <p className="mt-2 text-sm text-white/60">{t.perPasseggero}</p>
          </div>

          {/* Ogni numero è apribile: la trasparenza è il prodotto. */}
          <details className="group relative mx-auto mt-6 max-w-md text-left">
            <summary className="cursor-pointer list-none text-center text-sm font-medium text-menta underline decoration-menta/40 underline-offset-4 transition-colors hover:text-white">
              {t.comeNasceLaCifra.titolo}
            </summary>
            <div className="mt-3 rounded-xl bg-white/8 px-4 py-3.5 text-sm leading-relaxed text-white/80">
              <p>{t.comeNasceLaCifra.testo}</p>
              {dati.km !== null && (
                <p className="mt-2 font-medium text-white">
                  {riempi(t.comeNasceLaCifra.trattaTemplate, {
                    distanza: Math.round(dati.km).toLocaleString("it-IT"),
                  })}
                </p>
              )}
            </div>
          </details>
        </section>
      </Anima>

      {/* --------------------------------------- il fatto oggettivo */}
      <Anima ritardo={0.16}>
        <Card>
          {dati.arrivoPrevistoUtc && dati.arrivoEffettivoUtc ? (
            <>
              <p className="text-[1.05rem] leading-relaxed">
                {riempi(t.fattoTemplate, {
                  volo: dati.volo,
                  data: dataIt(dati.dataVolo),
                  oraEffettiva: oraIt(dati.arrivoEffettivoUtc),
                  oraPrevista: oraIt(dati.arrivoPrevistoUtc),
                })}
              </p>
              <p className="mt-1.5 text-[13px] text-fumo-2">{t.notaOrari}</p>
            </>
          ) : (
            ritardo && (
              <p className="text-[1.05rem] leading-relaxed">
                {riempi(t.fattoBreveTemplate, {
                  volo: dati.volo,
                  data: dataIt(dati.dataVolo),
                  ritardo,
                })}
              </p>
            )
          )}
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{t.verifica}</p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {t.cosaServe.map((voce) => (
              <li key={voce} className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed">
                <SpuntaVerde />
                {voce}
              </li>
            ))}
          </ul>

          {dati.scadenza && (
            <div className="mt-5 border-t border-bordo pt-4">
              <p className="text-sm font-medium">{t.scadenzaTitolo}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-fumo">
                {riempi(t.scadenzaTemplate, { data: dataIt(dati.scadenza.dataStimata) })}
              </p>
              {/* L'avvertenza viene dal motore: la stima è dichiarata, sempre. */}
              <p className="mt-1.5 text-[13px] leading-relaxed text-fumo-2">
                {dati.scadenza.avvertenza}
              </p>
            </div>
          )}
        </Card>
      </Anima>

      {/* --------------------------- passo 4 del funnel: l'email ORA */}
      <Anima ritardo={0.2}>
        <CatturaEmail
          idVerifica={dati.idVerifica}
          demo={dati.demo}
          titolo={COPY.catturaEmail.titolo}
          testo={COPY.catturaEmail.testo}
          etichetta={COPY.catturaEmail.campo.etichetta}
          segnaposto={COPY.catturaEmail.campo.segnaposto}
          bottone={COPY.catturaEmail.bottone}
          conferma={COPY.catturaEmail.conferma}
          rassicurazione={COPY.catturaEmail.rassicurazione}
        />
      </Anima>

      {/* ------------------------------- passo 5: il pagamento (o no) */}
      <Anima ritardo={0.24}>
        {dati.inAttesa ? (
          /* Shadow mode: niente bottoni finché l'umano non conferma. */
          <Card className="border-verde/30 bg-menta-tenue">
            <p className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-verde-notte">
              <SpuntaVerde />
              {t.shadow}
            </p>
            <p className="mt-2.5 pl-[30px] text-sm leading-relaxed text-verde-notte/80">
              {t.controlloUmano}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {testoAvviso && (
              <p
                role="status"
                className="rounded-xl bg-sole/15 px-4 py-3 text-sm leading-relaxed"
              >
                {testoAvviso}
              </p>
            )}
            {compraSingola ? (
              <>
                <Button asChild size="lg" className="h-auto w-full py-4 text-base">
                  <a href={`/api/pratiche/checkout?verifica=${dati.idPagina}&tipo=singola`}>
                    {t.cta}
                  </a>
                </Button>
                {compraFamiglia && (
                  <Button
                    asChild
                    variant="contorno"
                    size="lg"
                    className="h-auto w-full whitespace-normal py-3.5 text-center text-[0.95rem]"
                  >
                    <a href={`/api/pratiche/checkout?verifica=${dati.idPagina}&tipo=famiglia`}>
                      {t.ctaFamiglia}
                    </a>
                  </Button>
                )}
              </>
            ) : (
              !testoAvviso && (
                <p className="rounded-xl bg-sole/15 px-4 py-3 text-sm leading-relaxed">
                  {t.checkoutNonAttivo}
                </p>
              )
            )}
            <p className="flex items-center justify-center gap-2 text-center text-sm text-fumo">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verde" aria-hidden="true" />
              {t.garanziaBreve}
            </p>
          </div>
        )}
      </Anima>

      {/* ------------------------- la card virale (SPEC §8, punto 5) */}
      {ritardo && (
        <Anima ritardo={0.28}>
          <CardCondivisione volo={dati.volo} ritardo={ritardo} importo={importo} demo={dati.demo} />
        </Anima>
      )}
    </div>
  );
}

/* ============================================================ INCERTO */

function Incerto({ dati }: { dati: DatiVerifica }) {
  const t = COPY.risultato.incerto;
  return (
    <div className="flex flex-col gap-6">
      <Anima>
        <Occhiello testo={t.occhiello} demo={dati.demo} />
        <h1 className="luce-testo mt-4 font-display text-[clamp(1.9rem,6.4vw,2.9rem)] leading-[1.04] tracking-[-0.04em]">
          {t.titolo}
        </h1>
      </Anima>

      <Anima ritardo={0.1}>
        <Card>
          {/* La spiegazione viene dal motivo del motore: mai vaga. */}
          <p className="text-[1.05rem] leading-relaxed">
            {dati.motivo ?? t.motivi.datoMancante}
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{t.testo}</p>
          <p className="mt-3 border-t border-bordo pt-3 text-[0.95rem] leading-relaxed text-fumo">
            {t.alternativa}
          </p>
        </Card>
      </Anima>

      {/* Niente vendita sul giallo, MAI. Solo l'avviso se il dato si sblocca. */}
      <Anima ritardo={0.16}>
        <CatturaEmail
          idVerifica={dati.idVerifica}
          demo={dati.demo}
          testo={t.avviso.testo}
          etichetta={t.avviso.campoEmail.etichetta}
          segnaposto={t.avviso.campoEmail.segnaposto}
          bottone={t.avviso.bottone}
          conferma={t.avviso.conferma}
        />
      </Anima>

      <Anima ritardo={0.2}>
        <Button asChild size="lg" className="h-auto w-full py-4 text-base">
          <Link href="/">{t.cta}</Link>
        </Button>
      </Anima>
    </div>
  );
}

/* ========================================================= NON IDONEO */

function NonIdoneo({ dati }: { dati: DatiVerifica }) {
  const t = COPY.risultato.nonIdoneo;
  const minuti = dati.ritardoMinuti;
  const fatto =
    minuti === null
      ? null
      : minuti > 0
        ? riempi(t.fattoTemplate, {
            volo: dati.volo,
            data: dataIt(dati.dataVolo),
            ritardo: ritardoUmano(minuti),
          })
        : riempi(t.fattoPuntuale, { volo: dati.volo, data: dataIt(dati.dataVolo) });

  return (
    <div className="flex flex-col gap-6">
      <Anima>
        <Occhiello testo={t.occhiello} demo={dati.demo} />
        <h1 className="luce-testo mt-4 font-display text-[clamp(1.9rem,6.4vw,2.9rem)] leading-[1.04] tracking-[-0.04em]">
          {t.titolo}
        </h1>
      </Anima>

      <Anima ritardo={0.1}>
        <Card>
          {/* Il dato si mostra anche quando è un no: risposta chiara, gratis. */}
          {fatto && <p className="text-[1.05rem] leading-relaxed">{fatto}</p>}
          <p className={`${fatto ? "mt-3" : ""} text-[0.95rem] leading-relaxed text-fumo`}>
            {t.saluto}
          </p>
          <p className="mt-3 border-t border-bordo pt-3 text-[0.95rem] leading-relaxed text-fumo">
            {COPY.retroattivo.suggerimento}
          </p>
        </Card>
      </Anima>

      <Anima ritardo={0.16}>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-auto w-full py-4 text-base">
            <Link href="/">{t.cta}</Link>
          </Button>
          <p className="text-center text-[13px] text-fumo-2">{t.linkPromemoria}</p>
          <p className="text-center text-sm text-fumo">
            {t.suggerimentoOsservatorio}{" "}
            <Link href="/#osservatorio" className="font-medium text-verde hover:text-verde-scuro">
              {COPY.osservatorio.titolo}
            </Link>
          </p>
        </div>
      </Anima>
    </div>
  );
}

/* ============================================================ ingresso */

/**
 * La scansione d'apertura: la carta del volo attraversata dal raggio,
 * poi il verdetto. Solo quando NON si arriva dal check della hero (lì
 * la scansione c'è già stata: due teatri di fila sono una presa in giro).
 * Il flag lo scrive chi lancia il check; qui si legge e si consuma.
 * Con prefers-reduced-motion il verdetto appare subito.
 */
function ScansioneIngresso({ dati }: { dati: DatiVerifica }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-bordo bg-white shadow-[0_24px_60px_-30px_rgba(5,46,31,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-dashed border-bordo px-5 py-3">
        <span className="font-display text-[16px] font-medium tracking-[-0.01em]">
          {dati.volo}
        </span>
        <span className="numeri text-[13.5px] text-fumo">{dataIt(dati.dataVolo)}</span>
      </div>
      <div className="space-y-2.5 px-5 py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-8 items-center rounded-lg bg-nebbia px-3">
            <span
              className="h-1.5 rounded-full bg-verde/30"
              style={{ width: `${62 - i * 14}%` }}
            />
          </div>
        ))}
      </div>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(10,157,92,.16) 42%, rgba(10,157,92,.5) 50%, rgba(10,157,92,.16) 58%, transparent)",
        }}
        initial={{ y: "-100%" }}
        animate={{ y: ["-100%", "420%"] }}
        transition={{ duration: 0.62, repeat: 1, repeatType: "mirror", ease: "easeInOut" }}
      />
    </div>
  );
}

export default function Risultato({ dati }: { dati: DatiVerifica }) {
  /* true = scansione in corso; parte spenta e si accende SOLO se serve
     (arrivo diretto, niente flag dal check, movimento non ridotto). */
  const [scansione, setScansione] = useState(false);
  useEffect(() => {
    const dalCheck = sessionStorage.getItem("rivoglio-scan-fatto") === "1";
    sessionStorage.removeItem("rivoglio-scan-fatto");
    const fermo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dalCheck || fermo) return;
    // la decisione vive SOLO nel browser (sessionStorage): partire spenti
    // e accendersi dopo l'idratazione è il comportamento voluto, non un tic
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScansione(true);
    const t = setTimeout(() => setScansione(false), 1350);
    return () => clearTimeout(t);
  }, []);

  // Un "idoneo" senza importo non deve mai vendere: si tratta da incerto.
  const verdetto =
    dati.esito === "idoneo" && dati.importo !== null ? (
      <Idoneo dati={dati} importo={dati.importo} />
    ) : dati.esito === "non_idoneo" ? (
      <NonIdoneo dati={dati} />
    ) : (
      <Incerto dati={dati} />
    );

  /* La scansione è un VELO sopra il verdetto, non un sostituto: il
     verdetto resta montato da subito, così niente stato perso se uno
     (o una prova) inizia a scrivere nel primo istante. */
  return (
    <div className="relative">
      {verdetto}
      <AnimatePresence>
        {scansione && (
          <motion.div
            key="scansione"
            className="absolute inset-0 z-20 bg-nebbia pt-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="mb-5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-fumo">
              {COPY.comeFunziona.verifica.titolo}
            </p>
            <ScansioneIngresso dati={dati} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
