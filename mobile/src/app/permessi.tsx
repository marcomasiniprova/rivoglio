/**
 * IL PERMESSO NOTIFICHE (tavola 4g): la schermata cuscinetto.
 *
 * Perché esiste: su iOS il "no" alla finestra di sistema è quasi
 * irreversibile (si riapre solo dalle impostazioni). Questa schermata
 * viene PRIMA, dice esattamente quando scriveremo e perché, e chi
 * preferisce l'email lo dice qui senza bruciare niente: la finestra di
 * sistema parte solo dopo il "Va bene, avvisami".
 */
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import { VeloVerde } from "@/components/ScenaVerdetto";
import { chiediPermesso, registraToken } from "@/lib/notifiche";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.permessi;

/** Scritto quando l'utente sceglie l'email: non glielo richiediamo a ogni giro. */
export const CHIAVE_PERMESSI_RIMANDATO = "rivolio.permessi.rimandato";

export default function SchermataPermessi() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function accetta() {
    const ok = await chiediPermesso();
    if (ok) await registraToken();
    router.back();
  }

  async function rimanda() {
    await AsyncStorage.setItem(CHIAVE_PERMESSI_RIMANDATO, "1");
    router.back();
  }

  return (
    <View style={[stili.pagina, { paddingTop: insets.top + SPAZIO.xxl }]}>
      <VeloVerde />

      <View style={stili.campana}>
        <Feather name="bell" size={26} color={COLORI.bianco} />
      </View>

      <Text style={stili.titolo}>{T.titolo}</Text>
      <Text style={stili.testo}>{T.testo}</Text>

      <View style={stili.righe}>
        {T.righe.map((r) => (
          <View key={r.titolo} style={stili.riga}>
            <View style={stili.badge}>
              {r.badge === "aereo" ? (
                <Feather name="send" size={14} color={COLORI.verdeScuro} />
              ) : (
                <Text style={stili.badgeTesto}>{r.badge}</Text>
              )}
            </View>
            <View style={stili.rigaTesti}>
              <Text style={stili.rigaTitolo}>{r.titolo}</Text>
              <Text style={stili.rigaTesto}>{r.testo}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={stili.niente}>{T.niente}</Text>

      <View style={[stili.azioni, { paddingBottom: insets.bottom + SPAZIO.xl }]}>
        <Bottone testo={T.si} onPress={() => void accetta()} />
        <Bottone testo={T.no} variante="fantasma" onPress={() => void rimanda()} />
      </View>
    </View>
  );
}

const stili = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: COLORI.nebbia,
    paddingHorizontal: SPAZIO.schermata + SPAZIO.xs,
  },
  campana: {
    width: 64,
    height: 64,
    borderRadius: RAGGIO.scheda,
    backgroundColor: COLORI.verde,
    alignItems: "center",
    justifyContent: "center",
    ...OMBRA.sollevata,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.xl,
  },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
    maxWidth: 340,
  },
  righe: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    marginTop: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  riga: {
    flexDirection: "row",
    gap: SPAZIO.m,
    padding: SPAZIO.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORI.bordo,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: RAGGIO.minimo,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTesto: { fontFamily: FONT.testoSemi, fontSize: 12.5, color: COLORI.verdeScuro },
  rigaTesti: { flex: 1 },
  rigaTitolo: { fontFamily: FONT.testoSemi, fontSize: 14, color: COLORI.inchiostro },
  rigaTesto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: 2,
  },
  niente: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo,
    backgroundColor: COLORI.nebbia2,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.l,
  },
  azioni: { marginTop: "auto", gap: SPAZIO.m },
});
