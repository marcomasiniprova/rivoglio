/**
 * LA SCENA DELL'ANALISI: i quindici secondi fra il tocco e il verdetto.
 *
 * Rifatta il 10/08 sulla tavola di riferimento (7c): la schermata
 * diventa verde notte, in alto c'è il biglietto di vetro che si compila
 * coi dati veri, sotto i sei passi che si accendono uno alla volta, in
 * fondo la barra degli archivi col contarello dei secondi.
 *
 * Le regole restano quelle di sempre:
 * - i soli dati stampati subito sono quelli scritti dall'utente;
 * - tratta, orari, ritardo e distanza NON si inventano: restano puntini
 *   finché il server non ha davvero risposto (prop, mai calcolati qui);
 * - i passi avanzano con la prop `passo`, guidata dalla schermata: la
 *   scena non decide niente, mette in scena quello che succede davvero.
 */
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useValoreAnimato } from "@/lib/animazioni";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.analisi;

/** Il driver nativo non esiste sul web (anteprima): lì si va in JS. */
const NATIVO = Platform.OS !== "web";

/** Un secondo per passo della sequenza (index.tsx tiene 2,4s a passo). */
const PASSO_MS = 2400;

type Props = {
  volo: string;
  dataTesto: string;
  /** 0..6: quanti passi sono chiusi. Lo guida la schermata, non la scena. */
  passo: number;
  /** "Bergamo → Lanzarote" quando il server l'ha detto, prima null. */
  tratta: string | null;
  arrivoPrevisto: string | null;
  arrivoEffettivo: string | null;
  /** "3 h e 52 min" quando il server l'ha detto, prima null. */
  ritardo?: string | null;
  /** I km della tratta quando il server li ha detti, prima null. */
  km?: number | null;
};

/** Un valore del biglietto: puntini finché il dato vero non c'è. */
function Valore({ testo, acceso }: { testo: string | null; acceso?: boolean }) {
  const entrata = useValoreAnimato(0);
  useEffect(() => {
    if (!testo) return;
    entrata.setValue(0);
    Animated.timing(entrata, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVO,
    }).start();
  }, [testo, entrata]);

  if (!testo) return <Text style={stili.valorePuntini}>· · ·</Text>;
  return (
    <Animated.Text
      style={[
        stili.valore,
        acceso && stili.valoreAcceso,
        { opacity: entrata, transform: [{ translateY: entrata.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] },
      ]}
    >
      {testo}
    </Animated.Text>
  );
}

/** Un passo della lista: pallino, titolo, la sua riga. */
function Passo({
  indice,
  passo,
  titolo,
  riga,
}: {
  indice: number;
  passo: number;
  titolo: string;
  riga: string;
}) {
  const fatto = passo > indice;
  const attivo = passo === indice;
  const entrata = useValoreAnimato(0);

  useEffect(() => {
    if (!fatto && !attivo) return;
    Animated.timing(entrata, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVO,
    }).start();
  }, [fatto, attivo, entrata]);

  return (
    <Animated.View
      style={[
        stili.passo,
        (fatto || attivo) && {
          opacity: entrata.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
          transform: [
            { translateY: entrata.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          ],
        },
        !fatto && !attivo && stili.passoFuturo,
      ]}
    >
      <View style={stili.passoLinea}>
        <View
          style={[
            stili.pallino,
            fatto && stili.pallinoFatto,
            attivo && stili.pallinoAttivo,
          ]}
        />
        {indice < 5 && <View style={[stili.filo, fatto && stili.filoFatto]} />}
      </View>
      <View style={stili.passoTesti}>
        <Text style={[stili.passoTitolo, !fatto && !attivo && stili.passoTitoloFuturo]}>
          {titolo}
        </Text>
        <Text style={[stili.passoRiga, fatto && stili.passoRigaFatta]}>{riga}</Text>
      </View>
    </Animated.View>
  );
}

