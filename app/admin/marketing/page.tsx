import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Search, MessageSquare, TrendingUp } from "lucide-react";
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
