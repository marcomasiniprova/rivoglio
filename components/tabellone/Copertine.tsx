/**
 * LE COPERTINE DEL TABELLONE.
 *
 * Nel riferimento (il journal di Untitled UI) le copertine sono
 * fotografie. Qui non lo sono, e il motivo va detto: in questo ambiente
 * non si generano immagini (la quota Gemini è a zero) e non si scaricano
 * (manca la chiave Unsplash e l'uscita di rete è chiusa). Una copertina
 * vuota o un segnaposto grigio avrebbe affossato la pagina.
 *
 * Quindi sono illustrazioni editoriali disegnate qui, come quelle dei
 * settimanali: un fondo pieno, un soggetto solo, grana di stampa. Non
 * imitano una foto e non ci provano.
 *
 * SOSTITUZIONE: quando arrivano le foto vere basta mettere il file in
 * `public/assets/tabellone/<nome>.webp` e aggiungere `foto` all'articolo.
 * `Copertina` preferisce sempre la foto, se c'è. Nessun altro cambio.
 *
 * Ogni identificativo interno è suffissato con la chiave: in una griglia
 * ci sono nove copertine sulla stessa pagina, e due gradienti con lo
 * stesso id si sovrascrivono a vicenda.
 */

const NOTTE = "#052e1f";
const VERDE = "#0a9d5c";
const SCURO = "#067a46";
const MENTA = "#7fe8ae";
const CARTA = "#fbf9ef";
const CARTA2 = "#f3efdf";
const SOLE = "#f5c451";
const RUGGINE = "#c2492f";

