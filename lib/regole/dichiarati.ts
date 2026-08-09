import { VERSIONE_REGOLE, type FattoVolo, type Verdetto } from "./eu261";

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

/** Le fasce dell'art. 7: decide la distanza. */
function fascia(km: number): 250 | 400 | 600 {
  if (km <= 1500) return 250;
  if (km <= 3500) return 400;
  return 600;
}

/** I paletti comuni ai casi che spettano: sciopero, codeshare, distanza. */
function paletti(f: FattoVolo, km: number | null): Verdetto | null {
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
      "In base alle tue risposte la compensazione spetterebbe, ma non conosciamo la distanza che decide l'importo. Riprova più tardi: il controllo resta gratuito.",
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
  const importo = fascia(km);

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
  const importo =
    km <= 1500
      ? (250 as const)
      : km <= 3500
        ? (400 as const)
        : r.ritardoFinale === "fra3e4"
          ? (300 as const)
          : (600 as const);

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: 0,
    motivo: `Voli sulla stessa prenotazione e arrivo alla destinazione finale con ${r.ritardoFinale === "fra3e4" ? "3-4 ore" : "più di 4 ore"} di ritardo: la compensazione si calcola sull'intero viaggio, ${Math.round(km)} km, fascia ${importo}€. Il reclamo va alla compagnia del volo in ritardo. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}
