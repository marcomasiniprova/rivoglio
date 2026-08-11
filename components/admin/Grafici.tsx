import type { GiornoSerie } from "@/lib/eventi/lettura";

/**
 * I GRAFICI, DISEGNATI A MANO.
 *
 * Nel progetto non c'è nessuna libreria di grafici e non se ne aggiunge
 * una: per sei rettangoli e due aree si porterebbero dentro qualche
 * centinaio di chilobyte, un tema da riscrivere per farlo somigliare al
 * nostro, e una dipendenza in più da aggiornare per sempre.
 *
 * ⚠️ IL GRAFICO ESISTE ANCHE QUANDO NON C'È NIENTE DA MOSTRARE (scelta di
 * Valerio). Assi, giorni e nomi dei passi restano disegnati, e al posto
 * dei dati compare "ancora nessun dato". Un riquadro che sparisce fa
 * pensare a un guasto; uno che resta lì vuoto dice la verità, cioè che
 * oggi non è passato nessuno.
 *
 * ⚠️ E "vuoto" non è "non letto": se il registro non si è aperto lo
 * scriviamo con altre parole, perché sono due cose diverse e una delle
 * due va sistemata.
 *
 * ⚠️ NIENTE TESTO DENTRO GLI SVG CHE SI STIRANO. Le barre e le aree usano
 * `preserveAspectRatio="none"` per riempire la scheda a qualsiasi
 * larghezza: là dentro un testo si allargherebbe come uno specchio da
 * luna park. Le etichette stanno fuori, in HTML, alla loro misura vera.
 * L'imbuto invece è un SVG normale, perché sta in una colonna stretta che
 * su desktop e su telefono è larga quasi uguale.
 */

/* ── i mattoni ──────────────────────────────────────────────────────── */

