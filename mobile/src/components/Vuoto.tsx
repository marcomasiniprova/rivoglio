import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import Bottone from "./Bottone";

type Props = {
  titolo: string;
  testo: string;
  azione?: () => void;
  testoAzione?: string;
};

export default function Vuoto({ titolo, testo, azione, testoAzione }: Props) {
  return (
    <View style={stili.contenitore}>
      <View style={stili.cerchio}>
        <Feather name="sun" size={28} color={COLORI.verde} />
      </View>
      <Text style={stili.titolo}>{titolo}</Text>
      <Text style={stili.testo}>{testo}</Text>
      {azione && testoAzione ? (
        <View style={stili.azione}>
          <Bottone testo={testoAzione} onPress={azione} />
        </View>
      ) : null}
    </View>
  );
}

const stili = StyleSheet.create({
  contenitore: {
    alignItems: "center",
    paddingVertical: SPAZIO.xxl,
    paddingHorizontal: SPAZIO.xl,
  },
  cerchio: {
    width: 64,
    height: 64,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.mentaTenue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPAZIO.l,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 22,
    color: COLORI.inchiostro,
    textAlign: "center",
    marginBottom: SPAZIO.s,
  },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.fumo,
    textAlign: "center",
  },
  azione: {
    marginTop: SPAZIO.xl,
  },
});
