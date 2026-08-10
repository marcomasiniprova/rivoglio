/**
 * CHI HA OPERATO IL VOLO (tavola 6c): la domanda che chiude il codeshare.
 *
 * Quando il fornitore non sa chi ha fatto volare l'aereo, il motore si
 * ferma: il reclamo deve andare al vettore operativo. Ma quella risposta
 * l'utente ce l'ha sulla carta d'imbarco ("operato da"). Qui gliela
 * chiediamo, a scelta CHIUSA sulle compagnie che conosciamo: il verdetto
 * resta del server, questa scheda spedisce solo la risposta.
 * La parola "codeshare" non compare mai.
 */
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Bottone from "@/components/Bottone";
import { cercaVettori, dichiaraOperativo, type VettoreTrovato } from "@/lib/api";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.operato;

type Props = { volo: string; dataIso: string; verificaId: string | null };

export default function ChiHaOperato({ volo, dataIso, verificaId }: Props) {
  const router = useRouter();
  const [testo, setTesto] = useState("");
  const [proposte, setProposte] = useState<VettoreTrovato[]>([]);
  const [scelto, setScelto] = useState<VettoreTrovato | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const ultima = useRef(0);

  useEffect(() => {
    if (scelto || testo.trim().length < 2) return;
    const id = ++ultima.current;
    const timer = setTimeout(async () => {
      const trovate = await cercaVettori(testo);
      if (id === ultima.current) setProposte(trovate.slice(0, 5));
    }, 300);
    return () => clearTimeout(timer);
  }, [testo, scelto]);

  async function conferma() {
    if (!scelto) return;
    setErrore(null);
    setInCorso(true);
    const esito = await dichiaraOperativo(volo, dataIso, scelto.iata, verificaId);
    setInCorso(false);
    if (!esito.ok) {
      setErrore(esito.errore);
      return;
    }
    /* Il verdetto nuovo sostituisce quello fermo: stessa schermata,
       parametri aggiornati dal server. */
    router.replace({
      pathname: "/verdetto",
      params: {
        volo,
        data: dataIso,
        id: esito.id ?? "",
        esito: esito.esito,
        motivo: esito.motivo,
        importo: String(esito.importo ?? ""),
        ritardo: String(esito.ritardoMinuti ?? ""),
        da: esito.dato.da ?? "",
        a: esito.dato.a ?? "",
        previsto: esito.dato.previsto ?? "",
        effettivo: esito.dato.effettivo ?? "",
        km: String(esito.dato.km ?? ""),
        demo: esito.demo ? "1" : "",
      },
    });
  }

  return (
    <View style={stili.scheda}>
      <Text style={stili.occhiello}>{T.occhiello.toUpperCase()}</Text>
      <Text style={stili.titolo}>{T.titolo}</Text>
      <Text style={stili.testo}>{T.testo}</Text>

      <View style={stili.aiuto}>
        <Text style={stili.aiutoTesto}>{T.aiuto}</Text>
      </View>

      {scelto ? (
        <Pressable onPress={() => setScelto(null)} style={stili.sceltoRiga} accessibilityRole="button">
          <View style={stili.sceltoTesti}>
            <Text style={stili.sceltoNome}>{scelto.nome}</Text>
            <Text style={stili.sceltoPaese}>{scelto.paese}</Text>
          </View>
          <Text style={stili.sceltoCambia}>{TESTI.comune.annulla}</Text>
        </Pressable>
      ) : (
        <>
          <Text style={stili.etichetta}>{T.campo}</Text>
          <TextInput
            value={testo}
            onChangeText={setTesto}
            placeholder="air"
            placeholderTextColor={COLORI.fumo2}
            style={stili.campo}
            autoCapitalize="none"
          />
          {proposte.map((v) => (
            <Pressable
              key={v.iata}
              onPress={() => {
                setScelto(v);
                setProposte([]);
              }}
              accessibilityRole="button"
              style={stili.proposta}
            >
              <Text style={stili.propostaNome}>{v.nome}</Text>
              <Text style={stili.propostaPaese}>{v.paese}</Text>
            </Pressable>
          ))}
        </>
      )}

      {errore && (
        <Text style={stili.errore} accessibilityRole="alert">
          {errore}
        </Text>
      )}

      {inCorso && !errore ? (
        <ActivityIndicator color={COLORI.verde} style={{ marginTop: SPAZIO.m }} />
      ) : null}

      <View style={stili.azioni}>
        <Bottone testo={T.conferma} onPress={() => void conferma()} disabilitato={!scelto} caricamento={inCorso} />
      </View>
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
    ...OMBRA.scheda,
  },
  occhiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORI.verdeScuro,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  aiuto: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.m,
  },
  aiutoTesto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.verdeNotte,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
  },
  campo: {
    borderWidth: 1.5,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    fontFamily: FONT.testo,
    fontSize: 15,
    color: COLORI.inchiostro,
    backgroundColor: COLORI.bianco,
    marginTop: SPAZIO.s,
  },
  proposta: {
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.minimo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    marginTop: SPAZIO.s,
  },
  propostaNome: { fontFamily: FONT.testoSemi, fontSize: 14, color: COLORI.inchiostro },
  propostaPaese: { fontFamily: FONT.testo, fontSize: 12, color: COLORI.fumo2, marginTop: 1 },
  sceltoRiga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.interno,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
  },
  sceltoTesti: { flex: 1 },
  sceltoNome: { fontFamily: FONT.testoSemi, fontSize: 15, color: COLORI.inchiostro },
  sceltoPaese: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo, marginTop: 1 },
  sceltoCambia: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro },
  errore: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.errore, marginTop: SPAZIO.m },
  azioni: { marginTop: SPAZIO.l },
});
