/**
 * La prima schermata dell'app: IL CHECK DEL VOLO.
 *
 * Rifatta l'8/08 per Rivoglio (prima era l'onboarding del vecchio prodotto
 * viaggi). Regole del prodotto, identiche al sito:
 * - il check è gratis e NON richiede account: si scrive volo e data e basta;
 * - il verdetto lo dà il motore sul server, mai l'app (lib/api.ts);
 * - niente promesse: "forse ti devono", mai "hai diritto a".
 */
import { useCallback, useState } from "react";
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
import CardVolo from "@/components/CardVolo";
import Titolo from "@/components/Titolo";
import { verificaVolo } from "@/lib/api";
import { conBarre, dataIso } from "@/lib/data";
import { leggiVoli, salvaVolo, togliVolo, type VoloSalvato } from "@/lib/voliSalvati";
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

  /* I voli tornano a ogni ritorno sulla schermata: se ne è stato appena
     controllato uno, la lista lo mostra aggiornato senza riavviare. */
  useFocusEffect(
    useCallback(() => {
      void leggiVoli().then(setSalvati);
    }, []),
  );

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

        <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        {/* ------------------------------------------------ il form */}
        <View style={stili.scheda}>
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
                  onTogli={() => void togliVolo(v.volo, v.data).then(setSalvati)}
                />
              ))}
            </View>
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
  marchio: { flexDirection: "row", alignItems: "center", gap: SPAZIO.s },
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
    alignSelf: "flex-start",
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
  },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.xl,
    ...OMBRA.scheda,
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
