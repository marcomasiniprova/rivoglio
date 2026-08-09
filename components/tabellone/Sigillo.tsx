/**
 * IL SIGILLO OLOGRAFICO.
 *
 * Nel riferimento, accanto al titolo del blog, c'è un adesivo iridescente
 * con dentro dei numeri. Quello dice "20K+ USERS, 800+ REVIEWS": noi quei
 * numeri non li abbiamo, e scriverli sarebbe un dato finto che sembra vero
 * (regola 3). Quindi il nostro sigillo dice solo cose vere: il nome del
 * blog, il regolamento su cui si basa e le tre fasce del Regolamento.
 *
 * L'iridescenza non è una texture scaricata: sono cinque macchie di colore
 * sfocate dentro la sagoma, più una lama di luce. È il modo in cui si fa
 * un olografico in stampa, ed è il motivo per cui questo non sembra un
 * gradiente CSS.
 */

const LOBI = 9;
const R = 104;
const r = 84;

/** La sagoma smerlata dell'adesivo. */
function sagoma(): string {
  const cx = 0;
  const cy = 0;
  const passo = Math.PI / LOBI;
  const punto = (i: number) => {
    const raggio = i % 2 === 0 ? r : R;
    const a = i * passo - Math.PI / 2;
    return [cx + raggio * Math.cos(a), cy + raggio * Math.sin(a)] as const;
  };
  let d = "";
  for (let i = 0; i < LOBI * 2; i += 2) {
    const [x0, y0] = punto(i);
    const [cxp, cyp] = punto(i + 1);
    const [x1, y1] = punto((i + 2) % (LOBI * 2));
    d += i === 0 ? `M${x0.toFixed(1)},${y0.toFixed(1)}` : "";
    d += ` Q${cxp.toFixed(1)},${cyp.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return `${d} Z`;
}

const D = sagoma();

/** Una stellina a cinque punte, come quelle sparse sull'adesivo. */
function stella(cx: number, cy: number, raggio: number): string {
  const punti: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? raggio : raggio * 0.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    punti.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return punti.join(" ");
}

export default function Sigillo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-130 -130 260 260"
      className={className}
      role="img"
      aria-label="Sigillo del Tabellone, il blog di Rivolio sul Regolamento CE 261/2004"
    >
      <defs>
        <clipPath id="sig-forma">
          <path d={D} />
        </clipPath>
        <filter id="sig-sfoca" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="17" />
        </filter>
        <filter id="sig-grana" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <path id="sig-cerchio" d="M0,-72 A72,72 0 1,1 -0.1,-72" fill="none" />
        <linearGradient id="sig-lama" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* l'ombra dell'adesivo sulla carta */}
      <path d={D} fill="#052e1f" opacity="0.16" transform="translate(5,9)" />

      <g clipPath="url(#sig-forma)">
        <rect x="-130" y="-130" width="260" height="260" fill="#f4f2ea" />
        {/* le macchie iridescenti */}
        <g filter="url(#sig-sfoca)" opacity="0.88">
          <ellipse cx="-52" cy="-48" rx="62" ry="50" fill="#b8a4f0" />
          <ellipse cx="44" cy="-56" rx="58" ry="46" fill="#8fd8f2" />
          <ellipse cx="62" cy="42" rx="56" ry="52" fill="#7fe8ae" />
          <ellipse cx="-46" cy="58" rx="60" ry="46" fill="#f7c7d8" />
          <ellipse cx="4" cy="6" rx="46" ry="38" fill="#f5e2a8" />
        </g>
        {/* la lama di luce che attraversa l'olografico */}
        <rect x="-130" y="-130" width="260" height="260" fill="url(#sig-lama)" opacity="0.55" />
        {/* la grana della pellicola */}
        <rect
          x="-130"
          y="-130"
          width="260"
          height="260"
          filter="url(#sig-grana)"
          opacity="0.13"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>

      {/* il bordo dell'adesivo */}
      <path d={D} fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.75" />

      {/* La scritta che gira attorno. `textLength` non è un vezzo: la
          circonferenza misura circa 452 unità e la stringa, lasciata
          libera, ne occupava di più e si sovrapponeva a se stessa
          ("IL TABELLO IL TABELLONE"). Forzando la lunghezza il giro si
          chiude esatto, qualunque font stia caricando il browser. */}
      <text
        fontSize="11.6"
        fontWeight="800"
        fill="#052e1f"
        opacity="0.72"
        textLength="446"
        lengthAdjust="spacing"
      >
        <textPath href="#sig-cerchio" startOffset="0%">
          IL TABELLONE · RIVOLIO · REG. CE 261/2004 ·
        </textPath>
      </text>

      {/* il cuore: le tre fasce del Regolamento */}
      <text
        x="0"
        y="-10"
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        letterSpacing="1.4"
        fill="#052e1f"
        opacity="0.62"
      >
        DA
      </text>
      <text
        x="0"
        y="20"
        textAnchor="middle"
        fontSize="33"
        fontWeight="800"
        letterSpacing="-1.4"
        fill="#052e1f"
      >
        250€
      </text>
      <text
        x="0"
        y="44"
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        letterSpacing="1.4"
        fill="#052e1f"
        opacity="0.62"
      >
        A 600€
      </text>

      {/* le stelline */}
      <polygon points={stella(-62, 4, 7)} fill="#052e1f" opacity="0.5" />
      <polygon points={stella(64, -6, 6)} fill="#052e1f" opacity="0.5" />
      <polygon points={stella(-18, -58, 5)} fill="#052e1f" opacity="0.4" />
      <polygon points={stella(26, 62, 5)} fill="#052e1f" opacity="0.4" />
    </svg>
  );
}
