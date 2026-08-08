/**
 * "FOTOGRAFA LA CARTA D'IMBARCO": la strada più corta al verdetto.
 *
 * Sta in cima alla scheda, sopra gli altri due modi, perché quando la
 * carta d'imbarco ce l'hai è la via più veloce in assoluto: non devi
 * ricordare né il numero né il giorno.
 *
 * Cosa NON fa: non controlla il volo da sola. Riempie le due caselle e
 * mostra quello che ha letto, così la persona vede il dato e lo corregge
 * se è sbagliato. Un'app che parte da sola su un dato letto male fa un
 * verdetto sbagliato su un volo che non è il tuo.
 */
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fotografaCarta, scegliCarta } from "@/lib/carta";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.carta;

export default function ScattaCarta({
  onLetto,
}: {
  /** volo e data (in ISO, "2026-08-06"): uno dei due può mancare. */
  onLetto: (volo: string | null, dataIso: string | null) => void;
}) {
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function apri(da: "fotocamera" | "galleria") {
    setErrore(null);
    setInCorso(true);
    const esito = da === "fotocamera" ? await fotografaCarta() : await scegliCarta();
    setInCorso(false);

    if (!esito.ok) {
      // Chi annulla non ha sbagliato niente: nessun messaggio rosso.
      if (!esito.annullato) setErrore(esito.errore);
      return;
    }
    onLetto(esito.volo, esito.data);
  }

  /* Sul browser la fotocamera non c'è: si mostra solo "scegli un file",
     invece di un bottone che non farebbe niente. */
  const conFotocamera = Platform.OS !== "web";

  return (
    <View style={stili.riquadro}>
      <View style={stili.testata}>
        <Feather name="camera" size={16} color={COLORI.verdeScuro} />
        <Text style={stili.titolo}>{T.titolo}</Text>
      </View>
      <Text style={stili.testo}>{T.testo}</Text>

      <View style={stili.bottoni}>
        {conFotocamera && (
          <Pressable
            onPress={() => void apri("fotocamera")}
            disabled={inCorso}
            accessibilityRole="button"
            style={[stili.bottone, stili.principale, inCorso && stili.spento]}
          >
            {inCorso ? (
              <ActivityIndicator size="small" color={COLORI.bianco} />
            ) : (
              <Feather name="camera" size={15} color={COLORI.bianco} />
            )}
            <Text style={stili.testoPrincipale}>{T.scatta}</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => void apri("galleria")}
          disabled={inCorso}
          accessibilityRole="button"
          style={[stili.bottone, stili.secondario, inCorso && stili.spento]}
        >
          {inCorso && !conFotocamera ? (
            <ActivityIndicator size="small" color={COLORI.verdeScuro} />
          ) : (
            <Feather name="image" size={15} color={COLORI.verdeScuro} />
          )}
          <Text style={stili.testoSecondario}>{T.galleria}</Text>
        </Pressable>
      </View>

      {inCorso && <Text style={stili.attesa}>{T.attesa}</Text>}

      {errore && (
        <Text style={stili.errore} accessibilityRole="alert">
          {errore}
        </Text>
      )}

      <Text style={stili.privacy}>{T.privacy}</Text>
    </View>
  );
}

const stili = StyleSheet.create({
  riquadro: {
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.l,
    marginBottom: SPAZIO.l,
  },
  testata: { flexDirection: "row", alignItems: "center", gap: SPAZIO.s },
  titolo: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro, flex: 1 },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  bottoni: { flexDirection: "row", gap: SPAZIO.s, marginTop: SPAZIO.m },
  bottone: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPAZIO.s,
    borderRadius: RAGGIO.campo,
    paddingVertical: SPAZIO.m,
    minHeight: 46,
  },
  principale: { backgroundColor: COLORI.verde },
  secondario: { backgroundColor: COLORI.bianco, borderWidth: 1, borderColor: COLORI.menta },
  spento: { opacity: 0.6 },
  testoPrincipale: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.bianco },
  testoSecondario: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
  attesa: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.s,
    textAlign: "center",
  },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.errore,
    marginTop: SPAZIO.s,
  },
  privacy: {
    fontFamily: FONT.testo,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORI.fumo2,
    marginTop: SPAZIO.m,
  },
});
