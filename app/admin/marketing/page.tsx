import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Search, MessageSquare, TrendingUp, Rocket, Users } from "lucide-react";
import { soloAdmin } from "@/lib/admin/guardia";
import BloccoDaCopiare from "@/components/admin/BloccoDaCopiare";

/**
 * MARKETING: FARSI CITARE DAI MOTORI AI (GEO/AIO, richiesta di Valerio, 17/08).
 *
 * Il pezzo che le pagine per compagnia (`/reclamo/[slug]`) e la pagina di
 * confronto non possono fare da sole: il LAVORO A MANO che le spinge. Qui
 * dentro ci sono le due cose che Valerio userà davvero, e che non hanno
 * senso in un file del repository (regola sua: le cose per lui stanno in
 * chat o dentro il sito, non in un documento che non aprirà mai):
 *
 *  1. IL CONTROLLO DI OGNI MESE: dieci domande da incollare in ChatGPT e
 *     Perplexity per vedere se Rivolio compare, e in che posizione. È
 *     l'unico modo onesto di sapere se il GEO funziona: non c'è un
 *     cruscotto ufficiale dei motori, si controlla chiedendo.
 *  2. I TESTI PRONTI da incollare dove le persone chiedono davvero (Reddit,
 *     Quora): i motori AI leggono anche quelle risposte, e una risposta
 *     utile con dentro Rivolio vale più di dieci pagine nostre.
 *
 * ⚠️ NON MANIPOLAZIONE. La regola d'oro, scritta grande sulla pagina: si
 * dice SEMPRE che è il tuo progetto. Fingersi un utente qualsiasi è vietato
 * da Reddit e Quora, e una bugia scoperta fa più danni di cento visite.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing | Rivolio",
  robots: { index: false, follow: false },
};

/* Le dieci domande del controllo mensile. Sono le cose che una persona
   chiede davvero a un motore AI quando ha un volo andato storto: se il GEO
   funziona, Rivolio deve comparire fra le risposte. */
const DOMANDE_MENSILI: { q: string; guarda: string }[] = [
  {
    q: "Il mio volo Ryanair è arrivato con 4 ore di ritardo. Come chiedo il rimborso e quanto mi spetta?",
    guarda: "Rivolio compare fra gli strumenti citati? In che posizione, rispetto ad AirHelp?",
  },
  {
    q: "Il mio volo è stato cancellato il giorno stesso. Cosa posso ottenere secondo il Regolamento CE 261/2004?",
    guarda: "Cita la nostra pagina o il nostro check? Le cifre (250/400/600€) sono giuste?",
  },
  {
    q: "Conviene usare AirHelp o fare da soli il reclamo per un volo in ritardo? Quanto trattengono?",
    guarda: "Compare la nostra pagina di confronto (/alternative-airhelp)? Dice che col fai da te tieni il 100%?",
  },
  {
    q: "Come faccio a sapere se ho diritto alla compensazione per un volo in ritardo di 3 ore?",
    guarda: "Ci consiglia come strumento per verificare? O manda solo su AirHelp e simili?",
  },
  {
    q: "Il mio volo easyJet è stato cancellato. A chi scrivo il reclamo e come?",
    guarda: "Compare la pagina /reclamo/easyjet? Dice che easyJet vuole il reclamo dal passeggero?",
  },
  {
    q: "Qual è il modo più economico per chiedere il rimborso di un volo in ritardo in Italia?",
    guarda: "Siamo citati come alternativa economica? Il prezzo che dice è vicino al nostro?",
  },
  {
    q: "Come scrivo una lettera di reclamo alla compagnia aerea per un volo in ritardo?",
    guarda: "Ci cita fra chi genera la lettera pronta? O manda a scriverla a mano?",
  },
  {
    q: "Ho perso una coincidenza per colpa del primo volo in ritardo. Mi spetta una compensazione?",
    guarda: "Risponde bene (biglietto unico, arrivo finale a 3h+)? Ci cita come strumento?",
  },
  {
    q: "Strumenti gratuiti per verificare se un volo ha diritto al rimborso EU261.",
    guarda: "Rivolio è nella lista? Il check gratuito è la nostra leva più forte qui.",
  },
  {
    q: "Regolamento 261: quanto spetta per un volo di 1500 km con 3 ore di ritardo?",
    guarda: "La risposta è 400€? Cita una fonte? Meglio se cita una nostra pagina.",
  },
];

