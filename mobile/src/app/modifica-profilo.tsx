/**
 * DATI PERSONALI: il nome pubblico e l'adesione alla classifica.
 *
 * Due regole scelte da Valerio (popup dell'8/08):
 * - in classifica si entra SOLO con un nome pubblico scelto qui (opt-in):
 *   chi non lo sceglie non compare mai;
 * - niente altri dati da compilare: l'email è quella dell'accesso, e i
 *   dati dei passeggeri vivono nella pratica, non nel profilo.
 */
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import Titolo from "@/components/Titolo";
import { leggiProfilo, salvaProfilo } from "@/lib/profilo";
import { useSessione } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.modificaProfilo;

export default function SchermataModificaProfilo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { utente } = useSessione();

  const [nickname, setNickname] = useState("");
  const [optin, setOptin] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void leggiProfilo().then((p) => {
        if (!p) return;
        setNickname(p.nickname ?? "");
        setOptin(p.classificaOptin);
      });
    }, []),
  );

  async function salva() {
    setErrore(null);
    setSalvato(false);
    setInCorso(true);
    const esito = await salvaProfilo(nickname.trim() || null, optin);
    setInCorso(false);
    if (!esito.ok) {
      setErrore(esito.errore);
      return;
    }
    setSalvato(true);
  }

  return (
    <KeyboardAvoidingView
      style={stili.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          stili.contenuto,
          { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + SPAZIO.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={stili.indietro}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={16} color={COLORI.fumo} />
          <Text style={stili.indietroTesto}>{TESTI.comune.indietro}</Text>
        </Pressable>

        <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        <View style={stili.scheda}>
          <Text style={stili.etichetta}>{T.email}</Text>
          <Text style={stili.emailTesto}>{utente?.email ?? ""}</Text>

          <View style={stili.spazio} />

          <Campo
            etichetta={T.nickname.etichetta}
            valore={nickname}
            onChange={(t) => setNickname(t.replace(/\s/g, ""))}
            segnaposto={T.nickname.segnaposto}
          />
          <Text style={stili.aiuto}>{T.nickname.aiuto}</Text>

          <View style={stili.spazio} />

          <View style={stili.rigaOptin}>
            <View style={stili.optinTesti}>
              <Text style={stili.optinEtichetta}>{T.classifica.etichetta}</Text>
              <Text style={stili.optinTesto}>{T.classifica.testo}</Text>
            </View>
            <Switch
              value={optin}
              onValueChange={setOptin}
              trackColor={{ false: COLORI.bordo, true: COLORI.menta }}
              thumbColor={optin ? COLORI.verde : COLORI.bianco}
              accessibilityLabel={T.classifica.etichetta}
            />
          </View>

          {errore && (
            <Text style={stili.errore} accessibilityRole="alert">
              {errore}
            </Text>
          )}
          {salvato && <Text style={stili.salvato}>{T.salvato}</Text>}

          <View style={stili.spazio} />
          <Bottone testo={T.salva} onPress={() => void salva()} caricamento={inCorso} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, gap: SPAZIO.l },
  indietro: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  indietroTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.fumo,
    marginTop: -SPAZIO.s,
  },
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
  emailTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 15.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.xs,
  },
  spazio: { height: SPAZIO.l },
  aiuto: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 17,
    color: COLORI.fumo2,
    marginTop: SPAZIO.xs + 2,
  },
  rigaOptin: { flexDirection: "row", alignItems: "flex-start", gap: SPAZIO.m },
  optinTesti: { flex: 1, minWidth: 0 },
  optinEtichetta: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro },
  optinTesto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: 2,
  },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },
  salvato: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro, marginTop: SPAZIO.m },
});
