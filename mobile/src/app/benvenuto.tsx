/**
 * LA WELCOME: la prima cosa che si vede dopo l'installazione.
 *
 * Richiesta di Valerio (8/08): "determinerà se uno avrà voglia di
 * entrare o meno: effetto wow cinematico". La scena è sul verde notte
 * del marchio: le colonne dell'Osservatorio respirano sul fondo, il
 * logo ARRIVA IN VOLO da fuori schermo con un piccolo arco, il nome si
 * accende, poi sale la carta con l'email.
 *
 * Regole rispettate anche qui:
 * - si vede UNA volta (AsyncStorage), e c'è "Salta": il check resta
 *   libero, la welcome invita, non blocca;
 * - niente bottoni Google/Apple finché non esistono le chiavi OAuth:
 *   un bottone che non funziona è una promessa rotta.
 */
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import marchio from "../../assets/images/marchio.png";
import { useValoreAnimato } from "@/lib/animazioni";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.benvenuto;

export const CHIAVE_BENVENUTO = "rivoglio.benvenuto.v1";

/** Le colonne del marchio, che respirano piano sul fondo. */
function Colonna({ x, ritardo, alta }: { x: number; ritardo: number; alta: number }) {
  const respiro = useValoreAnimato(0);
  useEffect(() => {
    const giro = Animated.loop(
      Animated.sequence([
        Animated.delay(ritardo),
        Animated.timing(respiro, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(respiro, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    giro.start();
    return () => giro.stop();
  }, [respiro, ritardo]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        stili.colonna,
        {
          left: x,
          height: alta,
          opacity: respiro.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.16] }),
        },
      ]}
    />
  );
}

export default function SchermataBenvenuto() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");

  /* la regia: volo del logo → nome → tagline → carta */
  const volo = useValoreAnimato(0);
  const nome = useValoreAnimato(0);
  const riga = useValoreAnimato(0);
  const carta = useValoreAnimato(0);
  const salta = useValoreAnimato(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(volo, {
        toValue: 1,
        duration: 1100,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }),
      Animated.stagger(160, [
        Animated.timing(nome, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(riga, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(carta, {
          toValue: 1,
          duration: 640,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(salta, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [volo, nome, riga, carta, salta]);

  async function chiudi(dove: "accesso" | "tabs") {
    try {
      await AsyncStorage.setItem(CHIAVE_BENVENUTO, "1");
    } catch {
      /* al peggio si rivede: non è un dramma */
    }
    if (dove === "accesso") {
      router.replace({
        pathname: "/accesso",
        params: email.trim() ? { email: email.trim() } : {},
      });
    } else {
      router.replace("/");
    }
  }

  /* il volo del logo: entra da fuori schermo in basso a sinistra, con un
     arco e una virata che si raddrizza atterrando al centro */
  const voloX = volo.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.6, 0] });
  const voloY = volo.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [height * 0.3, -height * 0.02, 0],
  });
  const voloRotazione = volo.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: ["-18deg", "6deg", "0deg"],
  });
  const voloScala = volo.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const colonne = [0.06, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9];

  return (
    <KeyboardAvoidingView
      style={stili.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {colonne.map((f, i) => (
        <Colonna
          key={f}
          x={f * width}
          ritardo={i * 420}
          alta={height * (0.35 + (i % 3) * 0.18)}
        />
      ))}

      <Animated.View style={[stili.salta, { opacity: salta }]}>
        <Pressable
          onPress={() => void chiudi("tabs")}
          accessibilityRole="button"
          hitSlop={10}
        >
          <Text style={stili.saltaTesto}>{T.salta}</Text>
        </Pressable>
      </Animated.View>

      <View style={stili.scena}>
        <Animated.Image
          source={marchio}
          accessibilityLabel="Rivoglio"
          style={[
            stili.logo,
            {
              transform: [
                { translateX: voloX },
                { translateY: voloY },
                { rotate: voloRotazione },
                { scale: voloScala },
              ],
            },
          ]}
        />

        <Animated.Text
          style={[
            stili.nome,
            {
              opacity: nome,
              transform: [
                { translateY: nome.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            },
          ]}
        >
          Rivo<Text style={stili.nomeMenta}>glio</Text>
        </Animated.Text>

        <Animated.Text
          style={[
            stili.tagline,
            {
              opacity: riga,
              transform: [
                { translateY: riga.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
            },
          ]}
        >
          {T.tagline}
        </Animated.Text>

        <Animated.Text style={[stili.sotto, { opacity: riga }]}>{T.sottotitolo}</Animated.Text>
      </View>

      <Animated.View
        style={[
          stili.carta,
          {
            opacity: carta,
            transform: [
              { translateY: carta.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) },
            ],
          },
        ]}
      >
        <Text style={stili.cartaTitolo}>{T.carta.titolo}</Text>
        <Text style={stili.cartaTesto}>{T.carta.testo}</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={T.carta.segnaposto}
          placeholderTextColor={COLORI.fumo2}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          accessibilityLabel={T.carta.segnaposto}
          style={stili.campo}
        />

        <Pressable
          onPress={() => void chiudi("accesso")}
          accessibilityRole="button"
          style={stili.bottone}
        >
          <Text style={stili.bottoneTesto}>{T.carta.inizia}</Text>
        </Pressable>

        <Pressable
          onPress={() => void chiudi("tabs")}
          accessibilityRole="button"
          style={stili.esplora}
        >
          <Text style={stili.esploraTesto}>{T.carta.esplora}</Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.verdeNotte },
  colonna: {
    position: "absolute",
    bottom: 0,
    width: 34,
    backgroundColor: COLORI.menta,
  },
  salta: { position: "absolute", top: 58, right: SPAZIO.schermata, zIndex: 10 },
  saltaTesto: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.menta },
  scena: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  logo: { width: 96, height: 96 },
  nome: {
    fontFamily: FONT.display,
    fontSize: 44,
    letterSpacing: -1.6,
    color: COLORI.bianco,
    marginTop: SPAZIO.l,
  },
  nomeMenta: { color: COLORI.menta },
  tagline: {
    fontFamily: FONT.corsivo,
    fontSize: 24,
    color: COLORI.menta,
    marginTop: SPAZIO.s,
    textAlign: "center",
  },
  sotto: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: SPAZIO.l,
    maxWidth: 300,
  },
  carta: {
    backgroundColor: COLORI.bianco,
    borderTopLeftRadius: RAGGIO.grande,
    borderTopRightRadius: RAGGIO.grande,
    paddingHorizontal: SPAZIO.xl,
    paddingTop: SPAZIO.xl,
    paddingBottom: SPAZIO.xxl + SPAZIO.m,
  },
  cartaTitolo: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  cartaTesto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  campo: {
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    fontFamily: FONT.testo,
    fontSize: 15.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.l,
    minHeight: 50,
  },
  bottone: {
    backgroundColor: COLORI.verde,
    borderRadius: RAGGIO.bottone,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: SPAZIO.m,
  },
  bottoneTesto: { fontFamily: FONT.testoSemi, fontSize: 16, color: COLORI.bianco },
  esplora: { alignItems: "center", marginTop: SPAZIO.l, minHeight: 30 },
  esploraTesto: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.verdeScuro },
});
