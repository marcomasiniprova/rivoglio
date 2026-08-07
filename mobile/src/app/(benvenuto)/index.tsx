import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { COLORI, FONT, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

/** Passo 1: il marchio, la promessa, due strade. Nessun pallino qui. */
export default function Benvenuto() {
  const router = useRouter();
  const T = TESTI.onboarding.index;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <ScrollView contentContainerStyle={stili.contenuto} bounces={false}>
        <View style={stili.alto}>
          <Text style={stili.marchio}>{TESTI.comune.marchio}</Text>
        </View>

        <View style={stili.centro}>
          <Titolo {...T.titolo} />
          <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>
        </View>

        <View style={stili.azioni}>
          <Bottone
            testo={T.bottoni.inizia}
            onPress={() => router.push("/(benvenuto)/valore")}
          />
          <Bottone
            testo={T.bottoni.accedi}
            variante="fantasma"
            onPress={() => router.push("/(benvenuto)/accesso")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  schermo: {
    flex: 1,
  },
  contenuto: {
    flexGrow: 1,
    padding: SPAZIO.schermata,
  },
  alto: {
    paddingTop: SPAZIO.xl,
  },
  marchio: {
    fontFamily: FONT.testoSemi,
    fontSize: 15,
    color: COLORI.verde,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    gap: SPAZIO.l,
  },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 15,
    lineHeight: 23,
    color: COLORI.fumo,
  },
  azioni: {
    gap: SPAZIO.s,
    paddingBottom: SPAZIO.l,
  },
});
