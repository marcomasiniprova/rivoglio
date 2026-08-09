import { cookies } from "next/headers";
import { COOKIE_PREZZO, LISTINI, LISTINO_BASE, varianteValida, type Listino, type Variante } from "./prezzi";

/**
 * Il listino che questa persona sta vedendo, letto dal cookie che il proxy
 * ha scritto alla prima visita.
 *
 * Sta in un file suo perché `next/headers` si può usare solo sul server: se
 * finisse dentro `lib/prezzi.ts` non potrebbe più importarlo un componente
 * del browser, e i prezzi servono anche lì.
 *
 * Senza cookie (o con un valore sporco) si serve il listino di sempre:
 * meglio un prezzo vecchio che una pagina rotta.
 */
export async function listinoCorrente(): Promise<{ variante: Variante; listino: Listino }> {
  try {
    const c = await cookies();
    const variante = varianteValida(c.get(COOKIE_PREZZO)?.value);
    if (variante) return { variante, listino: LISTINI[variante] };
  } catch {
    // Fuori da una richiesta (build statica, script): listino di sempre.
  }
  return { variante: "a", listino: LISTINO_BASE };
}