/** La grana di stampa: senza, il vettore sembra una slide di PowerPoint. */
function Grana({ id, opacita = 0.5 }: { id: string; opacita?: number }) {
  return (
    <>
      <filter id={`grana-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        width="640"
        height="400"
        filter={`url(#grana-${id})`}
        opacity={opacita * 0.14}
        style={{ mixBlendMode: "multiply" }}
      />
    </>
  );
}

type Props = { className?: string };

const base = "block h-full w-full";

/* ────────────────────────────────────────────────────────────
   1. IL TABELLONE DELLE PARTENZE
   Le palette che girano. Una riga sta ancora ruotando: è il
   momento in cui il volo passa da "in orario" a "ritardo".
   ──────────────────────────────────────────────────────────── */
function TabellonePartenze({ className = base }: Props) {
  const righe = [
    { ora: "06:40", stato: "IN ORARIO", colore: MENTA, largo: 96 },
    { ora: "07:15", stato: "RITARDO", colore: SOLE, largo: 74 },
    { ora: "07:55", stato: "CANCELLATO", colore: RUGGINE, largo: 112 },
    { ora: "08:20", stato: "IMBARCO", colore: MENTA, largo: 84 },
  ];
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-tab" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0a4630" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
        <linearGradient id="g-tab-flip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123f2c" />
          <stop offset="49%" stopColor="#0d3323" />
          <stop offset="51%" stopColor="#08281b" />
          <stop offset="100%" stopColor="#061f15" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-tab)" />
      <ellipse cx="320" cy="40" rx="300" ry="130" fill={MENTA} opacity="0.09" />

      {righe.map((r, i) => {
        const y = 74 + i * 68;
        return (
          <g key={r.ora}>
            <rect x="66" y={y} width="508" height="52" rx="5" fill="url(#g-tab-flip)" />
            <line x1="66" y1={y + 26} x2="574" y2={y + 26} stroke="#04180f" strokeWidth="1.6" />
            {/* l'ora, in cifre da tabellone */}
            <text
              x="88"
              y={y + 34}
              fill={CARTA}
              opacity="0.92"
              fontSize="24"
              fontWeight="700"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1"
            >
              {r.ora}
            </text>
            {/* la tratta, sfumata: non è lei il soggetto */}
            <rect x="176" y={y + 19} width="120" height="9" rx="4.5" fill={CARTA} opacity="0.22" />
            <rect x="176" y={y + 32} width="70" height="7" rx="3.5" fill={CARTA} opacity="0.12" />
            {/* lo stato */}
            <rect
              x={558 - r.largo}
              y={y + 15}
              width={r.largo}
              height="23"
              rx="4"
              fill={r.colore}
              opacity={i === 1 ? 1 : 0.82}
            />
            <text
              x={558 - r.largo / 2}
              y={y + 31}
              textAnchor="middle"
              fill={NOTTE}
              fontSize="12.5"
              fontWeight="800"
              letterSpacing="0.6"
            >
              {r.stato}
            </text>
          </g>
        );
      })}

      {/* la paletta a metà giro sulla riga del ritardo */}
      <g transform="translate(0,142)">
        <rect x="66" y="0" width="508" height="26" rx="5" fill="#0e3826" opacity="0.96" />
        <rect x="66" y="0" width="508" height="26" rx="5" fill={SOLE} opacity="0.1" />
        <line x1="66" y1="26" x2="574" y2="26" stroke={SOLE} strokeWidth="2" opacity="0.55" />
      </g>

      <Grana id="tab" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   2. LA FETTA DELLA COMMISSIONE
   La compensazione come un rettangolo pieno. Un morso enorme
   se ne va per aria: è la percentuale del portale.
   ──────────────────────────────────────────────────────────── */
function FettaCommissione({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-fetta-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CARTA} />
          <stop offset="100%" stopColor={CARTA2} />
        </linearGradient>
        <linearGradient id="g-fetta-piena" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={VERDE} />
          <stop offset="100%" stopColor={SCURO} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-fetta-bg)" />

      {/* la torta: 600 euro */}
      <g transform="translate(214,200)">
        <circle r="128" fill={NOTTE} opacity="0.1" transform="translate(6,10)" />
        {/* i due terzi che restano a te */}
        <path
          d="M0,0 L128,0 A128,128 0 1,1 44.6,-119.9 Z"
          fill="url(#g-fetta-piena)"
        />
        <circle r="128" fill="none" stroke={NOTTE} strokeWidth="2.5" opacity="0.28" />
        {/* Il buco della ciambella. Senza, il numero cadeva a cavallo fra la
            fetta verde e quella grigia e la "€" spariva sul chiaro: si
            leggeva "390" con un taglio in mezzo. */}
        <circle r="82" fill={NOTTE} />
        <circle r="82" fill="none" stroke={CARTA} strokeWidth="1.5" opacity="0.14" />
        <text
          y="8"
          textAnchor="middle"
          fill={CARTA}
          fontSize="44"
          fontWeight="800"
          letterSpacing="-1.5"
        >
          390€
        </text>
        <text
          y="36"
          textAnchor="middle"
          fill={MENTA}
          fontSize="14"
          fontWeight="600"
          letterSpacing="0.4"
        >
          restano a te
        </text>
      </g>

      {/* la fetta che vola via */}
      <g transform="translate(430,116) rotate(16)">
        <path d="M0,0 L84,0 A84,84 0 0,1 29,78.7 Z" fill={SOLE} />
        <path
          d="M0,0 L84,0 A84,84 0 0,1 29,78.7 Z"
          fill="none"
          stroke={NOTTE}
          strokeWidth="2.5"
          opacity="0.35"
        />
        <text
          x="34"
          y="38"
          textAnchor="middle"
          fill={NOTTE}
          fontSize="26"
          fontWeight="800"
          letterSpacing="-0.5"
        >
          35%
        </text>
      </g>

      {/* la scia: la fetta è appena partita */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${372 + i * 12},${214 - i * 16} q22,-16 44,-26`}
          stroke={SOLE}
          strokeWidth={3 - i * 0.7}
          strokeLinecap="round"
          fill="none"
          opacity={0.55 - i * 0.14}
        />
      ))}

      <text x="440" y="272" fill={NOTTE} fontSize="15" fontWeight="700" opacity="0.55">
        LA COMMISSIONE
      </text>
      <text x="440" y="294" fill={NOTTE} fontSize="13" opacity="0.42">
        del portale, sul tuo rimborso
      </text>

      <Grana id="fetta" opacita={0.7} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   3. LA SOGLIA DELLE TRE ORE
   Un quadrante: prima delle tre non succede niente, dopo si apre.
   ──────────────────────────────────────────────────────────── */
function SogliaTreOre({ className = base }: Props) {
  const R = 118;
  const cx = 320;
  const cy = 214;
  /* archi: 0-3h spento, 3h-5h acceso */
  const punto = (gradi: number, raggio = R) => {
    const rad = ((gradi - 90) * Math.PI) / 180;
    return [cx + raggio * Math.cos(rad), cy + raggio * Math.sin(rad)];
  };
  const [ax, ay] = punto(198);
  const [bx, by] = punto(340);
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-soglia" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0b4a33" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-soglia)" />
      <ellipse cx="320" cy="200" rx="230" ry="180" fill={MENTA} opacity="0.07" />

      {/* le tacche del quadrante */}
      {Array.from({ length: 48 }, (_, i) => {
        const g = i * 7.5;
        const [x1, y1] = punto(g, R + 16);
        const [x2, y2] = punto(g, R + (i % 4 === 0 ? 30 : 24));
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={CARTA}
            strokeWidth={i % 4 === 0 ? 2.2 : 1}
            opacity={g > 198 ? 0.75 : 0.2}
          />
        );
      })}

      {/* l'arco spento e quello acceso */}
      <path
        d={`M${punto(0)[0]},${punto(0)[1]} A${R},${R} 0 0,1 ${ax},${ay}`}
        stroke={CARTA}
        strokeWidth="8"
        fill="none"
        opacity="0.16"
        strokeLinecap="round"
      />
      <path
        d={`M${ax},${ay} A${R},${R} 0 0,1 ${bx},${by}`}
        stroke={MENTA}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* la lancetta ferma appena dopo la soglia */}
      <line
        x1={cx}
        y1={cy}
        x2={punto(214, R - 26)[0]}
        y2={punto(214, R - 26)[1]}
        stroke={SOLE}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="9" fill={SOLE} />
      <circle cx={cx} cy={cy} r="4" fill={NOTTE} />

      {/* il taglio della soglia */}
      <line
        x1={punto(198, R - 34)[0]}
        y1={punto(198, R - 34)[1]}
        x2={punto(198, R + 42)[0]}
        y2={punto(198, R + 42)[1]}
        stroke={SOLE}
        strokeWidth="3"
        strokeDasharray="7 5"
      />
      <text x="118" y="330" fill={SOLE} fontSize="15" fontWeight="700">
        3 ore
      </text>

      <text
        x={cx}
        y={cy - 26}
        textAnchor="middle"
        fill={CARTA}
        fontSize="13"
        fontWeight="600"
        letterSpacing="2.4"
        opacity="0.55"
      >
        RITARDO ALL&apos;ARRIVO
      </text>
      <text
        x={cx}
        y={cy + 74}
        textAnchor="middle"
        fill={MENTA}
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.5"
      >
        da 250€ a 600€
      </text>

      <Grana id="soglia" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   4. IL MODULO RESPINTO
   Un foglio di reclamo con sopra il timbro rosso. È l'immagine
   mentale di chiunque abbia scritto a una compagnia.
   ──────────────────────────────────────────────────────────── */
function ModuloRespinto({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-mod-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d5238" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
        <linearGradient id="g-mod-foglio" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={CARTA2} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-mod-bg)" />

      {/* il foglio sotto, appena ruotato: sono due tentativi */}
      <g transform="translate(196,66) rotate(-5)">
        <rect width="256" height="300" rx="6" fill={CARTA2} opacity="0.35" />
      </g>

      <g transform="translate(206,52) rotate(2.5)">
        <rect width="256" height="300" rx="6" fill="url(#g-mod-foglio)" />
        {/* intestazione */}
        <rect x="26" y="30" width="96" height="10" rx="5" fill={NOTTE} opacity="0.75" />
        <rect x="26" y="50" width="150" height="6" rx="3" fill={NOTTE} opacity="0.2" />
        {/* i campi */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect
              x="26"
              y={82 + i * 30}
              width={i % 3 === 2 ? 132 : 204}
              height="7"
              rx="3.5"
              fill={NOTTE}
              opacity="0.14"
            />
          </g>
        ))}
        {/* la firma */}
        <path
          d="M28,268 q16,-16 30,-2 t26,-4 q14,-12 26,2 t22,-8"
          stroke={NOTTE}
          strokeWidth="2.2"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
        />
      </g>

      {/* il timbro */}
      <g transform="translate(392,236) rotate(-14)" opacity="0.92">
        <rect
          x="-96"
          y="-31"
          width="192"
          height="62"
          rx="7"
          fill="none"
          stroke={RUGGINE}
          strokeWidth="5"
        />
        <rect
          x="-88"
          y="-24"
          width="176"
          height="48"
          rx="4"
          fill="none"
          stroke={RUGGINE}
          strokeWidth="1.6"
          opacity="0.6"
        />
        <text
          x="0"
          y="11"
          textAnchor="middle"
          fill={RUGGINE}
          fontSize="30"
          fontWeight="800"
          letterSpacing="2.5"
        >
          RESPINTO
        </text>
      </g>
      <text
        x="392"
        y="308"
        textAnchor="middle"
        fill={MENTA}
        fontSize="13"
        fontWeight="600"
        letterSpacing="0.8"
        opacity="0.85"
      >
        &quot;circostanza eccezionale&quot;
      </text>

      <Grana id="mod" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   5. IL GIORNO DI SCIOPERO
   Un calendario con una casella marchiata, e l'aereo che non parte.
   ──────────────────────────────────────────────────────────── */
function GiornoSciopero({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-sci-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CARTA} />
          <stop offset="100%" stopColor="#eee9d6" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-sci-bg)" />

      <g transform="translate(96,58)">
        {/* il blocco calendario */}
        <rect x="6" y="10" width="330" height="290" rx="12" fill={NOTTE} opacity="0.12" />
        <rect width="330" height="290" rx="12" fill="#ffffff" />
        <path d="M0,12 A12,12 0 0,1 12,0 L318,0 A12,12 0 0,1 330,12 L330,52 L0,52 Z" fill={NOTTE} />
        <text x="24" y="35" fill={CARTA} fontSize="17" fontWeight="700" letterSpacing="0.5">
          Il giorno dello sciopero
        </text>

        {/* la griglia */}
        {Array.from({ length: 28 }, (_, i) => {
          const col = i % 7;
          const rig = Math.floor(i / 7);
          const x = 22 + col * 42;
          const y = 74 + rig * 52;
          const marcato = i === 16;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="34"
                height="34"
                rx="6"
                fill={marcato ? VERDE : NOTTE}
                opacity={marcato ? 1 : 0.07}
              />
              {marcato && (
                <text
                  x={x + 17}
                  y={y + 23}
                  textAnchor="middle"
                  fill={CARTA}
                  fontSize="15"
                  fontWeight="800"
                >
                  !
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* il megafono */}
      <g transform="translate(452,150) rotate(-16)">
        <path d="M0,26 L0,58 L26,58 L74,92 L74,-8 L26,26 Z" fill={NOTTE} />
        <rect x="-26" y="30" width="26" height="24" rx="5" fill={NOTTE} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${92 + i * 18},${26 - i * 12} a${28 + i * 16},${28 + i * 16} 0 0,1 0,${
              32 + i * 24
            }`}
            stroke={SOLE}
            strokeWidth={4 - i * 0.7}
            fill="none"
            strokeLinecap="round"
            opacity={0.95 - i * 0.24}
          />
        ))}
      </g>

      <Grana id="sci" opacita={0.7} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   6. LA SCUSA DEL METEO
   Una nuvola, e dentro un punto di domanda: la circostanza
   eccezionale è la parola con cui non ti pagano.
   ──────────────────────────────────────────────────────────── */
