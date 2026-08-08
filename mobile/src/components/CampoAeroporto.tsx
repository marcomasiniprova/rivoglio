/**
 * IL CAMPO "DA DOVE SEI PARTITO".
 *
 * Si scrive il nome della città come viene: "Roma", "Orio", "bergamo",
 * "BGY". Sotto compaiono gli aeroporti che corrispondono e se ne tocca
 * uno. Niente codici da sapere a memoria, niente elenchi a tendina da
 * scorrere: si scrive e si tocca.
 *
 * Regola del progetto (utente medio): non si chiede mai un dato che la
 * persona non ha in testa. La città ce l'ha; il codice IATA no.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { cercaAeroporti, type AeroportoTrovato } from "@/lib/api";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";

/* Si aspetta un attimo dopo l'ultima lettera: senza, si manderebbe una
   richiesta per ogni tasto premuto. */
const ATTESA_MS = 280;

type Props = {
  etichetta: string;
  segnaposto: string;
  scelto: AeroportoTrovato | null;
  onScegli: (a: AeroportoTrovato | null) => void;
};

export default function CampoAeroporto({ etichetta, segnaposto, scelto, onScegli }: Props) {
  const [testo, setTesto] = useState("");
  const [focalizzato, setFocalizzato] = useState(false);
  /* La risposta si tiene INSIEME alla domanda che l'ha prodotta: così una
     risposta vecchia non si spaccia per quella nuova mentre si scrive, e
     non serve azzerare niente a mano. */
  const [risposta, setRisposta] = useState<{ q: string; lista: AeroportoTrovato[] }>({
    q: "",
    lista: [],
  });

  const domanda = testo.trim();
  const attiva = !scelto && domanda.length >= 2;
  const aggiornata = risposta.q === domanda;
  const proposte = attiva && aggiornata ? risposta.lista : [];
  const inCorso = attiva && !aggiornata;

  useEffect(() => {
    if (!attiva) return;
    let vivo = true;
    const timer = setTimeout(() => {
      void cercaAeroporti(domanda).then((lista) => {
        if (vivo) setRisposta({ q: domanda, lista });
      });
    }, ATTESA_MS);
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [domanda, attiva]);

  /* Scelto: il campo diventa una riga ferma con la città e il codice.
     Si cambia con la X, che è più chiara di un campo che si ripulisce da solo. */
  if (scelto) {
    return (
      <View>
        <Text style={stili.etichetta}>{etichetta}</Text>
        <View style={stili.sceltoRiga}>
          <View style={stili.sceltoTesti}>
            <Text style={stili.sceltoCitta}>
              {scelto.citta} <Text style={stili.sceltoCodice}>{scelto.iata}</Text>
            </Text>
            <Text style={stili.sceltoNome} numberOfLines={1}>
              {scelto.nome}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              onScegli(null);
              setTesto("");
            }}
            accessibilityRole="button"
            accessibilityLabel={`Cambia ${etichetta}`}
            hitSlop={10}
          >
            <Feather name="x" size={18} color={COLORI.fumo} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={stili.etichetta}>{etichetta}</Text>
      <View style={[stili.campoRiga, focalizzato && stili.campoAttivo]}>
        <Feather name="search" size={17} color={COLORI.fumo2} />
        <TextInput
          value={testo}
          onChangeText={setTesto}
          placeholder={segnaposto}
          placeholderTextColor={COLORI.fumo2}
          onFocus={() => setFocalizzato(true)}
          onBlur={() => setFocalizzato(false)}
          autoCorrect={false}
          autoCapitalize="words"
          accessibilityLabel={etichetta}
          style={stili.campo}
        />
        {inCorso && <ActivityIndicator size="small" color={COLORI.fumo2} />}
      </View>

      {proposte.length > 0 && (
        <View style={stili.proposte}>
          {proposte.map((a, i) => (
            <Pressable
              key={a.iata}
              onPress={() => onScegli(a)}
              accessibilityRole="button"
              style={[stili.proposta, i > 0 && stili.propostaSopra]}
            >
              <View style={stili.propostaTesti}>
                <Text style={stili.propostaCitta} numberOfLines={1}>
                  {a.citta}
                </Text>
                <Text style={stili.propostaNome} numberOfLines={1}>
                  {a.nome} · {a.paese}
                </Text>
              </View>
              <Text style={stili.propostaCodice}>{a.iata}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {attiva && aggiornata && proposte.length === 0 && (
        <Text style={stili.nulla}>
          Nessun aeroporto con questo nome. Prova con la città, per esempio Roma.
        </Text>
      )}
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
  campoRiga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    minHeight: 48,
  },
  campoAttivo: { borderColor: COLORI.verde },
  campo: {
    flex: 1,
    paddingVertical: SPAZIO.m,
    fontFamily: FONT.testo,
    fontSize: 15.5,
    color: COLORI.inchiostro,
  },
  proposte: {
    marginTop: SPAZIO.s,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    overflow: "hidden",
  },
  proposta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    minHeight: 52,
  },
  propostaSopra: { borderTopWidth: 1, borderTopColor: COLORI.bordo },
  propostaTesti: { flex: 1, minWidth: 0 },
  propostaCitta: { fontFamily: FONT.testoMedio, fontSize: 15, color: COLORI.inchiostro },
  propostaNome: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo, marginTop: 1 },
  propostaCodice: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    letterSpacing: 0.6,
    color: COLORI.verdeScuro,
  },
  nulla: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  sceltoRiga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    minHeight: 48,
  },
  sceltoTesti: { flex: 1, minWidth: 0 },
  sceltoCitta: { fontFamily: FONT.display, fontSize: 17, color: COLORI.inchiostro },
  sceltoCodice: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro },
  sceltoNome: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo, marginTop: 1 },
});
