import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useValoreAnimato } from "@/lib/animazioni";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

/**
 * LA SCENA DI SCANSIONE: il teatro onesto del check, in nativo.
 *
 * È la stessa scena del sito (SchedaCheck + CartaImbarcoScan), ricostruita
 * qui: la carta d'imbarco sotto la luce dello scanner, i sei passi veri
 * dell'analisi, la barra che avanza. Le regole sono identiche:
 * - i soli dati stampati subito sono quelli scritti dall'utente;
 * - tratta e orari NON si inventano: restano barre in lettura finché il
 *   server non ha davvero risposto (prop, mai calcolati qui);
 * - i passi avanzano con la prop `passo`, guidata dalla schermata: la
 *   scena non decide niente, mette in scena quello che succede davvero.
 */

const T = TESTI.analisi;

/** Il driver nativo non esiste sul web (anteprima): lì si va in JS. */
const NATIVO = Platform.OS !== "web";

/**
 * Le barre del codice, derivate dal numero del volo come su CardVolo:
 * deterministiche, stesso volo = stesso disegno. Grafica, non un dato.
 */
function barre(seme: string): number[] {
  const larghezze: number[] = [];
  let x = 0;
  for (let i = 0; i < 34; i++) {
    x = (x * 31 + seme.charCodeAt(i % seme.length) + i) % 7;
    larghezze.push(1 + (x % 3));
  }
  return larghezze;
}

/** I gradini della fascia di luce: un gradiente morbido, senza librerie. */
const LUCE_STRISCE = [
  "rgba(10,157,92,0)",
  "rgba(10,157,92,0.04)",
  "rgba(10,157,92,0.09)",
  "rgba(10,157,92,0.13)",
  "rgba(127,232,174,0.20)",
  "rgba(10,157,92,0.11)",
  "rgba(10,157,92,0.06)",
  "rgba(10,157,92,0.03)",
  "rgba(10,157,92,0)",
];
const LUCE_ALTEZZA = 112;

/** Un valore appena letto: entra con un assestamento e un lampo menta. */
function ValoreLetto({ testo }: { testo: string }) {
  const entrata = useValoreAnimato(0);
  const lampo = useValoreAnimato(0.9);

  useEffect(() => {
    Animated.timing(entrata, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVO,
    }).start();
    Animated.timing(lampo, {
      toValue: 0,
      duration: 1100,
      delay: 150,
      useNativeDriver: NATIVO,
    }).start();
  }, [entrata, lampo]);

  return (
    <Animated.View
      style={{
        opacity: entrata,
        transform: [{ translateY: entrata.interpolate({ inputRange: [0, 1], outputRange: [3, 0] }) }],
      }}
    >
      <Animated.View style={[stili.valoreLampo, { opacity: lampo }]} />
      <Text style={stili.valoreTesto} numberOfLines={1}>
        {testo}
      </Text>
    </Animated.View>
  );
}

/** Un campo del documento: il valore vero, o la barra in lettura. */
function CampoLetto({
  etichetta,
  valore,
  letto,
  largo,
  lampeggio,
}: {
  etichetta: string;
  valore?: string | null;
  letto: boolean;
  largo: number;
  lampeggio: Animated.Value;
}) {
  return (
    <View style={stili.campo}>
      <Text style={stili.campoEtichetta}>{etichetta.toUpperCase()}</Text>
      {valore ? (
        <ValoreLetto testo={valore} />
      ) : (
        <Animated.View
          style={[
            stili.campoBarra,
            { width: largo },
            letto
              ? { backgroundColor: "rgba(10,157,92,0.4)" }
              : {
                  backgroundColor: COLORI.bordo,
                  opacity: lampeggio.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.45, 1],
                  }),
                },
          ]}
        />
      )}
    </View>
  );
}

/** Il timbro della verifica: entra come un timbro, con la molla. */
function Timbro() {
  const molla = useValoreAnimato(0);

  useEffect(() => {
    Animated.spring(molla, {
      toValue: 1,
      stiffness: 320,
      damping: 17,
      mass: 1,
      useNativeDriver: NATIVO,
    }).start();
  }, [molla]);

  return (
    <Animated.View
      style={[
        stili.timbro,
        {
          opacity: molla,
          transform: [
            { scale: molla.interpolate({ inputRange: [0, 1], outputRange: [1.5, 1] }) },
            { rotate: molla.interpolate({ inputRange: [0, 1], outputRange: ["-14deg", "-6deg"] }) },
          ],
        },
      ]}
    >
      <Text style={stili.timbroTesto}>{T.carta.timbro.toUpperCase()}</Text>
    </Animated.View>
  );
}

