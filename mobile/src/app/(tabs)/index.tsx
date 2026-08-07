/**
 * Il feed Destinazioni: le destinazioni ricevute con il totale a testa vero
 * (alloggio diviso persone + auto dal comune del profilo). Se non è arrivato
 * ancora niente, la sezione "Dove arrivi oggi" propone stime dal costruttore
 * con i criteri della prima ricerca attiva, mai spacciate per offerte.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Scheda from "@/components/Scheda";
import SchedaDestinazione from "@/components/SchedaDestinazione";
import Titolo from "@/components/Titolo";
import Vuoto from "@/components/Vuoto";
import { caricaDestinazioni, caricaProfilo, caricaRicerche } from "@/lib/dati";
import { dataBreve, euro } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO, TINTE_TIPO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Destinazione, Profilo, Ricerca } from "@/lib/tipi";
import { costruisci, type Proposta } from "@/motore/costruttore";
import { ordina, preferenzeDaStorico } from "@/motore/punteggio";
import { contoViaggio } from "@/motore/viaggio";

/**
 * Media nazionale self service, osservatorio MIMIT del 06/08/2026: lo stesso
 * valore fermo del sito. Da sostituire col lettore MIMIT quando arriva
 * (ARRETRATI.md); fino ad allora il valore è dichiarato, non nascosto.
 */
const PREZZO_BENZINA = 1.994;

// Aria sotto l'ultima card: la barra tab è una pillola flottante assoluta
// (offset SPAZIO.m + altezza della pillola + margine), il contenuto non
// deve finirci dietro.
const ARIA_BARRA = 116;

// Alpha sul token bianco, come nelle pillole di SchedaDestinazione:
// deve leggersi su tutte le tinte di TINTE_TIPO.
const PILLOLA_FONDO = COLORI.bianco + "B3";

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

type Voce = {
  destinazione: Destinazione;
  totale: number;
  avanzo: number;
  km?: number;
  ore?: number;
};

type Oggi = { motivo: string } | { lista: Proposta[] };

