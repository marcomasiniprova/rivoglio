import type { Metadata } from "next";
import PaginaLegale from "@/components/legale/PaginaLegale";
import { seSiPaga } from "@/lib/check/ingresso";

export const metadata: Metadata = {
  title: "Rimborsi | Rivolio",
  description:
    "Quando ti restituiamo i soldi e quando no, scritto prima che tu paghi. La garanzia sull'esito è un'altra cosa: qui c'è la differenza.",
  alternates: { canonical: "/rimborsi" },
};

/**
 * LA PAGINA RIMBORSI.
 *
 * Nasce da due esigenze che per una volta puntano nella stessa direzione.
 *
 * 1. **La chiede il venditore.** Dodo Payments, che ha accettato il caso
 *    d'uso per iscritto il 12/08, pretende che nel footer del sito ci
 *    siano link attivi a Condizioni, Privacy **e Rimborsi**, coi prezzi
 *    chiari e l'avviso che non diamo pareri legali. Senza, la verifica
 *    dell'account non passa.
 * 2. **Serve a noi.** Un tasso di rimborsi alto è uno dei motivi per cui
 *    questi servizi congelano un conto. Una politica scritta bene tiene
 *    basso il numero di richieste; una scritta male («soddisfatti o
 *    rimborsati entro 14 giorni») su un prodotto che si consuma in tre
 *    secondi è un invito a prendersi il verdetto e chiedere indietro i
 *    soldi.
 *
 * ⚠️ LA DISTINZIONE CHE VALE TUTTA LA PAGINA: **rimborso e garanzia sono
 * due cose diverse**, e confonderle costerebbe soldi veri. Il rimborso
 * riguarda il NOSTRO lavoro: se abbiamo sbagliato, ti ridiamo i tuoi
 * soldi. La garanzia riguarda l'esito con la COMPAGNIA: se lei non paga,
 * ti restituiamo quello che hai speso da noi. Chi le confonde chiede il
 * rimborso il giorno dopo aver comprato, perché la compagnia non ha
 * ancora risposto: e la compagnia ci mette dalle 8 alle 14 settimane.
 *
 * Politica scelta da Valerio col popup (12/08): stretta e onesta, non
 * "senza domande".
 */
