/**
 * La prima schermata dell'app: IL CHECK DEL VOLO.
 *
 * Ridisegnata il 10/08 sulla tavola di riferimento (6a, 7a, 7b):
 * - TRE modi di dire qual è il volo, nel selettore in fondo: la tratta
 *   (predefinito: il numero di volo lo sa a memoria una persona su
 *   dieci), la carta d'imbarco fotografata, il numero per chi ce l'ha;
 * - la testata cambia col modo: ogni strada ha la sua domanda;
 * - nella tratta si SCEGLIE il volo dall'elenco e si conferma col
 *   bottone in fondo, come nella tavola.
 *
 * Regole del prodotto, identiche al sito:
 * - il check NON richiede account (che si paghi o no: lo decide il
 *   server, e l'app lo scopre dal muro);
 * - il verdetto lo dà il motore sul server, mai l'app (lib/api.ts);
 * - niente promesse: "forse ti devono", mai "hai diritto a".
 */
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { CHIAVE_PERMESSI_RIMANDATO } from "@/app/permessi";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import CardAvvisi, { type StatoAvvisi } from "@/components/CardAvvisi";
import CardVolo from "@/components/CardVolo";
import RicercaTratta from "@/components/RicercaTratta";
import ScattaCarta from "@/components/ScattaCarta";
import ScenaScan from "@/components/ScenaScan";
import { VeloVerde } from "@/components/ScenaVerdetto";
import { verificaVolo, type MuroCheckDati } from "@/lib/api";
import MuroCheck from "@/components/MuroCheck";
import { conBarre, dataIso, inItaliano, perEsteso } from "@/lib/data";
import { dataBreve, durataLunga } from "@/lib/formati";
import { chiediPermesso, registraToken, statoPermesso } from "@/lib/notifiche";
import { useSessione } from "@/lib/sessione";
import { leggiVoli, salvaVolo, togliVolo, type VoloSalvato } from "@/lib/voliSalvati";
import { seguiVoli, smettiDiSeguire } from "@/lib/voliSeguiti";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { scenaDa } from "@/lib/anteprima";
import { TESTI } from "@/lib/testi";

const T = TESTI.check;
const MODI = ["tratta", "carta", "numero"] as const;
type Modo = (typeof MODI)[number];

const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* L'aria sotto il contenuto, perché la barra delle tab è una pillola che
   galleggia sopra la pagina: senza, su uno schermo corto copre il
   bottone che fa partire il check. Lo stesso numero delle altre tab. */
const ARIA_BARRA = 116;

/* L'analisi profonda, identica al sito (scelta di Valerio, 8/08): un passo
   ogni 2,4 secondi e la sequenza non si taglia MAI, nemmeno se il server
   risponde subito. */
const PASSO_MS = 2400;
const PAUSA_FINALE_MS = 900;
const PASSI_TOTALI = TESTI.analisi.passi.length;

/* ── I momenti della lavagna ──────────────────────────────────────────
   La lavagna del sito (/anteprima-app) apre questa schermata già su un
   momento preciso, per farlo vedere senza doverci arrivare cliccando.
   Nell'app vera questi valori non entrano mai in gioco: il parametro
   `scena` non esiste in nessuna navigazione dell'app.

   Gli errori si riconoscono dalle parole (vedi il riquadro rosso più
   sotto): qui si usano le stesse frasi vere del server, non frasi
   inventate per l'occasione. */
const ERRORE_DI_SCENA: Record<string, string> = {
  "errore-volo": "Questo volo non risulta negli archivi per la data indicata.",
  "errore-rete": "Sembri offline: il check ha bisogno della rete.",
  "errore-generico": "Qualcosa non ha funzionato. Riprova fra poco.",
};

/** Il volo dimostrativo della scena di analisi: ZZ non è di nessuno. */
const SCENA_ANALISI = {
  volo: { volo: "ZZ250", data: "2026-03-12" },
  letto: {
    tratta: "Bergamo → Lanzarote",
    previsto: "08:40",
    effettivo: "12:00",
    ritardo: "3 h e 20 min",
    km: 2980,
  },
};

