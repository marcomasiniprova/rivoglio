import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";

type Variante = "pieno" | "vetro" | "fantasma";

type Props = {
  testo: string;
  onPress: () => void;
  variante?: Variante;
  disabilitato?: boolean;
  caricamento?: boolean;
  icona?: ComponentProps<typeof Feather>["name"];
};

// Il vetro del sito (.vetro-bottone in globals.css): bianco semitrasparente
// con bordo chiaro. Le percentuali sono alpha sul token, non colori nuovi.
const VETRO_FONDO = COLORI.bianco + "A6";
const VETRO_BORDO = COLORI.bianco + "D9";

const COLORE_TESTO: Record<Variante, string> = {
  pieno: COLORI.bianco,
  vetro: COLORI.inchiostro,
  fantasma: COLORI.verdeScuro,
};

export default function Bottone({
  testo,
  onPress,
  variante = "pieno",
  disabilitato,
  caricamento,
  icona,
}: Props) {
  const spento = !!disabilitato || !!caricamento;
  const colore = COLORE_TESTO[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={spento}
      accessibilityRole="button"
      accessibilityLabel={testo}
      accessibilityState={{ disabled: spento, busy: !!caricamento }}
      style={({ pressed }) => [
        stili.base,
        stili[variante],
        pressed && !spento && stili.premuto,
        disabilitato && stili.disabilitato,
      ]}
    >
      {caricamento ? (
        <ActivityIndicator size="small" color={colore} />
      ) : (
        <>
          {icona ? <Feather name={icona} size={18} color={colore} /> : null}
          <Text style={[stili.testo, { color: colore }]}>{testo}</Text>
        </>
      )}
    </Pressable>
  );
}

const stili = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPAZIO.s,
    // Area di tocco minima consigliata dalle linee guida iOS e Android.
    minHeight: 48,
    paddingVertical: SPAZIO.m,
    paddingHorizontal: SPAZIO.xl,
    borderRadius: RAGGIO.bottone,
  },
  pieno: {
    backgroundColor: COLORI.verde,
    ...OMBRA.bottone,
  },
  vetro: {
    backgroundColor: VETRO_FONDO,
    borderWidth: 1,
    borderColor: VETRO_BORDO,
    ...OMBRA.scheda,
  },
  fantasma: {
    backgroundColor: "transparent",
  },
  premuto: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabilitato: {
    opacity: 0.5,
  },
  testo: {
    fontFamily: FONT.testoMedio,
    fontSize: 15,
  },
});
