import type { Metadata } from "next";
import Guscio from "@/components/admin/Guscio";
import { soloAdmin } from "@/lib/admin/guardia";

/**
 * IL RETROBOTTEGA, rifatto come un gestionale (richiesta di Valerio,
 * 11/08: «la parte admin è inguardabile, sviluppala come un software
 * gestionale, metti le sezioni a lato non sopra»).
 *
 * Il guscio sta qui e non dentro ogni pagina per un motivo pratico: la
 * barra laterale NON si smonta quando cambi sezione. Se vivesse dentro le
 * pagine, a ogni passaggio sparirebbe e ricomparirebbe, e un pannello che
 * sfarfalla a ogni clic sembra un sito, non uno strumento.
 *
 * ⚠️ Il controllo del ruolo si fa qui E in ogni pagina. Non è un
 * doppione inutile: un layout protegge quello che gli sta dentro, ma la
 * regola della casa è che ogni pagina si difenda da sola, perché è la
 * pagina a leggere i dati. Una prova (prove/registro.spec.ts) gira la
 * cartella e boccia la suite se una pagina se ne dimentica.
 */
export const metadata: Metadata = {
  title: "Pannello | Rivolio",
  robots: { index: false, follow: false },
};

/* L'ora della lettura: si calcola qui, sul server, e cambia da sola a ogni
   rinfresco. Presa dall'orologio del browser direbbe "quando ho chiesto",
   non "quando ho letto", e sono due momenti diversi. */
const OROLOGIO = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Rome",
});

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const utente = await soloAdmin();
  return (
    <Guscio email={utente.email ?? null} ora={OROLOGIO.format(new Date())}>
      {children}
    </Guscio>
  );
}