/** La spunta accanto al numero del volo, quando il volo è trovato. */
function Spunta() {
  const entrata = useValoreAnimato(0);
  useEffect(() => {
    Animated.spring(entrata, { toValue: 1, useNativeDriver: NATIVO }).start();
  }, [entrata]);
  return (
    <Animated.View style={{ opacity: entrata, transform: [{ scale: entrata }] }}>
      <Feather name="check" size={15} color={COLORI.verde} />
    </Animated.View>
  );
}

/** Il dettaglio sotto il passo attivo: entra morbido a ogni cambio. */
function Dettaglio({ testo }: { testo: string }) {
  const entrata = useValoreAnimato(0);
  useEffect(() => {
    Animated.timing(entrata, { toValue: 1, duration: 350, useNativeDriver: NATIVO }).start();
  }, [entrata]);
  return (
    <Animated.Text
      style={[
        stili.passoDettaglio,
        {
          opacity: entrata,
          transform: [{ translateY: entrata.interpolate({ inputRange: [0, 1], outputRange: [-3, 0] }) }],
        },
      ]}
    >
      {testo}
    </Animated.Text>
  );
}

type Props = {
  volo: string;
  dataTesto: string;
  /** 0..6: quanti passi dell'analisi sono compiuti. Lo guida la schermata. */
  passo: number;
  /* I dati VERI del server, quando arrivano. Mai inventati qui. */
  tratta: string | null;
  arrivoPrevisto: string | null;
  arrivoEffettivo: string | null;
};

