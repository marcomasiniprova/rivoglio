import { Pressable, StyleSheet, Text } from "react-native";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";

type Props = {
  testo: string;
  attivo: boolean;
  onPress: () => void;
  /** Coppia di TINTE_TIPO per i chip dei tipi. Senza, verde del marchio. */
  tinta?: { fondo: string; testo: string };
};

export default function Chip({ testo, attivo, onPress, tinta }: Props) {
  const fondoAttivo = tinta?.fondo ?? COLORI.mentaTenue;
  const testoAttivo = tinta?.testo ?? COLORI.verdeScuro;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={testo}
      accessibilityState={{ selected: attivo }}
      style={({ pressed }) => [
        stili.chip,
        attivo
          ? { backgroundColor: fondoAttivo, borderColor: fondoAttivo }
          : stili.spento,
        pressed && stili.premuto,
      ]}
    >
      <Text style={[stili.testo, { color: attivo ? testoAttivo : COLORI.fumo }]}>
        {testo}
      </Text>
    </Pressable>
  );
}

const stili = StyleSheet.create({
  chip: {
    borderRadius: RAGGIO.pillola,
    borderWidth: 1,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.s,
    alignSelf: "flex-start",
  },
  spento: {
    backgroundColor: COLORI.bianco,
    borderColor: COLORI.bordo,
  },
  premuto: {
    opacity: 0.8,
  },
  testo: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
  },
});
