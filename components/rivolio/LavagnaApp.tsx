"use client";

/**
 * LA LAVAGNA DELL'APP.
 *
 * Un tavolo da lavoro dove l'app sta tutta insieme sotto gli occhi: si
 * trascina col dito o col mouse, si zooma con la rotellina, e il modello
 * di telefono si cambia per TUTTE le schermate in una volta. Serve a
 * Valerio per guardare l'app senza installare niente e senza aprire
 * quattordici indirizzi a mano.
 *
 * Ogni riquadro è l'app VERA (la build web di Expo in /app-anteprima),
 * non una figura: si tocca, si scorre, risponde. Perché siano l'app vera
 * e non uno screenshot: uno screenshot invecchia al primo push e nessuno
 * se ne accorge.
 *
 * Le schermate partono SPENTE e si accendono quando entrano nello
 * schermo: quattordici copie dell'app caricate insieme al primo secondo
 * inchioderebbero qualsiasi computer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ── I telefoni ──────────────────────────────────────────────────────
   Misure vere dei punti CSS, non pixel fisici: sono quelle che vede il
   codice dell'app quando gira sul telefono di una persona. */
type Telefono = {
  id: string;
  nome: string;
  larghezza: number;
  altezza: number;
  raggio: number;
  /** La cornice ai lati. */
  cornice: number;
  /** La cornice sopra e sotto: sull'SE è larga, sui moderni no. */
  cornicePiedi?: number;
  /** L'isola in alto, la fotocamera a foro, oppure niente. */
  testa: "isola" | "foro" | "niente";
};

const TELEFONI: Telefono[] = [
  {
    id: "15pro",
    nome: "iPhone 15 Pro",
    larghezza: 393,
    altezza: 852,
    raggio: 52,
    cornice: 11,
    testa: "isola",
  },
  {
    id: "se",
    nome: "iPhone SE",
    larghezza: 375,
    altezza: 667,
    raggio: 20,
    cornice: 11,
    cornicePiedi: 62,
    testa: "niente",
  },
  {
    id: "pixel",
    nome: "Pixel 8",
    larghezza: 412,
    altezza: 915,
    raggio: 34,
    cornice: 9,
    testa: "foro",
  },
  {
    id: "nudo",
    nome: "Solo schermo",
    larghezza: 393,
    altezza: 852,
    raggio: 6,
    cornice: 0,
    testa: "niente",
  },
];

/* ── Le schermate ────────────────────────────────────────────────────
   Solo quelle che si reggono da sole. Quelle che vivono dentro una
   pratica vera (i quattro fogli, la cassa, gli esiti) hanno bisogno di
   un account e di una pratica pagata: si raggiungono entrando con le
   proprie credenziali dentro un riquadro qualsiasi, e non si mettono
   qui con dati finti. */
const VERDETTO_BASE =
  "volo=ZZ250&data=2026-03-12&id=demo&da=Bergamo&a=Lanzarote&previsto=2026-03-12T08:40:00Z&effettivo=2026-03-12T12:00:00Z&km=2980&demo=1";

type Schermata = { titolo: string; nota: string; rotta: string };
type Gruppo = { titolo: string; schermate: Schermata[] };

