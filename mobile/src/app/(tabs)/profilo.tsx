/**
 * Il profilo: chi sei, e i link alle cose che contano.
 *
 * Riscritto l'8/08 per Rivoglio: prima era il profilo del prodotto viaggi
 * (crediti, comune di partenza, tetto settimanale). Qui non c'è niente da
 * configurare, perché il check non ha impostazioni: si scrive il volo e
 * basta. Quindi resta l'essenziale, e le pagine legali vivono sul sito
 * (una sola versione, quella pubblicata).
 */
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { SITO } from "@/lib/api";
import { esci, useSessione } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const P = TESTI.profiloApp;
const ARIA_BARRA = 116;

type Voce = {
  chiave: string;
  icona: React.ComponentProps<typeof Feather>["name"];
  testo: string;
  fai: () => void;
};

export default function SchermataProfilo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { utente } = useSessione();

  const voci: Voce[] = [
    {
      chiave: "sito",
      icona: "globe",
      testo: P.voci.sito,
      fai: () => void openBrowserAsync(SITO),
    },
    {
      chiave: "supporto",
      icona: "mail",
      testo: P.voci.supporto,
      fai: () => void Linking.openURL(`mailto:${P.email}`),
    },
    {
      chiave: "privacy",
      icona: "shield",
      testo: P.voci.privacy,
      fai: () => void openBrowserAsync(`${SITO}/privacy`),
    },
    {
      chiave: "condizioni",
      icona: "file-text",
      testo: P.voci.condizioni,
      fai: () => void openBrowserAsync(`${SITO}/condizioni`),
    },
  ];

  return (
    <ScrollView
      style={stili.schermo}
      contentContainerStyle={[
        stili.contenuto,
        { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + ARIA_BARRA },
      ]}
    >
      <Titolo prima={P.titolo.prima} corsivo={P.titolo.corsivo} />

      {/* ------------------------------------------------ chi sei */}
      <View style={stili.scheda}>
        {utente ? (
          <>
            <Text style={stili.etichetta}>{P.entratoCome}</Text>
            <Text style={stili.email}>{utente.email}</Text>
            <View style={stili.spazio} />
            <Bottone testo={P.esci} onPress={() => void esci()} variante="fantasma" />
          </>
        ) : (
          <>
            <Text style={stili.etichetta}>{P.ospite.titolo}</Text>
            <Text style={stili.ospiteTesto}>{P.ospite.testo}</Text>
            <View style={stili.spazio} />
            <Bottone testo={P.ospite.azione} onPress={() => router.push("/accesso")} />
          </>
        )}
      </View>

      {/* ------------------------------------------------ i link */}
      <View style={stili.elenco}>
        {voci.map((v, i) => (
          <Pressable
            key={v.chiave}
            onPress={v.fai}
            accessibilityRole="button"
            style={[stili.voce, i < voci.length - 1 && stili.voceBordo]}
          >
            <Feather name={v.icona} size={18} color={COLORI.verde} />
            <Text style={stili.voceTesto}>{v.testo}</Text>
            <Feather name="chevron-right" size={18} color={COLORI.fumo2} />
          </Pressable>
        ))}
      </View>

      <Text style={stili.piede}>{P.piede}</Text>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  schermo: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, gap: SPAZIO.l },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 11.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORI.fumo2,
  },
  email: {
    fontFamily: FONT.display,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  ospiteTesto: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  spazio: { height: SPAZIO.l },
  elenco: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    ...OMBRA.scheda,
  },
  voce: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.xl,
    paddingVertical: SPAZIO.l,
  },
  voceBordo: { borderBottomWidth: 1, borderBottomColor: COLORI.bordo },
  voceTesto: { flex: 1, fontFamily: FONT.testo, fontSize: 15, color: COLORI.inchiostro },
  piede: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
});
