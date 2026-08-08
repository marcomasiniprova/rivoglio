/**
 * La prima schermata dell'app: IL CHECK DEL VOLO.
 *
 * Rifatta l'8/08 per Rivoglio (prima era l'onboarding del vecchio prodotto
 * viaggi). Regole del prodotto, identiche al sito:
 * - il check è gratis e NON richiede account: si scrive volo e data e basta;
 * - il verdetto lo dà il motore sul server, mai l'app (lib/api.ts);
 * - niente promesse: "forse ti devono", mai "hai diritto a".
 */
import { useState } from "react";
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
import { useRouter } from "expo-router";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import Titolo from "@/components/Titolo";
import { verificaVolo } from "@/lib/api";
import { conBarre, dataIso } from "@/lib/data";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.check;

export default function SchermataCheck() {
  const router = useRouter();
  const [volo, setVolo] = useState("");
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

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

    setErrore(null);
    setInCorso(true);
    const esito = await verificaVolo(volo, iso);
    setInCorso(false);

    if (!esito.ok) {
      setErrore(esito.errore);
      return;
    }
    // Il verdetto viaggia come parametri: la schermata dopo non richiama l'API.
    router.push({
      pathname: "/verdetto",
      params: {
        volo: volo.trim().toUpperCase(),
        data: iso,
        esito: esito.esito,
        motivo: esito.motivo,
        importo: String(esito.importo ?? ""),
        ritardo: String(esito.ritardoMinuti ?? ""),
        previsto: esito.dato.previsto ?? "",
        effettivo: esito.dato.effettivo ?? "",
        demo: esito.demo ? "1" : "",
      },
    });
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
  punti: { marginTop: SPAZIO.xl, gap: SPAZIO.m },
  punto: { flexDirection: "row", alignItems: "center", gap: SPAZIO.s },
  puntoTesto: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.inchiostro, flex: 1 },
  entra: { marginTop: SPAZIO.xxl, alignSelf: "center", padding: SPAZIO.s },
  entraTesto: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.verdeScuro },
});
