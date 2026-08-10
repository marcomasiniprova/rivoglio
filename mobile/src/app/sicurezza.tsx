/**
 * SICUREZZA E DATI (tavola 18), la parte onesta.
 *
 * Dentro: cambio password, la copia dei propri dati, l'eliminazione
 * dell'account con la parola scritta. FUORI, di proposito: il Face ID
 * (si aggiunge con gli store: serve una libreria nativa) e l'elenco dei
 * dispositivi collegati (richiede una tabella sessioni che non esiste:
 * mostrarla finta sarebbe un dato inventato).
 */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import { eliminaAccount } from "@/lib/api";
import { cambiaPassword, esci, tokenSessione, useSessione } from "@/lib/sessione";
import { scriviA } from "@/lib/sistema";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.sicurezza;

export default function SchermataSicurezza() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { utente } = useSessione();

  const [password, setPassword] = useState("");
  const [passwordEsito, setPasswordEsito] = useState<string | null>(null);
  const [passwordInCorso, setPasswordInCorso] = useState(false);

  const [conferma, setConferma] = useState("");
  const [eliminaErrore, setEliminaErrore] = useState<string | null>(null);
  const [eliminaInCorso, setEliminaInCorso] = useState(false);

  async function cambia() {
    setPasswordEsito(null);
    if (password.length < 8) {
      setPasswordEsito(T.password.corta);
      return;
    }
    setPasswordInCorso(true);
    const esito = await cambiaPassword(password);
    setPasswordInCorso(false);
    setPasswordEsito(esito.errore ?? T.password.fatta);
    if (!esito.errore) setPassword("");
  }

  async function elimina() {
    setEliminaErrore(null);
    if (conferma.trim().toUpperCase() !== T.elimina.conferma) {
      setEliminaErrore(`Scrivi ${T.elimina.conferma} per confermare.`);
      return;
    }
    setEliminaInCorso(true);
    const token = await tokenSessione();
    const esito = token
      ? await eliminaAccount(token)
      : { ok: false, errore: "Devi essere collegato." };
    setEliminaInCorso(false);
    if (!esito.ok) {
      setEliminaErrore(esito.errore ?? "Non sono riuscito a completare l'eliminazione.");
      return;
    }
    await esci();
    router.dismissAll();
    router.replace("/");
  }

  return (
    <ScrollView
      style={stili.pagina}
      contentContainerStyle={[
        stili.contenuto,
        { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + SPAZIO.xxl },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={stili.indietro}>
        <Feather name="arrow-left" size={16} color={COLORI.fumo} />
        <Text style={stili.indietroTesto}>{TESTI.comune.indietro}</Text>
      </Pressable>

      <Text style={stili.titolo}>{T.titolo}</Text>
      {utente?.email ? <Text style={stili.email}>{utente.email}</Text> : null}

      {/* --------------------------------------------- la password */}
      <View style={stili.scheda}>
        <Text style={stili.schedaTitolo}>{T.password.titolo}</Text>
        <View style={stili.spazio} />
        <Campo
          etichetta={T.password.campo}
          valore={password}
          onChange={setPassword}
          segnaposto={T.password.segnaposto}
          tipo="password"
        />
        {passwordEsito && (
          <Text
            style={passwordEsito === T.password.fatta ? stili.ok : stili.errore}
            accessibilityRole="alert"
          >
            {passwordEsito}
          </Text>
        )}
        <View style={stili.spazio} />
        <Bottone
          testo={T.password.bottone}
          onPress={() => void cambia()}
          caricamento={passwordInCorso}
          variante="fantasma"
        />
      </View>

      {/* ------------------------------------------------- i dati */}
      <View style={stili.scheda}>
        <Text style={stili.schedaTitolo}>{T.dati.titolo}</Text>
        <Text style={stili.schedaTesto}>{T.dati.testo}</Text>
        <View style={stili.spazio} />
        <Bottone
          testo={T.dati.bottone}
          variante="fantasma"
          onPress={() => {
            void scriviA(TESTI.profiloApp.email);
          }}
        />
      </View>

      {/* -------------------------------------------- l'eliminazione */}
      <View style={[stili.scheda, stili.schedaRossa]}>
        <Text style={stili.schedaTitolo}>{T.elimina.titolo}</Text>
        <Text style={stili.schedaTesto}>{T.elimina.testo}</Text>
        <View style={stili.spazio} />
        <Campo
          etichetta={T.elimina.campo}
          valore={conferma}
          onChange={setConferma}
          segnaposto={T.elimina.conferma}
        />
        {eliminaErrore && (
          <Text style={stili.errore} accessibilityRole="alert">
            {eliminaErrore}
          </Text>
        )}
        <View style={stili.spazio} />
        <Pressable
          onPress={() => void elimina()}
          disabled={eliminaInCorso}
          accessibilityRole="button"
          style={[stili.bottoneRosso, eliminaInCorso && { opacity: 0.6 }]}
        >
          <Text style={stili.bottoneRossoTesto}>{T.elimina.bottone}</Text>
        </Pressable>
      </View>
    </ScrollView>
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
    paddingVertical: SPAZIO.s,
  },
  indietroTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 28,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
  },
  email: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo, marginTop: -SPAZIO.s },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
  schedaRossa: { borderColor: "rgba(194,65,12,0.35)" },
  schedaTitolo: { fontFamily: FONT.testoSemi, fontSize: 15.5, color: COLORI.inchiostro },
  schedaTesto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  spazio: { height: SPAZIO.m },
  ok: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro, marginTop: SPAZIO.m },
  errore: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.errore, marginTop: SPAZIO.m },
  bottoneRosso: {
    borderWidth: 1.5,
    borderColor: COLORI.errore,
    borderRadius: RAGGIO.bottone,
    paddingVertical: SPAZIO.m + 2,
    alignItems: "center",
  },
  bottoneRossoTesto: { fontFamily: FONT.testoSemi, fontSize: 15, color: COLORI.errore },
});
