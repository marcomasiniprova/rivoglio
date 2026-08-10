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
import { useRouter, useLocalSearchParams } from "expo-router";
import Bottone from "@/components/Bottone";
import { scenaDa } from "@/lib/anteprima";
import Campo from "@/components/Campo";
import Titolo from "@/components/Titolo";
import { accedi, mandaCodice, registrati, verificaCodice } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const A = TESTI.accessoApp;
const C = TESTI.codice;

export default function SchermataAccesso() {
  const router = useRouter();
  /* L'email può arrivare già scritta dalla welcome: un campo in meno. */
  const { email: emailIniziale, scena } = useLocalSearchParams<{
    email?: string;
    /* Solo la lavagna del sito: apre direttamente il codice via email. */
    scena?: string;
  }>();
  const [nuovo, setNuovo] = useState(Boolean(emailIniziale));
  const [email, setEmail] = useState(emailIniziale ?? "");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  /* Il codice via email (tavola 3c): "manda" scrive le sei cifre alla
     casella, "verifica" le controlla. Vale anche come registrazione:
     al primo codice l'account nasce da solo. */
  const [conCodice, setConCodice] = useState(() => scenaDa(scena) === "codice");
  const [codiceMandato, setCodiceMandato] = useState(false);
  const [codice, setCodice] = useState("");

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

  async function manda() {
    if (!email.trim()) {
      setErrore(C.errori.emailVuota);
      return;
    }
    setErrore(null);
    setInCorso(true);
    const esito = await mandaCodice(email);
    setInCorso(false);
    if (esito.errore) {
      setErrore(esito.errore);
      return;
    }
    setCodiceMandato(true);
  }

  async function verifica() {
    if (codice.replace(/\D/g, "").length !== 6) {
      setErrore(C.errori.codiceCorto);
      return;
    }
    setErrore(null);
    setInCorso(true);
    const esito = await verificaCodice(email, codice);
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

        {conCodice ? (
          <>
            <Text style={stili.titoloCodice}>{C.titolo}</Text>
            <Text style={stili.sottotitolo}>
              {codiceMandato ? C.mandato.replace("{email}", email.trim()) : C.testo}
            </Text>

            <View style={stili.scheda}>
              {!codiceMandato ? (
                <>
                  <Campo
                    etichetta={A.email}
                    valore={email}
                    onChange={setEmail}
                    segnaposto="nome@esempio.it"
                    tipo="email"
                  />
                  {errore && (
                    <Text style={stili.errore} accessibilityRole="alert">
                      {errore}
                    </Text>
                  )}
                  <View style={stili.spazio} />
                  <Bottone testo={C.manda} onPress={() => void manda()} caricamento={inCorso} />
                </>
              ) : (
                <>
                  <Campo
                    etichetta={C.campo}
                    valore={codice}
                    onChange={(t) => setCodice(t.replace(/\D/g, "").slice(0, 6))}
                    segnaposto="000000"
                    tipo="numero"
                  />
                  {errore && (
                    <Text style={stili.errore} accessibilityRole="alert">
                      {errore}
                    </Text>
                  )}
                  <View style={stili.spazio} />
                  <Bottone testo={C.conferma} onPress={() => void verifica()} caricamento={inCorso} />
                  <Pressable onPress={() => void manda()} style={stili.cambia}>
                    <Text style={stili.cambiaTesto}>{C.rimanda}</Text>
                  </Pressable>
                </>
              )}
            </View>

            <Pressable
              onPress={() => {
                setConCodice(false);
                setCodiceMandato(false);
                setErrore(null);
              }}
              style={stili.cambia}
            >
              <Text style={stili.cambiaTesto}>{C.passaPassword}</Text>
            </Pressable>
          </>
        ) : (
          <>
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

            <Pressable
              onPress={() => {
                setConCodice(true);
                setErrore(null);
              }}
              style={stili.cambia}
            >
              <Text style={stili.cambiaTesto}>{C.invito}</Text>
            </Pressable>

            <Pressable onPress={() => setNuovo(!nuovo)} style={stili.cambia}>
              <Text style={stili.cambiaTesto}>{nuovo ? A.haiAccount : A.nonHaiAccount}</Text>
            </Pressable>
          </>
        )}
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
  titoloCodice: {
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
  },
});