function ScusaMeteo({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-met-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0c5138" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
        <linearGradient id="g-met-nuvola" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cfd8d2" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-met-bg)" />
      <ellipse cx="320" cy="330" rx="260" ry="90" fill={MENTA} opacity="0.07" />

      {/* la nuvola */}
      <g transform="translate(320,168)">
        <g opacity="0.18" transform="translate(10,16)">
          <ellipse cx="-72" cy="24" rx="62" ry="44" fill={NOTTE} />
          <ellipse cx="0" cy="-6" rx="82" ry="62" fill={NOTTE} />
          <ellipse cx="76" cy="26" rx="58" ry="42" fill={NOTTE} />
          <rect x="-134" y="18" width="268" height="46" rx="23" fill={NOTTE} />
        </g>
        <ellipse cx="-72" cy="24" rx="62" ry="44" fill="url(#g-met-nuvola)" />
        <ellipse cx="0" cy="-6" rx="82" ry="62" fill="url(#g-met-nuvola)" />
        <ellipse cx="76" cy="26" rx="58" ry="42" fill="url(#g-met-nuvola)" />
        <rect x="-134" y="18" width="268" height="46" rx="23" fill="url(#g-met-nuvola)" />
        <text
          x="0"
          y="34"
          textAnchor="middle"
          fill={NOTTE}
          fontSize="86"
          fontWeight="800"
          opacity="0.9"
        >
          ?
        </text>
      </g>

      {/* la pioggia, che in realtà sono euro che non arrivano */}
      {[
        [212, 268],
        [268, 292],
        [324, 274],
        [380, 296],
        [436, 270],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <line
            x1="0"
            y1="0"
            x2="-9"
            y2="34"
            stroke={MENTA}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.28 + i * 0.06}
          />
        </g>
      ))}

      <text
        x="320"
        y="360"
        textAnchor="middle"
        fill={CARTA}
        fontSize="14.5"
        fontWeight="700"
        letterSpacing="2.6"
        opacity="0.62"
      >
        CIRCOSTANZA ECCEZIONALE?
      </text>

      <Grana id="met" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   7. LA BUSTA UFFICIALE
   Il reclamo di secondo grado: una busta con il sigillo.
   ──────────────────────────────────────────────────────────── */