const GRUPPI: Gruppo[] = [
  {
    titolo: "L'ingresso",
    schermate: [
      { titolo: "Benvenuto", nota: "la prima apertura", rotta: "/benvenuto" },
      {
        titolo: "Accesso",
        nota: "password o codice via email",
        rotta: "/accesso",
      },
      {
        titolo: "Permessi",
        nota: "prima della finestra di sistema",
        rotta: "/permessi",
      },
    ],
  },
  {
    titolo: "Il check",
    schermate: [
      {
        titolo: "Controlla",
        nota: "tratta, carta d'imbarco, numero",
        rotta: "/",
      },
      {
        titolo: "Verdetto idoneo",
        nota: "la fascia e il passaggio alla cassa",
        rotta: `/verdetto?${VERDETTO_BASE}&esito=idoneo&importo=400&ritardo=200&motivo=${encodeURIComponent(
          "Ritardo all'arrivo di 3 h e 20 min sulla tratta oltre i 1500 km.",
        )}`,
      },
      {
        titolo: "Verdetto incerto",
        nota: "quando il dato non basta, e non si vende",
        rotta: `/verdetto?${VERDETTO_BASE}&esito=incerto&importo=0&ritardo=0&motivo=${encodeURIComponent(
          "L'orario di arrivo non risulta ancora consolidato negli archivi.",
        )}`,
      },
      {
        titolo: "Verdetto non idoneo",
        nota: "il no, detto in faccia",
        rotta: `/verdetto?${VERDETTO_BASE}&esito=non_idoneo&importo=0&ritardo=95&motivo=${encodeURIComponent(
          "Ritardo all'arrivo di 1 h e 35 min: sotto le tre ore la compensazione non spetta.",
        )}`,
      },
    ],
  },
  {
    titolo: "Le pratiche",
    schermate: [
      { titolo: "Home", nota: "compare con la prima pratica", rotta: "/home" },
      {
        titolo: "Pratiche",
        nota: "aperte, chiuse, prossimo passo",
        rotta: "/pratiche",
      },
    ],
  },
  {
    titolo: "L'account",
    schermate: [
      { titolo: "Profilo", nota: "portafoglio e voci", rotta: "/profilo" },
      {
        titolo: "Modifica profilo",
        nota: "nickname e classifica",
        rotta: "/modifica-profilo",
      },
      {
        titolo: "Sicurezza e dati",
        nota: "password, dati, eliminazione",
        rotta: "/sicurezza",
      },
      {
        titolo: "Classifica",
        nota: "spenta al lancio, pronta",
        rotta: "/classifica",
      },
    ],
  },
];

const BASE = "/app-anteprima";

/* LA SCHERMATA DI BENVENUTO SI METTE DA PARTE PRIMA CHE NASCA UN
   RIQUADRO. Senza questa riga metà del tavolo mostrerebbe il logo che
   respira invece della propria schermata: l'app manda al benvenuto
   chiunque non l'abbia ancora visto, e ogni riquadro è un "chiunque".
   La chiave è la stessa che scrive l'app (sul web quel magazzino è il
   localStorage del browser, senza prefissi), e sta qui fuori invece che
   dentro un effetto perché deve essere già scritta al primo disegno.
   Il riquadro "Benvenuto" la mostra lo stesso: ci va dritto. */
if (typeof window !== "undefined") {
  try {
    window.localStorage.setItem("rivolio.benvenuto.v1", "1");
  } catch {
    /* casella piena o negata: al peggio si rivede il benvenuto */
  }
}
const GAP_X = 44;
const GAP_Y = 96;
const ALTEZZA_ETICHETTA = 46;
const ALTEZZA_TITOLO = 62;

type Posizione = {
  chiave: string;
  schermata: Schermata;
  x: number;
  y: number;
};

/** Dove va ogni riquadro, e quanto è grande il tavolo. */
function disponi(t: Telefono) {
  const piedi = t.cornicePiedi ?? t.cornice;
  const largo = t.larghezza + t.cornice * 2;
  const alto = t.altezza + piedi * 2 + ALTEZZA_ETICHETTA;

  const riquadri: Posizione[] = [];
  const titoli: { titolo: string; x: number; y: number }[] = [];
  let y = 0;
  let largoMax = 0;

  for (const gruppo of GRUPPI) {
    titoli.push({ titolo: gruppo.titolo, x: 0, y });
    y += ALTEZZA_TITOLO;
    gruppo.schermate.forEach((s, i) => {
      riquadri.push({
        chiave: `${gruppo.titolo}/${s.titolo}`,
        schermata: s,
        x: i * (largo + GAP_X),
        y,
      });
    });
    largoMax = Math.max(
      largoMax,
      gruppo.schermate.length * largo + (gruppo.schermate.length - 1) * GAP_X,
    );
    y += alto + GAP_Y;
  }

  return {
    riquadri,
    titoli,
    largo,
    alto,
    larghezzaTavolo: largoMax,
    altezzaTavolo: y - GAP_Y,
  };
}

