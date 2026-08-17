import type { Metadata } from "next";
import PaginaLegale from "@/components/legale/PaginaLegale";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
export const metadata: Metadata = {
  title: "Condizioni d'uso | Rivolio",
  description:
    "Cosa fa Rivolio, cosa compri, cosa garantiamo e cosa no. Le condizioni del servizio, scritte in italiano comprensibile.",
};

/**
 * Condizioni d'uso: PRIMA BOZZA operativa dell'8/08. Descrivono il
 * servizio COME È COSTRUITO davvero (check gratuito, verdetto a tre
 * stati, lettera che invii tu, garanzia legata all'esito, rinuncia al recesso
 * ex art. 59 Cod. Consumo). Revisione legale segnata in ARRETRATI.
 */
export default function PaginaCondizioni() {
  return (
    <PaginaLegale titolo="Condizioni d'uso" aggiornata="8 agosto 2026">
      <p>
        Queste condizioni regolano l&apos;uso di Rivolio. Usando il sito le accetti. Sono
        scritte per essere capite: se qualcosa non torna, scrivici a{" "}
        <a href="mailto:team@rivolio.it">team@rivolio.it</a>.
      </p>

      <h2>Cosa fa Rivolio</h2>
      <p>
        Rivolio è uno strumento che verifica se un volo rientra nei casi di compensazione
        previsti dal Regolamento (CE) 261/2004 e, se decidi di acquistare la pratica, prepara
        per te i documenti del reclamo: la lettera con i dati verificati del volo, i
        riferimenti di legge e il canale reclami della compagnia, più i solleciti e le
        istruzioni per i passi successivi.
      </p>
      <p>
        <strong>Rivolio non è un&apos;agenzia di reclami e non è un intermediario</strong>:
        non ci cedi il credito, non firmiamo niente al posto tuo e non tratteniamo
        percentuali. Il reclamo lo invii tu, dalla tua email, e la compensazione arriva
        direttamente a te, per intero. Non siamo uno studio legale e non forniamo consulenza
        legale: prepariamo documenti sulla base di dati di volo verificati e di regole
        pubbliche.
      </p>

      <h2>{seSiPaga("L'analisi del volo e il verdetto", "Il check gratuito e il verdetto")}</h2>
      <p>
        {seSiPaga(
          `L'analisi di un volo costa ${euro(PREZZO_LANCIO)} e non richiede un account. Se il verdetto esce incerto l'analisi non si consuma: il credito resta e lo usi su un altro volo.`,
          "Il check è gratuito e senza account.",
        )}{" "}
        Il verdetto ha tre esiti possibili: idoneo,
        non idoneo, oppure incerto. Vendiamo la pratica solo quando il dato è solido: se il
        caso è incerto, te lo diciamo e non ti facciamo pagare. Il verdetto si basa sui dati
        di volo delle nostre fonti e sul Regolamento (CE) 261/2004:{" "}
        <strong>non è una promessa di pagamento</strong>, perché la decisione finale spetta
        sempre alla compagnia aerea ed eventualmente alle autorità o al giudice. La
        compagnia può ad esempio invocare circostanze eccezionali che non risultano dai dati
        di volo.
      </p>

      <h2>Cosa compri, e quanto costa</h2>
      <ul>
        <li>
          <strong>Pratica singola, 14,90 euro</strong>: i documenti del reclamo per un volo e
          un passeggero, il sollecito, le istruzioni ENAC e il tracker della pratica.
        </li>
        <li>
          <strong>Pratica famiglia, 29,90 euro</strong>: lo stesso, per lo stesso volo, fino
          a 5 passeggeri.
        </li>
      </ul>
      <p>
        Sono prezzi una tantum: nessun abbonamento, nessuna percentuale sulla compensazione.
        I pagamenti sono gestiti da un fornitore esterno che opera come venditore
        (merchant of record) e che emette anche la ricevuta.
      </p>

      <h2>Consegna immediata e diritto di recesso</h2>
      <p>
        La pratica è un contenuto digitale che ti viene consegnato subito dopo il pagamento.
        Per questo, prima di pagare ti chiediamo di accettare espressamente che
        l&apos;esecuzione inizi subito e di riconoscere che con la consegna{" "}
        <strong>perdi il diritto di recesso</strong> dei 14 giorni (art. 59, comma 1, lettera
        o del Codice del Consumo). Senza quella spunta il pagamento non parte. Resta ferma la
        garanzia qui sotto, che è più forte del recesso.
      </p>

      <h2>La garanzia</h2>
      <p>
        Se la compagnia <strong>rifiuta il reclamo senza un motivo valido</strong>, oppure{" "}
        <strong>non risponde entro i termini previsti dalla legge</strong>, la garanzia ti dà un{" "}
        <strong>credito per un&apos;altra pratica</strong>: la tua prossima pratica, dello stesso
        tipo, è gratis. Vale anche se la compagnia non ti riconosce nulla per una ragione che
        smentisce i dati verificati del volo.
      </p>
      <p>
        <strong>È un credito, non un rimborso in denaro</strong>, e lo diciamo chiaro: non ti
        restituiamo i soldi versati, ti offriamo noi la pratica successiva. Il credito è legato
        al tuo account, non scade, e copre una pratica dello stesso tipo di quella per cui è
        scattata la garanzia (una famiglia copre una famiglia o una singola).
      </p>
      <p>
        La garanzia è legata all&apos;esito e non a una scadenza sul calendario: le compagnie
        rispondono spesso dopo due o tre mesi. Il credito parte da solo quando ci dici che la
        compagnia ha rifiutato: ti chiediamo di aver davvero inviato il reclamo seguendo le
        istruzioni, di caricare il loro no scritto e di aver mandato la replica, perché
        l&apos;esito lo conosci solo tu e il credito nasce da un rifiuto reale.
      </p>
      <p>
        Un caso in cui la garanzia non si applica: se la compagnia ti paga, il servizio ha
        funzionato, e il prezzo della pratica resta dovuto.
      </p>

      <h2>Le tue responsabilità</h2>
      <ul>
        <li>Inserire dati veri: numero di volo, data e nomi dei passeggeri corretti.</li>
        <li>Avere il diritto di presentare il reclamo per i passeggeri indicati.</li>
        <li>Inviare tu il reclamo e gestire tu la corrispondenza con la compagnia.</li>
        <li>Non usare il servizio per scopi illeciti o per casi che sai essere infondati.</li>
      </ul>

      <h2>Limitazione di responsabilità</h2>
      <p>
        Facciamo il possibile perché i dati di volo e i documenti siano corretti, ma non
        possiamo garantire l&apos;esito del reclamo né rispondere delle decisioni della
        compagnia. Nei limiti consentiti dalla legge, la nostra responsabilità complessiva
        verso di te è limitata a quanto hai pagato a Rivolio per la pratica. Niente in
        queste condizioni limita i diritti che la legge ti riconosce come consumatore.
      </p>

      <h2>Legge e foro</h2>
      <p>
        Queste condizioni sono regolate dalla legge italiana. Per le controversie con un
        consumatore è competente il giudice del luogo di residenza o domicilio del
        consumatore. Per i reclami sul servizio scrivi prima a noi: quasi tutto si risolve
        con una email.
      </p>

      <h2>Aggiornamenti</h2>
      <p>
        Possiamo aggiornare queste condizioni quando cambia il servizio; la versione e la
        data in testa alla pagina ti dicono quale stai leggendo. Gli acquisti già fatti
        restano regolati dalla versione in vigore al momento dell&apos;acquisto.
      </p>
    </PaginaLegale>
  );
}
