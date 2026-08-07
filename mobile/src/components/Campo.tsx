import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";

type Tipo = "email" | "password" | "numero" | "testo";

type Props = {
  etichetta: string;
  valore: string;
  onChange: (testo: string) => void;
  segnaposto?: string;
  tipo?: Tipo;
  errore?: string;
};

export default function Campo({
  etichetta,
  valore,
  onChange,
  segnaposto,
  tipo = "testo",
  errore,
}: Props) {
  const [focalizzato, setFocalizzato] = useState(false);

  const bordo = errore
    ? COLORI.errore
    : focalizzato
      ? COLORI.verde
      : COLORI.bordo;

  return (
    <View>
      <Text style={stili.etichetta}>{etichetta}</Text>
      <TextInput
        value={valore}
        onChangeText={onChange}
        placeholder={segnaposto}
        placeholderTextColor={COLORI.fumo2}
        onFocus={() => setFocalizzato(true)}
        onBlur={() => setFocalizzato(false)}
        secureTextEntry={tipo === "password"}
        keyboardType={
          tipo === "email"
            ? "email-address"
            : tipo === "numero"
              ? "number-pad"
              : "default"
        }
        autoCapitalize={tipo === "email" || tipo === "password" ? "none" : "sentences"}
        autoCorrect={tipo === "testo"}
        autoComplete={
          tipo === "email" ? "email" : tipo === "password" ? "password" : "off"
        }
        accessibilityLabel={etichetta}
        style={[stili.campo, { borderColor: bordo }]}
      />
      {errore ? (
        <Text accessibilityLiveRegion="polite" style={stili.errore}>
          {errore}
        </Text>
      ) : null}
    </View>
  );
}

const stili = StyleSheet.create({
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.inchiostro,
    marginBottom: SPAZIO.s,
  },
  campo: {
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    fontFamily: FONT.testo,
    fontSize: 15.5,
    color: COLORI.inchiostro,
    // Area di tocco minima consigliata dalle linee guida iOS e Android.
    minHeight: 48,
  },
  errore: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.errore,
    marginTop: SPAZIO.xs,
  },
});