function BustaUfficiale({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-bus-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CARTA} />
          <stop offset="100%" stopColor={CARTA2} />
        </linearGradient>
        <linearGradient id="g-bus-fronte" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0ecdc" />
        </linearGradient>
        <linearGradient id="g-bus-aletta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f4e7" />
          <stop offset="100%" stopColor="#e6e0cb" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-bus-bg)" />

      <g transform="translate(320,206)">
        {/* ombra */}
        <ellipse cx="6" cy="118" rx="186" ry="20" fill={NOTTE} opacity="0.14" />
        {/* corpo */}
        <rect x="-186" y="-104" width="372" height="212" rx="10" fill="url(#g-bus-fronte)" />
        {/* aletta chiusa */}
        <path d="M-186,-94 L0,34 L186,-94 L186,-104 L-186,-104 Z" fill="url(#g-bus-aletta)" />
        <path
          d="M-186,-94 L0,34 L186,-94"
          stroke={NOTTE}
          strokeWidth="1.6"
          fill="none"
          opacity="0.16"
        />
        {/* le due pieghe basse */}
        <path d="M-186,108 L-24,10 M186,108 L24,10" stroke={NOTTE} strokeWidth="1.4" opacity="0.1" />
        {/* le righe da raccomandata sul bordo */}
        {Array.from({ length: 22 }, (_, i) => (
          <rect
            key={i}
            x={-186 + i * 17}
            y="-104"
            width="9"
            height="7"
            fill={i % 2 ? VERDE : NOTTE}
            opacity="0.5"
          />
        ))}
        {/* il sigillo */}
        <g transform="translate(0,26)">
          <circle r="42" fill={VERDE} />
          <circle r="42" fill={NOTTE} opacity="0.14" />
          <circle r="33" fill="none" stroke={CARTA} strokeWidth="1.6" opacity="0.66" />
          {/* l'aereo dentro il sigillo */}
          <path
            d="M-17,3 L13,-9 L18,-4 L4,7 L15,12 L11,16 L-1,12 L-7,17 L-11,15 L-9,9 L-17,7 Z"
            fill={CARTA}
          />
        </g>
        {/* l'indirizzo */}
        <rect x="-118" y="80" width="132" height="7" rx="3.5" fill={NOTTE} opacity="0.2" />
        <rect x="-118" y="94" width="88" height="7" rx="3.5" fill={NOTTE} opacity="0.12" />
      </g>

      <text
        x="320"
        y="366"
        textAnchor="middle"
        fill={NOTTE}
        fontSize="13.5"
        fontWeight="700"
        letterSpacing="2.8"
        opacity="0.42"
      >
        RECLAMO DI SECONDO GRADO
      </text>

      <Grana id="bus" opacita={0.7} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   8. LA MAPPA DEI RITARDI
   L'Italia con i pallini sugli scali: più grosso il pallino,
   peggio si vola. È l'Osservatorio, disegnato.
   ──────────────────────────────────────────────────────────── */
