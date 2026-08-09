/** I tipi del convertitore (il modulo è .mjs: gira anche fuori da Next). */
export type ScaloArchivio = {
  icao: string | null;
  nome: string;
  citta: string;
  paese: string;
  iso: string | null;
  lat: number;
  lon: number;
  tz: string | null;
};

export function leggiCsv(testo: string): Record<string, string>[];
export function daOurAirports(
  righe: Record<string, string>[],
  vecchio?: Record<string, Partial<ScaloArchivio>>,
): {
  archivio: Record<string, ScaloArchivio>;
  nuovi: string[];
  spariti: string[];
};
export function controlla(
  archivio: Record<string, Partial<ScaloArchivio>>,
  vecchio: Record<string, unknown>,
): { ok: boolean; motivi: string[]; quanti: number; prima: number };
export function serializza(archivio: Record<string, unknown>): string;
