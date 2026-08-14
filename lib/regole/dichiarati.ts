import { ambitoCE261, vettoreConLicenzaUE, zonaDiScalo } from "./territorio";
import {
  VERSIONE_REGOLE,
  dentroLoSpazioEuropeo,
  fasciaArt7,
  type FattoVolo,
  type Verdetto,
} from "./eu261";

import { seSiPaga } from "@/lib/check/ingresso";
/**
 * I CASI DICHIARATI: negato imbarco e coincidenza persa.
 *
 * Sono diversi da ritardo e cancellazione in una cosa sola, ma decisiva:
 * il volo controllato può risultare PERFETTO negli archivi. Un aereo
 * partito in orario non dice niente su chi è rimasto al gate, e un primo
 * volo con 40 minuti di ritardo non dice niente sulla coincidenza persa
 * a Monaco. Qui il fatto che conta lo dichiara il passeggero, a scelte
 * chiuse, e il motore resta un albero di if: l'AI non tocca niente.
 *
 * NEGATO IMBARCO (art. 4 CE 261/2004):
 * - hai ceduto il posto VOLONTARIAMENTE in cambio di benefici → niente
 *   compensazione: è lo scambio che hai accettato (art. 4.1);
 * - ti hanno lasciato a terra CONTRO la tua volontà, con prenotazione
 *   confermata e presentandoti in orario → compensazione IMMEDIATA
 *   (art. 4.3 + art. 7), senza condizioni sul ritardo d'arrivo;
 * - arrivato tardi al gate o senza prenotazione confermata → non spetta.
 * La fascia usa la distanza del volo negato: è quella che abbiamo già.
 *
 * COINCIDENZA PERSA (giurisprudenza consolidata su art. 7, causa
 * C-11/11 Folkerts): conta il ritardo all'arrivo nella DESTINAZIONE
 * FINALE, e vale solo se i voli stavano su UN'UNICA prenotazione.
 * - biglietti separati → ogni volo va giudicato da solo: qui non spetta;
 * - unica prenotazione e arrivo finale con 3 ore o più → spetta, con la
 *   fascia sulla distanza dell'INTERO viaggio (partenza del primo volo →
 *   destinazione finale), non del segmento;
 * - la riduzione del 50% sul lungo raggio (art. 7.2) vale anche qui:
 *   oltre 3.500 km con ritardo sotto le 4 ore → 300€.
 *
 * Come per i cancellati: chi non ricorda resta incerto e non paga, e le
 * dichiarazioni si scrivono sulla riga della verifica come prova.
 */

/* ------------------------------------------------------------ negato */

export type PresenzaGate = "inOrario" | "tardi" | "nonRicordo";
export type Volonta = "involontario" | "volontario";

export type RisposteNegato = {
  presenza: PresenzaGate;
  volonta: Volonta;
};

export function rispostaNegatoValida(r: unknown): r is RisposteNegato {
  const x = r as RisposteNegato | null;
  return (
    !!x &&
    (["inOrario", "tardi", "nonRicordo"] as const).includes(x.presenza) &&
    (["involontario", "volontario"] as const).includes(x.volonta)
  );
}