const SCALI: { x: number; y: number; r: number; nome: string }[] = [
  { x: 300, y: 128, r: 15, nome: "MXP" },
  { x: 318, y: 132, r: 9, nome: "LIN" },
  { x: 336, y: 124, r: 12, nome: "BGY" },
  { x: 392, y: 136, r: 11, nome: "VCE" },
  { x: 356, y: 178, r: 13, nome: "BLQ" },
  { x: 388, y: 244, r: 22, nome: "FCO" },
  { x: 438, y: 288, r: 14, nome: "NAP" },
  { x: 456, y: 358, r: 12, nome: "CTA" },
];

function MappaRitardi({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-map-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0b4b34" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
        <radialGradient id="g-map-alone">
          <stop offset="0%" stopColor={MENTA} stopOpacity="0.5" />
          <stop offset="100%" stopColor={MENTA} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-map-bg)" />

      {/* il reticolo: è una mappa, si deve capire */}
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * 52}
          y1="0"
          x2={i * 52}
          y2="400"
          stroke={MENTA}
          strokeWidth="1"
          opacity="0.07"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`o${i}`}
          x1="0"
          y1={i * 52}
          x2="640"
          y2={i * 52}
          stroke={MENTA}
          strokeWidth="1"
          opacity="0.07"
        />
      ))}

      {/* la penisola, stilizzata: non è un atlante, è un manifesto */}
      <path
        d="M262,96 q28,-22 62,-14 q26,6 44,-6 q30,-18 52,4 q18,18 44,10 q22,-6 30,10 q8,16 -12,26
           q-26,12 -50,10 q-24,-2 -40,10 q-16,12 -22,32 q-6,22 4,42 q12,24 30,44 q22,24 34,52
           q10,24 2,44 q-8,20 -28,16 q-18,-4 -26,-22 q-8,-18 -24,-24 q-18,-6 -30,6 q-14,14 -32,10
           q-18,-4 -20,-24 q-2,-20 -18,-30 q-16,-10 -34,-4 q-20,6 -30,-8 q-10,-14 2,-28
           q14,-16 12,-36 q-2,-22 -14,-38 q-14,-18 6,-32 q16,-12 34,-2 q14,8 24,-2 z"
        fill={MENTA}
        opacity="0.13"
      />
      <path
        d="M262,96 q28,-22 62,-14 q26,6 44,-6 q30,-18 52,4 q18,18 44,10 q22,-6 30,10 q8,16 -12,26
           q-26,12 -50,10 q-24,-2 -40,10 q-16,12 -22,32 q-6,22 4,42 q12,24 30,44 q22,24 34,52
           q10,24 2,44 q-8,20 -28,16 q-18,-4 -26,-22 q-8,-18 -24,-24 q-18,-6 -30,6 q-14,14 -32,10
           q-18,-4 -20,-24 q-2,-20 -18,-30 q-16,-10 -34,-4 q-20,6 -30,-8 q-10,-14 2,-28
           q14,-16 12,-36 q-2,-22 -14,-38 q-14,-18 6,-32 q16,-12 34,-2 q14,8 24,-2 z"
        fill="none"
        stroke={MENTA}
        strokeWidth="1.6"
        opacity="0.4"
      />

      {/* i pallini degli scali */}
      {SCALI.map((s) => (
        <g key={s.nome}>
          <circle cx={s.x} cy={s.y} r={s.r * 3.4} fill="url(#g-map-alone)" />
          <circle
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.r > 16 ? SOLE : MENTA}
            opacity={s.r > 16 ? 0.95 : 0.8}
          />
          <circle cx={s.x} cy={s.y} r={s.r} fill="none" stroke={CARTA} strokeWidth="1.4" opacity="0.5" />
        </g>
      ))}

      {/* la legenda */}
      <g transform="translate(48,318)">
        <text fill={CARTA} fontSize="12.5" fontWeight="700" letterSpacing="2.2" opacity="0.6">
          INDICE RITARDI
        </text>
        <circle cx="9" cy="26" r="6" fill={MENTA} opacity="0.85" />
        <text x="26" y="31" fill={CARTA} fontSize="12" opacity="0.55">
          si vola liscio
        </text>
        <circle cx="9" cy="50" r="11" fill={SOLE} />
        <text x="30" y="55" fill={CARTA} fontSize="12" opacity="0.55">
          giornata storta
        </text>
      </g>

      <Grana id="map" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   9. AL GATE, COL TELEFONO IN MANO
   Il momento esatto in cui uno cerca su Google: è bloccato,
   il tabellone dice ritardo, e ha solo il telefono.
   ──────────────────────────────────────────────────────────── */
