"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlarmClock,
  Bell,
  BookMarked,
  BrickWall,
  Building2,
  CreditCard,
  Database,
  Fingerprint,
  Mail,
  MailOpen,
  Plane,
  Scale,
  Search,
  Settings,
  Shield,
  Smartphone,
  Stamp,
  Store,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { FILI, NODI, ZONE, type ChiaveZona, type Nodo, type StatoNodo } from "@/lib/admin/mappa";

/**
 * LA LAVAGNA DEL BUSINESS.
 *
 * Richiesta di Valerio (12/08): «un canvas leggerissimo con zoom che
 * mappa tutto Rivolio: il funnel, il prodotto, i canali. Così so dove
 * siamo e capisco come funzionano le cose».
 *
 * ⚠️ NIENTE LIBRERIE DI DIAGRAMMI, e non è integralismo. Le librerie da
 * canvas (react-flow e simili) pesano fra i 100 e i 200 KB e portano
 * dentro un motore di trascinamento, di aggancio e di ridisegno che qui
 * non serve a niente: la mappa è ferma, i box stanno dove li ho messi.
 * Qui c'è un `div` che si sposta e si ingrandisce, e i fili sono un SVG.
 * Il pannello lo apre una persona sola e deve aprirsi subito.
 *
 * ⚠️ I FILI SI DISEGNANO SOTTO, NON SOPRA. Un filo che passa davanti a
 * una card ne taglia il testo: sono su un livello loro, dietro tutto.
 *
 * ⚠️ IL TRATTEGGIO NON È DECORAZIONE: dice che quella strada oggi non si
 * può percorrere. Guardando la mappa da lontano si deve vedere subito
 * dove il percorso si interrompe, e oggi si interrompe alla cassa.
 */

const ICONE: Record<string, LucideIcon> = {
  video: Video,
  cerca: Search,
  allarme: AlarmClock,
  posta: Mail,
  lente: Search,
  ingranaggio: Settings,
  aereo: Plane,
  timbro: Stamp,
  muro: BrickWall,
  carta: CreditCard,
  cassa: Store,
  lettera: MailOpen,
  orologio: AlarmClock,
  istituzione: Building2,
  bilancia: Scale,
  scudo: Shield,
  database: Database,
  registro: BookMarked,
  campana: Bell,
  busta: Mail,
  telefono: Smartphone,
  impronta: Fingerprint,
};

/** Le tre condizioni, dette in italiano e non con un colore soltanto. */
const STATO: Record<StatoNodo, { nome: string; punto: string; bordo: string; testo: string }> = {
  fatto: {
    nome: "Funziona",
    punto: "bg-verde",
    bordo: "border-verde/35",
    testo: "text-verde-scuro",
  },
  spento: {
    nome: "Costruito ma spento",
    punto: "bg-sole",
    bordo: "border-sole/50",
    testo: "text-[#92400e]",
  },
  manca: {
    nome: "Non c'è",
    punto: "bg-red-500",
    bordo: "border-red-300",
    testo: "text-red-700",
  },
};

/* La tela in unità: i nodi stanno in una griglia da 10 punti per unità. */
const U = 10;
const CARD_W = 216;
const CARD_H = 100;
const MARGINE = 70;

const larghezzaTela = Math.max(...NODI.map((n) => n.x)) * U + CARD_W + MARGINE * 2;
const altezzaTela = Math.max(...NODI.map((n) => n.y)) * U + CARD_H + MARGINE * 2;

const centroDi = (n: Nodo) => ({
  x: MARGINE + n.x * U + CARD_W / 2,
  y: MARGINE + n.y * U + CARD_H / 2,
});

