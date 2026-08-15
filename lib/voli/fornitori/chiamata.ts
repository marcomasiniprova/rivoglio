/**
 * LA CHIAMATA AL FORNITORE, CON IL RITENTATIVO.
 *
 * PERCHÉ ESISTE, e non è un dettaglio tecnico: il tetto di AeroDataBox
 * non è mensile, è **al secondo**. Anche sul piano più caro sono 3
 * richieste al secondo (letto sulla loro pagina prezzi l'11/08). Un
 * video che va bene manda mille persone in due minuti: la quota del
 * mese resta abbondante, ma in quel minuto il fornitore comincia a
 * rispondere "troppe richieste".
 *
 * Cosa succedeva prima: al primo "troppe richieste" si mollava, il
 * verdetto usciva incerto e quella persona non aveva la sua risposta.
 * Nessun guasto, nessun verdetto sbagliato, nessuno che paga per
 * niente: solo una vendita persa proprio nel minuto in cui ne arrivano
 * di più. È il modo più stupido di perdere il lancio.
 *
 * Cosa fa adesso: aspetta un attimo e riprova. Mezzo secondo di attesa
 * vale più di una risposta mancata.
 *
 * ⚠️ IL LIMITE VERO SONO I 10 SECONDI DELLE FUNZIONI NETLIFY. Oltre
 * quelli la funzione muore e l'utente vede un errore, che è peggio di un
 * incerto. Quindi il tempo TOTALE dei tentativi ha un tetto, e quando è
 * finito si smette anche se il fornitore direbbe di riprovare.
 *
 * ⚠️ SI RIPROVA SOLO SU "TROPPE RICHIESTE" E SUI GUASTI LORO. Un 404
 * vuol dire che quel volo su quella data non ce l'hanno, e riprovare
 * dieci volte darebbe dieci volte lo stesso 404 costando dieci volte.
 */

import { dopo } from "@/lib/eventi/registra";
import { tinGuasto } from "@/lib/eventi/telegram";
import { segnaChiamataFornitore, TETTO_ORA } from "@/lib/api/tetto-fornitore";

/** Tempo totale che possiamo spendere, tentativi e attese comprese. */
export const BUDGET_MS = 8_000;

/** Quante volte in tutto: il primo colpo più due ritentativi. */
export const TENTATIVI = 3;

/** L'attesa fra un tentativo e l'altro, che raddoppia ogni volta. */
const ATTESA_BASE_MS = 450;

/** Oltre questa attesa non ha senso aspettare: la funzione muore prima. */
const ATTESA_MASSIMA_MS = 1_500;

const dormi = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * IL FRENO D'EMERGENZA (un "interruttore automatico"), audit 14/08.
 *
 * Quando il fornitore va in "troppe richieste" a raffica (un video virale su
 * voli DIVERSI: la cache non aiuta e si sfondano i 3 al secondo), riprovare
 * per 8 secondi non serve e fa PEGGIO: tiene la funzione occupata mentre ne
 * arrivano altre, finché non si accumulano e la piattaforma inizia a
 * rispondere 503 a tutti. Qui, dopo qualche 429 di fila, si "apre il
 * circuito": per qualche secondo le chiamate escono SUBITO come "troppe
 * richieste", senza chiamare né aspettare. La funzione si libera all'istante,
 * il check esce onesto (incerto, e con la coda-email lo si potrà recuperare),
 * e la piena non travolge la concorrenza. Passata l'ondata, si richiude da
 * solo. Vale per macchina Netlify: ognuna protegge sé stessa.
 */
const FRENO_SOGLIA_429 = 4; // dopo 4 "troppe richieste" di fila...
const FRENO_COOLDOWN_MS = 3_000; // ...si esce subito per 3 secondi
let conta429 = 0;
let frenoApertoFino = 0;

function frenoAperto(): boolean {
  return Date.now() < frenoApertoFino;
}
function segna429(): void {
  conta429 += 1;
  if (conta429 >= FRENO_SOGLIA_429) frenoApertoFino = Date.now() + FRENO_COOLDOWN_MS;
}
function azzeraFreno(): void {
  conta429 = 0; // una risposta buona vuol dire che l'ondata è passata
}

