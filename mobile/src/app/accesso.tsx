/**
 * Accesso e registrazione, in una schermata sola.
 *
 * Serve SOLO a seguire le pratiche: il check funziona senza. Per questo
 * si apre come foglio modale da dove serve, e si può sempre chiudere.
 */
import { useState } from "react";
import {
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
import { accedi, registrati } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const A = TESTI.accessoApp;

export default function SchermataAccesso() {
  const router = useRouter();
  const [nuovo, setNuovo] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  async function invia() {
    if (!email.trim() || !password) {
      setErrore(A.errori.campiVuoti);
      return;
    }
    setErrore(null);
    setInCorso(true);
    const esito = nuovo
      ? await registrati(email.trim(), password)
      : await accedi(email.trim(), password);
    setInCorso(false);

    if (esito.errore) {
      setErrore(esito.errore);
      return;
    }
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={stili.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={stili.contenuto} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={stili.chiudi} accessibilityRole="button">
          <Feather name="x" size={22} color={COLORI.fumo} />
        </Pressable>

        <Titolo
          prima={nuovo ? A.registra.titolo.prima : A.entra.titolo.prima}
          corsivo={nuovo ? A.registra.titolo.corsivo : A.entra.titolo.corsivo}
        />
        <Text style={stili.sottotitolo}>{nuovo ? A.registra.testo : A.entra.testo}</Text>

        <View style={stili.scheda}>
          <Campo
            etichetta={A.email}
            valore={email}
            onChange={setEmail}
            segnaposto="nome@esempio.it"
            tipo="email"
          />
          <View style={stili.spazio} />
          <Campo
            etichetta={A.password}
            valore={password}
            onChange={setPassword}
            segnaposto="almeno 8 caratteri"
            tipo="password"
          />

          {errore && (
            <Text style={stili.errore} accessibilityRole="alert">
              {errore}
            </Text>
          )}

          <View style={stili.spazio} />
          <Bottone
            testo={nuovo ? A.registra.bottone : A.entra.bottone}
            onPress={invia}
            caricamento={inCorso}
          />
        </View>

        <Pressable onPress={() => setNuovo(!nuovo)} style={stili.cambia}>
          <Text style={stili.cambiaTesto}>{nuovo ? A.haiAccount : A.nonHaiAccount}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.xxl,
  },
  chiudi: { alignSelf: "flex-end", padding: SPAZIO.s, marginBottom: SPAZIO.m },
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
  spazio: { height: SPAZIO.l },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },
  cambia: { alignSelf: "center", marginTop: SPAZIO.xl, padding: SPAZIO.s },
  cambiaTesto: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.verdeScuro },
});
