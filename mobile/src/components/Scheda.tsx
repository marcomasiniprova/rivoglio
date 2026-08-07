import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { COLORI, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";

type Props = {
  children: ReactNode;
  /** Colore di fondo alternativo (un token di COLORI o di TINTE_TIPO). */
  su?: string;
  stile?: StyleProp<ViewStyle>;
};

export default function Scheda({ children, su, stile }: Props) {
  return (
    <View style={[stili.scheda, su ? { backgroundColor: su } : null, stile]}>
      {children}
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
});