export default function ScenaScan({
  volo,
  dataTesto,
  passo,
  tratta,
  arrivoPrevisto,
  arrivoEffettivo,
  ritardo,
  km,
}: Props) {
  const { height } = useWindowDimensions();

  /* Il contarello dei secondi: parte col sipario e cresce di uno al
     secondo. Niente orologio letto in render (regola dei componenti
     puri): è l'intervallo stesso a fare da metronomo. */
  const [secondi, setSecondi] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSecondi((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  /* La barra degli archivi avanza col passo, morbida. */
  const barra = useValoreAnimato(0);
  useEffect(() => {
    Animated.timing(barra, {
      toValue: Math.min(passo, 6) / 6,
      duration: PASSO_MS * 0.6,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [passo, barra]);

  const [daCitta, aCitta] = (tratta ?? "").split("→").map((s) => s.trim());

  /* Le righe dei passi: il dettaglio statico finché il dato vero non è
     arrivato, poi il dato. L'"in corso" segna il passo attivo. */
  const righe = T.dettagli.map((d, i) => {
    if (i === 1 && arrivoEffettivo) return T.ruoteATerra.replace("{ora}", arrivoEffettivo);
    if (i === 2 && ritardo) return ritardo;
    if (i === 3 && km && km > 0) return T.kmFra.replace("{km}", km.toLocaleString("it-IT"));
    if (passo === i) return T.inCorso;
    return d;
  });

  return (
    <View style={[stili.scena, { minHeight: height }]}>
      <Text style={stili.occhiello}>{T.occhiello}</Text>
      <Text style={stili.titolo} numberOfLines={2}>
        {tratta ? `${daCitta} · ${aCitta}` : volo}
      </Text>

      {/* --------------------------------------------- il biglietto */}
      <View style={stili.biglietto}>
        <View style={stili.bigliettoRiga}>
          <View>
            <Text style={stili.etichetta}>{T.biglietto.volo}</Text>
            <Text style={stili.bigliettoGrande}>{volo}</Text>
          </View>
          <View style={stili.aDestra}>
            <Text style={stili.etichetta}>{T.biglietto.data}</Text>
            <Text style={stili.bigliettoGrande}>{dataTesto}</Text>
          </View>
        </View>

        <View style={stili.rotta}>
          <Text style={stili.rottaScalo} numberOfLines={1}>
            {daCitta || "· · ·"}
          </Text>
          <View style={stili.rottaFilo} />
          <Text style={[stili.rottaScalo, stili.aDestraTesto]} numberOfLines={1}>
            {aCitta || "· · ·"}
          </Text>
        </View>

        <View style={stili.bigliettoRiga}>
          <View style={stili.colonna}>
            <Text style={stili.etichetta}>{T.biglietto.previsto}</Text>
            <Valore testo={arrivoPrevisto} />
          </View>
          <View style={stili.colonna}>
            <Text style={stili.etichetta}>{T.biglietto.effettivo}</Text>
            <Valore testo={arrivoEffettivo} acceso />
          </View>
          <View style={stili.colonna}>
            <Text style={stili.etichetta}>{T.biglietto.distanza}</Text>
            <Valore testo={km && km > 0 ? `${km.toLocaleString("it-IT")} km` : null} />
          </View>
        </View>
      </View>

      {/* ------------------------------------------------- i passi */}
      <View style={stili.passi}>
        {T.passi.map((titolo, i) => (
          <Passo key={titolo} indice={i} passo={passo} titolo={titolo} riga={righe[i]} />
        ))}
      </View>

      {/* -------------------------------------------------- la barra */}
      <View style={stili.fondo}>
        <View style={stili.barra}>
          <Animated.View
            style={[
              stili.barraPiena,
              {
                width: barra.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <View style={stili.barraPiedi}>
          <Text style={stili.barraTesto}>
            {T.contatore.replace("{n}", String(Math.min(passo, 6)))}
          </Text>
          <Text style={stili.barraTesto}>{T.secondi.replace("{s}", String(secondi))}</Text>
        </View>
        <Text style={stili.nessunaStima}>{T.nessunaStima}</Text>
      </View>
    </View>
  );
}

const stili = StyleSheet.create({
  scena: {
    backgroundColor: COLORI.verdeNotte,
    paddingHorizontal: SPAZIO.schermata + SPAZIO.xs,
    paddingTop: SPAZIO.xxl + SPAZIO.xl,
    /* La scena scorre sotto la barra delle tab: il fondo (contatore e
       riga finale) deve restare sopra, quindi il respiro in basso è
       l'altezza della barra più un margine. */
    paddingBottom: 116 + SPAZIO.xl,
  },
  occhiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 11.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORI.menta,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: COLORI.bianco,
    marginTop: SPAZIO.s,
  },

  /* Il biglietto di vetro: un velo chiaro sul verde notte. */
  biglietto: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    marginTop: SPAZIO.xl,
  },
  bigliettoRiga: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  colonna: { flex: 1 },
  aDestra: { alignItems: "flex-end" },
  aDestraTesto: { textAlign: "right" },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  bigliettoGrande: {
    fontFamily: FONT.display,
    fontSize: 20,
    letterSpacing: -0.3,
    color: COLORI.bianco,
    marginTop: 2,
  },
  rotta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    marginVertical: SPAZIO.l,
  },
  rottaScalo: {
    fontFamily: FONT.display,
    fontSize: 17,
    letterSpacing: -0.3,
    color: COLORI.bianco,
    flexShrink: 1,
  },
  rottaFilo: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  valore: {
    fontFamily: FONT.display,
    fontSize: 17,
    letterSpacing: -0.2,
    color: COLORI.bianco,
    marginTop: 2,
  },
  valoreAcceso: { color: COLORI.verdeAcceso },
  valorePuntini: {
    fontFamily: FONT.testo,
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
  },

  passi: { marginTop: SPAZIO.xl, flexGrow: 1 },
  passo: { flexDirection: "row", gap: SPAZIO.l },
  passoFuturo: { opacity: 0.45 },
  passoLinea: { alignItems: "center", width: 18 },
  pallino: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginTop: 4,
  },
  pallinoFatto: { backgroundColor: COLORI.menta },
  pallinoAttivo: {
    backgroundColor: "transparent",
    borderWidth: 2.5,
    borderColor: COLORI.menta,
  },
  filo: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 3,
    minHeight: 14,
  },
  filoFatto: { backgroundColor: "rgba(127,232,174,0.5)" },
  passoTesti: { flex: 1, paddingBottom: SPAZIO.l },
  passoTitolo: {
    fontFamily: FONT.testoSemi,
    fontSize: 15,
    color: COLORI.bianco,
  },
  passoTitoloFuturo: { color: "rgba(255,255,255,0.6)" },
  passoRiga: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  passoRigaFatta: { color: COLORI.menta },

  fondo: { marginTop: "auto", paddingTop: SPAZIO.xl },
  barra: {
    height: 6,
    borderRadius: RAGGIO.pillola,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  barraPiena: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.verdeAcceso,
  },
  barraPiedi: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPAZIO.s,
  },
  barraTesto: { fontFamily: FONT.testoMedio, fontSize: 12.5, color: "rgba(255,255,255,0.7)" },
  nessunaStima: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: "rgba(255,255,255,0.55)",
    marginTop: SPAZIO.l,
  },
});
