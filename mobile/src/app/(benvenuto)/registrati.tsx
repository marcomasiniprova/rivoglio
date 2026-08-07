import { useRef, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
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
import { creaRicerca, salvaPartenza } from "@/lib/dati";
import { registrati } from "@/lib/sessione";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import { PARTENZE } from "@/motore/costruttore";
import { Pallini, RICERCA_BASE } from "./_layout";

const uno = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

/** Controllo veloce prima di chiamare la rete: il resto lo valida sessione. */
const EMAIL_SEMBRA_BUONA = /^\S+@\S+\.\S+$/;

/** Passo 5: l'account come recapito. Da qui partono partenza e prima ricerca. */
export default function Registrati() {
  const router = useRouter();
  const T = TESTI.onboarding.registrati;
  const A = TESTI.accesso;
  const params = useLocalSearchParams<{ comune?: string; soglia?: string; ore?: string }>();

  const comune = uno(params.comune);
  const soglia = Number(uno(params.soglia));
  const ore = Number(uno(params.ore));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroreEmail, setErroreEmail] = useState<string | undefined>();
  const [errorePassword, setErrorePassword] = useState<string | undefined>();
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  // Doppione di fatto.current.conto leggibile durante il render (il ref no):
  // decide solo l'etichetta del bottone.
  const [contoCreato, setContoCreato] = useState(false);

  // Cosa è già andato a buon fine: al Riprova non si ricrea l'account
  // e non si duplica la ricerca.
  const fatto = useRef({ conto: false, partenza: false, ricerca: false });

  // Senza criteri validi non c'è niente da salvare: si torna al passo 3.
  const criteriValidi =
    PARTENZE.some((p) => p.nome === comune) &&
    Number.isFinite(soglia) &&
    Number.isFinite(ore);
  if (!criteriValidi) return <Redirect href="/(benvenuto)/criteri" />;

  const invia = async () => {
    const emailBuona = EMAIL_SEMBRA_BUONA.test(email.trim());
    const passwordBuona = password.length >= 8;
    setErroreEmail(emailBuona ? undefined : A.validazione.email);
    setErrorePassword(passwordBuona ? undefined : A.validazione.passwordCorta);
    if (!emailBuona || !passwordBuona) return;

    setErrore(null);
    setCaricamento(true);

    if (!fatto.current.conto) {
      const esito = await registrati(email, password);
      if (esito.errore) {
        setErrore(esito.errore);
        setCaricamento(false);
        return;
      }
      fatto.current.conto = true;
      setContoCreato(true);
    }

    if (!fatto.current.partenza) {
      const esito = await salvaPartenza(comune);
      if (esito.errore) {
        setErrore(`${T.criteriNonSalvati} ${esito.errore}`);
        setCaricamento(false);
        return;
      }
      fatto.current.partenza = true;
    }

    if (!fatto.current.ricerca) {
      const esito = await creaRicerca({
        budget: soglia,
        ore,
        nottiMin: RICERCA_BASE.nottiMin,
        nottiMax: RICERCA_BASE.nottiMax,
        persone: RICERCA_BASE.persone,
        tipi: [...RICERCA_BASE.tipi],
      });
      if (esito.errore) {
        setErrore(`${T.criteriNonSalvati} ${esito.errore}`);
        setCaricamento(false);
        return;
      }
      fatto.current.ricerca = true;
    }

    router.replace("/(benvenuto)/avvisi");
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
          <Pallini passo={5} />
          <Titolo {...T.titolo} />
          <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

          <View style={stili.modulo}>
            <Campo
              etichetta={A.campi.email}
              valore={email}
              onChange={setEmail}
              segnaposto={A.campi.emailSegnaposto}
              tipo="email"
              errore={erroreEmail}
            />
            <View>
              <Campo
                etichetta={A.campi.password}
                valore={password}
                onChange={setPassword}
                tipo="password"
                errore={errorePassword}
              />
              {errorePassword ? null : (
                <Text style={stili.nota}>{A.campi.passwordNota}</Text>
              )}
            </View>
          </View>

          {errore ? (
            <View accessibilityLiveRegion="polite" style={stili.avviso}>
              <Text style={stili.avvisoTesto}>{errore}</Text>
            </View>
          ) : null}

          <View style={stili.azioni}>
            <Bottone
              testo={contoCreato ? TESTI.comune.riprova : T.bottoni.crea}
              onPress={invia}
              caricamento={caricamento}
            />
            <Bottone
              testo={T.bottoni.accedi}
              variante="fantasma"
              disabilitato={caricamento}
              onPress={() => router.push("/(benvenuto)/accesso")}
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
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo2,
    marginTop: SPAZIO.xs,
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