function GateTelefono({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-gate-vetro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MENTA} stopOpacity="0.34" />
          <stop offset="100%" stopColor={MENTA} stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="g-gate-schermo" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={CARTA2} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill={NOTTE} />
      <rect width="640" height="400" fill="#0e5a3d" opacity="0.5" />
      <ellipse cx="200" cy="40" rx="300" ry="180" fill={MENTA} opacity="0.1" />

      {/* le vetrate del terminal */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 92}
            y="46"
            width="74"
            height="214"
            rx="37"
            fill="url(#g-gate-vetro)"
          />
          <rect
            x={40 + i * 92}
            y="46"
            width="74"
            height="214"
            rx="37"
            fill="none"
            stroke={MENTA}
            strokeWidth="1.4"
            opacity="0.28"
          />
        </g>
      ))}

      {/* la coda di un aereo oltre il vetro */}
      <g transform="translate(150,168)" opacity="0.5">
        <path d="M0,74 L44,-26 L64,-26 L52,74 Z" fill={MENTA} opacity="0.5" />
        <rect x="-40" y="66" width="180" height="12" rx="6" fill={MENTA} opacity="0.4" />
      </g>

      {/* il pavimento */}
      <rect y="272" width="640" height="128" fill={NOTTE} />
      <rect y="272" width="640" height="4" fill={MENTA} opacity="0.28" />

      {/* la mano e il telefono */}
      <g transform="translate(408,150)">
        <rect x="-6" y="6" width="152" height="248" rx="24" fill="#01130c" opacity="0.55" />
        <rect x="-14" y="-2" width="152" height="248" rx="24" fill="#0a1f17" />
        <rect x="-6" y="6" width="136" height="232" rx="18" fill="url(#g-gate-schermo)" />
        {/* dentro lo schermo: il verdetto */}
        <rect x="6" y="20" width="52" height="8" rx="4" fill={NOTTE} opacity="0.25" />
        <rect x="6" y="42" width="112" height="60" rx="8" fill={VERDE} />
        <text x="62" y="70" textAnchor="middle" fill={CARTA} fontSize="21" fontWeight="800">
          400€
        </text>
        <text
          x="62"
          y="88"
          textAnchor="middle"
          fill={MENTA}
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="0.6"
        >
          fascia della tratta
        </text>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="6"
            y={118 + i * 22}
            width={i % 2 ? 84 : 112}
            height="7"
            rx="3.5"
            fill={NOTTE}
            opacity="0.13"
          />
        ))}
        <rect x="6" y="212" width="112" height="20" rx="6" fill={NOTTE} opacity="0.82" />
        {/* il pollice */}
        <path
          d="M124,196 q26,-10 34,6 q8,16 -8,26 q-14,10 -30,4 z"
          fill="#e8c9a8"
          opacity="0.92"
        />
      </g>

      <Grana id="gate" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   10. LE STELLE E LA SOGLIA CHE SI SPOSTA
   La riforma del Regolamento: il cerchio di stelle europee e
   un cursore che sposta l'asticella.
   ──────────────────────────────────────────────────────────── */