export default function PaginaRimborsi() {
  return (
    <PaginaLegale titolo="Rimborsi" aggiornata="12 agosto 2026">
      <p>
        La versione corta: <strong>ti restituiamo i soldi se abbiamo sbagliato noi</strong>.
        Non se la compagnia aerea dice di no: per quel caso c&apos;è la garanzia, che è una
        cosa diversa e più ampia. Qui sotto trovi tutte e due, spiegate senza formule.
      </p>

      <h2>Cosa vendiamo, esattamente</h2>
      <p>
        Due cose, e si pagano una volta sola:
      </p>
      <ul>
        <li>
          {seSiPaga(
            "l'analisi del volo: gli orari certificati di partenza e atterraggio, il ritardo al minuto, la fascia del Regolamento CE 261/2004 che si applica al tuo caso, e la prova archiviata;",
            "l'analisi del volo, che è gratuita: gli orari certificati, il ritardo al minuto e la fascia che si applica al tuo caso;",
          )}
        </li>
        <li>
          la pratica: la lettera di reclamo già scritta col tuo caso dentro, l&apos;indirizzo
          giusto della compagnia, le scadenze calcolate e i passi successivi se ti dicono di
          no.
        </li>
      </ul>
      <p>
        Entrambe sono <strong>prodotti digitali</strong> che ricevi subito. Non siamo
        intermediari: la lettera la mandi tu dalla tua email, e la compensazione la compagnia
        la paga direttamente a te, per intero. Noi non tocchiamo mai quei soldi.
      </p>

      <h2>Quando ti rimborsiamo</h2>
      <p>Ti restituiamo per intero quello che hai pagato a noi se:</p>
      <ul>
        <li>
          <strong>il verdetto era sbagliato.</strong> Se gli orari che ti abbiamo dato non
          corrispondono a quelli reali del volo, o se abbiamo applicato la fascia sbagliata,
          l&apos;errore è nostro e i soldi tornano indietro.
        </li>
        <li>
          <strong>il volo non era coperto</strong> dal Regolamento CE 261/2004 e non ce ne
          siamo accorti prima di farti pagare.
        </li>
        <li>
          <strong>non sei riuscito ad avere la lettera</strong> per un problema nostro: un
          guasto del sito, un documento che non si è generato, un file illeggibile.
        </li>
        <li>
          <strong>hai pagato due volte</strong> lo stesso volo, per qualsiasi motivo.
        </li>
      </ul>
      <p>
        In tutti questi casi scrivi a{" "}
        <a href="mailto:valerio@artecai.it">valerio@artecai.it</a> con il numero del volo e la
        data. Rispondiamo entro 5 giorni lavorativi e, se il rimborso spetta, i soldi tornano
        sullo stesso metodo con cui hai pagato entro 14 giorni.
      </p>

      <h2>Quando invece non ti rimborsiamo, e perché</h2>
      <ul>
        <li>
          <strong>Perché la compagnia ha detto di no.</strong> Non è un rifiuto: è
          esattamente il caso per cui esiste la <strong>garanzia</strong>, qui sotto. Il
          percorso però va finito, e ci vuole tempo.
        </li>
        <li>
          <strong>Perché hai cambiato idea dopo aver avuto il verdetto.</strong> Il prodotto
          è digitale e si consuma nell&apos;istante in cui te lo consegniamo: prima di pagare
          spunti la rinuncia al diritto di recesso, che è prevista dall&apos;art. 59 del
          Codice del Consumo proprio per questo caso, e resta registrata sulla tua pratica.
        </li>
        <li>
          <strong>Perché non hai mandato la lettera.</strong> L&apos;invio parte dalla tua
          email, ed è una scelta: le principali compagnie low cost lavorano solo i reclami
          inviati dal passeggero, ed è lo stesso motivo per cui la compensazione arriva a te
          intera invece che decurtata.
        </li>
        <li>
          <strong>Se il verdetto è incerto.</strong> Non serve chiedere: in quel caso non ti
          facciamo pagare per niente.
        </li>
      </ul>

      <h2>La garanzia, che è un&apos;altra cosa</h2>
      <p>
        Sulla pratica c&apos;è una garanzia legata all&apos;esito, e copre il caso che al
        rimborso non appartiene:{" "}
        <strong>
          se la compagnia rifiuta senza un motivo valido, o non risponde entro i termini di
          legge, ti restituiamo per intero quello che hai speso da noi.
        </strong>
      </p>
      <p>
        ⚠️ Serve pazienza, e lo diciamo prima: le compagnie rispondono in genere fra le 8 e le
        14 settimane. Chiedere la garanzia al decimo giorno vuol dire chiuderla mentre la
        pratica è ancora viva. Nella tua area personale vedi sempre a che punto è e cosa
        succede dopo.
      </p>

      <h2>Le controversie sul pagamento</h2>
      <p>
        Se qualcosa non torna, <strong>scrivici prima di aprire una contestazione con la tua
        banca</strong>. Non è una formula di cortesia: una contestazione bancaria si risolve
        in mesi e costa a tutti e due, mentre una email si risolve in giorni. Se il rimborso
        ti spetta, te lo diamo senza discutere.
      </p>

      <h2>Chi incassa</h2>
      <p>
        Il pagamento è gestito da un fornitore esterno che agisce da rivenditore
        (<em>merchant of record</em>): è lui a emettere il documento di acquisto e a comparire
        sull&apos;estratto conto della tua carta. I dati della carta non passano mai da noi e
        non li conserviamo.
      </p>

      <h2>Questa pagina non è un parere legale</h2>
      <p>
        Rivolio è uno strumento automatico che prepara documenti sulla base di dati di volo
        certificati e del Regolamento CE 261/2004. Non siamo uno studio legale, non
        rappresentiamo nessuno e non diamo consulenza: quello che leggi qui e nella lettera
        non costituisce un parere legale.
      </p>
      {/* ⚠️ QUI C'ERA UNA RIGA IN PIÙ che diceva «oggi l'analisi è
          gratuita», ed è stata tolta: una prova l'ha bocciata subito
          (prove/ingresso-check.spec.ts, 12/08) perché la promessa
          "gratis" può esistere in un posto solo, dentro `seSiPaga`. La
          regola è severa apposta: se il muro si accende e una riga
          sparsa continua a promettere gratis, il sito si contraddice
          davanti a chi sta per pagare. Quello che serviva dire è già
          nell'elenco qui sopra, e lì segue l'interruttore. */}
    </PaginaLegale>
  );
}