/**
 * Il fornitore ha smesso di rispondere: fai squillare il telefono.
 *
 * ⚠️ SOLO QUANDO I TENTATIVI SONO FINITI, e mai su un 404. Un volo che
 * non c'è non è un guasto; il fornitore giù invece è la cosa che durante
 * una distribuzione va saputa nel minuto, non la sera.
 *
 * Il messaggio parte DOPO la risposta all'utente e non si aspetta: chi
 * sta facendo il check ha già avuto il suo verdetto (incerto, onesto), e
 * non deve restare fermo perché noi stiamo avvisando qualcuno.
 * `tinGuasto` ha già il suo silenziatore da un quarto d'ora, quindi un
 * picco di mille errori resta un messaggio solo.
 */
function allarmeFornitore(etichetta: string, stato: number): void {
  /* 🔴 LA CHIAVE DEL SILENZIATORE DEV'ESSERE STABILE, non per-volo. L'audit
     del 14/08 ha trovato che era `fornitore-${etichetta}`, e l'etichetta è
     "aerodatabox FR1234 2026-08-06": UNICA per ogni volo. Così mille voli
     distinti che falliscono nel picco facevano mille messaggi Telegram e
     mille insert 'guasto', proprio mentre il DB è già sotto stress (STATO
     diceva "mille errori = un messaggio solo": era falso). La chiave ora è
     per FORNITORE + stato (il fornitore è la prima parola dell'etichetta);
     la riga del volo resta nel MESSAGGIO, dove serve. */
  const chiave = `fornitore-${etichetta.split(" ")[0]}-${stato}`;
  dopo(() =>
    tinGuasto(
      chiave,
      stato === 0
        ? `Il fornitore dei dati di volo non risponde (${etichetta}).\nI check escono "incerto": nessuno paga per un verdetto sbagliato, ma le vendite si fermano.`
        : `Il fornitore dei dati di volo risponde ${stato} (${etichetta}).\n${stato === 429 ? "È il tetto delle richieste al secondo: sta arrivando troppa gente insieme." : "È un guasto dalla loro parte."}`,
    ),
  );
}

/**
 * IL TIN QUANDO IL TETTO SI CHIUDE.
 *
 * È uno dei tre casi in cui i soldi si muovono o si fermano, quindi vale
 * un messaggio sul telefono: da quel momento i check escono "incerto" e
 * non si vende più niente finché non scocca l'ora dopo. Il silenziatore
 * da un quarto d'ora di `tinGuasto` fa il resto: sotto attacco arrivano
 * quattro messaggi all'ora, non quattromila.
 */
function allarmeTetto(fatte: number): void {
  dopo(() =>
    tinGuasto(
      "tetto-fornitore",
      `Tetto orario delle chiamate al fornitore raggiunto: ${fatte} in un'ora (limite ${TETTO_ORA}).\nDa adesso i check escono "incerto" finché non scocca l'ora nuova: nessuno paga per un verdetto sbagliato, ma le vendite si fermano.\nSe non è traffico vero, è qualcuno che ci sta girando un elenco di voli.`,
    ),
  );
}

/** Vale la pena riprovare? Solo se il problema è loro e passa da solo. */
function daRiprovare(stato: number): boolean {
  // 429 = troppe richieste. 5xx = un guasto dalla loro parte.
  return stato === 429 || (stato >= 500 && stato < 600);
}

/**
 * Quanto aspettare prima del prossimo tentativo.
 * Se il fornitore lo dice lui (`Retry-After`) gli si dà retta, ma entro
 * il nostro tetto: se chiedesse un minuto non possiamo aspettarlo.
 */
function quantoAspettare(risposta: Response | null, tentativo: number): number {
  const detto = risposta?.headers.get("retry-after");
  const secondi = detto ? Number.parseFloat(detto) : NaN;
  const chiesto = Number.isFinite(secondi) && secondi > 0 ? secondi * 1000 : 0;
  const nostro = ATTESA_BASE_MS * 2 ** tentativo;
  return Math.min(Math.max(chiesto, nostro), ATTESA_MASSIMA_MS);
}

export type EsitoChiamata =
  | { ok: true; risposta: Response }
  /** Il fornitore ha risposto, ma non con un dato: 404, 204, o un errore. */
  | { ok: false; stato: number }
  /** Non ha risposto affatto: rete giù, timeout, tempo finito. */
  | { ok: false; stato: 0 };

/**
 * Chiama il fornitore e riprova quando ha senso.
 *
 * `etichetta` finisce nei log: serve a capire QUALE chiamata sta
 * soffrendo quando si guardano i registri di Netlify durante un picco.
 */
