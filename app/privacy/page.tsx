import type { Metadata } from "next";
import PaginaLegale from "@/components/legale/PaginaLegale";

import { seSiPaga } from "@/lib/check/ingresso";
export const metadata: Metadata = {
  title: "Privacy | Rivolio",
  description:
    "Come Rivolio tratta i tuoi dati: quali raccogliamo, perché, per quanto tempo e quali diritti hai.",
};

/**
 * Informativa ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (GDPR).
 * PRIMA BOZZA operativa dell'8/08: dice la verità su cosa facciamo coi
 * dati (che è poca roba, ed è un vanto). Revisione legale in ARRETRATI.
 */
export default function PaginaPrivacy() {
  return (
    <PaginaLegale titolo="Informativa sulla privacy" aggiornata="8 agosto 2026">
      <p>
        Questa pagina spiega quali dati personali raccoglie Rivolio, perché li raccoglie,
        per quanto li conserva e quali diritti hai. È scritta per essere letta, non per
        spaventare: se qualcosa non è chiaro, scrivici.
      </p>

      <h2>Chi è il titolare</h2>
      <p>
        Il titolare del trattamento è il gestore di Rivolio, contattabile all&apos;indirizzo{" "}
        <a href="mailto:valerio@artecai.it">valerio@artecai.it</a>. Rivolio è un progetto in
        fase di avvio: questa informativa sarà integrata con i dati societari completi appena
        l&apos;attività sarà formalizzata.
      </p>

      <h2>Quali dati trattiamo, e perché</h2>
      <ul>
        <li>
          <strong>{seSiPaga("L'analisi del volo", "Il check gratuito")}</strong>: per verificare un volo ci servono solo numero di
          volo e data. Non sono dati che ti identificano e non ti chiediamo né email né
          account per usare il check. Base giuridica: esecuzione del servizio che richiedi
          (art. 6.1.b GDPR).
        </li>
        <li>
          <strong>L&apos;Osservatorio (newsletter)</strong>: se ti iscrivi trattiamo la tua
          email per mandarti la newsletter. Base giuridica: il tuo consenso (art. 6.1.a),
          che puoi revocare in ogni momento con il link in fondo a ogni email o scrivendoci.
        </li>
        <li>
          <strong>Account e pratiche</strong>: se apri una pratica trattiamo la tua email
          (per l&apos;accesso senza password), i nomi e cognomi dei passeggeri che inserisci
          tu, i dati verificati del volo e la cronologia della pratica. Base giuridica:
          esecuzione del contratto (art. 6.1.b) e obblighi di legge (art. 6.1.c).
        </li>
        <li>
          <strong>La carta d&apos;imbarco che carichi</strong>: la leggiamo per confrontarla
          coi dati verificati del volo e <strong>non la salviamo</strong>. Il file viene
          letto, l&apos;esito del confronto viene registrato nella pratica, il file viene
          scartato.
        </li>
        {/* ⚠️ AGGIUNTO IL 13/08, ED ERA UN BUCO VERO. Da quel giorno chi
            riceve un no dalla compagnia può incollarne la risposta (o
            caricarne lo screenshot) e noi la LEGGIAMO E LA TENIAMO: è il
            materiale con cui si scrive la replica, e serve poterla
            rileggere. Ma la riga qui sopra diceva «non li salviamo», che
            per quel testo non era più vero. Dichiarare quello che si
            raccoglie è la cosa più facile da dimenticare e la più cara da
            spiegare dopo. */}
        <li>
          <strong>La risposta della compagnia</strong>, se scegli di incollarla o
          fotografarla: <strong>il testo lo conserviamo</strong> dentro la tua pratica, perché
          serve a scrivere la replica su misura e a fartela rileggere. Se carichi
          un&apos;immagine, l&apos;immagine viene letta e scartata: resta solo il testo. Puoi
          chiederne la cancellazione quando vuoi, e sparisce con la pratica.
        </li>
        <li>
          <strong>La foto della carta d&apos;imbarco nell&apos;app</strong>: se scegli di
          fotografarla per compilare il check, l&apos;immagine viene inviata al nostro
          servizio, letta per ricavarne numero di volo e data, e{" "}
          <strong>subito scartata</strong>. Non viene salvata su disco, non entra nel
          database e non resta in nessun registro. I due dati ricavati finiscono nei campi
          del check, dove puoi correggerli prima di procedere.
        </li>
        <li>
          <strong>Pagamenti</strong>: sono gestiti da un fornitore di pagamento esterno che opera come venditore (in
          qualità di merchant of record). Noi non vediamo e non conserviamo i dati della tua
          carta.
        </li>
        <li>
          <strong>Statistiche d&apos;uso</strong>: registriamo i fatti che succedono sul
          sito (una pagina aperta, un&apos;analisi lanciata su un certo numero di volo, una
          pratica pagata) insieme a due sole informazioni di contorno: il{" "}
          <strong>sito da cui sei arrivato</strong>,
          ridotto al nome del dominio (per esempio &laquo;tiktok.com&raquo;, mai
          l&apos;indirizzo esatto della pagina o del video), e il tuo{" "}
          <strong>paese</strong>, così come ce lo dichiara il nostro hosting. Servono a
          capire cosa funziona e dove le persone si fermano. Base giuridica: legittimo
          interesse (art. 6.1.f GDPR) a far funzionare e migliorare il servizio.{" "}
          <strong>
            Non registriamo il tuo indirizzo IP, non usiamo impronte del browser e non
            c&apos;è nessun modo di ricollegare due visite alla stessa persona
          </strong>
          : sono conteggi, non profili. Per lo stesso motivo non usiamo Google Analytics né
          altri strumenti di terze parti.
        </li>
      </ul>
      <p>
        Non facciamo profilazione, non vendiamo dati a terzi e non usiamo i tuoi dati per
        pubblicità.
      </p>

      <h2>Chi li tratta per noi</h2>
      <p>
        Per far funzionare il servizio usiamo fornitori che trattano i dati per nostro conto,
        come responsabili o autonomi titolari: Supabase (database e accessi, server
        nell&apos;Unione Europea), Netlify (hosting del sito), Resend (invio email), Mistral
        (lettura del testo dei documenti che carichi e stesura della replica sulla risposta
        della compagnia; il file immagine non viene conservato),
        AeroDataBox (dati di volo: riceve solo numero di volo e data, mai la tua identità).
        Alcuni fornitori possono trovarsi fuori dall&apos;Unione Europea: in quel caso il
        trasferimento avviene con le garanzie previste dagli artt. 44 e seguenti del GDPR
        (clausole contrattuali standard).
      </p>

      <h2>Per quanto li conserviamo</h2>
      <ul>
        <li>
          Le verifiche dei voli: al più tardi dopo 24 mesi (il tempo utile a seguire una
          pratica, visto che la finestra di reclamo arriva a due anni) togliamo ogni dato che
          possa ricondurle a te; restano solo numeri anonimi per le statistiche del servizio.
        </li>
        <li>
          L&apos;iscrizione all&apos;Osservatorio: finché non ti disiscrivi.
        </li>
        <li>
          Le statistiche d&apos;uso: 12 mesi. Sono già anonime dal momento in cui vengono
          scritte, quindi dopo quel periodo restano solo come numeri aggregati.
        </li>
        <li>
          Account e pratiche: per la durata della pratica e poi per il tempo richiesto dagli
          obblighi legali e fiscali (di norma 10 anni per i documenti contabili).
        </li>
      </ul>

      <h2>I tuoi diritti</h2>
      <p>
        Hai il diritto di chiederci l&apos;accesso ai tuoi dati, la rettifica, la
        cancellazione, la limitazione del trattamento, la portabilità, e di opporti al
        trattamento (artt. 15-22 GDPR). Per esercitarli scrivi a{" "}
        <a href="mailto:valerio@artecai.it">valerio@artecai.it</a>: rispondiamo entro 30
        giorni. Se pensi che qualcosa non vada, hai anche il diritto di presentare reclamo al
        Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>).
      </p>

      <h2>Aggiornamenti</h2>
      <p>
        Questa informativa può cambiare quando cambia il servizio. La versione e la data in
        testa alla pagina ti dicono sempre quale stai leggendo.
      </p>
    </PaginaLegale>
  );
}
