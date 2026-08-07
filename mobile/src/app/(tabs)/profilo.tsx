/**
 * Il profilo: crediti in grande con la loro spiegazione, partenza
 * modificabile dall'elenco PARTENZE, tetto settimanale con il più e il
 * meno, il pannello "Presto" per l'acquisto (onesto, senza bottoni finti)
 * e l'uscita dall'account.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import Chip from "@/components/Chip";
import Scheda from "@/components/Scheda";
import Titolo from "@/components/Titolo";
import { caricaProfilo, salvaPartenza, salvaTetto } from "@/lib/dati";
import { esci } from "@/lib/sessione";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Profilo } from "@/lib/tipi";
import { PARTENZE } from "@/motore/costruttore";

// Aria sotto l'ultimo elemento: la barra tab è una pillola flottante
// assoluta, il contenuto non deve finirci dietro (stesso valore del feed).
const ARIA_BARRA = 116;

/** Stessi limiti di dati.ts: al massimo una destinazione al giorno. */
const TETTO = { min: 1, max: 7 } as const;

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

export default function SchermataProfilo() {
  const insets = useSafeAreaInsets();
  const T = TESTI.profilo;

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [aggiorno, setAggiorno] = useState(false);
  const [profilo, setProfilo] = useState<Profilo | null>(null);

  // Partenza: l'elenco si apre con "Cambia" e si filtra scrivendo.
  const [scelgoPartenza, setScelgoPartenza] = useState(false);
  const [cerca, setCerca] = useState("");
  const [salvoPartenza, setSalvoPartenza] = useState(false);
  const [avvisoPartenza, setAvvisoPartenza] = useState<string | null>(null);

  const [salvoTetto, setSalvoTetto] = useState(false);
  const [avvisoTetto, setAvvisoTetto] = useState<string | null>(null);

  const [esco, setEsco] = useState(false);

  // Dopo il primo caricamento riuscito un aggiornamento fallito non butta
  // via la schermata: si tiene quello che c'è.
  const caricato = useRef(false);

  const carica = useCallback(async () => {
    try {
      const p = await caricaProfilo();
      // Con l'utente dentro il profilo esiste: se manca, qualcosa è andato male.
      if (!p) {
        if (!caricato.current) setStato("errore");
        return;
      }
      caricato.current = true;
      setProfilo(p);
      setStato("pronto");
    } catch (e) {
      console.error("[profilo] caricamento fallito:", e);
      if (!caricato.current) setStato("errore");
    }
  }, []);

  // Al ritorno sulla scheda i crediti si riaggiornano: una destinazione
  // arrivata nel frattempo deve vedersi.
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

  const trovate = useMemo(() => {
    const testo = cerca.trim().toLowerCase();
    if (!testo) return PARTENZE;
    return PARTENZE.filter((p) => p.nome.toLowerCase().includes(testo));
  }, [cerca]);

  const scegliPartenza = async (nome: string) => {
    if (salvoPartenza) return;
    setSalvoPartenza(true);
    setAvvisoPartenza(null);
    const esito = await salvaPartenza(nome);
    if (esito.errore) {
      setAvvisoPartenza(esito.errore);
    } else {
      setScelgoPartenza(false);
      setCerca("");
      // Le coordinate le mette dati.ts a partire dal nome: si rilegge tutto.
      await carica();
    }
    setSalvoPartenza(false);
  };

  const cambiaTetto = async (nuovo: number) => {
    if (!profilo || salvoTetto) return;
    if (nuovo < TETTO.min || nuovo > TETTO.max) return;
    const prima = profilo.tetto_settimanale;
    // Subito a schermo, e indietro se il salvataggio fallisce.
    setProfilo({ ...profilo, tetto_settimanale: nuovo });
    setSalvoTetto(true);
    setAvvisoTetto(null);
    const esito = await salvaTetto(nuovo);
    if (esito.errore) {
      setProfilo((p) => (p ? { ...p, tetto_settimanale: prima } : p));
      setAvvisoTetto(esito.errore);
    }
    setSalvoTetto(false);
  };

  const esciDalConto = async () => {
    setEsco(true);
    // Al termine la guardia della radice riporta al benvenuto da sola.
    await esci();
    setEsco(false);
  };

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
        keyboardShouldPersistTaps="handled"
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

        {stato === "pronto" && profilo ? (
          <>
            <Scheda su={COLORI.verdeNotte} stile={stili.crediti}>
              <Text style={stili.creditiEtichetta}>{T.crediti.etichetta}</Text>
              <Text style={stili.creditiNumero}>{profilo.crediti}</Text>
              <Text style={stili.creditiSpiegazione}>{T.crediti.spiegazione}</Text>
              {profilo.crediti === 0 ? (
                <Text style={stili.creditiFiniti}>{T.crediti.finiti}</Text>
              ) : null}
            </Scheda>

            <Scheda stile={stili.sezione}>
              <View style={stili.rigaSezione}>
                <View style={stili.colonna}>
                  <Text style={stili.etichetta}>{T.partenza.etichetta}</Text>
                  <Text style={stili.valore}>
                    {profilo.comune ?? TESTI.onboarding.criteri.partenza.segnaposto}
                  </Text>
                </View>
                {salvoPartenza ? (
                  <ActivityIndicator size="small" color={COLORI.verde} />
                ) : (
                  <Bottone
                    testo={scelgoPartenza ? TESTI.comune.annulla : T.partenza.cambia}
                    variante="fantasma"
                    onPress={() => {
                      setScelgoPartenza((aperto) => !aperto);
                      setCerca("");
                      setAvvisoPartenza(null);
                    }}
                  />
                )}
              </View>
              {scelgoPartenza ? (
                <View style={stili.blocco}>
                  {/* Stesse parole del passo criteri dell'onboarding: stessa scelta. */}
                  <Campo
                    etichetta={TESTI.onboarding.criteri.partenza.etichetta}
                    valore={cerca}
                    onChange={setCerca}
                    segnaposto={TESTI.onboarding.criteri.partenza.segnaposto}
                  />
                  <View style={stili.elenco}>
                    {trovate.map((p) => (
                      <Chip
                        key={p.nome}
                        testo={p.nome}
                        attivo={profilo.comune === p.nome}
                        onPress={() => void scegliPartenza(p.nome)}
                      />
                    ))}
                    {trovate.length === 0 ? (
                      <Text style={stili.nota}>{TESTI.onboarding.criteri.partenza.nessuna}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
              {avvisoPartenza ? (
                <Text accessibilityLiveRegion="polite" style={stili.avviso}>
                  {avvisoPartenza}
                </Text>
              ) : null}
            </Scheda>

            <Scheda stile={stili.sezione}>
              <View style={stili.rigaSezione}>
                <View style={stili.colonna}>
                  <Text style={stili.etichetta}>{T.tetto.etichetta}</Text>
                  <Text style={stili.valore}>
                    {riempi(T.tetto.valore, { n: profilo.tetto_settimanale })}
                  </Text>
                </View>
                <View style={stili.contatore}>
                  <Pressable
                    onPress={() => void cambiaTetto(profilo.tetto_settimanale - 1)}
                    disabled={salvoTetto || profilo.tetto_settimanale <= TETTO.min}
                    accessibilityRole="button"
                    accessibilityLabel={T.tetto.abbassa}
                    style={({ pressed }) => [
                      stili.passo,
                      (salvoTetto || profilo.tetto_settimanale <= TETTO.min) && stili.passoSpento,
                      pressed && stili.passoPremuto,
                    ]}
                  >
                    <Feather name="minus" size={18} color={COLORI.verdeScuro} />
                  </Pressable>
                  <Pressable
                    onPress={() => void cambiaTetto(profilo.tetto_settimanale + 1)}
                    disabled={salvoTetto || profilo.tetto_settimanale >= TETTO.max}
                    accessibilityRole="button"
                    accessibilityLabel={T.tetto.alza}
                    style={({ pressed }) => [
                      stili.passo,
                      (salvoTetto || profilo.tetto_settimanale >= TETTO.max) && stili.passoSpento,
                      pressed && stili.passoPremuto,
                    ]}
                  >
                    <Feather name="plus" size={18} color={COLORI.verdeScuro} />
                  </Pressable>
                </View>
              </View>
              <Text style={stili.nota}>{T.tetto.spiegazione}</Text>
              {avvisoTetto ? (
                <Text accessibilityLiveRegion="polite" style={stili.avviso}>
                  {avvisoTetto}
                </Text>
              ) : null}
            </Scheda>

            <Scheda stile={stili.sezione}>
              <View style={stili.rigaSezione}>
                <Text style={stili.etichetta}>{T.acquisto.titolo}</Text>
                <View style={stili.presto}>
                  <Text style={stili.prestoTesto}>{T.acquisto.stato}</Text>
                </View>
              </View>
              <Text style={stili.nota}>{T.acquisto.testo}</Text>
            </Scheda>

            <Scheda stile={stili.sezione}>
              <View style={stili.colonna}>
                <Text style={stili.etichetta}>{T.account.email}</Text>
                <Text style={stili.valore}>{profilo.email}</Text>
              </View>
            </Scheda>

            <Bottone
              testo={T.account.esci}
              icona="log-out"
              variante="vetro"
              onPress={() => void esciDalConto()}
              caricamento={esco}
            />
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
    color: COLORI.fumo,
  },
  messaggioErrore: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.errore,
    textAlign: "center",
  },
  avviso: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.errore,
  },
  crediti: {
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    gap: SPAZIO.s,
  },
  creditiEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.menta,
  },
  creditiNumero: {
    fontFamily: FONT.display,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2.5,
    color: COLORI.menta,
    fontVariant: ["tabular-nums"],
  },
  creditiSpiegazione: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.mentaTenue,
  },
  // Oro sul fondo scuro: è il colore dei messaggi d'errore lì (BRAND.md).
  creditiFiniti: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.sole,
  },
  sezione: {
    gap: SPAZIO.m,
  },
  rigaSezione: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  colonna: {
    gap: SPAZIO.xs,
    flexShrink: 1,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.fumo,
  },
  valore: {
    fontFamily: FONT.testoSemi,
    fontSize: 16,
    color: COLORI.inchiostro,
  },
  blocco: {
    gap: SPAZIO.m,
  },
  elenco: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
  },
  contatore: {
    flexDirection: "row",
    gap: SPAZIO.s,
  },
  passo: {
    width: 40,
    height: 40,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.mentaTenue,
    alignItems: "center",
    justifyContent: "center",
  },
  passoSpento: {
    opacity: 0.4,
  },
  passoPremuto: {
    opacity: 0.7,
  },
  presto: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
  },
  prestoTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 11,
    color: COLORI.menta,
  },
});