export async function chiamaConRitentativo(
  url: string,
  intestazioni: Record<string, string>,
  etichetta: string,
  budgetMs = BUDGET_MS,
): Promise<EsitoChiamata> {
  /* IL FRENO D'EMERGENZA, prima ancora del tetto: se il circuito è aperto
     (troppe "troppe richieste" appena adesso) si esce all'istante, senza
     chiamare né toccare il database. È quello che libera le funzioni sotto
     un picco. */
  if (frenoAperto()) return { ok: false, stato: 429 };

  /* IL TETTO SULLA SPESA, prima di tutto il resto.
     Sta qui e non nelle rotte perché qui passa OGNI chiamata che
     paghiamo, comprese quelle delle tre rotte del seguito (cancellato,
     dichiara, operativo) e del lavoro notturno degli avvisi. Un tetto
     scritto rotta per rotta è un tetto che la rotta numero sei non ha.
     ⚠️ I ritentativi NON contano doppio: il conto si fa una volta per
     chiamata logica, prima del ciclo. Contare anche i ritentativi
     vorrebbe dire chiudere il rubinetto proprio nel momento in cui il
     fornitore sta già facendo i capricci. */
  const tetto = await segnaChiamataFornitore();
  if (tetto.chiuso) {
    console.warn(`[${etichetta}] tetto orario raggiunto (${tetto.fatte}/${TETTO_ORA})`);
    allarmeTetto(tetto.fatte ?? TETTO_ORA);
    return { ok: false, stato: 0 };
  }

  const scadenza = Date.now() + budgetMs;

  for (let tentativo = 0; tentativo < TENTATIVI; tentativo++) {
    const rimasto = scadenza - Date.now();
    /* Sotto il secondo non si fa in tempo nemmeno ad aprire la
       connessione: meglio arrendersi ora che far morire la funzione. */
    if (rimasto < 1_000) break;

    let risposta: Response | null = null;
    try {
      risposta = await fetch(url, {
        headers: intestazioni,
        signal: AbortSignal.timeout(Math.min(rimasto, 6_000)),
        cache: "no-store",
      });
    } catch (e) {
      /* Rete giù o tempo scaduto. Si riprova, perché una connessione
         caduta è esattamente il genere di cosa che al secondo colpo
         funziona. */
      console.warn(`[${etichetta}] tentativo ${tentativo + 1} fallito:`, e);
      if (tentativo + 1 < TENTATIVI && scadenza - Date.now() > 1_500) {
        await dormi(quantoAspettare(null, tentativo));
        continue;
      }
      allarmeFornitore(etichetta, 0);
      return { ok: false, stato: 0 };
    }

    /* ⚠️ IL 204 NON È UNA RISPOSTA BUONA, anche se sta nella famiglia
       dei "va tutto bene": vuol dire "nessun contenuto", cioè quel volo
       su quella data non ce l'hanno. Trattarlo come riuscito porta chi
       chiama a leggere un corpo vuoto come se fosse dati. Il codice di
       prima lo gestiva a parte e nel rifacimento si era perso: l'ha
       ripreso una prova. */
    if (risposta.status === 204) return { ok: false, stato: 204 };
    if (risposta.ok) {
      azzeraFreno(); // una risposta buona: l'ondata è passata, il freno si scarica
      return { ok: true, risposta };
    }

    if (!daRiprovare(risposta.status)) {
      /* 404 e 204 non sono guasti: quel volo su quella data non ce
         l'hanno. Riprovare costerebbe e darebbe lo stesso risultato. */
      return { ok: false, stato: risposta.status };
    }

    console.warn(
      `[${etichetta}] il fornitore ha risposto ${risposta.status} (tentativo ${tentativo + 1} di ${TENTATIVI})`,
    );
    if (tentativo + 1 < TENTATIVI) {
      const attesa = quantoAspettare(risposta, tentativo);
      if (scadenza - Date.now() > attesa + 1_000) {
        await dormi(attesa);
        continue;
      }
    }
    if (risposta.status === 429) segna429(); // conta verso il freno d'emergenza
    allarmeFornitore(etichetta, risposta.status);
    return { ok: false, stato: risposta.status };
  }

  allarmeFornitore(etichetta, 0);
  return { ok: false, stato: 0 };
}