export default function Destinazioni() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [aggiorno, setAggiorno] = useState(false);
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [ricerche, setRicerche] = useState<Ricerca[]>([]);
  const [destinazioni, setDestinazioni] = useState<Destinazione[]>([]);

  // Dopo il primo caricamento riuscito un aggiornamento fallito non butta
  // via la schermata: si tiene quello che c'è.
  const caricato = useRef(false);

  const carica = useCallback(async () => {
    try {
      const [p, r, d] = await Promise.all([
        caricaProfilo(),
        caricaRicerche(),
        caricaDestinazioni(),
      ]);
      // Con l'utente dentro il profilo esiste: se manca, qualcosa è andato male.
      if (!p) {
        if (!caricato.current) setStato("errore");
        return;
      }
      caricato.current = true;
      setProfilo(p);
      setRicerche(r);
      setDestinazioni(d);
      setStato("pronto");
    } catch (e) {
      console.error("[destinazioni] caricamento fallito:", e);
      if (!caricato.current) setStato("errore");
    }
  }, []);

  // Al ritorno sul feed i dati si riaggiornano: un'apertura fatta nel
  // dettaglio deve spegnere la pillola "Nuova".
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

  // L'invio non porta con sé la sua ricerca (il modello dati non la espone):
  // persone e soglia vengono dalla prima ricerca attiva, o dalla più recente.
  const ricercaAttiva = useMemo(() => ricerche.find((r) => r.attiva) ?? null, [ricerche]);
  const ricercaGuida = ricercaAttiva ?? ricerche[0] ?? null;
  const persone = ricercaGuida?.persone ?? 1;

  const senzaCoordinate = profilo !== null && (profilo.lat === null || profilo.lng === null);

  const voci = useMemo<Voce[]>(
    () =>
      destinazioni.map((d) => {
        const alloggio = d.offerta.prezzo_alloggio / persone;
        if (profilo?.lat != null && profilo.lng != null) {
          const conto = contoViaggio({
            da: { lat: profilo.lat, lng: profilo.lng },
            a: { lat: d.offerta.lat, lng: d.offerta.lng },
            persone,
            prezzoBenzina: PREZZO_BENZINA,
          });
          const totale = alloggio + conto.aPersona;
          return {
            destinazione: d,
            totale,
            avanzo: ricercaGuida ? ricercaGuida.budget_max_persona - totale : 0,
            km: conto.kmSolaAndata,
            ore: conto.ore,
          };
        }
        // Senza coordinate l'auto non si calcola: solo alloggio, e si dice.
        return { destinazione: d, totale: alloggio, avanzo: 0 };
      }),
    [destinazioni, profilo, persone, ricercaGuida],
  );

  const oggi = useMemo<Oggi | null>(() => {
    if (stato !== "pronto" || destinazioni.length > 0) return null;
    if (!profilo?.comune || !ricercaAttiva) return null;
    const esito = costruisci({
      partenza: profilo.comune,
      budgetPersona: ricercaAttiva.budget_max_persona,
      notti: ricercaAttiva.notti_max,
      persone: ricercaAttiva.persone,
      tipi: [...ricercaAttiva.tipi],
      oreMax: ricercaAttiva.ore_viaggio_max,
      prezzoBenzina: PREZZO_BENZINA,
    });
    if (!esito.ok) return { motivo: esito.motivo };
    // Con il feed vuoto lo storico è vuoto e l'ordine resta quello del
    // motore: il punteggio inizia a pesare appena arrivano le aperture.
    const preferenze = preferenzeDaStorico(
      destinazioni.map((d) => ({ tipo: d.offerta.tipo, aperto: d.aperto_il !== null })),
    );
    return { lista: ordina(esito.proposte, preferenze) };
  }, [stato, destinazioni, profilo, ricercaAttiva]);

  const apri = (d: Destinazione) => {
    router.push({ pathname: "/destinazione/[id]", params: { id: d.id } });
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
          <Titolo
            prima={TESTI.destinazioni.titolo.prima}
            corsivo={TESTI.destinazioni.titolo.corsivo}
          />
          {profilo?.comune ? (
            <Text style={stili.saluto}>
              {riempi(TESTI.destinazioni.saluto, { comune: profilo.comune })}
            </Text>
          ) : null}
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

        {stato === "pronto" && voci.length > 0 ? (
          <>
            {senzaCoordinate ? (
              <Text style={stili.nota}>{TESTI.destinazioni.senzaPartenza}</Text>
            ) : null}
            {voci.map((v) => (
              <View key={v.destinazione.id} style={stili.blocco}>
                <View style={stili.rigaRicevuta}>
                  <Text style={stili.ricevuta}>
                    {riempi(TESTI.destinazioni.ricevuta, {
                      data: dataBreve(v.destinazione.inviato_il.slice(0, 10)),
                    })}
                  </Text>
                  {v.destinazione.aperto_il === null ? (
                    <View style={stili.nuova}>
                      <Text style={stili.nuovaTesto}>{TESTI.destinazioni.nuova}</Text>
                    </View>
                  ) : null}
                </View>
                <SchedaDestinazione
                  destinazione={v.destinazione}
                  totale={v.totale}
                  avanzo={v.avanzo}
                  persone={persone}
                  km={v.km}
                  ore={v.ore}
                  onPress={() => apri(v.destinazione)}
                />
              </View>
            ))}
          </>
        ) : null}

        {stato === "pronto" && voci.length === 0 ? (
          <>
            <Vuoto
              titolo={TESTI.destinazioni.vuoto.titolo}
              testo={TESTI.destinazioni.vuoto.testo}
              azione={ricercaGuida ? undefined : () => router.push("/ricerca/nuova")}
              testoAzione={ricercaGuida ? undefined : TESTI.ricerche.vuoto.azione}
            />

            {oggi ? (
              <View style={stili.sezione}>
                <Text style={stili.sezioneTitolo}>{TESTI.destinazioni.oggi.titolo}</Text>
                <Text style={stili.nota}>{TESTI.destinazioni.oggi.nota}</Text>

                {"motivo" in oggi ? (
                  <Scheda>
                    <Text style={stili.motivo}>{oggi.motivo}</Text>
                  </Scheda>
                ) : (
                  oggi.lista.map((p) => {
                    const tinta = TINTE_TIPO[p.destinazione.tipo];
                    const pillole = [
                      riempi(TESTI.destinazioni.oggi.km, {
                        km: Math.round(p.conto.kmSolaAndata),
                      }),
                      riempi(TESTI.destinazioni.oggi.auto, { ore: p.ore }),
                      riempi(TESTI.destinazioni.oggi.autoATesta, {
                        costo: euro(p.conto.aPersona),
                      }),
                    ];
                    return (
                      <Scheda key={p.destinazione.nome} su={tinta.fondo} stile={stili.proposta}>
                        <View style={stili.rigaProposta}>
                          <View style={stili.pillola}>
                            <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
                              {tinta.nome}
                            </Text>
                          </View>
                          <View style={stili.pillolaStima}>
                            <Text style={stili.pillolaStimaTesto}>
                              {TESTI.destinazioni.oggi.stima}
                            </Text>
                          </View>
                        </View>
                        <Text style={[stili.propostaNome, { color: tinta.testo }]}>
                          {p.destinazione.nome}
                        </Text>
                        <Text style={[stili.propostaRegione, { color: tinta.testo }]}>
                          {p.destinazione.regione}
                        </Text>
                        <Text style={[stili.propostaCosa, { color: tinta.testo }]}>
                          {p.destinazione.cosa}
                        </Text>
                        <View style={stili.pillole}>
                          {pillole.map((testo) => (
                            <View key={testo} style={stili.pillola}>
                              <Text style={[stili.pillolaTesto, { color: tinta.testo }]}>
                                {testo}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <View style={stili.resta}>
                          <Text style={stili.restaTesto}>
                            {riempi(TESTI.destinazioni.oggi.resta, {
                              resto: euro(p.restaPerNotte),
                            })}
                          </Text>
                        </View>
                      </Scheda>
                    );
                  })
                )}
              </View>
            ) : null}
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
    gap: SPAZIO.s,
    marginBottom: SPAZIO.s,
  },
  saluto: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    color: COLORI.fumo,
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
  blocco: {
    gap: SPAZIO.s,
  },
  rigaRicevuta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPAZIO.xs,
  },
  ricevuta: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo,
  },
  nuova: {
    backgroundColor: COLORI.verde,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
  },
  nuovaTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 11,
    color: COLORI.bianco,
  },
  sezione: {
    gap: SPAZIO.m,
    marginTop: SPAZIO.l,
  },
  sezioneTitolo: {
    fontFamily: FONT.display,
    fontSize: 20,
    letterSpacing: -0.8,
    color: COLORI.inchiostro,
  },
  motivo: {
    fontFamily: FONT.testo,
    fontSize: 14,
    lineHeight: 21,
    color: COLORI.fumo,
  },
  proposta: {
    gap: SPAZIO.s,
  },
  rigaProposta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillole: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
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
  pillolaStima: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
  },
  pillolaStimaTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 11,
    color: COLORI.menta,
  },
  propostaNome: {
    fontFamily: FONT.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -1,
  },
  propostaRegione: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    opacity: 0.75,
  },
  propostaCosa: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  resta: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.xs,
  },
  restaTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.verdeScuro,
  },
});
