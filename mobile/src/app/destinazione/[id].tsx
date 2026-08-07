/**
 * Il dettaglio di una destinazione: il conto intero, riga per riga, con il
 * dettaglio auto apribile. All'apertura si registra la prima lettura
 * (segnaAperta) e il bottone porta alla pagina vera della struttura.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BadgeDemo from "@/components/BadgeDemo";
import Bottone from "@/components/Bottone";
import ContoAperto from "@/components/ContoAperto";
import Scheda from "@/components/Scheda";
import {
  caricaDestinazioni,
  caricaProfilo,
  caricaRicerche,
  segnaAperta,
} from "@/lib/dati";
import { dataBreve, euro } from "@/lib/formati";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO, TINTE_TIPO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Destinazione, Profilo, Ricerca } from "@/lib/tipi";
import { contoViaggio } from "@/motore/viaggio";

/**
 * Media nazionale self service, osservatorio MIMIT del 06/08/2026: lo stesso
 * valore fermo del sito e del feed. Da sostituire col lettore MIMIT quando
 * arriva (ARRETRATI.md); fino ad allora il valore è dichiarato, non nascosto.
 */
const PREZZO_BENZINA = 1.994;

// Alpha sul token bianco, come nelle pillole di SchedaDestinazione.
const PILLOLA_FONDO = COLORI.bianco + "B3";

const MS_NOTTE = 86_400_000;

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

type Carico = {
  destinazione: Destinazione;
  profilo: Profilo;
  ricerca: Ricerca | null;
};

