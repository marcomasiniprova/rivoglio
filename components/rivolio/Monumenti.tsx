/**
 * I monumenti degli scali dell'Osservatorio.
 *
 * Perché esistono: la striscia dei ritardi era quattro riquadri identici
 * con dentro un nome e un numero. Nessuno li guardava, e a colpo d'occhio
 * non si capiva nemmeno di quale città si stesse parlando. Un simbolo che
 * si riconosce in mezzo secondo (il Colosseo, il Duomo, il Vesuvio) fa il
 * lavoro che il testo non riesce a fare.
 *
 * Perché disegnati e non scaricati: le librerie di illustrazioni 3D
 * vogliono licenza e attribuzione, pesano centinaia di KB l'una e non si
 * possono ricolorare. Qui ogni monumento è un SVG di poche righe, si
 * tinge col colore dell'indice (verde, giallo, rosso) e non chiede
 * permessi a nessuno.
 *
 * IL RILIEVO, sempre con le stesse tre tinte:
 * - FACCIA in luce: currentColor pieno;
 * - FIANCO in ombra: currentColor al 42%;
 * - BUCHI (archi, finestre, portali): il verde notte del fondo, non una
 *   trasparenza. Una trasparenza dello stesso colore si confonde col
 *   corpo e il monumento diventa una macchia: gli archi del Colosseo,
 *   disegnati così, sparivano.
 */

type Props = { className?: string };

const OMBRA = 0.42;
/** Il fondo della card: è con questo che si "bucano" archi e finestre. */
const BUCO = "#052e1f";

function Base({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="currentColor">
      {children}
      {/* l'ombra a terra: quella che stacca l'oggetto dal fondo */}
      <ellipse cx="32" cy="56.5" rx="18" ry="2.8" opacity="0.18" />
    </svg>
  );
}

