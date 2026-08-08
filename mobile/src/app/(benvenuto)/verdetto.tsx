/**
 * Il verdetto del check, coi tre esiti del motore (SPEC §4).
 *
 * Non ricalcola niente: legge quello che il server ha già deciso e lo
 * mostra. Un caso incerto NON si vende, e lo dice apertamente; un caso
 * idoneo mostra la fascia di legge senza mai promettere il pagamento.
 */
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { SITO } from "@/lib/api";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import * as WebBrowser from "expo-web-browser";

const V = TESTI.verdetto;

/** "2026-08-06" → "6 agosto 2026". */
const dataIt = (iso: string) =>
  iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

/** "2026-08-06T18:35Z" → "18:35". Vuoto se l'orario non c'è. */
const oraDa = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};

const durata = (minuti: number) => {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
};

export default function SchermataVerdetto() {
  const router = useRouter();
  const p = useLocalSearchParams<{
    volo: string;
    data: string;
    esito: string;
    motivo: string;
    importo: string;
    ritardo: string;
    previsto: string;
    effettivo: string;
    demo: string;
  }>();

  const idoneo = p.esito === "idoneo";
  const incerto = p.esito === "incerto";
  const testa = idoneo ? V.idoneo : incerto ? V.incerto : V.nonIdoneo;
  const ritardo = Number(p.ritardo);
  const haOrari = Boolean(p.previsto && p.effettivo);

  return (
    <ScrollView style={stili.pagina} contentContainerStyle={stili.contenuto}>
      <View style={stili.testata}>
        <Image
          source={require("../../../assets/images/marchio.png")}
          style={stili.segno}
          accessibilityLabel="Rivoglio"
        />
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={stili.altro}>{V.altroVolo}</Text>
        </Pressable>
      </View>

      <Text style={stili.occhiello}>{testa.occhiello}</Text>
      <Titolo prima={testa.titolo.prima} corsivo={testa.titolo.corsivo} />

      {p.demo === "1" && (
        <View style={stili.demo}>
          <Text style={stili.demoTesto}>{V.demo}</Text>
        </View>
      )}

      {/* ------------------------------------------------ il fatto */}
      <View style={stili.scheda}>
        <Text style={stili.volo}>
          {p.volo} · {dataIt(p.data)}
        </Text>

        {haOrari && (
          <View style={stili.orari}>
            <View style={stili.ora}>
              <Text style={stili.oraEtichetta}>{V.previsto}</Text>
              <Text style={stili.oraValore}>{oraDa(p.previsto)}</Text>
            </View>
            <View style={[stili.ora, stili.oraTardi]}>
              <Text style={stili.oraEtichetta}>{V.effettivo}</Text>
              <Text style={stili.oraValore}>{oraDa(p.effettivo)}</Text>
            </View>
          </View>
        )}

        {Number.isFinite(ritardo) && ritardo > 0 && (
          <View style={stili.ritardo}>
            <Feather name="clock" size={15} color={COLORI.verdeScuro} />
            <Text style={stili.ritardoTesto}>
              {V.ritardo}: {durata(ritardo)}
            </Text>
          </View>
        )}

        <Text style={stili.motivo}>{p.motivo}</Text>
      </View>

      {/* ------------------------------------------------ la fascia */}
      {idoneo && p.importo && (
        <View style={stili.fascia}>
          <Text style={stili.fasciaEtichetta}>{V.idoneo.fasciaEtichetta}</Text>
          <Text style={stili.fasciaImporto}>
            {p.importo}€ <Text style={stili.fasciaPer}>{V.idoneo.perPasseggero}</Text>
          </Text>
          <Text style={stili.fasciaNota}>{V.idoneo.nota}</Text>
        </View>
      )}

      <Text style={stili.nota}>{testa.nota}</Text>

      <View style={stili.azioni}>
        {idoneo && (
          <Bottone
            testo={V.apriPratica}
            onPress={() => {
              void WebBrowser.openBrowserAsync(`${SITO}/#controllo`);
            }}
            icona="external-link"
          />
        )}
        <Bottone
          testo={V.altroVolo}
          onPress={() => router.back()}
          variante={idoneo ? "fantasma" : "pieno"}
        />
      </View>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.l,
    paddingBottom: SPAZIO.xxl,
  },
  testata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPAZIO.xl,
  },
  segno: { width: 30, height: 30 },
  altro: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  occhiello: {
    fontFamily: FONT.testoMedio,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLORI.fumo2,
    marginBottom: SPAZIO.m,
  },
  demo: {
    alignSelf: "flex-start",
    backgroundColor: COLORI.nebbia2,
    borderColor: COLORI.bordo,
    borderWidth: 1,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 5,
    marginTop: SPAZIO.m,
  },
  demoTesto: { fontFamily: FONT.testoMedio, fontSize: 11.5, color: COLORI.fumo },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  volo: {
    fontFamily: FONT.testoMedio,
    fontSize: 14,
    color: COLORI.fumo,
  },
  orari: { flexDirection: "row", gap: SPAZIO.m, marginTop: SPAZIO.l },
  ora: {
    flex: 1,
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    borderWidth: 1,
    borderColor: COLORI.bordo,
  },
  oraTardi: { backgroundColor: COLORI.mentaTenue, borderColor: COLORI.menta },
  oraEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORI.fumo2,
  },
  oraValore: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.8,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.xs,
  },
  ritardo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    marginTop: SPAZIO.l,
  },
  ritardoTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
  motivo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.l,
  },
  fascia: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.l,
  },
  fasciaEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 11.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORI.menta,
  },
  fasciaImporto: {
    fontFamily: FONT.display,
    fontSize: 44,
    letterSpacing: -1.6,
    color: COLORI.bianco,
    marginTop: SPAZIO.s,
  },
  fasciaPer: { fontFamily: FONT.testo, fontSize: 14, color: COLORI.bianco },
  fasciaNota: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 20,
    color: COLORI.bianco,
    opacity: 0.8,
    marginTop: SPAZIO.m,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 21,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
  },
  azioni: { marginTop: SPAZIO.xl, gap: SPAZIO.m },
});