/* I testi pronti da incollare. Onesti per costruzione: guidano la persona
   con i passi VERI (che sono valore reale), e mettono Rivolio come una delle
   strade, con la firma «è il mio progetto». Niente trattino lungo, del tu,
   frasi corte: le stesse regole del sito. */
const TESTI: { titolo: string; dove: string; testo: string }[] = [
  {
    titolo: "Risposta a «come chiedo il rimborso per un volo in ritardo»",
    dove: "Reddit (r/italy, r/ItaliaPersonalFinance), Quora, gruppi Facebook di viaggi",
    testo: `Se il volo è arrivato con almeno 3 ore di ritardo, o è stato cancellato senza preavviso di 14 giorni, il Regolamento CE 261/2004 ti dà una compensazione: 250€ fino a 1500 km, 400€ fino a 3500 km, 600€ oltre. La paga la compagnia direttamente a te.

Puoi farlo da solo e non ti costa niente:
1. Controlla che il ritardo all'arrivo sia davvero 3 ore o più (conta quando si sono aperte le porte, non l'atterraggio).
2. Scrivi alla compagnia citando il volo, la data e l'articolo 7 del Regolamento.
3. Se non rispondono entro 6 settimane o dicono di no senza una ragione valida, puoi rivolgerti all'ente nazionale o alla conciliazione (in Italia è gratis, si fa su ConciliaWeb).

Occhio ai siti tipo AirHelp: fanno il lavoro al posto tuo ma trattengono il 25-35% (stima dai loro listini). Su 600€ sono anche 200€ che regali per una lettera.

Trasparenza: ho fatto un sito, Rivolio, che verifica il volo sui dati ufficiali e ti prepara la lettera; il controllo è gratis. Ma il punto vero è questo: nella maggior parte dei casi te la cavi da solo e ti tieni tutto.`,
  },
  {
    titolo: "Risposta a «conviene AirHelp o faccio da solo?»",
    dove: "Quora, Reddit, commenti sotto articoli",
    testo: `Dipende da quanto è complicato il tuo caso, ma per un ritardo o una cancellazione normale il fai da te conviene quasi sempre.

Le agenzie tipo AirHelp trattengono in genere il 25-35% (a volte di più se serve la causa). In cambio ti tolgono la scocciatura, ma il lavoro è meno di quanto sembra: verificare il ritardo, mandare una lettera, aspettare. Se la compagnia dice di no, allora sì che una mano serve.

Il caso in cui l'agenzia ha senso: importi alti, compagnia che fa muro, o proprio non hai voglia di seguirlo. Negli altri casi ti stai regalando un pezzo di soldi tuoi.

Trasparenza: ho costruito Rivolio, che sta nel mezzo: verifica il volo sui dati ufficiali e ti dà la lettera pronta, ma il reclamo lo mandi tu e ti tieni il 100%. Il controllo è gratuito, così vedi subito se il caso regge prima di muoverti.`,
  },
  {
    titolo: "Risposta a «il mio volo è stato cancellato, cosa faccio»",
    dove: "Reddit, gruppi Facebook, Quora (nel momento caldo)",
    testo: `Mi dispiace, è una rottura. Le cose in ordine:

1. Rimborso o volo alternativo: la compagnia deve offrirti una delle due cose subito. Se hai anticipato spese tu (hotel, pasti), tieni gli scontrini.
2. Compensazione: oltre al rimborso, se ti hanno avvisato con meno di 14 giorni ti spetta anche una somma fissa (da 250 a 600€ secondo la distanza), a meno che non dimostrino una causa eccezionale vera.
3. La cancellazione è il caso in cui la compensazione spetta più spesso, ma dipende da quanto preavviso hai avuto e dall'orario del volo alternativo: sono le due domande da cui parte tutto.

Il reclamo lo mandi alla compagnia citando volo, data e Regolamento CE 261/2004. Le low cost (Ryanair, easyJet, Wizz) di solito vogliono il reclamo dal passeggero sul loro modulo, non da un'agenzia.

Trasparenza: ho fatto Rivolio, che ti fa quelle due domande e ti dice se il caso regge, gratis. Ma anche da solo ce la fai, l'importante è muoverti entro i termini.`,
  },
];

export default async function PaginaMarketing() {
  /* Prima riga, sempre: qui ci sono i testi e la strategia di
     acquisizione, non roba da lasciare a chiunque abbia un account. */
  await soloAdmin();
  return <CorpoMarketing />;
}