export default function Mappa() {
  const [vista, setVista] = useState({ x: 0, y: 0, z: 0.62 });
  const [aperto, setAperto] = useState<Nodo | null>(null);
  const [zonaSola, setZonaSola] = useState<ChiaveZona | null>(null);
  const telaio = useRef<HTMLDivElement>(null);
  const trascino = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  /* I fili si calcolano una volta: sono venti segmenti fissi. */
  const fili = useMemo(
    () =>
      FILI.map((f) => {
        const da = NODI.find((n) => n.id === f.da);
        const a = NODI.find((n) => n.id === f.a);
        if (!da || !a) return null;
        const p = centroDi(da);
        const q = centroDi(a);
        /* Curva morbida: due maniglie orizzontali. Una linea dritta fra
           due box sfalsati taglia in diagonale e sembra un errore. */
        const dx = Math.max(40, Math.abs(q.x - p.x) * 0.45);
        return {
          ...f,
          d: `M ${p.x} ${p.y} C ${p.x + dx} ${p.y}, ${q.x - dx} ${q.y}, ${q.x} ${q.y}`,
          mx: (p.x + q.x) / 2,
          my: (p.y + q.y) / 2,
          zone: [da.zona, a.zona] as ChiaveZona[],
        };
      }).filter((f): f is NonNullable<typeof f> => f !== null),
    [],
  );

  const iniziaTrascino = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-card]")) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      trascino.current = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y };
    },
    [vista.x, vista.y],
  );

  const muovi = useCallback((e: React.PointerEvent) => {
    const t = trascino.current;
    if (!t) return;
    setVista((v) => ({ ...v, x: t.vx + (e.clientX - t.x), y: t.vy + (e.clientY - t.y) }));
  }, []);

  const fermaTrascino = useCallback(() => {
    trascino.current = null;
  }, []);

  /**
   * ⚠️ LO ZOOM TIENE FERMO IL PUNTO SOTTO IL PUNTATORE. Se ingrandisse
   * rispetto al centro dello schermo, la card che stai guardando
   * scapperebbe via proprio mentre ti avvicini per leggerla.
   */
  const conLaRotella = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const r = telaio.current?.getBoundingClientRect();
    if (!r) return;
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    setVista((v) => {
      const z = Math.min(1.8, Math.max(0.25, v.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      const k = z / v.z;
      return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const inquadraTutto = useCallback(() => {
    const r = telaio.current?.getBoundingClientRect();
    if (!r) return;
    const z = Math.min((r.width - 24) / larghezzaTela, (r.height - 24) / altezzaTela, 1.2);
    setVista({ z, x: (r.width - larghezzaTela * z) / 2, y: (r.height - altezzaTela * z) / 2 });
  }, []);

  const vaiA = useCallback((chiave: ChiaveZona) => {
    const r = telaio.current?.getBoundingClientRect();
    if (!r) return;
    const dentro = NODI.filter((n) => n.zona === chiave);
    if (!dentro.length) return;
    const x0 = Math.min(...dentro.map((n) => n.x)) * U + MARGINE;
    const x1 = Math.max(...dentro.map((n) => n.x)) * U + MARGINE + CARD_W;
    const y0 = Math.min(...dentro.map((n) => n.y)) * U + MARGINE;
    const y1 = Math.max(...dentro.map((n) => n.y)) * U + MARGINE + CARD_H;
    const z = Math.min((r.width - 80) / (x1 - x0), (r.height - 80) / (y1 - y0), 1.1);
    setVista({
      z,
      x: r.width / 2 - ((x0 + x1) / 2) * z,
      y: r.height / 2 - ((y0 + y1) / 2) * z,
    });
    setZonaSola(chiave);
  }, []);

  const spento = (z: ChiaveZona) => zonaSola !== null && zonaSola !== z;

  return (
    <div className="flex h-[calc(100dvh-142px)] min-h-[520px] flex-col gap-3">
      {/* ---------------- i comandi ---------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setZonaSola(null);
            inquadraTutto();
          }}
          className={`rounded-[9px] border px-3 py-1.5 text-[13px] font-medium transition-colors ${
            zonaSola === null
              ? "border-verde/40 bg-menta-tenue text-verde-scuro"
              : "border-bordo bg-white text-fumo hover:text-inchiostro"
          }`}
        >
          Tutto
        </button>
        {ZONE.map((z) => (
          <button
            key={z.chiave}
            type="button"
            onClick={() => vaiA(z.chiave)}
            className={`inline-flex items-center gap-2 rounded-[9px] border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              zonaSola === z.chiave
                ? "border-verde/40 bg-menta-tenue text-verde-scuro"
                : "border-bordo bg-white text-fumo hover:text-inchiostro"
            }`}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: z.tinta }}
            />
            {z.nome}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1">
          {[-1, 1].map((verso) => (
            <button
              key={verso}
              type="button"
              onClick={() =>
                setVista((v) => ({
                  ...v,
                  z: Math.min(1.8, Math.max(0.25, v.z * (verso > 0 ? 1.2 : 1 / 1.2))),
                }))
              }
              className="grid size-8 place-items-center rounded-[9px] border border-bordo bg-white text-[15px] text-fumo transition-colors hover:text-inchiostro"
              aria-label={verso > 0 ? "Ingrandisci" : "Rimpicciolisci"}
            >
              {verso > 0 ? "+" : "−"}
            </button>
          ))}
          <span className="w-12 text-right text-[12.5px] tabular-nums text-fumo-2">
            {Math.round(vista.z * 100)}%
          </span>
        </span>
      </div>

      {/* ---------------- la tela ---------------- */}
      <div
        ref={telaio}
        onPointerDown={iniziaTrascino}
        onPointerMove={muovi}
        onPointerUp={fermaTrascino}
        onPointerCancel={fermaTrascino}
        onWheel={conLaRotella}
        className="relative flex-1 cursor-grab touch-none overflow-hidden rounded-[16px] border border-bordo bg-white active:cursor-grabbing"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(5,46,31,.10) 1px, transparent 1px)",
          backgroundSize: `${22 * vista.z}px ${22 * vista.z}px`,
          backgroundPosition: `${vista.x}px ${vista.y}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: larghezzaTela,
            height: altezzaTela,
            transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.z})`,
          }}
        >
          {/* le fasce delle zone, dietro tutto */}
          {ZONE.map((z) => {
            const dentro = NODI.filter((n) => n.zona === z.chiave);
            if (!dentro.length) return null;
            const x0 = Math.min(...dentro.map((n) => n.x)) * U + MARGINE - 18;
            const x1 = Math.max(...dentro.map((n) => n.x)) * U + MARGINE + CARD_W + 18;
            const y0 = Math.min(...dentro.map((n) => n.y)) * U + MARGINE - 58;
            const y1 = Math.max(...dentro.map((n) => n.y)) * U + MARGINE + CARD_H + 18;
            return (
              <div
                key={z.chiave}
                className="absolute rounded-[18px] border transition-opacity duration-300"
                style={{
                  left: x0,
                  top: y0,
                  width: x1 - x0,
                  height: y1 - y0,
                  borderColor: `${z.tinta}28`,
                  background: `${z.tinta}09`,
                  opacity: spento(z.chiave) ? 0.25 : 1,
                }}
              >
                {/* ⚠️ La testata sta DENTRO la fascia e non deborda:
                    prima la riga di spiegazione usciva dal riquadro e
                    finiva sopra la zona accanto (visto nella prima
                    schermata, 12/08). `max-w` la tiene a bada e
                    `leading-snug` la fa andare a capo. */}
                <p
                  className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: z.tinta }}
                >
                  {z.nome}
                </p>
                <p
                  className="px-4 pt-0.5 text-[11.5px] leading-snug text-fumo-2"
                  style={{ maxWidth: Math.min(x1 - x0 - 32, 420) }}
                >
                  {z.sotto}
                </p>
              </div>
            );
          })}

          {/* i fili, sotto le card */}
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={larghezzaTela}
            height={altezzaTela}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="filo-vivo" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0a9d5c" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#0a9d5c" stopOpacity="0.75" />
                <stop offset="1" stopColor="#0a9d5c" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {fili.map((f, i) => {
              const attenuato = zonaSola !== null && !f.zone.includes(zonaSola);
              return (
                <g key={`${f.da}-${f.a}`} opacity={attenuato ? 0.12 : 1}>
                  <path
                    d={f.d}
                    fill="none"
                    stroke={f.fermo ? "#d97706" : "url(#filo-vivo)"}
                    strokeWidth={f.fermo ? 1.6 : 2}
                    strokeDasharray={f.fermo ? "7 6" : undefined}
                    strokeLinecap="round"
                  />
                  {/* la scintilla che scorre: dice che di lì passa qualcosa */}
                  {!f.fermo && (
                    <circle r="3" fill="#0a9d5c" opacity="0.85">
                      <animateMotion
                        dur={`${3 + (i % 4) * 0.7}s`}
                        repeatCount="indefinite"
                        path={f.d}
                        begin={`${(i % 6) * 0.45}s`}
                      />
                    </circle>
                  )}
                  {f.testo && (
                    <text
                      x={f.mx}
                      y={f.my - 7}
                      textAnchor="middle"
                      className="fill-fumo-2 text-[10px]"
                      style={{ fontSize: 10 }}
                    >
                      {f.testo}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* le card */}
          {NODI.map((n) => {
            const Icona = ICONE[n.icona] ?? Settings;
            const s = STATO[n.stato];
            const zona = ZONE.find((z) => z.chiave === n.zona)!;
            return (
              <button
                key={n.id}
                data-card
                type="button"
                onClick={() => setAperto(n)}
                className={`absolute overflow-hidden rounded-[13px] border bg-white p-3 text-left shadow-[0_10px_28px_-20px_rgba(5,46,31,.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-18px_rgba(5,46,31,.45)] ${s.bordo}`}
                style={{
                  left: MARGINE + n.x * U,
                  top: MARGINE + n.y * U,
                  width: CARD_W,
                  height: CARD_H,
                  opacity: spento(n.zona) ? 0.28 : 1,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ background: zona.tinta }}
                />
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[7px]"
                    style={{ background: `${zona.tinta}18`, color: zona.tinta }}
                  >
                    <Icona className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-semibold leading-tight text-inchiostro">
                        {n.titolo}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full ${s.punto}`}
                      />
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-snug text-fumo">
                      {n.riga}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* la legenda, ferma in basso a sinistra */}
        <div className="pointer-events-none absolute right-3 top-3 rounded-[11px] border border-bordo bg-white/92 px-3 py-2.5 backdrop-blur">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-fumo-2">
            Come si legge
          </p>
          <ul className="mt-1.5 space-y-1">
            {(Object.keys(STATO) as StatoNodo[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-[12px] text-fumo">
                <span aria-hidden="true" className={`size-2 rounded-full ${STATO[k].punto}`} />
                {STATO[k].nome}
              </li>
            ))}
            <li className="flex items-center gap-2 text-[12px] text-fumo">
              <span
                aria-hidden="true"
                className="h-0 w-4 border-t-[1.6px] border-dashed border-[#d97706]"
              />
              strada oggi interrotta
            </li>
          </ul>
        </div>

        <p className="pointer-events-none absolute bottom-3 right-3 text-[11.5px] text-fumo-2">
          Trascina per spostarti · rotella per lo zoom · clicca una card
        </p>
      </div>

      {/* ---------------- il pannello del dettaglio ---------------- */}
      {aperto && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-inchiostro/25"
          onClick={() => setAperto(null)}
        >
          <div
            className="h-full w-full max-w-[440px] overflow-y-auto border-l border-bordo bg-white p-6 shadow-[0_0_60px_rgba(5,46,31,.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: ZONE.find((z) => z.chiave === aperto.zona)!.tinta }}
                >
                  {ZONE.find((z) => z.chiave === aperto.zona)!.nome}
                </p>
                <h2 className="mt-1 font-display text-[24px] leading-tight tracking-[-0.03em]">
                  {aperto.titolo}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAperto(null)}
                className="grid size-9 shrink-0 place-items-center rounded-[10px] text-fumo transition-colors hover:bg-nebbia hover:text-inchiostro"
                aria-label="Chiudi"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            </div>

            <p
              className={`mt-3 inline-flex items-center gap-2 rounded-pillola border px-3 py-1 text-[12.5px] font-medium ${STATO[aperto.stato].bordo} ${STATO[aperto.stato].testo}`}
            >
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${STATO[aperto.stato].punto}`}
              />
              {STATO[aperto.stato].nome}
            </p>

            <p className="mt-4 text-[15px] font-medium leading-relaxed text-inchiostro">
              {aperto.riga}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-fumo">{aperto.dentro}</p>

            {aperto.dove && (
              <a
                href={aperto.dove}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-bordo bg-white px-4 py-2.5 text-[14px] font-medium text-inchiostro transition-colors hover:border-verde/40"
              >
                Vai a vederlo
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