/** Roma: il Colosseo, due ordini di archi e la fascia crollata a destra. */
export function Colosseo({ className }: Props) {
  /* Gli archi si generano: scriverli a mano uno per uno è solo più lungo. */
  const arco = (x: number, y: number, w: number, h: number) => (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}Z`}
      fill={BUCO}
    />
  );
  const colonne = [11.5, 19.5, 27.5, 35.5, 43.5];
  return (
    <Base className={className}>
      {/* il muro esterno: più alto a sinistra, spezzato a destra */}
      <path d="M8 52V26a24 8.5 0 0 1 48 0v26Z" opacity={OMBRA} />
      <path d="M8 52V26a24 8.5 0 0 1 34 -7.4V52Z" />
      {/* il cornicione in cima, quello che fa il tamburo */}
      <path d="M8 26a24 8.5 0 0 1 48 0 24 8.5 0 0 1-48 0Z" opacity="0.55" />
      {/* i due ordini di arcate */}
      {colonne.map((x) => arco(x, 30.5, 6, 8))}
      {colonne.map((x) => arco(x, 42, 6, 8))}
      {/* la base */}
      <path d="M6 52h52v2.6H6Z" opacity={OMBRA} />
    </Base>
  );
}

/** Milano: il Duomo, tutto guglie e marmo. */
export function Duomo({ className }: Props) {
  return (
    <Base className={className}>
      {/* le guglie dietro: la firma del Duomo si vede prima della facciata */}
      <g>
        <path d="M32 4.5 34.6 20h-5.2Z" />
        <path d="M23.5 13 25.6 24h-4.2Z" />
        <path d="M40.5 13 42.6 24h-4.2Z" />
        <path d="M17.5 19.5 19.2 28h-3.4Z" opacity={OMBRA} />
        <path d="M46.5 19.5 48.2 28h-3.4Z" opacity={OMBRA} />
        <circle cx="32" cy="3.2" r="1.9" />
      </g>
      {/* fianco e facciata */}
      <path d="M32 24h16v28H32Z" opacity={OMBRA} />
      <path d="M16 24h16v28H16Z" />
      {/* il portale e le finestre gotiche, bucati nel fondo */}
      <path d="M28.5 52V40a3.5 3.5 0 0 1 7 0v12Z" fill={BUCO} />
      <path d="M20 44v-8a2.4 2.4 0 0 1 4.8 0v8Z" fill={BUCO} />
      <path d="M39.2 44v-8a2.4 2.4 0 0 1 4.8 0v8Z" fill={BUCO} />
      {/* il basamento */}
      <path d="M13 52h38v3H13Z" opacity="0.55" />
    </Base>
  );
}

/** Venezia: il campanile di San Marco, e sotto l'acqua con la gondola. */
export function Campanile({ className }: Props) {
  return (
    <Base className={className}>
      {/* la cuspide */}
      <path d="M32 3 41.5 17H22.5Z" />
      <path d="M32 3l9.5 14H32Z" opacity={OMBRA} />
      {/* la cella campanaria, più larga del fusto */}
      <path d="M22 17h20v7H22Z" />
      <path d="M32 17h10v7H32Z" opacity={OMBRA} />
      <path d="M25 24v-4a2 2 0 0 1 4 0v4Z" fill={BUCO} />
      <path d="M35 24v-4a2 2 0 0 1 4 0v4Z" fill={BUCO} />
      {/* il fusto in mattoni */}
      <path d="M24 24h16v25H24Z" />
      <path d="M32 24h8v25h-8Z" opacity={OMBRA} />
      {/* le due scanalature verticali del fusto */}
      <rect x="27" y="28" width="2.2" height="17" rx="1.1" fill={BUCO} />
      <rect x="34.8" y="28" width="2.2" height="17" rx="1.1" fill={BUCO} />
      {/* il basamento sulla piazza: senza, la torre sembra galleggiare */}
      <path d="M19 49h26v4H19Z" opacity="0.55" />
    </Base>
  );
}

/** Bergamo: il Campanone di Città Alta, in cima al colle. */
export function Campanone({ className }: Props) {
  return (
    <Base className={className}>
      {/* il colle: Bergamo è la città che sta di sopra */}
      <path d="M4 55c5-8 14-12 24-12s21 4 26 12Z" opacity="0.22" />
      {/* la torre */}
      <path d="M24 15h16v33H24Z" />
      <path d="M32 15h8v33h-8Z" opacity={OMBRA} />
      {/* la merlatura in cima */}
      <path d="M22.5 10h19v5h-19Z" />
      <path d="M32 10h9.5v5H32Z" opacity={OMBRA} />
      <g fill={BUCO}>
        <rect x="25" y="10" width="2.6" height="2.8" />
        <rect x="30.7" y="10" width="2.6" height="2.8" />
        <rect x="36.4" y="10" width="2.6" height="2.8" />
      </g>
      {/* l'orologio del Campanone */}
      <circle cx="32" cy="24" r="4.4" fill={BUCO} />
      <path d="M32 21.2v3.2h2.4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* la bifora sotto */}
      <path d="M29.5 42v-6a2.5 2.5 0 0 1 5 0v6Z" fill={BUCO} />
      {/* le mura venete */}
      <path d="M12 48h40v4H12Z" opacity="0.5" />
    </Base>
  );
}

/** Napoli: il Vesuvio, con il Somma accanto e il pennacchio. */
export function Vesuvio({ className }: Props) {
  return (
    <Base className={className}>
      {/* il golfo */}
      <path d="M4 52h56v2.4H4Z" opacity="0.28" />
      {/* la montagna: due cime, ed è per quelle che si riconosce */}
      <path d="M6 52 25 24l6.5 9.5 5.5-7.5L58 52Z" opacity={OMBRA} />
      <path d="M6 52 25 24l7 28Z" />
      {/* il cratere aperto in cima */}
      <path d="M22.4 27.6h5.6l-2.8-3.6Z" fill={BUCO} />
      {/* il pennacchio: cerchi sovrapposti, così legge come una nuvola */}
      <g opacity="0.4">
        <circle cx="26" cy="16" r="3.8" />
        <circle cx="30.6" cy="13.6" r="3" />
        <circle cx="21.8" cy="13.8" r="2.6" />
        <circle cx="26.4" cy="11.8" r="2.4" />
      </g>
    </Base>
  );
}

/** Catania e Palermo: l'Etna, col cappello di neve che il Vesuvio non ha. */
export function Etna({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M2 53 32 13l30 40Z" opacity={OMBRA} />
      <path d="M2 53 32 13v40Z" />
      {/* la neve: è questa che lo distingue dal Vesuvio */}
      <path d="M32 13l8.4 11.2-4.4-1.5L32 24.4l-4-1.7-4.4 1.5Z" fill="#ffffff" opacity="0.92" />
      {/* il fumo */}
      <g opacity="0.45">
        <circle cx="38.5" cy="9" r="3.2" />
        <circle cx="44.6" cy="5.8" r="2.3" />
      </g>
    </Base>
  );
}

/** Bologna: le due torri, una dritta e una che pende davvero. */
export function DueTorri({ className }: Props) {
  return (
    <Base className={className}>
      {/* la Garisenda: più bassa, e pendente */}
      <g transform="rotate(-5 24 42)">
        <path d="M17.5 26h10v28h-10Z" />
        <path d="M23 26h4.5v28H23Z" opacity={OMBRA} />
        <path d="M16.2 22.6h12.6v3.6H16.2Z" opacity="0.6" />
        <rect x="20.4" y="33" width="2.4" height="4.4" rx="1.2" fill={BUCO} />
        <rect x="20.4" y="42" width="2.4" height="4.4" rx="1.2" fill={BUCO} />
      </g>
      {/* l'Asinelli: alta e dritta */}
      <path d="M33 8h10v46H33Z" />
      <path d="M39 8h4v46h-4Z" opacity={OMBRA} />
      <path d="M32 5h12v3.4H32Z" opacity="0.6" />
      <g fill={BUCO}>
        <rect x="35.6" y="16" width="2.6" height="5" rx="1.3" />
        <rect x="35.6" y="27" width="2.6" height="5" rx="1.3" />
        <rect x="35.6" y="38" width="2.6" height="5" rx="1.3" />
      </g>
    </Base>
  );
}

/** L'aereo di riserva: uno scalo senza monumento non resta senza figura. */
export function ScaloGenerico({ className }: Props) {
  return (
    <Base className={className}>
      {/* la torre di controllo */}
      <path d="M27 22h10v30H27Z" />
      <path d="M32 22h5v30h-5Z" opacity={OMBRA} />
      <path d="M22 12h20l-3 10H25Z" />
      <path d="M32 12h10l-3 10h-7Z" opacity={OMBRA} />
      <path d="M26.5 20v-5h11v5Z" fill={BUCO} />
      <path d="M12 52h40v3H12Z" opacity="0.5" />
    </Base>
  );
}

/**
 * Lo scalo → il suo monumento. Milano ne ha due (Malpensa e Linate) e
 * prendono lo stesso Duomo: la città è quella, a distinguerli è il nome.
 */
const PER_IATA: Record<string, (p: Props) => React.ReactElement> = {
  FCO: Colosseo,
  CIA: Colosseo,
  MXP: Duomo,
  LIN: Duomo,
  BGY: Campanone,
  VCE: Campanile,
  TSF: Campanile,
  NAP: Vesuvio,
  CTA: Etna,
  PMO: Etna,
  BLQ: DueTorri,
};

export function monumentoDi(iata: string) {
  return PER_IATA[iata?.toUpperCase()] ?? ScaloGenerico;
}
