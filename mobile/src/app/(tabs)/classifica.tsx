/**
 * LA CLASSIFICA: chi si è ripreso più soldi con Rivolio.
 *
 * Richiesta di Valerio (8/08): una gara vera, che dia il senso di
 * un'app che aiuta a riprendersi dei soldi, non di un giochino. Regole
 * non negoziabili, scelte col popup:
 * - i numeri sono VERI: solo pratiche pagate dalla compagnia, fasce del
 *   Regolamento. Se i dati sono d'esempio, c'è scritto sopra;
 * - compare SOLO chi ha scelto un nome pubblico e ha detto sì (opt-in);
 * - al lancio sta SPENTA finché non ci sono vincite vere: la accende il
 *   server, e questa tab compare da sola.
 */
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Titolo from "@/components/Titolo";
import Vuoto from "@/components/Vuoto";
import { classifica, type VoceClassifica } from "@/lib/api";
import { leggiProfilo } from "@/lib/profilo";
import { useSessione } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.classifica;
const ARIA_BARRA = 116;

const iniziali = (nickname: string) =>
  nickname.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "??";

/** "1200" → "1.200€": il punto delle migliaia all'italiana. */
const inEuro = (n: number) => `${n.toLocaleString("it-IT")}€`;

export default function SchermataClassifica() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { utente } = useSessione();

  const [voci, setVoci] = useState<VoceClassifica[]>([]);
  const [demo, setDemo] = useState(false);
  const [mioNome, setMioNome] = useState<string | null>(null);
  const [aggiorno, setAggiorno] = useState(false);

  const carica = useCallback(async () => {
    const esito = await classifica();
    if (esito.attiva) {
      setVoci(esito.voci);
      setDemo(esito.demo);
    }
    if (utente) {
      const p = await leggiProfilo();
      setMioNome(p?.nickname ?? null);
    } else {
      setMioNome(null);
    }
  }, [utente]);

  useFocusEffect(
    useCallback(() => {
      void carica();
    }, [carica]),
  );

  const aggiorna = async () => {
    setAggiorno(true);
    await carica();
    setAggiorno(false);
  };

  const podio = voci.slice(0, 3);
  const resto = voci.slice(3);
  /* Sul podio il primo sta AL CENTRO, più in alto: secondo a sinistra,
     terzo a destra. È la forma che tutti riconoscono. */
  const ordinePodio = [podio[1], podio[0], podio[2]].filter(Boolean) as VoceClassifica[];
  const sonoInClassifica = mioNome !== null && voci.some((v) => v.nickname === mioNome);

  return (
    <ScrollView
      style={stili.schermo}
      contentContainerStyle={[
        stili.contenuto,
        { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + ARIA_BARRA },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={aggiorno}
          onRefresh={() => void aggiorna()}
          tintColor={COLORI.verde}
          colors={[COLORI.verde]}
        />
      }
    >
      <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} />
      <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

      {demo && (
        <View style={stili.demo}>
          <Feather name="info" size={13} color={COLORI.fumo} />
          <Text style={stili.demoTesto}>{T.demo}</Text>
        </View>
      )}

      {voci.length === 0 ? (
        <Vuoto
          titolo={T.vuota.titolo}
          testo={T.vuota.testo}
          azione={() => router.navigate("/")}
          testoAzione={T.vuota.azione}
        />
      ) : (
        <>
          {/* ------------------------------------------------ il podio */}
          <View style={stili.podio}>
            {ordinePodio.map((v) => {
              const primo = v.posizione === 1;
              const mio = v.nickname === mioNome;
              return (
                <View key={v.posizione} style={[stili.gradino, primo && stili.gradinoPrimo]}>
                  {primo && (
                    <View style={stili.corona}>
                      <Feather name="award" size={15} color={COLORI.sole} />
                    </View>
                  )}
                  <View
                    style={[
                      stili.cerchio,
                      primo && stili.cerchioPrimo,
                      mio && stili.cerchioMio,
                    ]}
                  >
                    <Text style={[stili.cerchioTesto, primo && stili.cerchioTestoPrimo]}>
                      {iniziali(v.nickname)}
                    </Text>
                  </View>
                  <Text style={stili.podioNome} numberOfLines={1}>
                    {v.nickname}
                  </Text>
                  <Text style={[stili.podioTotale, primo && stili.podioTotalePrimo]}>
                    {inEuro(v.totale)}
                  </Text>
                  <View style={[stili.base, primo && stili.basePrima]}>
                    <Text style={[stili.baseNumero, primo && stili.baseNumeroPrimo]}>
                      {v.posizione}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ------------------------------------------------ la lista */}
          {resto.length > 0 && (
            <View style={stili.lista}>
              {resto.map((v, i) => {
                const mio = v.nickname === mioNome;
                return (
                  <View
                    key={v.posizione}
                    style={[
                      stili.riga,
                      i < resto.length - 1 && stili.rigaBordo,
                      mio && stili.rigaMia,
                    ]}
                  >
                    <Text style={stili.posizione}>{v.posizione}</Text>
                    <View style={[stili.rigaCerchio, mio && stili.cerchioMio]}>
                      <Text style={stili.rigaCerchioTesto}>{iniziali(v.nickname)}</Text>
                    </View>
                    <Text style={stili.rigaNome} numberOfLines={1}>
                      {v.nickname}
                      {mio ? `  ·  ${T.tu}` : ""}
                    </Text>
                    <Text style={stili.rigaTotale}>{inEuro(v.totale)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* ---------------------------------------- l'invito a esserci */}
      {utente && !sonoInClassifica && (
        <View style={stili.invito}>
          <Text style={stili.invitoTitolo}>{T.entra.titolo}</Text>
          <Text style={stili.invitoTesto}>{T.entra.testo}</Text>
          <Text
            style={stili.invitoAzione}
            onPress={() => router.push("/modifica-profilo")}
            accessibilityRole="link"
          >
            {T.entra.azione}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  schermo: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, gap: SPAZIO.l },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: -SPAZIO.s,
  },
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    backgroundColor: COLORI.nebbia2,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.s,
  },
  demoTesto: { flex: 1, fontFamily: FONT.testoMedio, fontSize: 12, color: COLORI.fumo },
  podio: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: SPAZIO.m,
    marginTop: SPAZIO.s,
  },
  gradino: { alignItems: "center", flex: 1, maxWidth: 110 },
  gradinoPrimo: {},
  corona: { marginBottom: SPAZIO.xs },
  cerchio: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORI.bianco,
    borderWidth: 2,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  cerchioPrimo: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderColor: COLORI.sole,
  },
  cerchioMio: { borderColor: COLORI.verde },
  cerchioTesto: { fontFamily: FONT.display, fontSize: 18, color: COLORI.inchiostro },
  cerchioTestoPrimo: { fontSize: 22 },
  podioNome: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
    maxWidth: 104,
  },
  podioTotale: { fontFamily: FONT.testoSemi, fontSize: 13.5, color: COLORI.verdeScuro, marginTop: 1 },
  podioTotalePrimo: { fontSize: 15.5 },
  base: {
    width: "100%",
    height: 44,
    borderTopLeftRadius: RAGGIO.campo,
    borderTopRightRadius: RAGGIO.campo,
    backgroundColor: COLORI.nebbia2,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPAZIO.s,
  },
  basePrima: { height: 66, backgroundColor: COLORI.mentaTenue, borderColor: COLORI.menta },
  baseNumero: { fontFamily: FONT.display, fontSize: 20, color: COLORI.fumo },
  baseNumeroPrimo: { fontSize: 26, color: COLORI.verdeScuro },
  lista: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    ...OMBRA.scheda,
  },
  riga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    minHeight: 56,
  },
  rigaBordo: { borderBottomWidth: 1, borderBottomColor: COLORI.bordo },
  rigaMia: { backgroundColor: COLORI.mentaTenue },
  posizione: {
    width: 22,
    fontFamily: FONT.testoSemi,
    fontSize: 13.5,
    color: COLORI.fumo,
    textAlign: "center",
  },
  rigaCerchio: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  rigaCerchioTesto: { fontFamily: FONT.testoSemi, fontSize: 12.5, color: COLORI.inchiostro },
  rigaNome: { flex: 1, fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro },
  rigaTotale: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.verdeScuro },
  invito: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
  invitoTitolo: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.inchiostro },
  invitoTesto: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  invitoAzione: {
    fontFamily: FONT.testoMedio,
    fontSize: 14,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.m,
  },
});
