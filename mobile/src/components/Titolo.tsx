import { StyleSheet, Text } from "react-native";
import { COLORI, FONT } from "@/lib/tema";

type Props = {
  prima: string;
  /** LA parola del titolo, una sola, nel corsivo del marchio. */
  corsivo: string;
  dopo?: string;
};

const TAGLIA = 28;
// Come la classe .corsivo del sito: il serif ha un'altezza-x più bassa,
// senza il +9% sembrerebbe più piccolo del resto della riga.
const TAGLIA_CORSIVO = Math.round(TAGLIA * 1.09);

export default function Titolo({ prima, corsivo, dopo }: Props) {
  return (
    <Text accessibilityRole="header" style={stili.riga}>
      {prima}{" "}
      <Text style={stili.corsivo}>{corsivo}</Text>
      {dopo ? ` ${dopo}` : ""}
    </Text>
  );
}

const stili = StyleSheet.create({
  riga: {
    fontFamily: FONT.display,
    fontSize: TAGLIA,
    lineHeight: TAGLIA_CORSIVO + 4,
    // La spaziatura dei titoli del marchio: -0.04em (BRAND.md).
    letterSpacing: TAGLIA * -0.04,
    color: COLORI.inchiostro,
  },
  corsivo: {
    fontFamily: FONT.corsivo,
    fontSize: TAGLIA_CORSIVO,
    letterSpacing: TAGLIA_CORSIVO * -0.012,
    color: COLORI.verdeScuro,
  },
});