function StelleRiforma({ className = base }: Props) {
  const stella = (cx: number, cy: number, r: number) => {
    const punti: string[] = [];
    for (let i = 0; i < 10; i++) {
      const raggio = i % 2 === 0 ? r : r * 0.42;
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      punti.push(`${(cx + raggio * Math.cos(ang)).toFixed(1)},${(cy + raggio * Math.sin(ang)).toFixed(1)}`);
    }
    return punti.join(" ");
  };
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-rif-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0a4b34" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-rif-bg)" />
      <ellipse cx="320" cy="176" rx="220" ry="170" fill={MENTA} opacity="0.08" />

      {/* le dodici stelle */}
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (Math.PI / 6) * i - Math.PI / 2;
        const cx = 320 + 128 * Math.cos(ang);
        const cy = 176 + 128 * Math.sin(ang);
        return (
          <polygon
            key={i}
            points={stella(cx, cy, 16)}
            fill={SOLE}
            opacity={i === 3 ? 1 : 0.82}
          />
        );
      })}

      {/* il cursore che sposta la soglia */}
      <g transform="translate(320,176)">
        <rect x="-102" y="-9" width="204" height="18" rx="9" fill={NOTTE} opacity="0.7" />
        <rect x="-102" y="-9" width="128" height="18" rx="9" fill={MENTA} opacity="0.9" />
        <circle cx="26" cy="0" r="19" fill={CARTA} />
        <circle cx="26" cy="0" r="19" fill="none" stroke={VERDE} strokeWidth="3" />
        <circle cx="26" cy="0" r="6" fill={VERDE} />
        <text
          x="-102"
          y="-24"
          fill={CARTA}
          fontSize="13"
          fontWeight="700"
          opacity="0.55"
          letterSpacing="0.5"
        >
          3 ore
        </text>
        <text
          x="102"
          y="-24"
          textAnchor="end"
          fill={CARTA}
          fontSize="13"
          fontWeight="700"
          opacity="0.28"
          letterSpacing="0.5"
        >
          5 ore
        </text>
      </g>

      <text
        x="320"
        y="356"
        textAnchor="middle"
        fill={CARTA}
        fontSize="14"
        fontWeight="700"
        letterSpacing="3"
        opacity="0.6"
      >
        LA RIFORMA DEL 261
      </text>

      <Grana id="rif" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   11. LA COINCIDENZA PERSA
   Due tratte, e la seconda che parte senza di te.
   ──────────────────────────────────────────────────────────── */
