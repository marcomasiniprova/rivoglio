import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, rigaScalo, vestito } from "./modello";
import { linkConferma, linkDisdetta } from "@/lib/iscritti/gettone";

import { seSiPaga } from "@/lib/check/ingresso";
/**
 * Le email di servizio, una funzione ciascuna.
 *
 * VIVE (le mandano i flussi di Rivolio):
 *   0. chiedi conferma dell'iscrizione → chiediConferma  (doppio opt-in)
 *   1. iscrizione confermata           → benvenutoLista
 *   2. creazione dell'account          → benvenuto
 *   3. conferma dell'email             → conferma
 *   4. accesso senza password          → linkMagico
 * Le email della PRATICA (T+0/2/15/30/60) stanno in `pratiche.ts`.
 *
 * EREDITÀ del prodotto viaggi (5-8: ricercaAttiva, alert, creditiFiniti,
 * ricevuta): nessun flusso di Rivolio le manda più; le richiama solo il
 * vecchio ramo ricerche/alert, da spegnere (voce in ARRETRATI). Non
 * riusarle per testi nuovi.
 *
 * Nessuna di queste lancia eccezioni: se l'email non parte, l'azione
 * dell'utente è comunque riuscita. Una registrazione fallita perché la
 * posta era giù sarebbe un disastro.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

/* ---------------------------------------------------------------- 0 */
/**
 * DOPPIO OPT-IN: prima di iscrivere qualcuno gli si chiede di cliccare.
 *
 * Non è burocrazia. Chiunque può scrivere l'indirizzo di un altro nel
 * campo della newsletter: senza il clic gli manderemmo posta che non ha
 * chiesto. E ogni indirizzo falso che rimbalza abbassa la reputazione del
 * dominio, cioè fa finire in spam anche le email di chi ci tiene.
 */
export function componiConferma(link: string) {
  return {
    oggetto: "Confermi l'iscrizione all'Osservatorio?",
    html: vestito({
      titolo: "Confermi l'iscrizione?",
      corpo:
        h("Manca un clic.") +
        p(
          "Qualcuno ha chiesto di iscrivere questo indirizzo all'Osservatorio dei Disservizi: ogni settimana i voli più in ritardo sui cieli italiani, dai dati che verifichiamo per i check.",
        ) +
        p("Se sei stato tu, confermalo qui sotto. Da lì parte tutto.") +
        bottone("Sì, confermo", link) +
        p("Il link vale trenta giorni. Se scade, riscrivi il tuo indirizzo sul sito e te ne mando un altro."),
      coda: "Se non hai chiesto tu questa iscrizione, butta questa email: senza il clic non ti arriva più niente e il tuo indirizzo resta fermo.",
    }),
    testo: `Manca un clic.\n\nConferma l'iscrizione all'Osservatorio dei Disservizi:\n${link}\n\nSe non hai chiesto tu questa iscrizione, ignora questa email.`,
  };
}

export function chiediConferma(a: string): Promise<Esito> {
  const link = linkConferma(casa(), a);
  if (!link) return Promise.resolve({ ok: false, motivo: "Nessun segreto per firmare il link." });
  return spedisci({ a, ...componiConferma(link) });
}

/* ---------------------------------------------------------------- 1 */
export type ScaloOggi = { nome: string; indice: number; medianaMinuti: number | null };

/**
 * Il benvenuto vero, quello che parte DOPO il clic di conferma.
 * Dentro ci sono già gli scali di oggi: chi si iscrive riceve subito una
 * cosa utile, non la promessa di riceverne una fra sette giorni.
 */
export function componiBenvenuto(scali: ScaloOggi[], disdetta: string | null) {
  const tabella = scali.length
    ? `<p style="margin:26px 0 4px;font-family:${FONT};font-size:12.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.verde};">Gli aeroporti italiani, adesso</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;">
         ${scali
           .map((s) =>
             rigaScalo(
               s.nome,
               s.indice.toLocaleString("it-IT", { maximumFractionDigits: 1 }),
               s.medianaMinuti !== null ? `mediana ${s.medianaMinuti} min di ritardo` : "indice ritardi",
             ),
           )
           .join("")}
       </table>
       <p style="margin:8px 0 0;font-family:${FONT};font-size:12.5px;line-height:1.6;color:${C.fumo2};">Indice da 0 (tutto in orario) a 5, sugli arrivi delle ultime due ore. Fonte: tracciamento AeroDataBox.</p>`
    : "";

  return {
    oggetto: "Sei nell'Osservatorio dei Disservizi.",
    html: vestito({
      titolo: "Sei dentro",
      corpo:
        h("Sei dentro.") +
        p(
          "Ogni settimana ti mando i voli più in ritardo sui cieli italiani, presi dai dati che verifichiamo per i check. Una email a settimana, niente altro.",
        ) +
        tabella +
        bottone(seSiPaga("Analizza un tuo volo", "Controlla un tuo volo, gratis"), `${casa()}/app`) +
        p(
          `<strong style="color:${C.inchiostro}">Intanto una cosa utile:</strong> se nell'ultimo anno hai preso un volo atterrato con più di 3 ore di ritardo, il check dice in trenta secondi in che fascia rientri (250, 400 o 600 euro). Non serve account.`,
        ),
      coda: "Ricevi questa email perché hai confermato l'iscrizione all'Osservatorio dei Disservizi di Rivolio.",
      disdetta,
    }),
    testo:
      `Sei dentro.\n\nOgni settimana i voli più in ritardo sui cieli italiani, dai dati che verifichiamo per i check.\n` +
      (scali.length
        ? `\nGli aeroporti italiani adesso:\n${scali.map((s) => `- ${s.nome}: ${s.indice.toLocaleString("it-IT", { maximumFractionDigits: 1 })}/5${s.medianaMinuti !== null ? ` (mediana ${s.medianaMinuti} min)` : ""}`).join("\n")}\n`
        : "") +
      `\n${seSiPaga("Analizza un tuo volo", "Controlla un tuo volo, gratis")}: ${casa()}/app` +
      (disdetta ? `\n\nPer non ricevere più queste email: ${disdetta}` : ""),
  };
}

