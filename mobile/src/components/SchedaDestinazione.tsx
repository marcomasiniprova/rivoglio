import { Pressable, StyleSheet, Text, View } from "react-native";
import { dataBreve, euro, oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO, TINTE_TIPO } from "@/lib/tema";
import type { Destinazione } from "@/lib/tipi";
import BadgeDemo from "./BadgeDemo";

type Props = {
  destinazione: Destinazione;
  /** Totale a persona, in euro, già calcolato dalla schermata. */
  totale: number;
  /** Quanto avanza sulla soglia, a persona. */
  avanzo: number;
  onPress: () => void;
  // Facoltative, fuori dalla firma del contratto: la scheda da sola non può
  // calcolarle (servono la ricerca e la partenza). Le pillole compaiono
  // solo se la schermata le passa.
  persone?: number;
  km?: number;
  ore?: number;
};

// Alpha sul token bianco, non un colore nuovo: le pillole devono leggersi
// su tutte le tinte di TINTE_TIPO.
const PILLOLA_FONDO = COLORI.bianco + "B3";

const MS_NOTTE = 86_400_000;

export default function SchedaDestinazione({
  destinazione,
  totale,
  avanzo,
  onPress,
  persone,
  km,
  ore,
}: Props) {
  const { offerta } = destinazione;
  const tinta = TINTE_TIPO[offerta.tipo];

  const notti = Math.max(
    1,
    Math.round(
      (Date.parse(offerta.check_out) - Date.parse(offerta.check_in)) / MS_NOTTE,
    ),
  );

  const pillole = [
    dataBreve(offerta.check_in),
    notti === 1 ? "1 notte" : `${notti} notti`,
    persone != null && persone > 1 ? `in ${persone}` : null,
    km != null ? `${Math.round(km)} km` : null,
    ore != null ? `${oreLeggibili(ore)} di auto` : null,
  ].filter((p): p is string => p !== null);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${offerta.comune}, ${offerta.struttura}, ${euro(totale)} a testa`}
      style={({ pressed }) => [
        stili.scheda,
        { backgroundColor: tinta.fondo },
        pressed && stili.premuta,
      ]}
    >
      <View style={stili.testata}>
        <View style={[stili.pillola, stili.pillolaTipo]}>
          <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
            {tinta.nome}
          </Text>
        </View>
        {destinazione.demo ? <BadgeDemo /> : null}
      </View>

      <Text style={[stili.comune, { color: tinta.testo }]}>
        {offerta.comune}
      </Text>
      <Text style={[stili.struttura, { color: tinta.testo }]}>
        {offerta.struttura}
      </Text>

      <View style={stili.pillole}>
        {pillole.map((pillola) => (
          <View key={pillola} style={stili.pillola}>
            <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
              {pillola}
            </Text>
          </View>
        ))}
      </View>

      <View style={stili.piede}>
        <View>
          <Text style={[stili.totaleEtichetta, { color: tinta.testo }]}>
            Totale a testa
          </Text>
          <Text style={[stili.totale, { color: tinta.testo }]}>
            {euro(totale)}
          </Text>
        </View>
        {avanzo > 0 ? (
          <View style={stili.avanzo}>
            <Text style={stili.avanzoTesto}>Ti avanzano {euro(avanzo)}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const stili = StyleSheet.create({
  scheda: {
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    gap: SPAZIO.s,
    ...OMBRA.scheda,
  },
  premuta: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  testata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPAZIO.xs,
  },
  comune: {
    fontFamily: FONT.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1.3,
  },
  struttura: {
    fontFamily: FONT.testo,
    fontSize: 14,
    opacity: 0.75,
  },
  pillole: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
    marginTop: SPAZIO.s,
  },
  pillola: {
    backgroundColor: PILLOLA_FONDO,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
  },
  pillolaTipo: {
    alignSelf: "flex-start",
  },
  pillolaTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
  },
  piede: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPAZIO.l,
    marginTop: SPAZIO.m,
  },
  totaleEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    opacity: 0.7,
  },
  totale: {
    fontFamily: FONT.display,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
  },
  avanzo: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
  },
  avanzoTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    color: COLORI.verdeScuro,
  },
});