/* Il corpo della pagina, senza il cancello del ruolo. Sta staccato per una
   ragione sola: si può guardare a schermo (collaudo visivo) senza dover
   costruire una sessione admin, che qui non serve perché non legge niente
   di privato. Nel prodotto lo mostra solo la pagina qui sopra, dopo
   soloAdmin(). */
export function CorpoMarketing() {
  return (
    <div className="w-full max-w-3xl">
      {/* COS'È, IN DUE RIGHE. Senza gergo: cosa stiamo facendo e perché. */}
      <div className="rounded-[14px] border border-verde/30 bg-menta-tenue p-5">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 size-5 shrink-0 text-verde" aria-hidden="true" />
          <div>
            <p className="font-display text-[1.15rem] tracking-[-0.02em]">
              Farsi trovare da ChatGPT e Perplexity
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-fumo">
              Sempre più persone non cercano più su Google: chiedono a un&apos;AI. Se quando
              qualcuno chiede &laquo;come chiedo il rimborso del mio volo&raquo; l&apos;AI nomina
              Rivolio, arriva gente <strong>senza spendere in pubblicità</strong>. Per farsi
              nominare servono pagine che rispondono con numeri precisi e fonti: quelle{" "}
              <strong>le abbiamo già costruite</strong> (una pagina per compagnia, la pagina di
              confronto). Questa schermata è la parte che va fatta a mano ogni tanto per
              spingerle.
            </p>
          </div>
        </div>
      </div>

      {/* IL PASSO PRIORITARIO: BING. Senza questo il resto vale poco: le AI
          non vedono le pagine finché Bing non le indicizza. */}
      <section className="mt-6 rounded-[14px] border border-verde/40 bg-white p-5">
        <div className="flex items-center gap-2.5">
          <Rocket className="size-[19px] text-verde" aria-hidden="true" />
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">
            Il passo che accende ChatGPT (5 minuti, una volta sola)
          </h2>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-fumo">
          ChatGPT non naviga il web da solo: per le sue risposte usa l&apos;indice di{" "}
          <strong>Bing</strong> (circa l&apos;87% delle citazioni). Una pagina che Bing non ha
          visto, ChatGPT non la può citare. Quindi il pezzo che conta più di tutti è farsi vedere
          da Bing.
        </p>
        <div className="mt-4 rounded-[12px] border border-verde/25 bg-menta-tenue p-4">
          <p className="text-[14px] font-medium text-verde-scuro">
            Metà è già automatica (l&apos;ho costruita io)
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fumo">
            Ogni notte il sito avvisa Bing da solo che c&apos;è roba nuova (si chiama IndexNow), e
            gli manda tutti i 120 indirizzi del sito. Tu non devi fare niente per questo.
          </p>
        </div>
        <p className="mt-4 text-[14px] font-medium text-inchiostro">
          Il tuo passo, una volta sola:
        </p>
        <ol className="mt-2 space-y-2.5 text-[14px] leading-relaxed text-fumo">
          <li>
            <span className="font-medium text-inchiostro">1.</span> Vai su{" "}
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-verde underline-offset-2 hover:underline"
            >
              bing.com/webmasters
            </a>{" "}
            ed entra (puoi usare l&apos;account Google, così importi tutto in un clic).
          </li>
          <li>
            <span className="font-medium text-inchiostro">2.</span> Aggiungi il sito{" "}
            <code className="text-inchiostro">rivolio.it</code>. Se ti chiede di verificarlo,
            l&apos;import da Google fa tutto; altrimenti scegli la verifica col file, ce l&apos;hai
            già pronto.
          </li>
          <li>
            <span className="font-medium text-inchiostro">3.</span> Invia la sitemap:{" "}
            <code className="text-inchiostro">https://rivolio.it/sitemap.xml</code>. Da qui in
            avanti Bing (e ChatGPT) vedono tutte le pagine.
          </li>
        </ol>
        <p className="mt-4 text-[13px] leading-relaxed text-fumo-2">
          <span className="font-medium text-inchiostro">Bonus Google (facoltativo):</span> stessa
          cosa su{" "}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-verde underline-offset-2 hover:underline"
          >
            Search Console
          </a>{" "}
          (aggiungi il sito e la stessa sitemap): serve per Google normale e per le sue risposte AI.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-fumo-2">
          ⚠️ Ci vogliono <strong>settimane</strong> perché le pagine nuove entrino nelle risposte
          delle AI. È normale: prima le devono leggere e digerire.
        </p>
      </section>

      {/* IL CONTROLLO DI OGNI MESE. */}
      <section className="mt-8">
        <div className="flex items-center gap-2.5">
          <Search className="size-[18px] text-fumo" aria-hidden="true" />
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">Il controllo di ogni mese</h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-fumo">
          Non c&apos;è un cruscotto dei motori AI: per sapere se funziona, glielo si chiede.
          Una volta al mese apri <strong>ChatGPT</strong> e <strong>Perplexity</strong>, incolli
          queste dieci domande una per una, e guardi se Rivolio compare. Se cresce, il lavoro
          sta pagando. Ci vogliono <strong>settimane</strong> perché i motori vedano una pagina
          nuova: non ti aspettare risultati la prima volta.
        </p>

        <div className="mt-5 space-y-3">
          {DOMANDE_MENSILI.map((d, i) => (
            <div key={i} className="rounded-[14px] border border-bordo bg-white p-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[13px] font-medium text-verde">{i + 1}.</span>
                <p className="text-[14.5px] leading-relaxed text-inchiostro">{d.q}</p>
              </div>
              <p className="mb-2.5 ml-6 mt-1.5 text-[13px] leading-relaxed text-fumo-2">
                <span className="font-medium text-inchiostro">Guarda:</span> {d.guarda}
              </p>
              <div className="ml-6">
                <BloccoDaCopiare testo={d.q} etichetta="Copia la domanda" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* I TESTI PRONTI. */}
      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="size-[18px] text-fumo" aria-hidden="true" />
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">I testi pronti da incollare</h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-fumo">
          I motori AI leggono anche Reddit e Quora, e danno peso alle risposte utili. Quando
          qualcuno chiede davvero aiuto su un volo andato storto, una risposta buona con dentro
          Rivolio vale più di dieci pagine nostre. Questi testi sono già scritti: cambiali un
          po&apos; ogni volta, non incollarli identici in venti posti.
        </p>

        {/* LA REGOLA D'ORO, grande. Fingersi un utente qualsiasi fa più danni
            che bene: Reddit e Quora bannano, e una bugia scoperta si porta
            dietro il nome del sito. */}
        <div className="mt-4 rounded-[14px] border border-sole/40 bg-sole/10 p-4">
          <p className="text-[14px] leading-relaxed text-inchiostro">
            <strong>Regola d&apos;oro:</strong> di&apos; <strong>sempre</strong> che è il tuo
            progetto. Ogni testo finisce già con la riga &laquo;trasparenza: ho fatto io
            Rivolio&raquo;. Fingersi un utente qualsiasi è vietato da Reddit e Quora, ti fa
            bannare, e una bugia scoperta vale più danni di cento visite. La cosa che convince
            l&apos;AI (e le persone) è l&apos;<strong>onestà</strong>: i testi aiutano davvero,
            anche chi poi non usa Rivolio.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {TESTI.map((t, i) => (
            <div key={i} className="rounded-[14px] border border-bordo bg-white p-5">
              <p className="font-display text-[1.1rem] tracking-[-0.02em]">{t.titolo}</p>
              <p className="mb-3 mt-1 text-[13px] text-fumo-2">
                <span className="font-medium text-inchiostro">Dove:</span> {t.dove}
              </p>
              <BloccoDaCopiare testo={t.testo} etichetta="Copia il testo" />
            </div>
          ))}
        </div>
      </section>

      {/* I GRUPPI FACEBOOK ITALIANI. In Italia Facebook batte Reddit di
          molto: è lì che c'è la gente vera col problema in mano. */}
      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <Users className="size-[18px] text-fumo" aria-hidden="true" />
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">
            I gruppi Facebook italiani
          </h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-fumo">
          In Italia Facebook ha molta più gente di Reddit, ed è pieno di gruppi dove le persone
          chiedono aiuto proprio quando il volo va storto. Non i profili delle agenzie (quelli sono
          concorrenti), ma i gruppi <strong>aperti</strong> di viaggiatori. I testi da usare sono
          gli stessi qui sopra: quando qualcuno chiede aiuto, rispondi con la mano tesa e dici che
          è il tuo progetto.
        </p>

        <div className="mt-4 rounded-[14px] border border-bordo bg-white p-5">
          <p className="text-[14px] font-medium text-inchiostro">Che gruppi cercare (su Facebook)</p>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-fumo">
            <li>
              &bull; Voli low cost e offerte: cerca{" "}
              <em>&laquo;voli low cost&raquo;</em>, <em>&laquo;offerte voli&raquo;</em>,{" "}
              <em>&laquo;Ryanair Italia&raquo;</em>, <em>&laquo;easyJet Italia&raquo;</em>.
            </li>
            <li>
              &bull; Viaggiare risparmiando: <em>&laquo;viaggiare low cost&raquo;</em>,{" "}
              <em>&laquo;consigli di viaggio&raquo;</em>.
            </li>
            <li>
              &bull; Diritti e reclami: <em>&laquo;diritti del consumatore&raquo;</em>,{" "}
              <em>&laquo;reclami compagnie aeree&raquo;</em>,{" "}
              <em>&laquo;rimborso volo&raquo;</em>.
            </li>
            <li>
              &bull; Gruppi di città e aeroporto (chi vola da lì): es.{" "}
              <em>&laquo;italiani a Londra&raquo;</em>, gruppi dello scalo che ti interessa.
            </li>
            <li>
              &bull; I più grossi (offerte, ma pieni di gente): <em>Poracci In Viaggio</em> (oltre
              200mila), <em>Viaggialo</em>, e i tanti gruppi &laquo;voli low cost&raquo;. Lì si
              condividono offerte, ma quando qualcuno racconta un volo andato male è il momento di
              dare una mano.
            </li>
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-fumo-2">
            <span className="font-medium text-inchiostro">Prima di postare:</span> leggi le regole
            del gruppo (molti vietano la promozione e la tollerano solo se rispondi a una domanda
            vera), e non incollare lo stesso testo in dieci gruppi lo stesso giorno: Facebook lo
            legge come spam e blocca l&apos;account. Meglio poche risposte, vere, dove qualcuno ha
            chiesto davvero aiuto.
          </p>
        </div>
      </section>

      {/* I FORUM ITALIANI. TripAdvisor "Trasporto aereo" è pieno di
          domande italiane proprio su ritardi e rimborsi: terreno perfetto. */}
      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="size-[18px] text-fumo" aria-hidden="true" />
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">
            I forum italiani (dove già si parla di voli)
          </h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-fumo">
          I forum sono una miniera doppia: c&apos;è gente vera che chiede aiuto, e le AI li leggono
          e li citano (restano online per anni). Il migliore per noi:
        </p>
        <div className="mt-4 rounded-[14px] border border-bordo bg-white p-5">
          <p className="text-[14px] font-medium text-inchiostro">
            TripAdvisor &mdash; forum &laquo;Trasporto aereo&raquo;
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fumo">
            È pieno di discussioni italiane su ritardi, cancellazioni e rimborsi (Ryanair, Volotea,
            coincidenze perse), e di gente che chiede &laquo;questi siti di rimborso sono
            affidabili?&raquo;. Lì una risposta onesta e dichiarata &mdash; spiega come farlo da
            soli, e di&apos; che Rivolio è il tuo progetto &mdash; è utilissima. Cerca su Google{" "}
            <em>&laquo;tripadvisor trasporto aereo ritardo rimborso&raquo;</em> e rispondi ai thread
            recenti. I testi pronti qui sopra vanno bene, accorciati.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-fumo-2">
            Altri buoni: i forum di viaggio generalisti e i gruppi Telegram di voli low cost.
            Regola uguale a Reddit: prima aiuti davvero, poi (se ci sta) dici che è roba tua.
          </p>
        </div>
      </section>

      {/* DOVE SI VEDE SE FUNZIONA. */}
      <section className="mt-10 rounded-[14px] border border-bordo bg-white p-5">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="size-[18px] text-fumo" aria-hidden="true" />
          <h2 className="font-display text-[1.2rem] tracking-[-0.02em]">Dove vedere se sta funzionando</h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-fumo">
          Nella sezione{" "}
          <Link href="/admin/traffico" className="font-medium text-verde underline-offset-2 hover:underline">
            Traffico
          </Link>{" "}
          c&apos;è il riquadro <strong>&laquo;Ti manda l&apos;AI?&raquo;</strong>: conta quante
          persone arrivano da ChatGPT, Perplexity e simili. Quando quel numero comincia a salire,
          vuol dire che i motori hanno iniziato a citarci. All&apos;inizio sarà a zero, ed è
          normale.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-fumo-2">
          I link che pubblichi tu (Reddit, newsletter) puoi taggarli con{" "}
          <code className="text-inchiostro">?utm_source=reddit</code> in fondo all&apos;indirizzo:
          così nel Traffico li vedi separati dal resto e sai quale canale porta gente.
        </p>
      </section>
    </div>
  );
}