export default function ScenaScan({
  volo,
  dataTesto,
  passo,
  tratta,
  arrivoPrevisto,
  arrivoEffettivo,
}: Props) {
  /* Come sul sito: la carta ha 4 stati (0..3), uno ogni due passi. */
  const passoCarta = Math.min(3, Math.floor(passo / 2));
  const compiuti = Math.min(passo, T.passi.length);

  const [altezzaCarta, setAltezzaCarta] = useState(0);
  const tacche = useMemo(() => barre(volo || "RIVOGLIO"), [volo]);

  /* La luce dello scanner: scende in 3,4 secondi, riposa mezzo secondo,
     riparte dall'alto. Stessi tempi del sito. */
  const luce = useValoreAnimato(0);
  useEffect(() => {
    const giro = Animated.loop(
      Animated.sequence([
        Animated.timing(luce, {
          toValue: 1,
          duration: 3400,
          easing: Easing.linear,
          useNativeDriver: NATIVO,
        }),
        Animated.delay(500),
      ]),
    );
    giro.start();
    return () => giro.stop();
  }, [luce]);

  /* La pulsazione condivisa: le barre in lettura e il pallino del passo
     attivo respirano insieme, un solo orologio. */
  const lampeggio = useValoreAnimato(0);
  useEffect(() => {
    const giro = Animated.loop(
      Animated.timing(lampeggio, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: NATIVO,
      }),
    );
    giro.start();
    return () => giro.stop();
  }, [lampeggio]);

  /* La barra di avanzamento: segue il passo, morbida. Anima la larghezza,
     quindi resta sul filo JS (non è un transform). */
  const avanzamento = useValoreAnimato(0);
  useEffect(() => {
    Animated.timing(avanzamento, {
      toValue: compiuti / T.passi.length,
      duration: 800,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: false,
    }).start();
  }, [avanzamento, compiuti]);

  return (
    <View accessibilityLiveRegion="polite">
      {/* ------------------------------------------- titolo e contatore */}
      <View style={stili.testata}>
        <Text style={stili.titolo}>{T.titolo.toUpperCase()}</Text>
        <Text style={stili.contatore}>
          {compiuti}/{T.passi.length}
        </Text>
      </View>
      <View style={stili.binario}>
        <Animated.View
          style={[
            stili.avanzamento,
            { width: avanzamento.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
      </View>

      {/* ------------------------------------------- la carta d'imbarco */}
      <View
        style={stili.carta}
        onLayout={(e) => setAltezzaCarta(e.nativeEvent.layout.height)}
      >
        <View style={stili.fascia}>
          <Text style={stili.fasciaTitolo}>{T.carta.intestazione.toUpperCase()}</Text>
          <Text style={stili.fasciaEn}>{T.carta.intestazioneEn.toUpperCase()}</Text>
        </View>

        <View style={stili.campi}>
          {/* Su 390px la griglia del sito (3 colonne) tronca data e
              tratta: qui il volo e la data dividono la prima riga, la
              TRATTA ha una riga tutta sua (è il campo più lungo:
              "Bergamo → Lanzarote" si deve leggere intera). */}
          <View style={stili.riga}>
            <View style={[stili.campo, stili.cellaLarga]}>
              <Text style={stili.campoEtichetta}>{T.carta.volo.toUpperCase()}</Text>
              <View style={stili.voloRiga}>
                <Text style={stili.voloTesto}>{volo}</Text>
                {passoCarta >= 1 && <Spunta />}
              </View>
            </View>
            <View style={stili.cella}>
              <CampoLetto
                etichetta={T.carta.data}
                valore={dataTesto}
                letto={passoCarta >= 1}
                largo={64}
                lampeggio={lampeggio}
              />
            </View>
          </View>
          <CampoLetto
            etichetta={T.carta.tratta}
            valore={passoCarta >= 1 ? tratta : null}
            letto={passoCarta >= 1}
            largo={120}
            lampeggio={lampeggio}
          />
          <View style={stili.riga}>
            <View style={stili.cellaLarga}>
              <CampoLetto
                etichetta={T.carta.previsto}
                valore={passoCarta >= 2 ? arrivoPrevisto : null}
                letto={passoCarta >= 2}
                largo={48}
                lampeggio={lampeggio}
              />
            </View>
            <View style={stili.cella}>
              <CampoLetto
                etichetta={T.carta.effettivo}
                valore={passoCarta >= 2 ? arrivoEffettivo : null}
                letto={passoCarta >= 2}
                largo={48}
                lampeggio={lampeggio}
              />
            </View>
            <View style={stili.cella}>
              <View style={stili.campo}>
                <Text style={stili.campoEtichetta}>{T.carta.verifica.toUpperCase()}</Text>
                {passoCarta >= 3 ? (
                  <Timbro />
                ) : (
                  <Animated.View
                    style={[
                      stili.campoBarra,
                      {
                        width: 64,
                        backgroundColor: COLORI.bordo,
                        opacity: lampeggio.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0.45, 1],
                        }),
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* il tagliando: strappo tratteggiato e codice a barre */}
        <View style={stili.tagliando}>
          <View style={stili.codiceBarre} accessibilityElementsHidden>
            {tacche.map((larghezza, i) => (
              <View
                key={i}
                style={[stili.barra, { width: larghezza, opacity: larghezza === 1 ? 0.55 : 0.85 }]}
              />
            ))}
          </View>
          <Text style={stili.tagliandoTesto} numberOfLines={1}>
            {volo} · {dataTesto}
          </Text>
        </View>

        {/* LA LUCE: la testina dello scanner, dall'alto verso il basso. */}
        {altezzaCarta > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              stili.luce,
              {
                opacity: luce.interpolate({
                  inputRange: [0, 0.12, 0.85, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: luce.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-LUCE_ALTEZZA, altezzaCarta + LUCE_ALTEZZA * 0.3],
                    }),
                  },
                ],
              },
            ]}
          >
            {LUCE_STRISCE.map((tinta, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: tinta }} />
            ))}
          </Animated.View>
        )}
      </View>

      {/* ------------------------------------------- i sei passi veri */}
      <View style={stili.passi}>
        {T.passi.map((testo, i) => {
          const fatto = i < passo;
          const attivo = i === passo;
          return (
            <View key={testo} style={stili.passoRiga}>
              <View
                style={[
                  stili.passoCerchio,
                  fatto && stili.passoCerchioFatto,
                  attivo && stili.passoCerchioAttivo,
                ]}
              >
                {fatto ? (
                  <Feather name="check" size={14} color={COLORI.bianco} />
                ) : attivo ? (
                  <Animated.View
                    style={[
                      stili.passoPallinoAttivo,
                      {
                        opacity: lampeggio.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0.25, 1],
                        }),
                        transform: [
                          {
                            scale: lampeggio.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [1, 0.8, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ) : (
                  <View style={stili.passoPallino} />
                )}
              </View>
              <View style={stili.passoTesti}>
                <Text
                  style={[stili.passoTesto, (fatto || attivo) && stili.passoTestoAcceso]}
                >
                  {testo}
                </Text>
                {attivo && T.dettagli[i] ? <Dettaglio testo={T.dettagli[i]} /> : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={stili.notaBordo}>
        <Text style={stili.nota}>{T.nota}</Text>
      </View>
    </View>
  );
}

const stili = StyleSheet.create({
  testata: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  titolo: {
    fontFamily: FONT.testoMedio,
    fontSize: 12,
    letterSpacing: 1.6,
    color: COLORI.fumo,
  },
  contatore: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro },
  binario: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORI.bordo,
    marginTop: SPAZIO.s,
    overflow: "hidden",
  },
  avanzamento: { height: 4, borderRadius: 2, backgroundColor: COLORI.verde },

  carta: {
    marginTop: SPAZIO.l,
    borderRadius: RAGGIO.scheda - 4,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    backgroundColor: COLORI.bianco,
    overflow: "hidden",
  },
  fascia: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORI.verdeNotte,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.s,
  },
  fasciaTitolo: {
    fontFamily: FONT.testoMedio,
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(127,232,174,0.8)",
  },
  fasciaEn: {
    fontFamily: FONT.testo,
    fontSize: 10,
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.55)",
  },
  campi: {
    paddingHorizontal: SPAZIO.l,
    paddingTop: SPAZIO.m + 2,
    paddingBottom: SPAZIO.m,
    gap: SPAZIO.m,
  },
  riga: { flexDirection: "row", gap: SPAZIO.l, alignItems: "flex-start" },
  cellaLarga: { flex: 1.2, minWidth: 0 },
  cella: { flex: 1, minWidth: 0 },
  campo: { minWidth: 0 },
  campoEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 9,
    letterSpacing: 1.2,
    color: COLORI.fumo2,
  },
  campoBarra: { height: 8, borderRadius: 4, marginTop: 6 },
  voloRiga: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  voloTesto: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: COLORI.inchiostro,
  },
  valoreTesto: {
    fontFamily: FONT.display,
    fontSize: 15,
    letterSpacing: -0.15,
    color: COLORI.inchiostro,
    marginTop: 2,
  },
  valoreLampo: {
    position: "absolute",
    top: -1,
    bottom: -1,
    left: -4,
    right: -4,
    borderRadius: 4,
    backgroundColor: "rgba(127,232,174,0.4)",
  },
  timbro: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: COLORI.verde,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  timbroTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 9,
    letterSpacing: 0.7,
    color: COLORI.verde,
  },
  tagliando: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPAZIO.l,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORI.bordo,
    paddingHorizontal: SPAZIO.l,
    paddingTop: SPAZIO.s + 2,
    paddingBottom: SPAZIO.m,
  },
  codiceBarre: { flexDirection: "row", alignItems: "stretch", gap: 1.5, height: 26 },
  barra: { backgroundColor: COLORI.inchiostro },
  tagliandoTesto: {
    fontFamily: FONT.testo,
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: COLORI.fumo2,
    flexShrink: 1,
  },
  luce: { position: "absolute", left: 0, right: 0, top: 0, height: LUCE_ALTEZZA },

  passi: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  passoRiga: { flexDirection: "row", alignItems: "flex-start", gap: SPAZIO.m },
  passoCerchio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    backgroundColor: COLORI.bianco,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  passoCerchioFatto: { borderColor: COLORI.verde, backgroundColor: COLORI.verde },
  passoCerchioAttivo: { borderColor: "rgba(10,157,92,0.5)" },
  passoPallino: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORI.bordo },
  passoPallinoAttivo: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORI.verde },
  passoTesti: { flex: 1, minWidth: 0 },
  passoTesto: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.fumo2,
  },
  passoTestoAcceso: { fontFamily: FONT.testoMedio, color: COLORI.inchiostro },
  passoDettaglio: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 17,
    color: COLORI.fumo,
    marginTop: 2,
  },
  notaBordo: {
    borderTopWidth: 1,
    borderColor: "rgba(228,233,238,0.7)",
    marginTop: SPAZIO.l,
    paddingTop: SPAZIO.m,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
  },
});
