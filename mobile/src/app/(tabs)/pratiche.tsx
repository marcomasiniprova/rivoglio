/**
 * La tab Pratiche: ogni reclamo aperto con il punto in cui si trova (gli
 * stati della macchina di lib/pratiche del sito) e la fascia CE 261/2004.
 * Il check e l'apertura della pratica vivono sul SITO, senza login (SPEC §3):
 * l'app serve a seguire, mai ad aprire. Per questo lo stato vuoto spiega e
 * porta al sito col browser di sistema.
 */
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BadgeDemo from "@/components/BadgeDemo";
import Bottone from "@/components/Bottone";
import Scheda from "@/components/Scheda";
import Titolo from "@/components/Titolo";
import Vuoto from "@/components/Vuoto";
import { caricaPratiche, type Pratica, type StatoPratica } from "@/lib/dati";
import { useSessione } from "@/lib/sessione";
import { dataBreve, euro } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

// Aria sotto l'ultima card: la barra tab è una pillola flottante assoluta
// (offset SPAZIO.m + altezza della pillola + margine), il contenuto non
// deve finirci dietro.
const ARIA_BARRA = 116;

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

/** Etichetta italiana dello stato; uno stato nuovo del DB non rompe niente. */
const nomeStato = (stato: StatoPratica): string =>
  (TESTI.pratiche.stati as Record<string, string>)[stato] ?? stato;

export default function Pratiche() {
  const insets = useSafeAreaInsets();
  const T = TESTI.pratiche;

  const router = useRouter();
  const { utente } = useSessione();
  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [aggiorno, setAggiorno] = useState(false);
  const [pratiche, setPratiche] = useState<Pratica[]>([]);

  // Dopo il primo caricamento riuscito un aggiornamento fallito non butta
  // via la schermata: si tiene quello che c'è.
  const caricato = useRef(false);

  const carica = useCallback(async () => {
    // Senza account non c'è niente da leggere: la schermata invita a entrare.
    if (!utente) {
      setPratiche([]);
      setStato("pronto");
      return;
    }
    // `null` = lettura fallita: mai mostrare lo stato vuoto per un errore.
    const lette = await caricaPratiche();
    if (lette === null) {
      if (!caricato.current) setStato("errore");
      return;
    }
    caricato.current = true;
    setPratiche(lette);
    setStato("pronto");
  }, [utente]);

  // Al ritorno sulla tab l'elenco si riaggiorna: una transizione fatta dal
  // cron (sollecito, esito) deve vedersi senza riavviare l'app.
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

  /* Lo stato vuoto porta al check DENTRO l'app: l'app non scappa più
     nel browser (richiesta di Valerio, 8/08). */
  const vaiAlCheck = () => router.navigate("/");

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
          <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>
        </View>

        {stato === "caricamento" ? (
          <View style={stili.centro}>
            <ActivityIndicator size="large" color={COLORI.verde} />
            <Text style={stili.nota}>{TESTI.comune.caricamento}</Text>
          </View>
        ) : null}

        {stato === "errore" ? (
          <View style={stili.centro}>
            <Text style={stili.messaggioErrore}>{T.errore}</Text>
            <Bottone testo={TESTI.comune.riprova} onPress={riprova} variante="vetro" />
          </View>
        ) : null}

        {stato === "pronto" && pratiche.length > 0
          ? pratiche.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/pratica/${p.id}`)}
                accessibilityRole="button"
              >
                <Scheda stile={stili.pratica}>
                  <View style={stili.rigaAlta}>
                    <View style={stili.pillolaStato}>
                      <Text style={stili.pillolaStatoTesto}>{nomeStato(p.stato)}</Text>
                    </View>
                    {p.demo ? <BadgeDemo /> : null}
                  </View>

                  <Text style={stili.volo}>
                    {p.volo_iata && p.data_locale
                      ? riempi(T.volo, {
                          volo: p.volo_iata,
                          data: dataBreve(p.data_locale),
                        })
                      : T.voloMancante}
                  </Text>

                  <View style={stili.fascia}>
                    <Text style={stili.fasciaImporto}>
                      {p.importo_fascia !== null
                        ? riempi(T.fascia, { importo: euro(p.importo_fascia) })
                        : T.fasciaDaConfermare}
                    </Text>
                    {p.importo_fascia !== null ? (
                      // La cifra non resta mai sola: si cita da dove viene.
                      <Text style={stili.fasciaFonte}>{T.fasciaFonte}</Text>
                    ) : null}
                  </View>

                  <View style={stili.piede}>
                    <Text style={stili.aperta}>
                      {riempi(T.aperta, { data: dataBreve(p.creata_il.slice(0, 10)) })}
                    </Text>
                    <View style={stili.apriRiga}>
                      <Text style={stili.apriTesto}>{T.apri}</Text>
                      <Feather name="chevron-right" size={15} color={COLORI.verdeScuro} />
                    </View>
                  </View>
                </Scheda>
              </Pressable>
            ))
          : null}

        {stato === "pronto" && pratiche.length === 0 ? (
          utente ? (
            <Vuoto
              titolo={T.vuoto.titolo}
              testo={T.vuoto.testo}
              azione={vaiAlCheck}
              testoAzione={T.vuoto.azione}
            />
          ) : (
            <Vuoto
              titolo={T.ospite.titolo}
              testo={T.ospite.testo}
              azione={() => router.push("/accesso")}
              testoAzione={T.ospite.azione}
            />
          )
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
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
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
  pratica: {
    gap: SPAZIO.m,
  },
  rigaAlta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillolaStato: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.xs,
    alignSelf: "flex-start",
  },
  pillolaStatoTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 12,
    color: COLORI.verdeScuro,
  },
  volo: {
    fontFamily: FONT.display,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.8,
    color: COLORI.inchiostro,
  },
  fascia: {
    gap: SPAZIO.xs,
  },
  fasciaImporto: {
    fontFamily: FONT.testoSemi,
    fontSize: 16,
    color: COLORI.verde,
  },
  fasciaFonte: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 17,
    color: COLORI.fumo2,
  },
  aperta: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo,
  },
  piede: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  apriRiga: { flexDirection: "row", alignItems: "center", gap: 2 },
  apriTesto: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro },
});
