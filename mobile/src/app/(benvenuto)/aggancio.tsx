import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Scheda from "@/components/Scheda";
import Titolo from "@/components/Titolo";
import { euro, oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import { PARTENZE } from "@/motore/costruttore";
import { Pallini, RICERCA_BASE } from "./_layout";

const uno = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

const sostituisci = (s: string, valori: Record<string, string>): string =>
  s.replace(/\{(\w+)\}/g, (tutto, chiave) => valori[chiave] ?? tutto);

/** Passo 4: i criteri riletti ad alta voce, poi la promessa: 3 gratis. */
export default function Aggancio() {
  const router = useRouter();
  const T = TESTI.onboarding.aggancio;
  const params = useLocalSearchParams<{ comune?: string; soglia?: string; ore?: string }>();

  const comune = uno(params.comune);
  const soglia = Number(uno(params.soglia));
  const ore = Number(uno(params.ore));

  // Senza criteri validi questo passo non ha niente da riepilogare:
  // succede solo arrivando qui fuori ordine, e si torna al passo giusto.
  const criteriValidi =
    PARTENZE.some((p) => p.nome === comune) &&
    Number.isFinite(soglia) &&
    Number.isFinite(ore);
  if (!criteriValidi) return <Redirect href="/(benvenuto)/criteri" />;

  const righe = [
    { icona: "map-pin", testo: sostituisci(T.riepilogo.partenza, { comune }) },
    { icona: "credit-card", testo: sostituisci(T.riepilogo.soglia, { soglia: euro(soglia) }) },
    { icona: "clock", testo: sostituisci(T.riepilogo.ore, { ore: oreLeggibili(ore) }) },
    {
      icona: "users",
      testo: sostituisci(T.riepilogo.resto, {
        persone: String(RICERCA_BASE.persone),
        notti: String(RICERCA_BASE.nottiMax),
      }),
    },
  ] as const;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <ScrollView contentContainerStyle={stili.contenuto}>
        <Pallini passo={4} />
        <Titolo {...T.titolo} />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        <Scheda stile={stili.riepilogo}>
          {righe.map((riga) => (
            <View key={riga.icona} style={stili.riga}>
              <View style={stili.cerchio}>
                <Feather name={riga.icona} size={16} color={COLORI.verdeScuro} />
              </View>
              <Text style={stili.testoRiga}>{riga.testo}</Text>
            </View>
          ))}
        </Scheda>

        <View style={stili.azioni}>
          <Bottone
            testo={T.bottoni.avanti}
            onPress={() =>
              router.push({
                pathname: "/(benvenuto)/registrati",
                params: { comune, soglia: String(soglia), ore: String(ore) },
              })
            }
          />
          <Bottone
            testo={T.bottoni.correggi}
            variante="fantasma"
            onPress={() => router.back()}
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
  riepilogo: {
    marginTop: SPAZIO.xl,
    gap: SPAZIO.l,
  },
  riga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
  },
  cerchio: {
    width: 32,
    height: 32,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.mentaTenue,
    alignItems: "center",
    justifyContent: "center",
  },
  testoRiga: {
    fontFamily: FONT.testoMedio,
    fontSize: 14.5,
    color: COLORI.inchiostro,
    flexShrink: 1,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    gap: SPAZIO.s,
    marginTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.l,
  },
});