function CoincidenzaPersa({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-coi-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CARTA} />
          <stop offset="100%" stopColor={CARTA2} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-coi-bg)" />

      {/* la rotta */}
      <g>
        <path
          d="M96,268 C186,178 246,166 314,192"
          stroke={VERDE}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M330,196 C412,224 470,178 552,110"
          stroke={NOTTE}
          strokeWidth="4"
          strokeDasharray="10 11"
          fill="none"
          opacity="0.28"
          strokeLinecap="round"
        />
      </g>

      {/* i tre scali */}
      {[
        [96, 268, "Partenza", VERDE],
        [322, 194, "Scalo", SOLE],
        [552, 110, "Destinazione", NOTTE],
      ].map(([x, y, nome, colore], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r="21" fill={colore as string} opacity={i === 2 ? 0.16 : 0.18} />
          <circle r="11" fill={colore as string} />
          <circle r="4.5" fill={CARTA} />
          <text
            y="44"
            textAnchor="middle"
            fill={NOTTE}
            fontSize="13.5"
            fontWeight="700"
            opacity="0.66"
          >
            {nome as string}
          </text>
        </g>
      ))}

      {/* l'aereo che è già partito, oltre lo scalo */}
      <g transform="translate(424,150) rotate(-30)">
        <path
          d="M-26,4 L22,-14 L30,-6 L8,10 L26,18 L20,25 L-2,18 L-12,27 L-19,24 L-15,14 L-27,10 Z"
          fill={NOTTE}
          opacity="0.85"
        />
      </g>
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={368 - i * 20}
          y1={186 + i * 12}
          x2={392 - i * 20}
          y2={172 + i * 12}
          stroke={NOTTE}
          strokeWidth={3 - i * 0.7}
          strokeLinecap="round"
          opacity={0.3 - i * 0.08}
        />
      ))}

      {/* il cartello */}
      <g transform="translate(322,262)">
        <rect x="-104" y="0" width="208" height="46" rx="8" fill={NOTTE} />
        <text
          x="0"
          y="29"
          textAnchor="middle"
          fill={SOLE}
          fontSize="16"
          fontWeight="800"
          letterSpacing="1.2"
        >
          COINCIDENZA PERSA
        </text>
      </g>
      <text
        x="322"
        y="336"
        textAnchor="middle"
        fill={NOTTE}
        fontSize="13"
        opacity="0.45"
      >
        una prenotazione sola, un viaggio solo
      </text>

      <Grana id="coi" opacita={0.7} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   12. IL BANCONE DEL GATE
   Negato l'imbarco: il posto a sedere che non c'è.
   ──────────────────────────────────────────────────────────── */
function ImbarcoNegato({ className = base }: Props) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g-neg-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0c5138" />
          <stop offset="100%" stopColor={NOTTE} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#g-neg-bg)" />

      {/* la fila di poltrone: quattro piene, una barrata */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 64 + i * 108;
        const negata = i === 3;
        return (
          <g key={i} transform={`translate(${x},128)`}>
            <rect
              x="0"
              y="0"
              width="80"
              height="86"
              rx="14"
              fill={negata ? NOTTE : MENTA}
              opacity={negata ? 0.35 : 0.85}
            />
            <rect
              x="0"
              y="0"
              width="80"
              height="86"
              rx="14"
              fill="none"
              stroke={negata ? RUGGINE : CARTA}
              strokeWidth={negata ? 3 : 1.4}
              opacity={negata ? 0.9 : 0.35}
            />
            <rect
              x="6"
              y="86"
              width="68"
              height="46"
              rx="10"
              fill={negata ? NOTTE : MENTA}
              opacity={negata ? 0.28 : 0.65}
            />
            {/* la persona seduta */}
            {!negata && (
              <g transform="translate(40,-6)">
                <circle cy="-16" r="17" fill={CARTA} opacity="0.9" />
                <path d="M-24,4 q24,-24 48,0 z" fill={CARTA} opacity="0.9" />
              </g>
            )}
            {negata && (
              <g stroke={RUGGINE} strokeWidth="6" strokeLinecap="round">
                <line x1="22" y1="26" x2="58" y2="62" />
                <line x1="58" y1="26" x2="22" y2="62" />
              </g>
            )}
          </g>
        );
      })}

      <text
        x="320"
        y="316"
        textAnchor="middle"
        fill={CARTA}
        fontSize="19"
        fontWeight="800"
        letterSpacing="1"
      >
        Il posto era venduto due volte
      </text>
      <text
        x="320"
        y="346"
        textAnchor="middle"
        fill={MENTA}
        fontSize="14"
        opacity="0.75"
      >
        e a restare a terra sei tu
      </text>

      <Grana id="neg" />
    </svg>
  );
}

/** Il catalogo. La chiave è quella che scrive l'articolo in `copertina`. */
export const COPERTINE: Record<string, (p: Props) => React.JSX.Element> = {
  "tabellone-partenze": TabellonePartenze,
  "fetta-commissione": FettaCommissione,
  "soglia-tre-ore": SogliaTreOre,
  "modulo-respinto": ModuloRespinto,
  "giorno-sciopero": GiornoSciopero,
  "scusa-meteo": ScusaMeteo,
  "busta-ufficiale": BustaUfficiale,
  "mappa-ritardi": MappaRitardi,
  "gate-telefono": GateTelefono,
  "stelle-riforma": StelleRiforma,
  "coincidenza-persa": CoincidenzaPersa,
  "imbarco-negato": ImbarcoNegato,
};

export type ChiaveCopertina = keyof typeof COPERTINE;
