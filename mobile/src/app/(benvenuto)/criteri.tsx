import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import Chip from "@/components/Chip";
import Titolo from "@/components/Titolo";
import { oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import { PARTENZE } from "@/motore/costruttore";
import { Pallini } from "./_layout";

/** Stessi limiti di dati.ts e del sito: qui si valida solo per guidare. */
const SOGLIA = { min: 30, max: 600 } as const;

/** Scelte proposte per le ore di auto, dentro i limiti 0,5-8 di dati.ts. */
const ORE_SCELTE = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8] as const;

const ORE_BASE = 3;

/** Passo 3: tre limiti, ancora senza account. Lo stato resta locale. */
export default function Criteri() {
  const router = useRouter();
  const T = TESTI.onboarding.criteri;

  const [cerca, setCerca] = useState("");
  const [comune, setComune] = useState<string | null>(null);
  const [soglia, setSoglia] = useState("");
  const [ore, setOre] = useState<number>(ORE_BASE);

  const trovate = useMemo(() => {
    const testo = cerca.trim().toLowerCase();
    if (!testo) return PARTENZE;
    return PARTENZE.filter((p) => p.nome.toLowerCase().includes(testo));
  }, [cerca]);

  const sogliaNumero = Number(soglia.replace(",", "."));
  const sogliaValida =
    soglia.trim() !== "" &&
    Number.isFinite(sogliaNumero) &&
    sogliaNumero >= SOGLIA.min &&
    sogliaNumero <= SOGLIA.max;
  const erroreSoglia =
    soglia.trim() !== "" && !sogliaValida ? TESTI.ricerche.limiti.soglia : undefined;

  const pronto = comune !== null && sogliaValida;

  const avanti = () => {
    if (!pronto || comune === null) return;
    router.push({
      pathname: "/(benvenuto)/aggancio",
      params: { comune, soglia: String(sogliaNumero), ore: String(ore) },
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <KeyboardAvoidingView
        style={stili.schermo}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={stili.contenuto}
          keyboardShouldPersistTaps="handled"
        >
          <Pallini passo={3} />
          <Titolo {...T.titolo} />
          <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

          <View style={stili.blocco}>
            <Campo
              etichetta={T.partenza.etichetta}
              valore={comune ?? cerca}
              onChange={(testo) => {
                // Scrivere di nuovo annulla la scelta: si cerca da capo.
                setComune(null);
                setCerca(testo);
              }}
              segnaposto={T.partenza.segnaposto}
            />
            <View style={stili.elenco}>
              {trovate.map((p) => (
                <Chip
                  key={p.nome}
                  testo={p.nome}
                  attivo={comune === p.nome}
                  onPress={() => {
                    setComune(p.nome);
                    setCerca("");
                  }}
                />
              ))}
              {trovate.length === 0 ? (
                <Text style={stili.nota}>{T.partenza.nessuna}</Text>
              ) : null}
            </View>
            <Text style={stili.nota}>{T.partenza.nota}</Text>
          </View>

          <View style={stili.blocco}>
            <Campo
              etichetta={T.soglia.etichetta}
              valore={soglia}
              onChange={setSoglia}
              segnaposto={`${SOGLIA.min}-${SOGLIA.max}`}
              tipo="numero"
              errore={erroreSoglia}
            />
            <Text style={stili.nota}>{T.soglia.nota}</Text>
          </View>

          <View style={stili.blocco}>
            <Text style={stili.etichetta}>{T.ore.etichetta}</Text>
            <View style={stili.elenco}>
              {ORE_SCELTE.map((o) => (
                <Chip
                  key={o}
                  testo={oreLeggibili(o)}
                  attivo={ore === o}
                  onPress={() => setOre(o)}
                />
              ))}
            </View>
            <Text style={stili.nota}>{T.ore.nota}</Text>
          </View>

          <View style={stili.azioni}>
            <Bottone testo={T.bottoni.avanti} onPress={avanti} disabilitato={!pronto} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  blocco: {
    marginTop: SPAZIO.xl,
    gap: SPAZIO.m,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.inchiostro,
  },
  elenco: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo2,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.l,
  },
});