export function Scheda({
  titolo,
  sotto,
  destra,
  children,
  className = "",
}: {
  titolo?: string;
  sotto?: string;
  destra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-bordo bg-white p-4 shadow-[0_1px_2px_rgba(5,46,31,0.04)] sm:p-5 ${className}`}
    >
      {(titolo || destra) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {titolo && (
              <h2 className="font-display text-[15.5px] leading-tight tracking-[-0.02em]">
                {titolo}
              </h2>
            )}
            {sotto && <p className="mt-1 text-[12.5px] leading-snug text-fumo">{sotto}</p>}
          </div>
          {destra && <div className="shrink-0">{destra}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** La legenda del riferimento: pallino, nome, e basta. */
export function Legenda({ voci }: { voci: { nome: string; classe: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {voci.map((v) => (
        <li key={v.nome} className="flex items-center gap-1.5 text-[12px] text-fumo">
          <span aria-hidden="true" className={`size-2 rounded-[3px] ${v.classe}`} />
          {v.nome}
        </li>
      ))}
    </ul>
  );
}

/** Il cartello che prende il posto dei dati quando non ce ne sono. */
function Cartello({ testo }: { testo: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <span className="rounded-pillola border border-bordo bg-white/85 px-3 py-1.5 text-[12px] font-medium text-fumo-2 backdrop-blur-sm">
        {testo}
      </span>
    </div>
  );
}

/** Quattro tacche orizzontali: danno la scala senza rubare attenzione. */
function Griglia({ h, w }: { h: number; w: number }) {
  return (
    <g>
      {[0, 0.25, 0.5, 0.75, 1].map((q) => (
        <line
          key={q}
          x1={0}
          x2={w}
          y1={h * q}
          y2={h * q}
          className="stroke-bordo"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

/** Il numero più alto della serie: sotto l'1 la scala si romperebbe. */
const cima = (valori: number[]) => Math.max(1, ...valori);

/**
 * Il righello a sinistra: tre numeri, non dodici.
 *
 * ⚠️ Con un massimo piccolo la tacca di mezzo diventa uguale a una delle
 * altre due, e il righello finiva per dire "1 · 1 · 0" (visto nel giro
 * visivo). Due tacche identiche una sopra l'altra fanno sembrare rotto un
 * grafico che è solo vuoto: sotto il tre si mostrano solo gli estremi.
 */
function Righello({ massimo, suffisso = "" }: { massimo: number; suffisso?: string }) {
  const mezzo = Math.round(massimo * 0.5);
  const passi = massimo >= 3 ? [massimo, mezzo, 0] : [massimo, 0];
  return (
    <div className="flex w-8 shrink-0 flex-col justify-between py-0 text-right text-[10.5px] leading-none text-fumo-2 sm:w-9">
      {passi.map((p, i) => (
        <span key={i} className="numeri">
          {p}
          {suffisso}
        </span>
      ))}
    </div>
  );
}

/* ── le colonne per giorno ──────────────────────────────────────────── */

export type SerieBarre = { nome: string; classe: string; valore: (g: GiornoSerie) => number };

/**
 * Le colonne affiancate, un gruppo per giorno.
 *
 * Affiancate e non impilate: impilate sembrerebbero una somma, e "visite
 * più analisi" non è un numero che significhi qualcosa (chi fa un'analisi
 * è già dentro le visite, lo conteremmo due volte).
 */
export function Barre({
  serie,
  giorni,
  altezza = 250,
}: {
  serie: SerieBarre[];
  giorni: GiornoSerie[] | null;
  altezza?: number;
}) {
  const dati = giorni ?? [];
  const W = 1000;
  const H = 300;
  const tutti = dati.flatMap((g) => serie.map((s) => s.valore(g)));
  const massimo = cima(tutti);
  const vuoto = dati.length === 0 || tutti.every((v) => v === 0);

  const passo = W / Math.max(1, dati.length);
  const larghezzaGruppo = passo * 0.62;
  const larghezzaBarra = larghezzaGruppo / serie.length;

  return (
    <div>
      <div className="flex gap-2">
        <Righello massimo={massimo} />
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ height: altezza }}
            className="w-full"
            role="img"
            aria-label={`Colonne per giorno: ${serie.map((s) => s.nome).join(", ")}`}
          >
            <Griglia h={H} w={W} />
            {!vuoto &&
              dati.map((g, i) =>
                serie.map((s, j) => {
                  const v = s.valore(g);
                  /* ⚠️ Una serie piccola accanto a una grande spariva: i
                     pagamenti (2 al giorno) contro le visite (60)
                     diventavano meno di due pixel. Sotto questa soglia il
                     valore c'è ma non si vede, e un grafico che nasconde
                     un dato vero è peggio di nessun grafico. L'altezza si
                     calcola PRIMA della posizione, se no la barra minima
                     sfonderebbe la linea di base. */
                  const h = Math.max(v > 0 ? 9 : 0, (v / massimo) * (H - 4));
                  const x = i * passo + (passo - larghezzaGruppo) / 2 + j * larghezzaBarra;
                  return (
                    <rect
                      key={`${g.giorno}-${s.nome}`}
                      x={x + larghezzaBarra * 0.08}
                      y={H - h}
                      width={larghezzaBarra * 0.84}
                      height={h}
                      rx={2}
                      className={`${s.classe} g-sale`}
                      style={{ ["--n" as string]: i }}
                    />
                  );
                }),
              )}
          </svg>
          {vuoto && <Cartello testo={giorni === null ? "non letto" : "ancora nessun dato"} />}
        </div>
      </div>

      {/* I giorni: in HTML, quindi leggibili anche a 390 punti. Sotto i
          640 se ne mostra uno ogni due, se no diventano una banda grigia. */}
      <div className="mt-2 flex gap-2">
        <div className="w-8 shrink-0 sm:w-9" />
        <div className="flex min-w-0 flex-1">
          {dati.map((g, i) => (
            <span
              key={g.giorno}
              className={`min-w-0 flex-1 truncate text-center text-[10.5px] ${
                g.oggi ? "font-medium text-inchiostro" : "text-fumo-2"
              } ${i % 2 === 1 && dati.length > 8 ? "hidden sm:inline" : ""}`}
            >
              {g.oggi ? "oggi" : g.etichetta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── le due aree ────────────────────────────────────────────────────── */

export type SerieArea = {
  nome: string;
  /** Le classi Tailwind del riempimento e del tratto. */
  riempimento: string;
  tratto: string;
  valore: (g: GiornoSerie) => number;
};

/**
 * Due aree sovrapposte e la linea tratteggiata su oggi.
 *
 * Perché due e non una: da sole "quante analisi" non dicono niente. Il
 * paio analisi/idonei mostra a colpo d'occhio quanta parte del lavoro
 * può diventare una vendita, e lo spazio fra le due curve è esattamente
 * quello che non venderemo mai.
 */
export function Area({
  serie,
  giorni,
  altezza = 200,
}: {
  serie: SerieArea[];
  giorni: GiornoSerie[] | null;
  altezza?: number;
}) {
  const dati = giorni ?? [];
  const W = 1000;
  const H = 300;
  const tutti = dati.flatMap((g) => serie.map((s) => s.valore(g)));
  const massimo = cima(tutti);
  const vuoto = dati.length === 0 || tutti.every((v) => v === 0);

  const x = (i: number) => (dati.length <= 1 ? W / 2 : (i / (dati.length - 1)) * W);
  const y = (v: number) => H - (v / massimo) * (H - 6);
  const iOggi = dati.findIndex((g) => g.oggi);

  return (
    <div>
      <div className="flex gap-2">
        <Righello massimo={massimo} />
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ height: altezza }}
            className="w-full"
            role="img"
            aria-label={`Andamento: ${serie.map((s) => s.nome).join(", ")}`}
          >
            <Griglia h={H} w={W} />
            {!vuoto &&
              serie.map((s) => {
                const punti = dati.map((g, i) => `${x(i)},${y(s.valore(g))}`);
                return (
                  <g key={s.nome} className="g-entra">
                    <polygon
                      points={`0,${H} ${punti.join(" ")} ${W},${H}`}
                      className={s.riempimento}
                    />
                    <polyline
                      points={punti.join(" ")}
                      fill="none"
                      className={s.tratto}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            {/* La messa a fuoco del riferimento: qui è sempre OGGI, perché
                è l'unico punto che si guarda tutte le mattine.
                ⚠️ Oggi è l'ULTIMO punto, quindi la riga cadeva esattamente
                sul bordo destro e si vedeva a metà: rientra di un paio di
                unità. */}
            {iOggi >= 0 && (
              <line
                x1={Math.min(x(iOggi), W - 2)}
                x2={Math.min(x(iOggi), W - 2)}
                y1={0}
                y2={H}
                className="stroke-fumo-2"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* Il pallino sull'ultimo dato: senza, "dove siamo oggi" si
                deve indovinare guardando dove finisce la curva. */}
            {!vuoto &&
              iOggi >= 0 &&
              serie.map((s) => (
                <circle
                  key={`oggi-${s.nome}`}
                  cx={Math.min(x(iOggi), W - 2)}
                  cy={y(s.valore(dati[iOggi]))}
                  r={4}
                  className={`${s.tratto} fill-white`}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
          </svg>
          {vuoto && <Cartello testo={giorni === null ? "non letto" : "ancora nessun dato"} />}
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <div className="w-8 shrink-0 sm:w-9" />
        <div className="flex min-w-0 flex-1">
          {dati.map((g, i) => (
            <span
              key={g.giorno}
              className={`min-w-0 flex-1 truncate text-center text-[10.5px] ${
                g.oggi ? "font-medium text-inchiostro" : "text-fumo-2"
              } ${i % 2 === 1 && dati.length > 8 ? "hidden sm:inline" : ""}`}
            >
              {g.oggi ? "oggi" : g.etichetta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── l'imbuto: il pezzo che si guarda per primo ─────────────────────── */

export type PassoImbuto = { nome: string; quanti: number | null };

/**
 * L'IMBUTO.
 *
 * Non è un grafico a barre girato: le bande sono CENTRATE, e messe una
 * sotto l'altra disegnano la sagoma di un imbuto che si stringe. Fra una
 * banda e l'altra c'è scritto quanta gente si è persa lì in mezzo, ed è
 * l'unico numero di tutto il pannello che dice cosa fare domani.
 *
 * ⚠️ Quando un passo vale zero resta una riga sottile invece di sparire:
 * un imbuto che finisce a metà sembra rotto, uno che si assottiglia fino
 * al filo racconta esattamente quello che sta succedendo.
 */
export function Imbuto({ passi }: { passi: PassoImbuto[] }) {
  const W = 340;
  const ALTEZZA_PASSO = 48;
  const H = passi.length * ALTEZZA_PASSO + 8;
  const massimo = cima(passi.map((p) => p.quanti ?? 0));
  const vuoto = passi.every((p) => (p.quanti ?? 0) === 0);
  const nonLetto = passi.every((p) => p.quanti === null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="L'imbuto">
        {passi.map((p, i) => {
          const v = p.quanti ?? 0;
          const larghezza = Math.max(3, (v / massimo) * (W - 8));
          const yPerdita = i * ALTEZZA_PASSO + 2;
          const yTesto = i * ALTEZZA_PASSO + 18;
          const yBanda = i * ALTEZZA_PASSO + 26;
          const prima = passi[i - 1]?.quanti ?? null;
          /* La perdita si scrive solo se si può calcolare davvero: senza
             il passo di prima, o con zero sopra, non è una percentuale,
             è una divisione per zero travestita. */
          const perdita =
            i > 0 && prima !== null && prima > 0 && p.quanti !== null
              ? Math.round(((prima - v) / prima) * 100)
              : null;

          return (
            <g key={p.nome}>
              <text x={0} y={yTesto} className="fill-fumo" fontSize={11.5}>
                {p.nome}
              </text>
              <text
                x={W}
                y={yTesto}
                textAnchor="end"
                fontSize={12.5}
                className={v > 0 ? "fill-inchiostro" : "fill-fumo-2"}
                fontWeight={600}
              >
                {p.quanti === null ? "non letto" : v}
              </text>
              <rect
                x={(W - larghezza) / 2}
                y={yBanda}
                width={larghezza}
                height={10}
                rx={3}
                className={v > 0 ? "fill-verde g-larga" : "fill-bordo"}
                style={{ ["--n" as string]: i }}
              />
              {/* ⚠️ La perdita sta SOPRA il nome del passo a cui si
                  riferisce. Scritta sotto la banda precedente sembrava
                  appartenere al passo di prima, e sotto l'ultima restava
                  una percentuale appesa nel vuoto (visto nel giro
                  visivo). */}
              {perdita !== null && perdita > 0 && (
                <text x={W} y={yPerdita} textAnchor="end" fontSize={10.5} className="fill-fumo-2">
                  {`meno ${perdita}%`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {vuoto && <Cartello testo={nonLetto ? "non letto" : "ancora nessun dato"} />}
    </div>
  );
}

/* ── la classifica a barrette: da dove arrivano, da che paese ───────── */

export function BarreOrizzontali({
  righe,
  vuotoTesto = "ancora nessun dato",
}: {
  righe: { nome: string; quanti: number }[] | null;
  vuotoTesto?: string;
}) {
  if (righe === null) {
    return <p className="py-6 text-center text-[13px] text-fumo-2">Non letto.</p>;
  }
  if (righe.length === 0) {
    return <p className="py-6 text-center text-[13px] text-fumo-2">{vuotoTesto}</p>;
  }
  const massimo = cima(righe.map((r) => r.quanti));

  return (
    <ul className="flex flex-col gap-2.5">
      {righe.map((r, i) => (
        <li key={r.nome}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate text-fumo">{r.nome}</span>
            <span className="numeri shrink-0 font-medium text-inchiostro">{r.quanti}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pillola bg-nebbia-2">
            <div
              className="g-larga-sx h-full rounded-pillola bg-verde"
              style={{ width: `${(r.quanti / massimo) * 100}%`, ["--n" as string]: i }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
