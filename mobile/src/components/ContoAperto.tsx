import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { euro, oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";

type Props = {
  /** Quota alloggio a persona, in euro. */
  alloggio: number;
  /** Quota auto a persona, in euro. È una stima e il componente lo dice. */
  auto: number;
  /** Totale a persona, in euro. */
  totale: number;
  /** Soglia scelta dall'utente, a persona. */
  soglia: number;
  persone: number;
  km: number;
  ore: number;
  /** Le voci del conto auto. Senza, il dettaglio apribile non compare. */
  dettaglio?: { litri: number; benzina: number; pedaggi: number };
};

// Le etichette del conto fanno parte del componente: la firma del contratto
// non le riceve da fuori.
const ETICHETTE = {
  alloggio: "Alloggio a testa",
  auto: "Auto a testa (stima)",
  totale: "Totale a testa",
  apriDettaglio: "Come ho calcolato l'auto",
  stima:
    "Il costo dell'auto è una stima: consumo da utilitaria a benzina e prezzo medio nazionale. I pedaggi variano col percorso.",
} as const;

const virgola = (n: number, decimali = 1) =>
  n.toFixed(decimali).replace(".", ",");

export default function ContoAperto({
  alloggio,
  auto,
  totale,
  soglia,
  persone,
  km,
  ore,
  dettaglio,
}: Props) {
  const [aperto, setAperto] = useState(false);
  const avanzo = soglia - totale;

  const vociDettaglio = dettaglio
    ? [
        { etichetta: "Chilometri di strada", valore: `${Math.round(km)} km` },
        { etichetta: "Ore di guida", valore: oreLeggibili(ore) },
        {
          etichetta: `Benzina (${virgola(dettaglio.litri)} litri)`,
          valore: euro(dettaglio.benzina, 2),
        },
        { etichetta: "Pedaggi", valore: euro(dettaglio.pedaggi, 2) },
        {
          etichetta:
            persone === 1 ? "Per 1 persona" : `Diviso per ${persone} persone`,
          valore: euro(auto, 2),
        },
      ]
    : [];

  return (
    <View style={stili.scheda}>
      <View style={stili.riga}>
        <Text style={stili.etichetta}>{ETICHETTE.alloggio}</Text>
        <Text style={stili.valore}>{euro(alloggio)}</Text>
      </View>
      <View style={stili.riga}>
        <Text style={stili.etichetta}>{ETICHETTE.auto}</Text>
        <Text style={stili.valore}>{euro(auto)}</Text>
      </View>

      <View style={stili.rigaTotale}>
        <Text style={stili.etichettaTotale}>{ETICHETTE.totale}</Text>
        <Text style={stili.valoreTotale}>{euro(totale)}</Text>
      </View>

      {avanzo > 0 ? (
        <View style={stili.avanzo}>
          <Text style={stili.avanzoTesto}>
            La tua soglia è {euro(soglia)}. Ti avanzano {euro(avanzo)}.
          </Text>
        </View>
      ) : (
        <Text style={stili.nota}>La tua soglia è {euro(soglia)}.</Text>
      )}

      {dettaglio ? (
        <>
          <Pressable
            onPress={() => setAperto((era) => !era)}
            accessibilityRole="button"
            accessibilityLabel={ETICHETTE.apriDettaglio}
            accessibilityState={{ expanded: aperto }}
            style={({ pressed }) => [stili.apri, pressed && stili.apriPremuto]}
          >
            <Text style={stili.apriTesto}>{ETICHETTE.apriDettaglio}</Text>
            <Feather
              name={aperto ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORI.verdeScuro}
            />
          </Pressable>

          {aperto ? (
            <View style={stili.dettaglio}>
              {vociDettaglio.map((voce) => (
                <View key={voce.etichetta} style={stili.riga}>
                  <Text style={stili.etichettaDettaglio}>{voce.etichetta}</Text>
                  <Text style={stili.valoreDettaglio}>{voce.valore}</Text>
                </View>
              ))}
              <Text style={stili.nota}>{ETICHETTE.stima}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    gap: SPAZIO.m,
    ...OMBRA.scheda,
  },
  riga: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.l,
  },
  etichetta: {
    fontFamily: FONT.testo,
    fontSize: 14,
    color: COLORI.fumo,
  },
  valore: {
    fontFamily: FONT.testoMedio,
    fontSize: 14.5,
    color: COLORI.inchiostro,
    fontVariant: ["tabular-nums"],
  },
  rigaTotale: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.l,
    borderTopWidth: 1,
    borderTopColor: COLORI.bordo,
    paddingTop: SPAZIO.m,
  },
  etichettaTotale: {
    fontFamily: FONT.testoMedio,
    fontSize: 15,
    color: COLORI.inchiostro,
  },
  valoreTotale: {
    fontFamily: FONT.display,
    fontSize: 30,
    color: COLORI.verde,
    fontVariant: ["tabular-nums"],
  },
  avanzo: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
  },
  avanzoTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.verdeScuro,
  },
  apri: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.xs,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  apriPremuto: {
    opacity: 0.7,
  },
  apriTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.verdeScuro,
  },
  dettaglio: {
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    gap: SPAZIO.s,
  },
  etichettaDettaglio: {
    fontFamily: FONT.testo,
    fontSize: 13,
    color: COLORI.fumo,
    flexShrink: 1,
  },
  valoreDettaglio: {
    fontFamily: FONT.testo,
    fontSize: 13,
    color: COLORI.inchiostro,
    fontVariant: ["tabular-nums"],
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORI.fumo2,
  },
});