export function benvenutoLista(a: string, scali: ScaloOggi[] = []): Promise<Esito> {
  return spedisci({ a, ...componiBenvenuto(scali, linkDisdetta(casa(), a)) });
}

/* ---------------------------------------------------------------- 2 */
export function benvenuto(a: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Il tuo account Rivolio è pronto.",
    html: vestito({
      titolo: "Benvenuto",
      corpo:
        h("Il tuo account è pronto.") +
        p(
          seSiPaga(
            "L'analisi di un volo si fa anche senza account. L'account serve al resto: le tue pratiche e gli avvisi.",
            "Il check dei voli resta gratis e senza account, per te e per chiunque. L'account serve al resto: le tue pratiche e gli avvisi.",
          ),
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.menta};border-radius:14px;padding:20px 22px;margin:0 0 8px;">
           <tr><td style="font-family:${FONT};font-size:15px;line-height:1.7;color:${C.verdeNotte};">
             <strong>Cosa ti sei aperto</strong><br>
             1. Le pratiche si seguono passo per passo, dal sito e dall'app.<br>
             2. I voli che salvi nell'app li ricontrolliamo il giorno dopo: se rientrano in una fascia, ti avvisiamo noi.<br>
             3. Con questa email ritrovi tutto, su sito e app.
           </td></tr>
         </table>` +
        bottone(seSiPaga("Analizza un volo", "Controlla un volo, gratis"), `${casa()}/app`) +
        p(
          "Nessun abbonamento e nessun addebito: si paga solo se apri una pratica, una volta sola. Se questo account non l'hai chiesto tu, rispondi a questa email e lo cancelliamo.",
        ),
      coda: "Ricevi questa email perché è stato creato un account Rivolio con questo indirizzo.",
    }),
    testo: `Il tuo account è pronto.\n\n${seSiPaga("L'analisi di un volo si fa anche senza account.", "Il check dei voli resta gratis e senza account.")} L'account serve al resto:\n1. Le pratiche si seguono passo per passo, dal sito e dall'app.\n2. I voli che salvi nell'app li ricontrolliamo il giorno dopo: se rientrano in una fascia, ti avvisiamo noi.\n3. Con questa email ritrovi tutto, su sito e app.\n\n${seSiPaga("Analizza un volo", "Controlla un volo, gratis")}: ${casa()}/app\n\nNessun abbonamento: si paga una volta sola, per quello che chiedi.`,
  });
}

/* ---------------------------------------------------------------- 3 */
export function conferma(a: string, link: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Conferma il tuo indirizzo",
    html: vestito({
      titolo: "Conferma il tuo indirizzo",
      corpo:
        h("Un clic e sei dentro.") +
        p("Serve solo a essere sicuri che questo indirizzo sia davvero tuo.") +
        bottone("Conferma il mio indirizzo", link) +
        p(
          `Se non hai chiesto tu questa registrazione, ignora questa email: senza il clic non succede niente.`,
        ),
      coda: `Ricevi questa email perché qualcuno ha usato questo indirizzo per registrarsi su ${casa().replace(/^https?:\/\//, "")}.`,
    }),
    testo: `Un clic e sei dentro.\n\nConferma il tuo indirizzo: ${link}\n\nSe non hai chiesto tu questa registrazione, ignora questa email.`,
  });
}

/* ---------------------------------------------------------------- 4 */
export function linkMagico(a: string, link: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Il tuo link per entrare",
    html: vestito({
      titolo: "Il tuo link per entrare",
      corpo:
        h("Entra senza password.") +
        p("Apri questo link dallo stesso dispositivo da cui l'hai chiesto.") +
        bottone("Entra", link) +
        p("Il link vale una volta sola e scade a breve. Se non l'hai chiesto tu, ignoralo."),
      coda: "Ricevi questa email perché è stato chiesto un accesso con questo indirizzo.",
    }),
    testo: `Entra senza password: ${link}\n\nIl link vale una volta sola e scade a breve.`,
  });
}
