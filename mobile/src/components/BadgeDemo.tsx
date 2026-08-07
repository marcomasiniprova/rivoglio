import { StyleSheet, Text, View } from "react-native";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";

/**
 * Pillola obbligatoria su ogni dato dimostrativo (regola CLAUDE.md #3):
 * niente dati finti che sembrano veri.
 */
export default function BadgeDemo() {
  return (
    <View
      accessibilityLabel="Dato dimostrativo"
      style={stili.pillola}
    >
      <Text style={stili.testo}>Demo</Text>
    </View>
  );
}

const stili = StyleSheet.create({
  pillola: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.s,
    paddingVertical: SPAZIO.xs,
    alignSelf: "flex-start",
  },
  testo: {
    fontFamily: FONT.testoSemi,
    fontSize: 11,
    color: COLORI.menta,
  },
});
