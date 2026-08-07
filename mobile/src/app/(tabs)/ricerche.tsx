/**
 * Le tue ricerche: ogni scheda mostra i limiti in pillole, si mette in
 * pausa con l'interruttore e si cancella con conferma. La creazione apre
 * il modale /ricerca/nuova (presentazione dichiarata nella radice).
 */
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Scheda from "@/components/Scheda";
import Titolo from "@/components/Titolo";
import Vuoto from "@/components/Vuoto";
import { cambiaStatoRicerca, caricaRicerche, eliminaRicerca } from "@/lib/dati";
import { euro, oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO, TINTE_TIPO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Ricerca } from "@/lib/tipi";

// Aria sotto l'ultimo elemento: la barra tab è una pillola flottante
// assoluta, il contenuto non deve finirci dietro (stesso valore del feed).
const ARIA_BARRA = 116;

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

const S = TESTI.ricerche.scheda;

function testoNotti(min: number, max: number): string {
  if (min === max) return min === 1 ? S.unaNotte : riempi(S.nottiUguali, { n: min });
  return riempi(S.notti, { min, max });
}

export default function Ricerche() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const T = TESTI.ricerche;

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [aggiorno, setAggiorno] = useState(false);
  const [ricerche, setRicerche] = useState<Ricerca[]>([]);
  // La ricerca su cui c'è una scrittura in corso: interruttore e cestino fermi.
  const [occupata, setOccupata] = useState<string | null>(null);
  const [avviso, setAvviso] = useState<string | null>(null);

  // Dopo il primo caricamento riuscito un aggiornamento fallito non butta
  // via la schermata: si tiene quello che c'è.
  const caricato = useRef(false);

  const carica = useCallback(async () => {
    try {
      const lista = await caricaRicerche();
      caricato.current = true;
      setRicerche(lista);
      setStato("pronto");
    } catch (e) {
      console.error("[ricerche] caricamento fallito:", e);
      if (!caricato.current) setStato("errore");
    }
  }, []);

  // Al ritorno dal modale di creazione la lista si riaggiorna da sola.
  useFocusEffect(
    useCallback(() => {
      void carica();
    }, [carica]),
  );

  const riprova = () => {
    setStato("caricamento");
    void carica();
  };

  const aggiorna = async () => {
    setAggiorno(true);
    await carica();
    setAggiorno(false);
  };

  const cambiaStato = async (r: Ricerca, attiva: boolean) => {
    if (occupata) return;
    setOccupata(r.id);
    setAvviso(null);
    const esito = await cambiaStatoRicerca(r.id, attiva);
    if (esito.errore) {
      setAvviso(esito.errore);
    } else {
      setRicerche((prima) => prima.map((x) => (x.id === r.id ? { ...x, attiva } : x)));
    }
    setOccupata(null);
  };

  const cancella = async (r: Ricerca) => {
    setOccupata(r.id);
    setAvviso(null);
    const esito = await eliminaRicerca(r.id);
    if (esito.errore) {
      setAvviso(esito.errore);
    } else {
      setRicerche((prima) => prima.filter((x) => x.id !== r.id));
    }
    setOccupata(null);
  };

  const chiediCancella = (r: Ricerca) => {
    if (occupata) return;
    Alert.alert(T.azioni.confermaTitolo, T.azioni.confermaCancella, [
      { text: TESTI.comune.annulla, style: "cancel" },
      { text: T.azioni.cancella, style: "destructive", onPress: () => void cancella(r) },
    ]);
  };

  const nuova = () => router.push("/ricerca/nuova");

  return (
    <View style={stili.schermo}>
      <ScrollView
        contentContainerStyle={[
          stili.contenuto,
          {
            paddingTop: insets.top + SPAZIO.l,
            paddingBottom: insets.bottom + ARIA_BARRA,
          },
        ]}
        refreshControl={
          stato === "pronto" ? (
            <RefreshControl
              refreshing={aggiorno}
              onRefresh={() => void aggiorna()}
              tintColor={COLORI.verde}
              colors={[COLORI.verde]}
            />
          ) : undefined
        }
      >
        <View style={stili.testata}>
          <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} />
        </View>

        {avviso ? (
          <Text accessibilityLiveRegion="polite" style={stili.messaggioErrore}>
            {avviso}
          </Text>
        ) : null}

        {stato === "caricamento" ? (
          <View style={stili.centro}>
            <ActivityIndicator size="large" color={COLORI.verde} />
            <Text style={stili.nota}>{TESTI.comune.caricamento}</Text>
          </View>
        ) : null}

        {stato === "errore" ? (
          <View style={stili.centro}>
            <Text style={stili.messaggioErrore}>{TESTI.errori.generico}</Text>
            <Bottone testo={TESTI.comune.riprova} onPress={riprova} variante="vetro" />
          </View>
        ) : null}

        {stato === "pronto" && ricerche.length === 0 ? (
          <Vuoto
            titolo={T.vuoto.titolo}
            testo={T.vuoto.testo}
            azione={nuova}
            testoAzione={T.vuoto.azione}
          />
        ) : null}

        {stato === "pronto" && ricerche.length > 0 ? (
          <>
            {ricerche.map((r) => {
              const ferma = occupata === r.id;
              const pillole = [
                riempi(S.finoA, { soglia: euro(r.budget_max_persona) }),
                riempi(S.maxAuto, { ore: oreLeggibili(r.ore_viaggio_max) }),
                testoNotti(r.notti_min, r.notti_max),
                r.persone === 1 ? S.unaPersona : riempi(S.persone, { n: r.persone }),
              ];
              return (
                <Scheda key={r.id} stile={stili.scheda}>
                  <View style={stili.rigaStato}>
                    <View style={stili.statoGruppo}>
                      <View
                        style={[
                          stili.pallino,
                          { backgroundColor: r.attiva ? COLORI.verde : COLORI.fumo2 },
                        ]}
                      />
                      <Text style={stili.statoTesto}>
                        {r.attiva ? T.stato.inAscolto : T.stato.inPausa}
                      </Text>
                      {ferma ? <ActivityIndicator size="small" color={COLORI.verde} /> : null}
                    </View>
                    <Switch
                      value={r.attiva}
                      onValueChange={(attiva) => void cambiaStato(r, attiva)}
                      disabled={ferma}
                      trackColor={{ false: COLORI.bordo, true: COLORI.verde }}
                      thumbColor={COLORI.bianco}
                      ios_backgroundColor={COLORI.bordo}
                      accessibilityLabel={r.attiva ? T.azioni.pausa : T.azioni.riprendi}
                    />
                  </View>

                  <View style={[stili.pillole, !r.attiva && stili.spenta]}>
                    {pillole.map((testo) => (
                      <View key={testo} style={stili.pillola}>
                        <Text style={stili.pillolaTesto}>{testo}</Text>
                      </View>
                    ))}
                    {r.tipi.length === 0 ? (
                      <View style={stili.pillola}>
                        <Text style={stili.pillolaTesto}>{S.tuttiITipi}</Text>
                      </View>
                    ) : (
                      r.tipi.map((tipo) => {
                        const tinta = TINTE_TIPO[tipo];
                        return (
                          <View key={tipo} style={[stili.pillola, { backgroundColor: tinta.fondo }]}>
                            <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
                              {tinta.nome}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>

                  <Pressable
                    onPress={() => chiediCancella(r)}
                    disabled={ferma}
                    accessibilityRole="button"
                    accessibilityLabel={T.azioni.cancella}
                    style={({ pressed }) => [stili.cancella, pressed && stili.cancellaPremuto]}
                  >
                    <Feather name="trash-2" size={15} color={COLORI.fumo} />
                    <Text style={stili.cancellaTesto}>{T.azioni.cancella}</Text>
                  </Pressable>
                </Scheda>
              );
            })}

            <Bottone testo={T.nuovaBottone} icona="plus" onPress={nuova} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const stili = StyleSheet.create({
  schermo: {
    flex: 1,
    backgroundColor: COLORI.nebbia,
  },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    gap: SPAZIO.l,
  },
  testata: {
    marginBottom: SPAZIO.s,
  },
  centro: {
    alignItems: "center",
    paddingVertical: SPAZIO.xxl,
    gap: SPAZIO.l,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.fumo2,
  },
  messaggioErrore: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.errore,
    textAlign: "center",
  },
  scheda: {
    gap: SPAZIO.m,
  },
  rigaStato: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  statoGruppo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
  },
  pallino: {
    width: 8,
    height: 8,
    borderRadius: RAGGIO.pillola,
  },
  statoTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.inchiostro,
  },
  pillole: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
  },
  // In pausa i limiti restano leggibili ma si vede che non ascoltano.
  spenta: {
    opacity: 0.55,
  },
  pillola: {
    backgroundColor: COLORI.nebbia2,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
    alignSelf: "flex-start",
  },
  pillolaTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    color: COLORI.fumo,
  },
  cancella: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  cancellaPremuto: {
    opacity: 0.6,
  },
  cancellaTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.fumo,
  },
});
