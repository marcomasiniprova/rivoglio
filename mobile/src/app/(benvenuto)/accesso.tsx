import { useState } from "react";
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
import Titolo from "@/components/Titolo";
import { accedi } from "@/lib/sessione";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

/** Controllo veloce prima di chiamare la rete: il resto lo valida sessione. */
const EMAIL_SEMBRA_BUONA = /^\S+@\S+\.\S+$/;

/** L'ingresso per chi l'account ce l'ha già. Fuori dai 6 passi: niente pallini. */
export default function Accesso() {
  const router = useRouter();
  const T = TESTI.accesso;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroreEmail, setErroreEmail] = useState<string | undefined>();
  const [errorePassword, setErrorePassword] = useState<string | undefined>();
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  const entra = async () => {
    const emailBuona = EMAIL_SEMBRA_BUONA.test(email.trim());
    const passwordBuona = password.length > 0;
    setErroreEmail(emailBuona ? undefined : T.validazione.email);
    setErrorePassword(passwordBuona ? undefined : T.validazione.passwordVuota);
    if (!emailBuona || !passwordBuona) return;

    setErrore(null);
    setCaricamento(true);
    const esito = await accedi(email, password);
    if (esito.errore) {
      setErrore(esito.errore);
      setCaricamento(false);
      return;
    }
    router.replace("/(tabs)");
  };

  // Chi arriva qui da un altro passo torna dov'era, coi criteri intatti;
  // chi ci arriva a freddo riparte dall'inizio del flusso.
  const nonHoAccount = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(benvenuto)");
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
          <Titolo {...T.titolo} />
          <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

          <View style={stili.modulo}>
            <Campo
              etichetta={T.campi.email}
              valore={email}
              onChange={setEmail}
              segnaposto={T.campi.emailSegnaposto}
              tipo="email"
              errore={erroreEmail}
            />
            <Campo
              etichetta={T.campi.password}
              valore={password}
              onChange={setPassword}
              tipo="password"
              errore={errorePassword}
            />
          </View>

          {errore ? (
            <View accessibilityLiveRegion="polite" style={stili.avviso}>
              <Text style={stili.avvisoTesto}>{errore}</Text>
            </View>
          ) : null}

          <View style={stili.azioni}>
            <Bottone testo={T.bottoni.entra} onPress={entra} caricamento={caricamento} />
            <Bottone
              testo={T.bottoni.registrati}
              variante="fantasma"
              disabilitato={caricamento}
              onPress={nonHoAccount}
            />
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
  modulo: {
    marginTop: SPAZIO.xl,
    gap: SPAZIO.l,
  },
  avviso: {
    backgroundColor: COLORI.erroreTenue,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.l,
  },
  avvisoTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORI.errore,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    gap: SPAZIO.s,
    marginTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.l,
  },
});
