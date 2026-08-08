/**
 * La prima schermata dell'app: IL CHECK DEL VOLO.
 *
 * Rifatta l'8/08 per Rivoglio (prima era l'onboarding del vecchio prodotto
 * viaggi). Regole del prodotto, identiche al sito:
 * - il check è gratis e NON richiede account: si scrive volo e data e basta;
 * - il verdetto lo dà il motore sul server, mai l'app (lib/api.ts);
 * - niente promesse: "forse ti devono", mai "hai diritto a".
 */
import { useCallback, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import CardAvvisi, { type StatoAvvisi } from "@/components/CardAvvisi";
import CardVolo from "@/components/CardVolo";
import RicercaTratta from "@/components/RicercaTratta";
import ScattaCarta from "@/components/ScattaCarta";
import Titolo from "@/components/Titolo";
import { verificaVolo } from "@/lib/api";
import { conBarre, dataIso, inItaliano, perEsteso } from "@/lib/data";
import { chiediPermesso, registraToken, statoPermesso } from "@/lib/notifiche";
import { useSessione } from "@/lib/sessione";
import { leggiVoli, salvaVolo, togliVolo, type VoloSalvato } from "@/lib/voliSalvati";
import { seguiVoli, smettiDiSeguire } from "@/lib/voliSeguiti";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.check;

export default function SchermataCheck() {
  const router = useRouter();
  const [volo, setVolo] = useState("");
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [salvati, setSalvati] = useState<VoloSalvato[]>([]);
  /* Il modo predefinito è la tratta, non il numero: il numero di volo lo
     sa a memoria una persona su dieci, e chi non ce l'ha se ne va. */
  const [modo, setModo] = useState<"tratta" | "numero">("tratta");
  /* Quello che è stato letto dalla carta d'imbarco, per dirlo in chiaro:
     un campo che si riempie da solo senza spiegazioni mette a disagio. */
  const [daCarta, setDaCarta] = useState<string | null>(null);

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

  /* I voli tornano a ogni ritorno sulla schermata: se ne è stato appena
     controllato uno, la lista lo mostra aggiornato senza riavviare.
     È anche il momento in cui i voli salvati salgono sul server, se
     l'utente è entrato: così chi entra dopo ritrova tutto seguito. */
  useFocusEffect(
    useCallback(() => {
      void leggiVoli().then(async (voli) => {
        setSalvati(voli);
        if (!utente || voli.length === 0) return;

        await seguiVoli(voli);
        const stato = await statoPermesso();
        if (stato === "da_chiedere" && !giaChiesto.current) {
          giaChiesto.current = true;
          const ok = await chiediPermesso();
          setPermesso(ok ? "concesso" : "negato");
          if (ok) await registraToken();
          return;
        }
        setPermesso(stato);
        if (stato === "concesso") await registraToken();
      });
    }, [utente]),
  );

  /** Il bottone della card: riapre il permesso o porta all'accesso. */
  async function attivaAvvisi() {
    const ok = await chiediPermesso();
    setPermesso(ok ? "concesso" : "negato");
    if (!ok) return;
    await registraToken();
    await seguiVoli(salvati);
  }

  /** Il check vero e proprio: lo usa il form e lo usa "ricontrolla". */
  async function chiedi(voloDaControllare: string, iso: string) {
    setErrore(null);
    setInCorso(true);
    const esito = await verificaVolo(voloDaControllare, iso);
    setInCorso(false);

    if (!esito.ok) {
      setErrore(esito.errore);
      return;
    }

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
      controllatoIl: new Date().toISOString(),
      aggiuntoIl: new Date().toISOString(),
    });
    setSalvati(aggiornati);
    // Se è entrato, il volo sale subito fra quelli che il server ricontrolla.
    void seguiVoli(aggiornati);
    // Il verdetto viaggia come parametri: la schermata dopo non richiama l'API.
    router.push({
      pathname: "/verdetto",
      params: {
        volo: voloDaControllare.trim().toUpperCase(),
        data: iso,
        esito: esito.esito,
        motivo: esito.motivo,
        importo: String(esito.importo ?? ""),
        ritardo: String(esito.ritardoMinuti ?? ""),
        da: esito.dato.da ?? "",
        a: esito.dato.a ?? "",
        previsto: esito.dato.previsto ?? "",
        effettivo: esito.dato.effettivo ?? "",
        demo: esito.demo ? "1" : "",
      },
    });
  }

  /**
   * Quello che è stato letto dalla carta d'imbarco finisce nei campi,
   * NON in un check automatico: la persona deve vedere il dato e poterlo
   * correggere. Un verdetto su un volo letto male è peggio di nessun
   * verdetto.
   */
  function dallaCarta(voloLetto: string | null, dataLetta: string | null) {
    setErrore(null);
    setModo("numero");
    if (voloLetto) setVolo(voloLetto);
    if (dataLetta) setData(inItaliano(dataLetta));

    const giorno = dataLetta ? perEsteso(dataLetta) : "";
    if (voloLetto && dataLetta) {
      setDaCarta(TESTI.carta.letto.replace("{volo}", voloLetto).replace("{data}", giorno));
    } else if (voloLetto) {
      setDaCarta(TESTI.carta.lettoSoloVolo.replace("{volo}", voloLetto));
    } else {
      setDaCarta(TESTI.carta.lettoSoloData.replace("{data}", giorno));
    }
  }

  /** Il bottone del form: valida quello che è stato scritto, poi chiede. */
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

  return (
    <KeyboardAvoidingView
      style={stili.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={stili.contenuto}
        keyboardShouldPersistTaps="handled"
      >
        {/* ------------------------------------------------ il marchio */}
        <View style={stili.marchio}>
          <Image
            source={require("../../../assets/images/marchio.png")}
            style={stili.segno}
            accessibilityLabel="Rivoglio"
          />
          <Text style={stili.nomeMarchio}>
            Rivo<Text style={stili.nomeVerde}>glio</Text>
          </Text>
        </View>

        <View style={stili.occhiello}>
          <View style={stili.pallino} />
          <Text style={stili.occhielloTesto}>{T.occhiello}</Text>
        </View>

        <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} centro />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        {/* ------------------------------------------------ il form */}
        <View style={stili.scheda}>
          {/* La strada più corta di tutte, quando la carta d'imbarco c'è. */}
          <ScattaCarta onLetto={dallaCarta} />

          {/* I due modi di dire qual è il volo: la tratta per tutti,
              il numero per chi ce l'ha davanti. */}
          <View style={stili.modi}>
            {(["tratta", "numero"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  setModo(m);
                  setErrore(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: modo === m }}
                style={[stili.modo, modo === m && stili.modoAttivo]}
              >
                <Text style={[stili.modoTesto, modo === m && stili.modoTestoAttivo]}>
                  {T.modo[m]}
                </Text>
              </Pressable>
            ))}
          </View>

          {modo === "tratta" ? (
            <>
              <RicercaTratta
                occupato={inCorso}
                onScegli={(v, iso) => void chiedi(v, iso)}
              />
              {errore && (
                <Text style={stili.errore} accessibilityRole="alert">
                  {errore}
                </Text>
              )}
            </>
          ) : (
            <>
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
          <Text style={stili.aiuto}>{T.volo.aiuto}</Text>

          <View style={stili.spazio} />

          <Campo
            etichetta={T.data.etichetta}
            valore={data}
            onChange={(t) => setData(conBarre(t))}
            segnaposto={T.data.segnaposto}
            tipo="numero"
          />
          <Text style={stili.aiuto}>{T.data.aiuto}</Text>

          {errore && (
            <Text style={stili.errore} accessibilityRole="alert">
              {errore}
            </Text>
          )}

          <View style={stili.spazio} />
          <Bottone
            testo={T.bottone}
            onPress={controlla}
            caricamento={inCorso}
            icona="arrow-right"
          />
            </>
          )}
          <Text style={stili.rassicurazione}>{T.rassicurazione}</Text>
        </View>

        {/* ------------------------------------------------ i tuoi voli */}
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

        {/* ------------------------------------------------ la fiducia */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.l,
    paddingBottom: 116,
  },
  /* La testata sta AL CENTRO (richiesta di Valerio, 8/08): marchio,
     occhiello, titolo e sottotitolo sono un blocco simmetrico, non
     appoggiato a sinistra. */
  marchio: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPAZIO.s,
  },
  segno: { width: 30, height: 30 },
  nomeMarchio: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  nomeVerde: { color: COLORI.verde },
  occhiello: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    alignSelf: "center",
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 7,
    marginTop: SPAZIO.xl,
    borderWidth: 1,
    borderColor: COLORI.bordo,
  },
  pallino: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORI.verde },
  occhielloTesto: { fontFamily: FONT.testoMedio, fontSize: 12.5, color: COLORI.inchiostro },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 15,
    lineHeight: 22,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: 320,
  },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  modi: {
    flexDirection: "row",
    gap: SPAZIO.xs,
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.xs,
    marginBottom: SPAZIO.l,
  },
  modo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RAGGIO.campo - 3,
    paddingVertical: SPAZIO.s + 2,
    minHeight: 40,
  },
  modoAttivo: { backgroundColor: COLORI.bianco, ...OMBRA.scheda },
  modoTesto: { fontFamily: FONT.testoMedio, fontSize: 13.5, color: COLORI.fumo },
  modoTestoAttivo: { color: COLORI.inchiostro },
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
  aiuto: {
    fontFamily: FONT.testo,
    fontSize: 12,
    color: COLORI.fumo2,
    marginTop: SPAZIO.xs + 2,
  },
  spazio: { height: SPAZIO.l },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },
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