/* ── Un riquadro ─────────────────────────────────────────────────────
   L'app dentro il telefono. L'iframe nasce solo quando il riquadro si
   avvicina allo schermo, e da lì in poi resta: ricaricarlo a ogni
   passaggio farebbe ripartire l'animazione di apertura ogni volta. */
function Riquadro({
  posizione,
  telefono,
  largo,
  alto,
  ricarica,
}: {
  posizione: Posizione;
  telefono: Telefono;
  largo: number;
  alto: number;
  ricarica: number;
}) {
  const scatola = useRef<HTMLDivElement>(null);
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    const nodo = scatola.current;
    if (!nodo || acceso) return;
    const osservatore = new IntersectionObserver(
      (voci) => {
        if (voci.some((v) => v.isIntersecting)) setAcceso(true);
      },
      { rootMargin: "600px" },
    );
    osservatore.observe(nodo);
    return () => osservatore.disconnect();
  }, [acceso]);

  const { schermata } = posizione;

  return (
    <div
      ref={scatola}
      className="absolute"
      style={{
        left: posizione.x,
        top: posizione.y,
        width: largo,
        height: alto,
      }}
    >
      <div className="flex h-[46px] flex-col justify-end pb-2">
        <p className="truncate text-[15px] font-medium leading-tight text-white/90">
          {schermata.titolo}
        </p>
        <p className="truncate text-[12.5px] leading-tight text-white/40">
          {schermata.nota}
        </p>
      </div>

      <div
        className="relative bg-[#181b21]"
        style={{
          width: largo,
          height:
            telefono.altezza + (telefono.cornicePiedi ?? telefono.cornice) * 2,
          padding: `${telefono.cornicePiedi ?? telefono.cornice}px ${telefono.cornice}px`,
          borderRadius: telefono.raggio + telefono.cornice,
          boxShadow:
            telefono.cornice > 0
              ? "0 0 0 1.5px rgba(255,255,255,.09), 0 40px 70px -30px rgba(0,0,0,.9)"
              : "0 0 0 1.5px rgba(255,255,255,.09), 0 30px 60px -34px rgba(0,0,0,.9)",
        }}
      >
        {telefono.cornice > 0 && (
          <>
            <span className="absolute -left-[2px] top-24 h-8 w-[3px] rounded-l bg-[#2a2e37]" />
            <span className="absolute -left-[2px] top-36 h-14 w-[3px] rounded-l bg-[#2a2e37]" />
            <span className="absolute -right-[2px] top-32 h-20 w-[3px] rounded-r bg-[#2a2e37]" />
          </>
        )}

        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: telefono.larghezza,
            height: telefono.altezza,
            borderRadius: telefono.raggio,
          }}
        >
          {telefono.testa === "isola" && (
            <span className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-[26px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
          )}
          {telefono.testa === "foro" && (
            <span className="pointer-events-none absolute left-1/2 top-3 z-10 size-[11px] -translate-x-1/2 rounded-full bg-black" />
          )}

          {acceso ? (
            <iframe
              key={`${schermata.rotta}#${ricarica}`}
              src={`${BASE}${schermata.rotta}`}
              title={`Rivolio: ${schermata.titolo}`}
              className="size-full border-0 bg-white"
              loading="lazy"
            />
          ) : (
            <div className="grid size-full place-items-center bg-[#f6f8fa]">
              <span className="text-[13px] text-black/25">
                si accende avvicinandosi
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Una sola schermata ──────────────────────────────────────────────
   Un telefono grande, tutto dentro lo schermo. Il telefono più alto che
   abbiamo fa 933 punti con la cornice: su un portatile non ci sta, e
   lasciarlo traboccare significherebbe non vedere mai il fondo della
   schermata. Quindi si rimpicciolisce quel tanto che basta. */
function Singola({
  schermata,
  telefono,
  largo,
  alto,
  ricarica,
}: {
  schermata: Schermata;
  telefono: Telefono;
  largo: number;
  alto: number;
  ricarica: number;
}) {
  const cornice = useRef<HTMLDivElement>(null);
  const [scala, setScala] = useState(1);

  useEffect(() => {
    const nodo = cornice.current;
    if (!nodo) return;
    const misura = new ResizeObserver(([voce]) => {
      setScala(Math.min(1, (voce.contentRect.height - 48) / alto));
    });
    misura.observe(nodo);
    return () => misura.disconnect();
  }, [alto]);

  return (
    <div
      ref={cornice}
      className="flex flex-1 items-start justify-center overflow-hidden pt-6"
    >
      <div
        style={{
          transform: `scale(${scala})`,
          transformOrigin: "top center",
          width: largo,
          height: alto,
        }}
      >
        <Riquadro
          posizione={{ chiave: "singola", schermata, x: 0, y: 0 }}
          telefono={telefono}
          largo={largo}
          alto={alto}
          ricarica={ricarica}
        />
      </div>
    </div>
  );
}

/* ── La lavagna ──────────────────────────────────────────────────── */
export default function LavagnaApp() {
  const [telefonoId, setTelefonoId] = useState(TELEFONI[0].id);
  const [singola, setSingola] = useState<string | null>(null);
  const [vista, setVista] = useState({ x: 0, y: 0, z: 0.5 });
  const [ricarica, setRicarica] = useState(0);
  const cornice = useRef<HTMLDivElement>(null);
  const trascino = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
  } | null>(null);

  const telefono = TELEFONI.find((t) => t.id === telefonoId) ?? TELEFONI[0];
  const tavolo = useMemo(() => disponi(telefono), [telefono]);

  /* Il tavolo si adatta alla LARGHEZZA, non all'altezza. Farci stare
     dentro anche i quattro gruppi in verticale porterebbe lo zoom al 15%,
     cioè telefoni grandi come francobolli: si vedrebbe tutto e non si
     leggerebbe niente. In altezza si scorre trascinando. */
  const adatta = useCallback(() => {
    const nodo = cornice.current;
    if (!nodo) return;
    const z = Math.min((nodo.clientWidth - 96) / tavolo.larghezzaTavolo, 1);
    setVista({
      z,
      x: (nodo.clientWidth - tavolo.larghezzaTavolo * z) / 2,
      y: 40,
    });
  }, [tavolo.larghezzaTavolo]);

  useEffect(() => {
    if (!singola) adatta();
  }, [adatta, singola]);

  /* La rotellina zooma tenendo fermo il punto sotto il puntatore: se
     zoomasse sul centro dello schermo, il riquadro che stai guardando
     scapperebbe via ogni volta. */
  useEffect(() => {
    const nodo = cornice.current;
    if (!nodo || singola) return;
    const suRotella = (e: WheelEvent) => {
      e.preventDefault();
      const r = nodo.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setVista((v) => {
        const z = Math.min(
          2,
          Math.max(0.12, v.z * Math.exp(-e.deltaY * 0.0016)),
        );
        const k = z / v.z;
        return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    nodo.addEventListener("wheel", suRotella, { passive: false });
    return () => nodo.removeEventListener("wheel", suRotella);
  }, [singola]);

  function iniziaTrascino(e: React.PointerEvent) {
    /* Solo dal fondo: dentro un telefono il dito serve all'app. */
    if (e.target !== e.currentTarget) return;
    trascino.current = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function muoviTrascino(e: React.PointerEvent) {
    const t = trascino.current;
    if (!t) return;
    setVista((v) => ({
      ...v,
      x: t.vx + (e.clientX - t.x),
      y: t.vy + (e.clientY - t.y),
    }));
  }
  function fermaTrascino() {
    trascino.current = null;
  }

  const zoom = (verso: number) =>
    setVista((v) => ({
      ...v,
      z: Math.min(2, Math.max(0.12, v.z * (verso > 0 ? 1.25 : 0.8))),
    }));

  const schermataSingola = GRUPPI.flatMap((g) => g.schermate).find(
    (s) => s.titolo === singola,
  );

  return (
    <div className="flex h-dvh flex-col bg-[#0b0e13] text-white">
      {/* ─────────────────────────────────────────────── la barra sopra */}
      <header className="z-20 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 bg-[#0e1219] px-5 py-3">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-[17px] tracking-[-0.02em]">
            Rivolio
          </span>
          <span className="text-[12.5px] text-white/40">
            la lavagna dell&apos;app
          </span>
        </div>

        <Segmenti
          etichetta="Telefono"
          voci={TELEFONI.map((t) => ({ id: t.id, nome: t.nome }))}
          scelto={telefonoId}
          scegli={setTelefonoId}
        />

        <Segmenti
          etichetta="Vista"
          voci={[
            { id: "tutte", nome: "Tutte" },
            ...GRUPPI.flatMap((g) => g.schermate).map((s) => ({
              id: s.titolo,
              nome: s.titolo,
            })),
          ]}
          scelto={singola ?? "tutte"}
          scegli={(id) => setSingola(id === "tutte" ? null : id)}
        />

        {!singola && (
          <div className="flex items-center gap-1.5">
            <Tasto onClick={() => zoom(-1)} etichetta="Rimpicciolisci">
              −
            </Tasto>
            <span className="w-12 text-center text-[12.5px] tabular-nums text-white/50">
              {Math.round(vista.z * 100)}%
            </span>
            <Tasto onClick={() => zoom(1)} etichetta="Ingrandisci">
              +
            </Tasto>
            <Tasto onClick={adatta} etichetta="Adatta allo schermo">
              Adatta
            </Tasto>
          </div>
        )}

        <Tasto
          onClick={() => setRicarica((n) => n + 1)}
          etichetta="Ricarica tutte le schermate"
        >
          Ricarica
        </Tasto>

        <p className="ml-auto max-w-[30rem] text-[11.5px] leading-snug text-white/35">
          Sono l&apos;app vera: si toccano e rispondono. Le schermate dentro una
          pratica (i quattro fogli, la cassa, gli esiti) si aprono entrando col
          tuo account da un riquadro qualsiasi.
        </p>
      </header>

      {/* ───────────────────────────────────────────────────── il tavolo */}
      {singola && schermataSingola ? (
        <Singola
          schermata={schermataSingola}
          telefono={telefono}
          largo={tavolo.largo}
          alto={tavolo.alto}
          ricarica={ricarica}
        />
      ) : (
        <div
          ref={cornice}
          onPointerDown={iniziaTrascino}
          onPointerMove={muoviTrascino}
          onPointerUp={fermaTrascino}
          onPointerCancel={fermaTrascino}
          className="relative flex-1 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)",
            backgroundSize: `${28 * vista.z}px ${28 * vista.z}px`,
            backgroundPosition: `${vista.x}px ${vista.y}px`,
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.z})`,
              width: tavolo.larghezzaTavolo,
              height: tavolo.altezzaTavolo,
            }}
          >
            {tavolo.titoli.map((t) => (
              <p
                key={t.titolo}
                className="absolute font-display text-[26px] tracking-[-0.03em] text-white/70"
                style={{ left: t.x, top: t.y }}
              >
                {t.titolo}
              </p>
            ))}
            {tavolo.riquadri.map((r) => (
              <Riquadro
                key={r.chiave}
                posizione={r}
                telefono={telefono}
                largo={tavolo.largo}
                alto={tavolo.alto}
                ricarica={ricarica}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── I pezzi della barra ─────────────────────────────────────────── */
function Segmenti({
  etichetta,
  voci,
  scelto,
  scegli,
}: {
  etichetta: string;
  voci: { id: string; nome: string }[];
  scelto: string;
  scegli: (id: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
        {etichetta}
      </span>
      <select
        value={scelto}
        onChange={(e) => scegli(e.target.value)}
        className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-white outline-none focus-visible:border-white/35"
      >
        {voci.map((v) => (
          <option key={v.id} value={v.id} className="bg-[#0e1219] text-white">
            {v.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tasto({
  children,
  onClick,
  etichetta,
}: {
  children: React.ReactNode;
  onClick: () => void;
  etichetta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etichetta}
      title={etichetta}
      className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/85 transition-colors hover:bg-white/[0.12]"
    >
      {children}
    </button>
  );
}