/** "2026-08-06T14:55:00Z" → "14:55" (ora di Greenwich, come sul sito). */
function oraDa(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export default function SchermataCheck() {
  const router = useRouter();
  /* La Home può aprire il Check già sul modo giusto ("Scansiona la
     carta d'imbarco" deve atterrare sulla fotocamera, non su un'altra
     schermata da cui ricliccare). */
  const parametri = useLocalSearchParams<{ modo?: string; scena?: string }>();
  /* La lavagna del sito apre il check già sul momento da mostrare (un
     errore, la scena dell'analisi). Nell'app vera è sempre vuoto. */
  const momento = scenaDa(parametri.scena);
  const [volo, setVolo] = useState("");
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(() => ERRORE_DI_SCENA[momento] ?? null);
  /* Il muro del check a pagamento: lo accende il 402 del server, mai
     una decisione presa qui dentro. */
  const [muro, setMuro] = useState<MuroCheckDati | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [salvati, setSalvati] = useState<VoloSalvato[]>([]);
  const [modo, setModo] = useState<Modo>("tratta");
  /* Il volo scelto dall'elenco della tratta: il bottone in fondo lo
     conferma, come nella tavola. */
  const [scelta, setScelta] = useState<{ volo: string; iso: string } | null>(null);
  /* Quello che è stato letto dalla carta d'imbarco. Se la lettura è
     completa compare la carta di conferma (7a); se è a metà si passa al
     modo numero coi campi già scritti e la riga che dice cosa manca. */
  const [lettura, setLettura] = useState<{ volo: string; iso: string } | null>(null);
  const [daCarta, setDaCarta] = useState<string | null>(null);

  /* IL TEATRO: durante l'analisi la scheda diventa la scena di scansione,
     come sul sito. `passo` avanza col tempo vero della sequenza, `letto`
     si riempie SOLO coi dati che il server ha davvero dato. */
  const [fase, setFase] = useState<"campo" | "teatro">(() =>
    momento === "analisi" ? "teatro" : "campo",
  );
  const [passo, setPasso] = useState(() => (momento === "analisi" ? 3 : 0));
  const [inAnalisi, setInAnalisi] = useState(() =>
    momento === "analisi" ? SCENA_ANALISI.volo : { volo: "", data: "" },
  );
  const [letto, setLetto] = useState<{
    tratta: string | null;
    previsto: string | null;
    effettivo: string | null;
    ritardo: string | null;
    km: number | null;
  }>(() =>
    momento === "analisi"
      ? SCENA_ANALISI.letto
      : { tratta: null, previsto: null, effettivo: null, ritardo: null, km: null },
  );
  /* Vera finché sequenza e richiesta non sono chiuse: tiene il sipario
     giù anche se il focus va e torna (cambio tab a metà analisi). */
  const analisiViva = useRef(false);

  /* Gli avvisi: chi non è entrato non può essere avvisato (il server deve
     sapere di chi è il volo), quindi lo stato si deduce, non si tiene. */
  const { utente } = useSessione();
  const [permesso, setPermesso] = useState<"da_chiedere" | "concesso" | "negato">("da_chiedere");
  const avvisi: StatoAvvisi = !utente
    ? "ospite"
    : permesso === "concesso"
      ? "attivi"
      : permesso === "negato"
        ? "negato"
        : "da_attivare";

  /* Il permesso si chiede UNA volta, al primo volo salvato (scelta di
     Valerio): chiederlo all'avvio, a freddo, se lo prende un "no". */
  const giaChiesto = useRef(false);

  useFocusEffect(
    useCallback(() => {
      /* Se si torna qui dal verdetto, il sipario della scena è ancora
         giù: si riapre adesso, a schermata coperta ormai alle spalle.
         Ma se l'analisi sta ANCORA girando (cambio tab a metà), resta
         tutto in scena: al termine arriverà il verdetto da sola. */
      if (!analisiViva.current && momento !== "analisi") {
        setFase("campo");
        setInCorso(false);
        setPasso(0);
      }
      const chiesto = parametri.modo;
      if (chiesto === "tratta" || chiesto === "carta" || chiesto === "numero") {
        setModo(chiesto);
      }
      void leggiVoli().then(async (voli) => {
        setSalvati(voli);
        if (!utente || voli.length === 0) return;

        await seguiVoli(voli);
        const stato = await statoPermesso();
        if (stato === "da_chiedere" && !giaChiesto.current) {
          giaChiesto.current = true;
          /* La finestra di sistema NON parte più a freddo: prima la
             schermata cuscinetto (tavola 4g), che spiega quando e
             perché scriveremo. Chi ha già scelto l'email non viene
             riportato lì a ogni giro. */
          const rimandato = await AsyncStorage.getItem(CHIAVE_PERMESSI_RIMANDATO);
          if (!rimandato) router.push("/permessi");
          return;
        }
        setPermesso(stato);
        if (stato === "concesso") await registraToken();
      });
    }, [utente, parametri.modo, momento, router]),
  );

  /** Il bottone della card: riapre il permesso o porta all'accesso. */
  async function attivaAvvisi() {
    const ok = await chiediPermesso();
    setPermesso(ok ? "concesso" : "negato");
    if (!ok) return;
    await registraToken();
    await seguiVoli(salvati);
  }

  /** Il check vero e proprio: lo usano i tre modi e "ricontrolla". */
  async function chiedi(voloDaControllare: string, iso: string) {
    if (analisiViva.current) return;
    analisiViva.current = true;
    setErrore(null);
    setInCorso(true);
    Keyboard.dismiss();

    /* Su va il sipario: la scena di scansione, identica al sito. La
       sequenza dei passi corre col suo tempo e non si taglia mai; la
       richiesta vera corre in parallelo. */
    setInAnalisi({ volo: voloDaControllare.trim().toUpperCase(), data: iso });
    setLetto({ tratta: null, previsto: null, effettivo: null, ritardo: null, km: null });
    setPasso(0);
    setFase("teatro");

    const sequenza = (async () => {
      for (let i = 1; i <= PASSI_TOTALI; i++) {
        await attesa(PASSO_MS);
        setPasso(i);
      }
      await attesa(PAUSA_FINALE_MS);
    })();

    const esito = await verificaVolo(voloDaControllare, iso);

    if (!esito.ok) {
      /* Un errore chiude la scena: si torna al campo, col motivo detto.
         Il muro invece non è un errore: è una schermata. */
      analisiViva.current = false;
      setFase("campo");
      setInCorso(false);
      if (esito.muro) {
        setMuro(esito.muro);
        return;
      }
      setErrore(esito.errore);
      return;
    }

    /* I dati veri del server compilano il biglietto, al passo giusto. */
    setLetto({
      tratta: esito.dato.da && esito.dato.a ? `${esito.dato.da} → ${esito.dato.a}` : null,
      previsto: oraDa(esito.dato.previsto),
      effettivo: oraDa(esito.dato.effettivo),
      ritardo:
        typeof esito.ritardoMinuti === "number" && esito.ritardoMinuti > 0
          ? durataLunga(esito.ritardoMinuti)
          : null,
      km: esito.dato.km ?? null,
    });

    /* Il volo si salva da solo, con l'esito che ha dato il motore: è
       quello che rende l'app diversa dal sito, e la base delle notifiche.
       L'esito è copiato, mai ricalcolato qui. */
    const aggiornati = await salvaVolo({
      volo: voloDaControllare.trim().toUpperCase(),
      data: iso,
      da: esito.dato.da,
      a: esito.dato.a,
      esito: esito.esito,
      motivo: esito.motivo,
      importo: esito.importo,
      ritardoMinuti: esito.ritardoMinuti,
      previsto: esito.dato.previsto,
      effettivo: esito.dato.effettivo,
      controllatoIl: new Date().toISOString(),
      aggiuntoIl: new Date().toISOString(),
    });
    setSalvati(aggiornati);
    // Se è entrato, il volo sale subito fra quelli che il server ricontrolla.
    void seguiVoli(aggiornati);

    /* La scena finisce il suo giro anche se il server ha già risposto:
       l'analisi profonda non si taglia. Il sipario NON si riapre qui:
       durante la transizione la schermata resta visibile sotto il
       verdetto, e un form che riappare a metà scivolata sarebbe un
       lampo brutto. Si riapre al ritorno del focus (useFocusEffect). */
    await sequenza;
    analisiViva.current = false;

    // Il verdetto viaggia come parametri: la schermata dopo non richiama l'API.
    router.push({
      pathname: "/verdetto",
      params: {
        volo: voloDaControllare.trim().toUpperCase(),
        data: iso,
        /* Serve alle domande dei casi che gli archivi non vedono: le
           risposte vanno scritte sulla verifica giusta, non su una nuova. */
        id: esito.id ?? "",
        esito: esito.esito,
        motivo: esito.motivo,
        importo: String(esito.importo ?? ""),
        ritardo: String(esito.ritardoMinuti ?? ""),
        da: esito.dato.da ?? "",
        a: esito.dato.a ?? "",
        previsto: esito.dato.previsto ?? "",
        effettivo: esito.dato.effettivo ?? "",
        /* Serve al chip della tratta sul verdetto: la distanza è il dato
           che spiega PERCHÉ sei in quella fascia, e senza il chip resta
           un numero calato dall'alto. */
        km: String(esito.dato.km ?? ""),
        demo: esito.demo ? "1" : "",
      },
    });
  }

  /**
   * Quello che è stato letto dalla carta d'imbarco. Lettura completa =
   * carta di conferma (7a): la persona DEVE vedere i campi prima che
   * parta il check. Lettura a metà = modo numero coi campi già scritti.
   * Un verdetto su un volo letto male è peggio di nessun verdetto.
   */
  function dallaCarta(voloLetto: string | null, dataLetta: string | null) {
    setErrore(null);
    if (voloLetto && dataLetta) {
      setLettura({ volo: voloLetto, iso: dataLetta });
      return;
    }
    setModo("numero");
    if (voloLetto) setVolo(voloLetto);
    if (dataLetta) setData(inItaliano(dataLetta));
    const giorno = dataLetta ? perEsteso(dataLetta) : "";
    setDaCarta(
      voloLetto
        ? TESTI.carta.lettoSoloVolo.replace("{volo}", voloLetto)
        : TESTI.carta.lettoSoloData.replace("{data}", giorno),
    );
  }

  /** "Correggo a mano": i campi letti passano al modo numero, editabili. */
  function correggiAMano() {
    if (!lettura) return;
    setVolo(lettura.volo);
    setData(inItaliano(lettura.iso));
    setDaCarta(
      TESTI.carta.letto
        .replace("{volo}", lettura.volo)
        .replace("{data}", perEsteso(lettura.iso)),
    );
    setLettura(null);
    setModo("numero");
  }

  /** Il bottone del modo numero: valida quello che è stato scritto. */
  async function controlla() {
    if (!volo.trim()) {
      setErrore(T.errori.voloMancante);
      return;
    }
    if (!data.trim()) {
      setErrore(T.errori.dataMancante);
      return;
    }
    const iso = dataIso(data);
    if (!iso) {
      setErrore(T.errori.dataStrana);
      return;
    }
    await chiedi(volo, iso);
  }

  /** Il bottone del modo tratta: conferma il volo scelto dall'elenco. */
  async function controllaScelto() {
    if (!scelta) {
      setErrore(T.errori.voloDaScegliere);
      return;
    }
    await chiedi(scelta.volo, scelta.iso);
  }

  const testata = T.testate[modo];

  /* IL MURO prende tutta la schermata: non è un avviso in mezzo a un
     modulo, è il momento in cui si decide se pagare. */
  if (muro) return <MuroCheck dati={muro} onAnnulla={() => setMuro(null)} />;

  return (
    <KeyboardAvoidingView
      style={stili.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={stili.contenuto}
        keyboardShouldPersistTaps="handled"
      >
        <VeloVerde />

        {fase === "teatro" ? (
          /* La scena prende TUTTO lo schermo, verde notte come nella
             tavola: i margini negativi scavalcano il padding della
             pagina, il biglietto si compila coi dati veri. */
          <View style={stili.scenaPiena}>
            <ScenaScan
              volo={inAnalisi.volo}
              dataTesto={dataBreve(inAnalisi.data)}
              passo={passo}
              tratta={letto.tratta}
              arrivoPrevisto={letto.previsto}
              arrivoEffettivo={letto.effettivo}
              ritardo={letto.ritardo}
              km={letto.km}
            />
          </View>
        ) : (
          <>
            {/* -------------------------------------------- la testata */}
            <Text style={stili.occhiello}>{testata.occhiello}</Text>
            <Text style={stili.titolo}>{testata.titolo}</Text>
            <Text style={stili.sottotitolo}>{testata.sottotitolo}</Text>

            {/* ------------------------------------------- il contenuto */}
            {/* GLI ERRORI DEDICATI (4b, 4c): un volo che non si trova e
                la rete assente non sono la stessa cosa, e nessuno dei
                due è una riga rossa qualsiasi. */}
            {errore && (
              <View style={stili.erroreCard}>
                {errore.toLowerCase().includes("offline") ||
                errore.toLowerCase().includes("connession") ? (
                  <>
                    <Text style={stili.erroreTitolo}>{TESTI.erroriCheck.offline.titolo}</Text>
                    <Text style={stili.erroreTesto}>{TESTI.erroriCheck.offline.testo}</Text>
                  </>
                ) : errore.toLowerCase().includes("non risulta") ||
                  errore.toLowerCase().includes("ricontrolla") ||
                  errore.toLowerCase().includes("carta d'imbarco") ? (
                  <>
                    <Text style={stili.erroreTitolo}>{TESTI.erroriCheck.nonTrovato.titolo}</Text>
                    <Text style={stili.erroreTesto}>{TESTI.erroriCheck.nonTrovato.testo}</Text>
                    {TESTI.erroriCheck.nonTrovato.controlli.map((c, i) => (
                      <View key={c} style={stili.erroreRiga}>
                        <Text style={stili.erroreNumero}>{i + 1}</Text>
                        <Text style={stili.erroreRigaTesto}>{c}</Text>
                      </View>
                    ))}
                    <Text style={stili.erroreCta}>{TESTI.erroriCheck.nonTrovato.cta}</Text>
                  </>
                ) : (
                  <Text style={stili.erroreTesto}>{errore}</Text>
                )}
              </View>
            )}

            {modo === "tratta" && (
              <View style={stili.blocco}>
                <RicercaTratta occupato={inCorso} onSeleziona={setScelta} />
              </View>
            )}

            {modo === "carta" && (
              <View style={stili.blocco}>
                {lettura ? (
                  /* --------------------------- la conferma dei campi (7a) */
                  <View style={stili.conferma}>
                    <View style={stili.confermaBollo}>
                      <View style={stili.confermaPunto} />
                      <Text style={stili.confermaBolloTesto}>{TESTI.carta.conferma.bollo}</Text>
                    </View>
                    <Text style={stili.confermaDomanda}>{TESTI.carta.conferma.domanda}</Text>

                    <View style={stili.confermaRighe}>
                      <View style={stili.confermaRiga}>
                        <Text style={stili.confermaEtichetta}>{TESTI.carta.conferma.volo}</Text>
                        <Text style={stili.confermaValore}>{lettura.volo}</Text>
                      </View>
                      <View style={[stili.confermaRiga, stili.confermaRigaUltima]}>
                        <Text style={stili.confermaEtichetta}>{TESTI.carta.conferma.data}</Text>
                        <Text style={stili.confermaValore}>{perEsteso(lettura.iso)}</Text>
                      </View>
                    </View>

                    <Text style={stili.confermaPrivacy}>{TESTI.carta.conferma.privacy}</Text>

                    <View style={stili.confermaAzioni}>
                      <Bottone
                        testo={TESTI.carta.conferma.si}
                        onPress={() => void chiedi(lettura.volo, lettura.iso)}
                        caricamento={inCorso}
                      />
                      <Pressable
                        onPress={correggiAMano}
                        accessibilityRole="button"
                        style={stili.confermaCorreggo}
                      >
                        <Text style={stili.confermaCorreggoTesto}>
                          {TESTI.carta.conferma.correggo}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <ScattaCarta onLetto={dallaCarta} />
                )}
                {errore && (
                  <Text style={stili.errore} accessibilityRole="alert">
                    {errore}
                  </Text>
                )}
              </View>
            )}

            {modo === "numero" && (
              <View style={stili.blocco}>
                <View style={stili.scheda}>
                  {daCarta && (
                    <View style={stili.daCarta}>
                      <Feather name="check-circle" size={15} color={COLORI.verdeScuro} />
                      <Text style={stili.daCartaTesto}>{daCarta}</Text>
                    </View>
                  )}

                  <Campo
                    etichetta={T.volo.etichetta}
                    valore={volo}
                    onChange={(t) => setVolo(t.toUpperCase())}
                    segnaposto={T.volo.segnaposto}
                  />

                  <View style={stili.spazio} />

                  <Campo
                    etichetta={T.data.etichetta}
                    valore={data}
                    onChange={(t) => setData(conBarre(t))}
                    segnaposto={T.data.segnaposto}
                    tipo="numero"
                  />

                  {errore && (
                    <Text style={stili.errore} accessibilityRole="alert">
                      {errore}
                    </Text>
                  )}
                </View>

                {/* Il riquadro che evita l'errore più comune (7b): il
                    codice di prenotazione non è il numero del volo. */}
                <View style={stili.prenota}>
                  <Text style={stili.prenotaTitolo}>{T.prenotazione.titolo}</Text>
                  <View style={stili.prenotaRiga}>
                    <View style={[stili.prenotaChip, stili.prenotaChipSi]}>
                      <Text style={[stili.prenotaCodice, stili.prenotaCodiceSi]}>
                        {T.prenotazione.serve.codice}
                      </Text>
                    </View>
                    <View style={stili.prenotaTesti}>
                      <Text style={stili.prenotaTag}>{T.prenotazione.serve.tag}</Text>
                      <Text style={stili.prenotaTesto}>{T.prenotazione.serve.testo}</Text>
                    </View>
                  </View>
                  <View style={stili.prenotaRiga}>
                    <View style={stili.prenotaChip}>
                      <Text style={stili.prenotaCodice}>{T.prenotazione.non.codice}</Text>
                    </View>
                    <View style={stili.prenotaTesti}>
                      <Text style={[stili.prenotaTag, stili.prenotaTagNo]}>
                        {T.prenotazione.non.tag}
                      </Text>
                      <Text style={stili.prenotaTesto}>{T.prenotazione.non.testo}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ------------------------- il selettore dei modi e il via */}
            <View style={stili.modi}>
              {MODI.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => {
                    setModo(m);
                    setErrore(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: modo === m }}
                  style={[stili.modoVoce, modo === m && stili.modoAttivo]}
                >
                  <Text
                    numberOfLines={1}
                    style={[stili.modoTesto, modo === m && stili.modoTestoAttivo]}
                  >
                    {T.modo[m]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {modo === "tratta" && (
              <View style={stili.via}>
                <Bottone
                  testo={T.bottoneTratta}
                  onPress={() => void controllaScelto()}
                  caricamento={inCorso}
                  disabilitato={!scelta}
                />
              </View>
            )}
            {modo === "numero" && (
              <View style={stili.via}>
                <Bottone
                  testo={T.bottoneNumero}
                  onPress={() => void controlla()}
                  caricamento={inCorso}
                  icona="arrow-right"
                />
              </View>
            )}

            <Text style={stili.rassicurazione}>{T.rassicurazione}</Text>

            {/* ---------------------------------------------- i tuoi voli */}
            {salvati.length > 0 && (
              <View style={stili.voli}>
                <Text style={stili.voliTitolo}>{TESTI.mieiVoli.titolo}</Text>
                <Text style={stili.voliSotto}>{TESTI.mieiVoli.sottotitolo}</Text>
                <View style={stili.voliElenco}>
                  {salvati.map((v) => (
                    <CardVolo
                      key={`${v.volo}-${v.data}`}
                      volo={v}
                      onApri={() => void chiedi(v.volo, v.data)}
                      onTogli={() => {
                        void togliVolo(v.volo, v.data).then(setSalvati);
                        void smettiDiSeguire(v.volo, v.data);
                      }}
                    />
                  ))}
                </View>

                <CardAvvisi
                  stato={avvisi}
                  onEntra={() => router.push("/accesso")}
                  onAttiva={() => void attivaAvvisi()}
                />
              </View>
            )}

            {/* ---------------------------------------------- la fiducia */}
            <View style={stili.punti}>
              {T.punti.map((p) => (
                <View key={p} style={stili.punto}>
                  <Feather name="check-circle" size={15} color={COLORI.verde} />
                  <Text style={stili.puntoTesto}>{p}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.push("/accesso")}
              accessibilityRole="link"
              style={stili.entra}
            >
              <Text style={stili.entraTesto}>{T.entra}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.l,
    paddingBottom: ARIA_BARRA,
  },
  /* La testata sta a SINISTRA, come nella tavola: l'occhiello in
     maiuscolo largo, la domanda grande, la riga di aiuto. */
  occhiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 11.5,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: COLORI.verdeScuro,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -1,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 15,
    lineHeight: 22,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
    maxWidth: 340,
  },
  blocco: { marginTop: SPAZIO.xl },
  erroreCard: {
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: "rgba(194,65,12,0.35)",
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
  },
  erroreTitolo: { fontFamily: FONT.testoSemi, fontSize: 16, color: COLORI.inchiostro },
  erroreTesto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  erroreRiga: { flexDirection: "row", gap: SPAZIO.m, marginTop: SPAZIO.m },
  erroreNumero: {
    fontFamily: FONT.testoSemi,
    fontSize: 12,
    color: COLORI.verdeScuro,
    backgroundColor: COLORI.mentaTenue,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: "center",
    lineHeight: 22,
    overflow: "hidden",
  },
  erroreRigaTesto: {
    flex: 1,
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.inchiostro,
  },
  erroreCta: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.m,
  },
  /* La scena scavalca il padding della pagina: schermo intero, come
     nella tavola. Il velo verde resta sotto e non si vede. */
  scenaPiena: {
    marginHorizontal: -SPAZIO.schermata,
    marginTop: -(SPAZIO.xxl + SPAZIO.l),
    marginBottom: -116,
  },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  spazio: { height: SPAZIO.l },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },

  /* Il riquadro della prenotazione (7b). */
  prenota: {
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.interno,
    padding: SPAZIO.l,
    marginTop: SPAZIO.m,
    gap: SPAZIO.m,
  },
  prenotaTitolo: { fontFamily: FONT.testoSemi, fontSize: 13.5, color: COLORI.inchiostro },
  prenotaRiga: { flexDirection: "row", gap: SPAZIO.m, alignItems: "flex-start" },
  prenotaChip: {
    borderWidth: 1,
    borderColor: COLORI.bordo,
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.minimo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 7,
    minWidth: 92,
    alignItems: "center",
  },
  prenotaChipSi: { borderColor: COLORI.verde, backgroundColor: COLORI.mentaTenue },
  prenotaCodice: {
    fontFamily: FONT.display,
    fontSize: 14,
    letterSpacing: 0.6,
    color: COLORI.fumo,
  },
  prenotaCodiceSi: { color: COLORI.verdeScuro },
  prenotaTesti: { flex: 1 },
  prenotaTag: { fontFamily: FONT.testoSemi, fontSize: 12, color: COLORI.verdeScuro },
  prenotaTagNo: { color: COLORI.fumo2 },
  prenotaTesto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: 1,
  },

  /* La carta di conferma della lettura (7a). */
  conferma: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  confermaBollo: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 6,
  },
  confermaPunto: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORI.verde },
  confermaBolloTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 11.5,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: COLORI.verdeScuro,
  },
  confermaDomanda: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.l,
  },
  confermaRighe: {
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.interno,
    marginTop: SPAZIO.l,
  },
  confermaRiga: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORI.bordo,
  },
  confermaRigaUltima: { borderBottomWidth: 0 },
  confermaEtichetta: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo },
  confermaValore: { fontFamily: FONT.testoSemi, fontSize: 15, color: COLORI.inchiostro },
  confermaPrivacy: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
  },
  confermaAzioni: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  confermaCorreggo: { alignSelf: "center", padding: SPAZIO.s },
  confermaCorreggoTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },

  daCarta: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPAZIO.s,
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginBottom: SPAZIO.l,
  },
  daCartaTesto: {
    flex: 1,
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.verdeNotte,
  },

  /* Il selettore dei tre modi, in fondo come nella tavola. */
  modi: {
    flexDirection: "row",
    gap: SPAZIO.xs,
    backgroundColor: COLORI.nebbia2,
    borderRadius: RAGGIO.pillola,
    padding: SPAZIO.xs,
    marginTop: SPAZIO.xl,
  },
  modoVoce: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RAGGIO.pillola,
    paddingVertical: SPAZIO.s + 2,
    paddingHorizontal: SPAZIO.xs,
    minHeight: 40,
  },
  modoAttivo: { backgroundColor: COLORI.bianco, ...OMBRA.scheda },
  modoTesto: { fontFamily: FONT.testoMedio, fontSize: 12, color: COLORI.fumo },
  modoTestoAttivo: { color: COLORI.inchiostro },
  via: { marginTop: SPAZIO.m },
  rassicurazione: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo,
    textAlign: "center",
    marginTop: SPAZIO.m,
  },

  voli: { marginTop: SPAZIO.xxl },
  voliTitolo: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  voliSotto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  voliElenco: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  punti: { marginTop: SPAZIO.xl, gap: SPAZIO.m },
  punto: { flexDirection: "row", alignItems: "center", gap: SPAZIO.s },
  puntoTesto: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.inchiostro, flex: 1 },
  entra: { marginTop: SPAZIO.xxl, alignSelf: "center", padding: SPAZIO.s },
  entraTesto: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.verdeScuro },
});