const incerto = (motivo: string): Verdetto => ({
  esito: "incerto",
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

const nonIdoneo = (motivo: string): Verdetto => ({
  esito: "non_idoneo",
  ritardoMinuti: null,
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

/* 🔴 STESSA COPIA SBAGLIATA DI cancellato.ts: le fasce senza l'eccezione
   della lettera b). Vedi il commento là e `fasciaArt7` in eu261.ts. */
const fascia = (f: FattoVolo, km: number) => fasciaArt7(km, dentroLoSpazioEuropeo(f));

/** I paletti comuni ai casi che spettano: ambito, sciopero, codeshare, distanza. */
function paletti(f: FattoVolo, km: number | null): Verdetto | null {
  /* 🔴 IL CANCELLO TERRITORIALE NON C'ERA, E QUESTA PORTA ERA APERTA.
     L'art. 3 par. 1 decide PRIMA di tutto il resto se il Regolamento si
     applica, e `valuta()` in eu261.ts lo chiede da sempre. Ma negato
     imbarco e coincidenza persa non passano da lì: arrivano da
     /api/verifica/dichiara e chiamavano direttamente queste funzioni.
     Effetto: un New York → Toronto, che il check dichiara giustamente
     fuori ambito, bastava riaprirlo con «mi hanno lasciato a terra» per
     vedersi rispondere «idoneo, 250€». Lo stesso identico falso positivo
     chiuso nel giro #37 sul ritardo, rimasto aperto sulla porta accanto.
     Trovato dall'ispezione del 12/08. */
  const ambito = ambitoCE261(
    { iata: f.partenzaIata, paese: f.partenzaPaese, icao: f.partenzaIcao },
    { iata: f.arrivoIata, paese: f.arrivoPaese, icao: f.arrivoIcao },
    f.vettoreUE ?? vettoreConLicenzaUE(f.vettoreOperativo),
  );
  if (!ambito.dentro) {
    return ambito.certo
      ? nonIdoneo(ambito.motivo)
      : incerto(ambito.motivo);
  }

  if (f.scioperoNoto === true) {
    return incerto(
      "In base alle tue risposte la compensazione spetterebbe, ma nel giorno di questo volo risulta uno sciopero del trasporto aereo: l'esito dipende da chi scioperava e lo verifichiamo a mano. Non ti facciamo pagare niente finché non è chiaro.",
    );
  }
  if (f.vettoreDaDeterminare) {
    return incerto(
      "In base alle tue risposte la compensazione spetterebbe, ma questo numero di volo è venduto in codeshare: il reclamo deve andare alla compagnia che ha operato davvero, e la determiniamo a mano. Non ti facciamo pagare niente finché non è chiaro.",
    );
  }
  if (km === null || !Number.isFinite(km) || km <= 0) {
    return incerto(
      seSiPaga(
        "In base alle tue risposte la compensazione spetterebbe, ma non conosciamo la distanza che decide l'importo. Riprova più tardi: questa analisi non si consuma, il credito resta.",
        "In base alle tue risposte la compensazione spetterebbe, ma non conosciamo la distanza che decide l'importo. Riprova più tardi: il controllo resta gratuito.",
      ),
    );
  }
  return null;
}

export function valutaNegato(f: FattoVolo, r: RisposteNegato): Verdetto {
  if (r.volonta === "volontario") {
    return nonIdoneo(
      "Hai ceduto il posto volontariamente in cambio di benefici concordati con la compagnia: in quel caso la compensazione dell'art. 7 non spetta (art. 4, comma 1). Vale quello che avete concordato al gate.",
    );
  }
  if (r.presenza === "nonRicordo") {
    return incerto(
      "Per il negato imbarco il Regolamento chiede che tu ti sia presentato in orario all'imbarco con prenotazione confermata. Senza questo dato il caso resta incerto e non paghi niente. Controlla la carta d'imbarco o l'email di check-in e torna a rispondere.",
    );
  }
  if (r.presenza === "tardi") {
    return nonIdoneo(
      "Se ti sei presentato all'imbarco oltre l'orario indicato, il Regolamento non prevede la compensazione per negato imbarco (art. 3, comma 2): serve essersi presentati in orario con prenotazione confermata.",
    );
  }

  const blocco = paletti(f, f.kmOrtodromica);
  if (blocco) return blocco;
  const km = f.kmOrtodromica as number;
  const importo = fascia(f, km);

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: 0,
    motivo: `Ti hanno negato l'imbarco contro la tua volontà pur essendoti presentato in orario con prenotazione confermata: la compensazione è dovuta subito, senza condizioni sul ritardo (art. 4, comma 3). Su una tratta di ${Math.round(km)} km la fascia è ${importo}€. La compagnia può opporre solo motivi legati a te (documenti, sicurezza, salute), non i suoi.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}

/* ------------------------------------------------------- coincidenza */

export type PrenotazioneUnica = "si" | "no" | "nonSo";
export type RitardoFinale = "meno3" | "fra3e4" | "oltre4" | "nonRicordo";

export type RisposteCoincidenza = {
  unica: PrenotazioneUnica;
  ritardoFinale: RitardoFinale;
};

export function rispostaCoincidenzaValida(r: unknown): r is RisposteCoincidenza {
  const x = r as RisposteCoincidenza | null;
  return (
    !!x &&
    (["si", "no", "nonSo"] as const).includes(x.unica) &&
    (["meno3", "fra3e4", "oltre4", "nonRicordo"] as const).includes(x.ritardoFinale)
  );
}

/**
 * Il verdetto sulla coincidenza persa.
 * kmViaggio è la distanza dell'INTERO viaggio (partenza del primo volo →
 * destinazione finale), calcolata dal chiamante sui nostri dati: qui
 * arriva un numero, mai un nome di città da interpretare.
 */
export function valutaCoincidenza(
  f: FattoVolo,
  r: RisposteCoincidenza,
  kmViaggio: number | null,
): Verdetto {
  if (r.unica === "no") {
    return nonIdoneo(
      "I due voli erano su biglietti separati: per il Regolamento ogni volo va giudicato da solo, e la coincidenza persa fra prenotazioni diverse non dà compensazione. Controlla il primo volo per il suo ritardo: quello resta valutabile.",
    );
  }
  if (r.unica === "nonSo") {
    return incerto(
      "Serve sapere se i voli stavano sulla stessa prenotazione: guarda l'email di conferma, se c'è un solo codice di prenotazione per tutti i voli la risposta è sì. Finché non si sa, il caso resta incerto e non paghi niente.",
    );
  }
  if (r.ritardoFinale === "nonRicordo") {
    return incerto(
      "Manca il dato che decide: con quanto ritardo sei arrivato alla destinazione finale? Sotto le 3 ore la compensazione non spetta, da 3 in su sì. Ritrova l'orario d'arrivo del volo che hai preso davvero e torna a rispondere.",
    );
  }
  if (r.ritardoFinale === "meno3") {
    return nonIdoneo(
      "Sei arrivato alla destinazione finale con meno di 3 ore di ritardo: per la coincidenza persa la Corte di giustizia guarda l'arrivo finale, e sotto le 3 ore la compensazione non spetta. L'assistenza in aeroporto, se te la dovevano, è un'altra cosa.",
    );
  }

  const blocco = paletti(f, kmViaggio);
  if (blocco) return blocco;
  const km = kmViaggio as number;

  /* Le fasce sull'intero viaggio, con la riduzione del lungo raggio:
     oltre 3.500 km e arrivo fra 3 e 4 ore → 300€ (art. 7.2). */
  /* ⚠️ La riduzione dell'art. 7 par. 2 vale SOLO sulla fascia da 600.
     Prima, su un viaggio tutto dentro l'Unione più lungo di 3.500 km,
     con arrivo fra 3 e 4 ore uscivano 300€: ma lì la fascia giusta è 400
     piena, e dimezzare una fascia già tenuta bassa dalla lettera b)
     vuol dire applicare due volte lo stesso sconto. */
  const importo = fasciaArt7(km, dentroLoSpazioEuropeo(f), r.ritardoFinale === "fra3e4");

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: 0,
    motivo: `Voli sulla stessa prenotazione e arrivo alla destinazione finale con ${r.ritardoFinale === "fra3e4" ? "3-4 ore" : "più di 4 ore"} di ritardo: la compensazione si calcola sull'intero viaggio, ${Math.round(km)} km, fascia ${importo}€. Il reclamo va alla compagnia del volo in ritardo. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}

/* --------------------------------------------- declassamento (art. 10) */

/**
 * DECLASSAMENTO (art. 10 par. 2 CE 261/2004): hai pagato una classe
 * (business, premium) e ti hanno messo in una più bassa senza che tu
 * l'abbia scelto. Non è una compensazione a fasce fisse come il ritardo:
 * è una percentuale del PREZZO del biglietto, e la percentuale segue la
 * stessa geometria dell'art. 7 (30/50/75 al posto di 250/400/600).
 *
 * Il prezzo lo sappiamo solo dall'utente: il fornitore ci dà il volo, non
 * quanto l'hai pagato. Quindi il prezzo è un dato dichiarato, e il motivo
 * lo dice chiaro ("sul prezzo che hai indicato"). La compagnia, quando
 * paga, guarda comunque il prezzo vero del biglietto: se l'utente sbaglia
 * in eccesso, il conto lo corregge lei, non noi.
 *
 * ⚠️ La base è il prezzo del VOLO declassato (art. 10 par. 2 + art. 2
 * lett. f, causa C-255/15 Mennens): non l'intero itinerario, se il
 * declassamento è stato su una tratta sola. Qui chiediamo il prezzo della
 * tratta interessata.
 */
export type RisposteDeclassamento = {
  /** Involontario: se hai accettato tu lo scambio, non spetta. */
  volonta: Volonta;
  /** Il prezzo del biglietto (o della tratta declassata), in euro. */
  prezzo: number;
};

export function rispostaDeclassamentoValida(r: unknown): r is RisposteDeclassamento {
  const x = r as RisposteDeclassamento | null;
  return (
    !!x &&
    (["involontario", "volontario"] as const).includes(x.volonta) &&
    typeof x.prezzo === "number" &&
    Number.isFinite(x.prezzo) &&
    x.prezzo > 0 &&
    x.prezzo <= 100000
  );
}

/**
 * La percentuale del rimborso, art. 10 par. 2:
 * 30% fino a 1.500 km; 50% da 1.500 a 3.500 km e su TUTTE le tratte
 * intracomunitarie oltre 1.500; 75% sul resto del lungo raggio.
 * Stessa identica soglia dell'art. 7, cambia solo il numero.
 */
export function percentualeArt10(km: number, dentroSpazioEuropeo: boolean): 30 | 50 | 75 {
  if (km <= 1500) return 30;
  if (km <= 3500) return 50;
  return dentroSpazioEuropeo ? 50 : 75;
}

export function valutaDeclassamento(f: FattoVolo, r: RisposteDeclassamento): Verdetto {
  if (r.volonta === "volontario") {
    return nonIdoneo(
      "Hai accettato tu il posto in classe più bassa in cambio di qualcosa: in quel caso il rimborso dell'art. 10 non spetta, vale quello che avete concordato al momento.",
    );
  }
  const blocco = paletti(f, f.kmOrtodromica);
  if (blocco) return blocco;
  const km = f.kmOrtodromica as number;
  const perc = percentualeArt10(km, dentroLoSpazioEuropeo(f));
  const importo = Math.round((perc / 100) * r.prezzo);
  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: 0,
    motivo: `Ti hanno messo in una classe più bassa di quella che avevi pagato, senza che tu l'abbia scelto: l'art. 10 par. 2 prevede il rimborso del ${perc}% del prezzo del biglietto, da pagare entro 7 giorni. Su una tratta di ${Math.round(km)} km la percentuale è ${perc}%, e sul prezzo che hai indicato (${r.prezzo}€) fa ${importo}€. La compagnia verifica il prezzo vero del biglietto: è quello che conta.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}

/* ------------------------------ coincidenza persa, verificata a due tratte */

/**
 * COINCIDENZA PERSA, letta sui DUE voli (scelta di Valerio, 14/08:
 * «il motore verifica le due tratte»). È la versione oggettiva della
 * coincidenza: invece di fidarsi della sola dichiarazione, legge il primo
 * volo (in ritardo) e la coincidenza, e prova in modo SEVERO che il ritardo
 * del primo ha fatto perdere il secondo.
 *
 * La prova severa: il primo volo deve essere ATTERRATO (orario effettivo)
 * DOPO che la coincidenza era già PARTITA (orario previsto). Se sulla carta
 * la coincidenza era ancora prendibile, esce incerto: forse l'hai persa per
 * code o controlli, e senza un legame chiaro col ritardo la compagnia lo
 * contesterebbe.
 *
 * ⚠️ QUELLO CHE RESTA DICHIARATO, e non si può leggere: con quanto ritardo
 * sei ARRIVATO alla destinazione finale. Dipende dal volo di riprotezione su
 * cui ti hanno rimesso, che il fornitore non conosce. Lo dici tu a fasce, e
 * la fascia dell'art. 7 si calcola sull'intero viaggio.
 */
export function valutaCoincidenzaDueTratte(
  primo: FattoVolo,
  secondo: FattoVolo,
  r: RisposteCoincidenza,
  kmViaggio: number | null,
): Verdetto {
  if (r.unica === "no") {
    return nonIdoneo(
      "I due voli erano su biglietti separati: per il Regolamento ogni volo va giudicato da solo, e la coincidenza persa fra prenotazioni diverse non dà compensazione. Controlla il primo volo per il suo ritardo: quello resta valutabile.",
    );
  }
  if (r.unica === "nonSo") {
    return incerto(
      "Serve sapere se i voli stavano sulla stessa prenotazione: guarda l'email di conferma, se c'è un solo codice di prenotazione per tutti i voli la risposta è sì. Finché non si sa, il caso resta incerto e non paghi niente.",
    );
  }
  if (r.ritardoFinale === "nonRicordo") {
    return incerto(
      "Manca il dato che decide: con quanto ritardo sei arrivato alla destinazione finale? Sotto le 3 ore la compensazione non spetta, da 3 in su sì. Ritrova l'orario d'arrivo del volo che hai preso davvero e torna a rispondere.",
    );
  }
  if (r.ritardoFinale === "meno3") {
    return nonIdoneo(
      "Sei arrivato alla destinazione finale con meno di 3 ore di ritardo: per la coincidenza persa la Corte di giustizia guarda l'arrivo finale, e sotto le 3 ore la compensazione non spetta.",
    );
  }

  /* Del secondo volo non abbiamo letto niente di usabile (numero sbagliato,
     data sbagliata, o dato non ancora disponibile): non è "non si
     collegano" (quello è quando i due voli esistono ma partono da scali
     diversi), è che quel volo non lo troviamo. Si chiede di ricontrollare,
     e non si vende. */
  const secondoIgnoto =
    secondo.stato === "sconosciuto" ||
    (!secondo.partenzaIata && !secondo.arrivoIata && !secondo.partenzaPrevistoUtc);
  if (secondoIgnoto) {
    return incerto(
      "Non riesco a leggere il volo di coincidenza che mi hai indicato: controlla il numero e la data. Senza quel volo non posso provare che il ritardo del primo te l'ha fatto perdere, e non ti faccio pagare per un forse.",
    );
  }

  /* I due voli devono collegarsi DAVVERO: il primo deve atterrare nello
     stesso scalo da cui parte la coincidenza. Se no, non è la coppia
     giusta e non ci si può ragionare sopra. */
  const scaloComune =
    !!primo.arrivoIata &&
    !!secondo.partenzaIata &&
    primo.arrivoIata.toUpperCase() === secondo.partenzaIata.toUpperCase();
  if (!scaloComune) {
    return incerto(
      "Questi due voli non si collegano: il primo atterra in uno scalo e la coincidenza parte da un altro. Controlla i numeri: il secondo è il volo che dovevi prendere dallo scalo dove arriva il primo.",
    );
  }

  /* LA CAUSA, severa: il primo è atterrato DOPO che la coincidenza era già
     partita? Solo allora il ritardo ha fatto perdere il volo in modo che
     nessuno può contestare. */
  const arrivoPrimo = primo.arrivoEffettivoUtc;
  const partenzaSecondo = secondo.partenzaPrevistoUtc;
  if (!arrivoPrimo || !partenzaSecondo) {
    return incerto(
      "Non ho gli orari certi per confrontare l'arrivo del primo volo con la partenza della coincidenza. Riprova più tardi: questa analisi non consuma il credito.",
    );
  }
  if (Date.parse(arrivoPrimo) <= Date.parse(partenzaSecondo)) {
    return incerto(
      "Dagli orari, il tuo primo volo è atterrato prima che la coincidenza partisse: sulla carta avresti potuto prenderla. Se l'hai persa lo stesso, per code o controlli, può darsi che ti spetti, ma senza un legame chiaro col ritardo la compagnia lo contesterebbe, e non te lo vendiamo come sicuro.",
    );
  }

  const blocco = paletti(primo, kmViaggio);
  if (blocco) return blocco;
  const km = kmViaggio as number;

  /* LA FASCIA SUL VIAGGIO INTERO, non sul primo volo. Il tetto di 400
     dell'art. 7 par. 2 lett. b) cade solo se il viaggio esce DAVVERO dallo
     spazio europeo, e "esce davvero" lo diciamo solo quando la destinazione
     finale è un paese terzo CERTO. Su un dato incerto (o sulla Svizzera) si
     resta a 400, che è la direzione che non fa mai chiedere più del dovuto:
     un falso positivo sull'importo è la cosa che la regola numero uno
     vieta. Passare `dentroLoSpazioEuropeo(primo)` sarebbe stato sbagliato
     due volte: guardava lo scalo di COINCIDENZA invece della destinazione
     finale, quindi teneva a 400 anche un Milano → Francoforte → New York
     (dove spettano 600), e su una destinazione ignota avrebbe potuto aprire
     la fascia da 600 senza esserne certo. */
  const zonaFinale = zonaDiScalo({
    iata: secondo.arrivoIata,
    paese: secondo.arrivoPaese,
    icao: secondo.arrivoIcao,
  });
  const importo = fasciaArt7(km, zonaFinale !== "terzo", r.ritardoFinale === "fra3e4");

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: 0,
    motivo: `Il tuo primo volo è atterrato dopo che la coincidenza era già partita: il ritardo ti ha fatto perdere il secondo volo, su un'unica prenotazione, e alla destinazione finale sei arrivato con ${
      r.ritardoFinale === "fra3e4" ? "3-4 ore" : "più di 4 ore"
    } di ritardo. La compensazione si calcola sull'intero viaggio, ${Math.round(
      km,
    )} km, fascia ${importo}€, e il reclamo va alla compagnia del primo volo. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}
