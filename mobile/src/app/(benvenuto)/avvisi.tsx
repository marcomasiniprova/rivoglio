import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { chiediPermesso, registraToken } from "@/lib/notifiche";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import { Pallini } from "./_layout";

/**
 * Passo 6: il prompt nativo arriva solo dopo questo tasto, mai a freddo
 * (ricerca onboarding del 07/08). Chi rifiuta va avanti lo stesso: c'è
 * l'email di riserva, e la schermata lo dice prima, non dopo.
 */
export default function Avvisi() {
  const router = useRouter();
  const T = TESTI.onboarding.avvisi;
  const [caricamento, setCaricamento] = useState(false);

  const alleTab = () => router.replace("/(tabs)");

  const attiva = async () => {
    setCaricamento(true);
    // Concesso o negato, si va avanti: registraToken non lancia mai e
    // salva il token solo se il permesso c'è.
    await chiediPermesso();
    await registraToken();
    alleTab();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <ScrollView contentContainerStyle={stili.contenuto}>
        <Pallini passo={6} />
        <Titolo {...T.titolo} />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        <View style={stili.campana}>
          <Feather name="bell" size={40} color={COLORI.menta} />
        </View>

        <Text style={stili.nota}>{T.nota}</Text>

        <View style={stili.azioni}>
          <Bottone testo={T.bottoni.attiva} onPress={attiva} caricamento={caricamento} />
          <Bottone
            testo={T.bottoni.nonOra}
            variante="fantasma"
            disabilitato={caricamento}
            onPress={alleTab}
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
    paddingTop: SPAZIO.xl,
  },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  campana: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.verdeNotte,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPAZIO.xxl,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.xl,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    gap: SPAZIO.s,
    marginTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.l,
  },
});
