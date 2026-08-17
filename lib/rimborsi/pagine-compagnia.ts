import { COMPAGNIE, type CanaleCompagnia } from "@/lib/lettera/compagnie";

/**
 * LE PAGINE PER COMPAGNIA (GEO/AIO, 17/08).
 *
 * Una pagina per compagnia su `/reclamo/[slug]`, costruita dai dati VERI che
 * abbiamo già in `compagnie.ts`: il canale reclami ufficiale (verificato uno
 * per uno) e la policy anti-intermediari. Non è contenuto sottile: ogni pagina
 * dice a chi cerca "reclamo Ryanair" o "rimborso volo easyJet" esattamente
 * dove reclamare, quanto gli spetta e perché lo fa da sé (tenendo il 100%).
 *
 * ⚠️ `/rimborsi` (plurale) è un'altra cosa: è la pagina LEGALE della nostra
 * politica di rimborso. Queste stanno su `/reclamo/` di proposito.
 *
 * Il filtro è la qualità: solo le compagnie col canale VERIFICATO sul dominio
 * ufficiale (`verificato: true`) e con un URL. Una pagina che manda a un
 * canale non verificato varrebbe meno di nessuna pagina.
 */

/** "Wizz Air" → "wizz-air"; "ITA Airways" → "ita-airways". */
export function slugCompagnia(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // via gli accenti (segni combinanti)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CompagniaPagina = CanaleCompagnia & { slug: string };

/* Le compagnie che meritano una pagina: canale verificato + URL. Lo slug si
   calcola una volta sola qui, e un controllo impedisce due compagnie con lo
   stesso slug (finirebbero sulla stessa pagina, e una sparirebbe). */
const _viste = new Set<string>();
export const COMPAGNIE_PAGINA: CompagniaPagina[] = COMPAGNIE.filter(
  (c) => c.verificato && c.url && c.url.startsWith("http"),
)
  .map((c) => ({ ...c, slug: slugCompagnia(c.nome) }))
  .filter((c) => {
    if (_viste.has(c.slug)) return false;
    _viste.add(c.slug);
    return true;
  });

export function compagniaDaSlug(slug: string): CompagniaPagina | null {
  return COMPAGNIE_PAGINA.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

/** Il nome del paese in italiano, per la scheda (solo i più comuni). */
const PAESI: Record<string, string> = {
  IT: "Italia",
  IE: "Irlanda",
  GB: "Regno Unito",
  HU: "Ungheria",
  DE: "Germania",
  ES: "Spagna",
  FR: "Francia",
  NL: "Paesi Bassi",
  PT: "Portogallo",
  GR: "Grecia",
  AT: "Austria",
  BE: "Belgio",
  PL: "Polonia",
  US: "Stati Uniti",
  TR: "Turchia",
  CH: "Svizzera",
  NO: "Norvegia",
  DK: "Danimarca",
  SE: "Svezia",
  FI: "Finlandia",
};

export function paeseInItaliano(iso: string | null): string | null {
  if (!iso) return null;
  return PAESI[iso.toUpperCase()] ?? null;
}
