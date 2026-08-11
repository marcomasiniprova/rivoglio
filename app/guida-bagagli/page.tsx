import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegale from "@/components/legale/PaginaLegale";

import { seSiPaga } from "@/lib/check/ingresso";
export const metadata: Metadata = {
  title: "Bagaglio perso, in ritardo o danneggiato: la guida | Rivolio",
  description:
    "Cosa fare subito in aeroporto, i termini di 7 e 21 giorni, quanto si può chiedere con la Convenzione di Montreal. Guida gratuita, senza vendita: il reclamo bagagli lo fai da solo.",
};

/**
 * LA GUIDA BAGAGLI (scelta di Valerio col popup, 8/08: guida sì, vendita
 * no). I bagagli stanno sotto la Convenzione di Montreal, non sotto il
 * Reg. CE 261/2004: Rivolio non vende pratiche bagagli e lo dice subito.
 * La pagina serve a chi cerca "bagaglio perso cosa fare": risposta onesta,
 * i termini veri, e in fondo il ponte verso il check del volo.
 *
 * I numeri citati (1.519 DSP, i 7 e 21 giorni) hanno la fonte dichiarata
 * nel details in fondo: Convenzione di Montreal artt. 17, 22, 31 e 35,
 * limiti rivisti dal 28 dicembre 2024. La conversione in euro è marcata
 * come stima, perché il cambio DSP varia ogni giorno.
 */
export default function PaginaGuidaBagagli() {
  return (
    <PaginaLegale
      titolo="Bagaglio perso, in ritardo o danneggiato"
      aggiornata="8 agosto 2026"
      sottotitolo="Guida gratuita, verificata l'8 agosto 2026. Qui non si vende niente."
    >
      <p>
        La versione corta: <strong>per il bagaglio non vale il Regolamento CE 261/2004</strong>{" "}
        (quello dei ritardi dei voli), ma la Convenzione di Montreal. È una pratica che puoi
        fare da solo, gratis, e i passi sono pochi. Rivolio non vende pratiche bagagli:
        questa guida è tutto quello che serve.
      </p>

      <h2>Prima cosa, in aeroporto: il PIR</h2>
      <p>
        Se il bagaglio non esce dal nastro o esce rotto, vai <strong>subito</strong> allo
        sportello assistenza bagagli (lost and found), prima di uscire dall&apos;area ritiro.
        Lì compili il <strong>PIR</strong> (Property Irregularity Report): è la segnalazione
        ufficiale che il problema esiste. Non è ancora il reclamo, ma senza PIR dimostrare
        tutto dopo diventa molto più difficile. Conserva il codice che ti danno.
      </p>

      <h2>I termini: pochi giorni, per iscritto</h2>
      <ul>
        <li>
          <strong>Bagaglio danneggiato:</strong> reclamo scritto alla compagnia entro{" "}
          <strong>7 giorni</strong> da quando l&apos;hai ritirato.
        </li>
        <li>
          <strong>Bagaglio in ritardo:</strong> reclamo scritto entro <strong>21 giorni</strong>{" "}
          da quando te l&apos;hanno riconsegnato.
        </li>
        <li>
          <strong>Bagaglio perso:</strong> se dopo <strong>21 giorni</strong> non è arrivato,
          per la Convenzione è ufficialmente smarrito e puoi chiedere il risarcimento.
        </li>
        <li>
          <strong>Causa in tribunale:</strong> l&apos;azione va iniziata entro{" "}
          <strong>2 anni</strong> dall&apos;arrivo del volo.
        </li>
      </ul>
      <p>
        Il reclamo si manda al servizio clienti della compagnia che ha operato il volo, dal
        loro modulo bagagli o per email, allegando il PIR. Scrivi cosa è successo, cosa
        chiedi e allega le prove.
      </p>

      <h2>Quanto si può chiedere</h2>
      <p>
        La Convenzione fissa un tetto per passeggero (non per valigia):{" "}
        <strong>1.519 DSP</strong>, i &quot;diritti speciali di prelievo&quot; del Fondo
        Monetario. Il cambio varia ogni giorno: oggi fanno <strong>circa 1.900€</strong>{" "}
        (stima). Attenzione: non è un rimborso automatico, è un limite massimo. Ti
        risarciscono il danno che <strong>riesci a provare</strong>: scontrini, foto del
        contenuto e della valigia rotta, ricevute di quello che hai dovuto ricomprare.
      </p>
      <p>
        Se viaggi con cose di valore, alla consegna del bagaglio puoi fare una{" "}
        <strong>dichiarazione speciale di valore</strong> (pagando un supplemento): alza il
        tetto fino al valore dichiarato.
      </p>

      <h2>Il bagaglio è in ritardo e sei senza niente</h2>
      <p>
        Gli acquisti di prima necessità (biancheria, articoli da bagno, un capo per il
        lavoro) rientrano nel danno da ritardo: <strong>conserva ogni scontrino</strong> e
        mettili nel reclamo. Molte compagnie pubblicano regole proprie su cosa considerano
        &quot;essenziale&quot;: prima di spendere cifre importanti, controlla il sito del tuo
        vettore.
      </p>

      <h2>E se il volo era anche in ritardo?</h2>
      <p>
        Quella è un&apos;altra storia, e un&apos;altra legge: il Regolamento CE 261/2004. Se
        il tuo volo è atterrato con 3 ore di ritardo o più, la compensazione va da 250€ a
        600€ a passeggero, e lì Rivolio fa il lavoro sporco:{" "}
        <Link href="/#controllo">{seSiPaga("analizza il volo", "controlla il volo gratis")}</Link>, il verdetto arriva in
        trenta secondi.
      </p>

      <h2>Da dove vengono questi numeri</h2>
      <p>
        Convenzione di Montreal del 1999, articoli 17 (responsabilità), 22 (limiti), 31
        (termini dei reclami) e 35 (i 2 anni), applicata nell&apos;Unione dal Regolamento CE
        2027/97. Il limite di 1.519 DSP è quello in vigore dal 28 dicembre 2024, dopo la
        revisione quinquennale ICAO (prima era 1.288). La conversione in euro è una stima:
        il valore del DSP si muove ogni giorno coi cambi.
      </p>
    </PaginaLegale>
  );
}