export default function DettaglioDestinazione() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [carico, setCarico] = useState<Carico | null>(null);
  const [apro, setApro] = useState(false);

  // La prima lettura si registra una volta sola, anche se si ricarica.
  const segnata = useRef(false);

  const carica = useCallback(async () => {
    if (!id) {
      setStato("errore");
      return;
    }
    try {
      const [profilo, ricerche, destinazioni] = await Promise.all([
        caricaProfilo(),
        caricaRicerche(),
        caricaDestinazioni(),
      ]);
      const destinazione = destinazioni.find((d) => d.id === id) ?? null;
      if (!profilo || !destinazione) {
        setStato("errore");
        return;
      }
      // L'invio non porta con sé la sua ricerca: soglia e persone vengono
      // dalla prima ricerca attiva, o dalla più recente.
      const ricerca = ricerche.find((r) => r.attiva) ?? ricerche[0] ?? null;
      setCarico({ destinazione, profilo, ricerca });
      setStato("pronto");
      if (!segnata.current) {
        segnata.current = true;
        void segnaAperta(destinazione.id);
      }
    } catch (e) {
      console.error("[destinazione] caricamento fallito:", e);
      setStato("errore");
    }
  }, [id]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const riprova = () => {
    setStato("caricamento");
    void carica();
  };

  const indietro = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const conti = useMemo(() => {
    if (!carico) return null;
    const { destinazione, profilo, ricerca } = carico;
    const persone = ricerca?.persone ?? 1;
    const alloggio = destinazione.offerta.prezzo_alloggio / persone;
    const conto =
      profilo.lat !== null && profilo.lng !== null
        ? contoViaggio({
            da: { lat: profilo.lat, lng: profilo.lng },
            a: { lat: destinazione.offerta.lat, lng: destinazione.offerta.lng },
            persone,
            prezzoBenzina: PREZZO_BENZINA,
          })
        : null;
    const notti = Math.max(
      1,
      Math.round(
        (Date.parse(destinazione.offerta.check_out) -
          Date.parse(destinazione.offerta.check_in)) /
          MS_NOTTE,
      ),
    );
    return {
      persone,
      alloggio,
      conto,
      notti,
      totale: alloggio + (conto?.aPersona ?? 0),
    };
  }, [carico]);

  const apriOfferta = async () => {
    if (!carico) return;
    setApro(true);
    try {
      await openBrowserAsync(carico.destinazione.offerta.link);
    } catch (e) {
      // Il browser non è partito: il link resta lì, si può ripremere.
      console.error("[destinazione] browser non aperto:", e);
    } finally {
      setApro(false);
    }
  };

  const offerta = carico?.destinazione.offerta;
  const tinta = offerta ? TINTE_TIPO[offerta.tipo] : null;

  return (
    <View style={stili.schermo}>
      <ScrollView
        contentContainerStyle={[
          stili.contenuto,
          {
            paddingTop: insets.top + SPAZIO.m,
            paddingBottom: insets.bottom + SPAZIO.xxl,
          },
        ]}
      >
        <Pressable
          onPress={indietro}
          accessibilityRole="button"
          accessibilityLabel={TESTI.comune.indietro}
          style={({ pressed }) => [stili.indietro, pressed && stili.indietroPremuto]}
        >
          <Feather name="chevron-left" size={22} color={COLORI.inchiostro} />
        </Pressable>

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

        {stato === "pronto" && carico && conti && offerta && tinta ? (
          <>
            <View style={[stili.eroe, { backgroundColor: tinta.fondo }]}>
              <View style={stili.rigaEroe}>
                <View style={stili.pillola}>
                  <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
                    {tinta.nome}
                  </Text>
                </View>
                {carico.destinazione.demo ? <BadgeDemo /> : null}
              </View>
              <Text style={[stili.comune, { color: tinta.testo }]}>{offerta.comune}</Text>
              <Text style={[stili.struttura, { color: tinta.testo }]}>
                {offerta.struttura}
              </Text>
              <View style={stili.pillole}>
                {[
                  riempi(TESTI.destinazioni.date, {
                    arrivo: dataBreve(offerta.check_in),
                    ritorno: dataBreve(offerta.check_out),
                  }),
                  conti.notti === 1
                    ? TESTI.ricerche.scheda.unaNotte
                    : riempi(TESTI.ricerche.scheda.nottiUguali, { n: conti.notti }),
                  riempi(TESTI.destinazioni.alloggioIntero, {
                    prezzo: euro(offerta.prezzo_alloggio),
                  }),
                ].map((testo) => (
                  <View key={testo} style={stili.pillola}>
                    <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>{testo}</Text>
                  </View>
                ))}
              </View>
            </View>

            {conti.conto && carico.ricerca ? (
              <>
                <ContoAperto
                  alloggio={conti.alloggio}
                  auto={conti.conto.aPersona}
                  totale={conti.totale}
                  soglia={carico.ricerca.budget_max_persona}
                  persone={conti.persone}
                  km={conti.conto.kmSolaAndata}
                  ore={conti.conto.ore}
                  dettaglio={{
                    litri: conti.conto.litri,
                    benzina: conti.conto.benzina,
                    pedaggi: conti.conto.pedaggi,
                  }}
                />
                <Text style={stili.nota}>{TESTI.destinazioni.stimaAuto}</Text>
              </>
            ) : (
              <Scheda stile={stili.contoSemplice}>
                <View style={stili.riga}>
                  <Text style={stili.etichetta}>{TESTI.destinazioni.alloggioATesta}</Text>
                  <Text style={stili.valore}>{euro(conti.alloggio)}</Text>
                </View>
                {conti.conto ? (
                  <>
                    <View style={stili.riga}>
                      <Text style={stili.etichetta}>{TESTI.destinazioni.autoATesta}</Text>
                      <Text style={stili.valore}>{euro(conti.conto.aPersona)}</Text>
                    </View>
                    <View style={stili.riga}>
                      <Text style={stili.etichetta}>{TESTI.destinazioni.totaleATesta}</Text>
                      <Text style={stili.valore}>{euro(conti.totale)}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={stili.nota}>{TESTI.destinazioni.senzaPartenza}</Text>
                )}
              </Scheda>
            )}

            <View style={stili.azioni}>
              <Bottone
                testo={TESTI.destinazioni.vediOfferta}
                icona="external-link"
                onPress={() => void apriOfferta()}
                caricamento={apro}
              />
              <Text style={stili.nota}>{TESTI.destinazioni.avvisoPrezzo}</Text>
            </View>
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
  indietro: {
    width: 44,
    height: 44,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.bianco,
    alignItems: "center",
    justifyContent: "center",
    ...OMBRA.scheda,
  },
  indietroPremuto: {
    opacity: 0.7,
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
  eroe: {
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    gap: SPAZIO.s,
    ...OMBRA.scheda,
  },
  rigaEroe: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPAZIO.xs,
  },
  comune: {
    fontFamily: FONT.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.4,
  },
  struttura: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    opacity: 0.75,
  },
  pillole: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
    marginTop: SPAZIO.s,
  },
  pillola: {
    backgroundColor: PILLOLA_FONDO,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
    alignSelf: "flex-start",
  },
  pillolaTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
  },
  contoSemplice: {
    gap: SPAZIO.m,
  },
  riga: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.l,
  },
  etichetta: {
    fontFamily: FONT.testo,
    fontSize: 14,
    color: COLORI.fumo,
  },
  valore: {
    fontFamily: FONT.testoMedio,
    fontSize: 14.5,
    color: COLORI.inchiostro,
    fontVariant: ["tabular-nums"],
  },
  azioni: {
    gap: SPAZIO.m,
    marginTop: SPAZIO.s,
  },
});
