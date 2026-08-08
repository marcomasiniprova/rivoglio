/**
 * "TI AVVISO IO": la card che accende le notifiche sui voli salvati.
 *
 * Compare solo quando c'è almeno un volo salvato, cioè quando la promessa
 * ha un senso concreto. Prima sarebbe una richiesta di permesso a freddo,
 * e quella la gente la nega.
 *
 * Tre stati, tre frasi diverse, nessuna promessa:
 * - non sei entrato: gli avvisi hanno bisogno dell'email, e si dice perché;
 * - entrato ma notifiche spente: un bottone solo;
 * - tutto acceso: si dice cosa succede e quando, e basta.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.avvisi;

export type StatoAvvisi = "ospite" | "da_attivare" | "negato" | "attivi";

export default function CardAvvisi({
  stato,
  onEntra,
  onAttiva,
}: {
  stato: StatoAvvisi;
  onEntra: () => void;
  onAttiva: () => void;
}) {
  const attivi = stato === "attivi";
  const testo = T[stato];
  const azione = stato === "ospite" ? onEntra : onAttiva;

  return (
    <View style={[stili.scheda, attivi && stili.schedaAttiva]}>
      <View style={stili.riga}>
        <Feather
          name={attivi ? "bell" : "bell-off"}
          size={17}
          color={attivi ? COLORI.verdeScuro : COLORI.fumo}
        />
        <Text style={stili.titolo}>{testo.titolo}</Text>
      </View>
      <Text style={stili.testo}>{testo.testo}</Text>

      {!attivi && "azione" in testo && (
        <Pressable onPress={azione} accessibilityRole="button" style={stili.bottone}>
          <Text style={stili.bottoneTesto}>{testo.azione}</Text>
          <Feather name="arrow-right" size={15} color={COLORI.verdeScuro} />
        </Pressable>
      )}
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    marginTop: SPAZIO.l,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
  },
  schedaAttiva: { backgroundColor: COLORI.mentaTenue, borderColor: COLORI.menta },
  riga: { flexDirection: "row", alignItems: "center", gap: SPAZIO.s },
  titolo: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro, flex: 1 },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  bottone: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    marginTop: SPAZIO.m,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
    minHeight: 32,
  },
  bottoneTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
});
