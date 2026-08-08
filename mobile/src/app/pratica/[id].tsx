/**
 * LA SCHEDA DELLA PRATICA: il tracker, dentro l'app.
 *
 * Richiesta di Valerio (8/08, popup): "tutto tranne pagare". Quindi qui
 * dentro c'è la timeline passo per passo, la lettera che si legge, si
 * copia e si apre direttamente nell'email, e il bottone "L'ho inviata".
 * L'unico momento in cui si apre il sito è il pagamento, che qui non
 * esiste: quando si arriva su questa schermata si è già pagato.
 *
 * Regole di sempre: l'app non decide niente (la scheda arriva dal server,
 * lettera compresa), e non si promette mai l'esito.
 */
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import { confermaInvio, schedaPratica, type SchedaPratica } from "@/lib/api";
import { DEMO, schedaDemo } from "@/lib/dati";
import { dataBreve } from "@/lib/formati";
import { tokenSessione } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.praticaScheda;

const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

/* La timeline: i passi nell'ordine in cui succedono davvero.
   Lo stato della pratica dice fin dove siamo arrivati. */
const ORDINE = ["pagata", "pronta", "inviata", "sollecito", "enac", "esito"] as const;
type Passo = (typeof ORDINE)[number];

function passoRaggiunto(stato: string): number {
  switch (stato) {
    case "creata":
      return -1;
    case "pagata":
      return 0;
    case "pronta":
      return 1;
    case "inviata":
      return 2;
    case "sollecito":
      return 3;
    case "enac":
      return 4;
    default:
      // esito_pagata, esito_rifiutata, rimborsata: fine corsa.
      return 5;
  }
}

const dataOra = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
};

export default function SchermataPratica() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [scheda, setScheda] = useState<SchedaPratica | null>(null);
  const [aggiorno, setAggiorno] = useState(false);
  const [copiata, setCopiata] = useState(false);
  const [invioInCorso, setInvioInCorso] = useState(false);
  const [invioFatto, setInvioFatto] = useState(false);

  const carica = useCallback(async () => {
    if (!id) return;

    // In demo la scheda è finta e dichiarata: serve a provare la schermata.
    if (DEMO) {
      const finta = schedaDemo(id);
      if (finta) {
        setScheda(finta);
        setStato("pronto");
        return;
      }
    }

    const token = await tokenSessione();
    if (!token) {
      setMessaggio(T.entraPrima);
      setStato("errore");
      return;
    }
    const esito = await schedaPratica(id, token);
    if (!esito.ok) {
      setMessaggio(esito.errore);
      setStato("errore");
      return;
    }
    setScheda(esito.scheda);
    setStato("pronto");
  }, [id]);

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

  async function copiaLettera() {
    if (!scheda?.lettera) return;
    try {
      await Clipboard.setStringAsync(`${scheda.lettera.oggetto}\n\n${scheda.lettera.corpo}`);
      setCopiata(true);
      setTimeout(() => setCopiata(false), 3000);
    } catch (e) {
      console.warn("[pratica] copia fallita:", e);
    }
  }

  async function apriEmail() {
    if (!scheda?.lettera) return;
    const { compagnia, oggetto, corpo } = scheda.lettera;
    const a = compagnia?.email ?? "";
    const url = `mailto:${a}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      // Nessuna app email sul dispositivo: si ripiega sulla condivisione.
      console.warn("[pratica] mailto non aperto:", e);
      void condividi();
    }
  }

  async function condividi() {
    if (!scheda?.lettera) return;
    try {
      await Share.share({ message: `${scheda.lettera.oggetto}\n\n${scheda.lettera.corpo}` });
    } catch (e) {
      console.warn("[pratica] condivisione fallita:", e);
    }
  }

  async function hoInviato() {
    if (!scheda) return;
    setInvioInCorso(true);
    const token = await tokenSessione();
    const esito = token
      ? await confermaInvio(scheda.pratica.id, token)
      : ({ ok: false, errore: T.entraPrima } as const);
    setInvioInCorso(false);
    if (!esito.ok) {
      setMessaggio(esito.errore);
      return;
    }
    setInvioFatto(true);
    await carica();
  }

  const p = scheda?.pratica;
  const raggiunto = p ? passoRaggiunto(p.stato) : -1;
  const finale =
    p && (TESTI.praticaScheda.esitiFinali as Record<string, string>)[p.stato]
      ? (TESTI.praticaScheda.esitiFinali as Record<string, string>)[p.stato]
      : null;

  /* La data di un passo, dalla cronologia (il tipo dell'evento è il nome
     dello stato). "esito" raccoglie i tre esiti finali. */
  const dataPasso = (passo: Passo): string | null => {
    if (!scheda) return null;
    const tipi =
      passo === "esito" ? ["esito_pagata", "esito_rifiutata", "rimborsata"] : [passo];
    const evento = scheda.eventi.find((e) => tipi.includes(e.tipo));
    return evento ? dataOra(evento.creato_il) : null;
  };

  const puoConfermareInvio = p && (p.stato === "pagata" || p.stato === "pronta");

  return (
    <ScrollView
      style={stili.pagina}
      contentContainerStyle={[
        stili.contenuto,
        { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + SPAZIO.xxl },
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
      {/* ------------------------------------------------ la testata */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={stili.indietro}
        hitSlop={8}
      >
        <Feather name="arrow-left" size={16} color={COLORI.fumo} />
        <Text style={stili.indietroTesto}>{T.indietro}</Text>
      </Pressable>

      {stato === "caricamento" && (
        <View style={stili.centro}>
          <ActivityIndicator size="large" color={COLORI.verde} />
          <Text style={stili.nota}>{T.caricamento}</Text>
        </View>
      )}

      {stato === "errore" && (
        <View style={stili.centro}>
          <Text style={stili.errore}>{messaggio ?? T.errore}</Text>
          <Bottone
            testo={TESTI.comune.riprova}
            onPress={() => {
              setStato("caricamento");
              void carica();
            }}
            variante="vetro"
          />
        </View>
      )}

      {stato === "pronto" && p && (
        <>
          {/* -------------------------------------------- il volo */}
          <Text style={stili.tratta}>
            {p.volo?.da && p.volo?.a ? `${p.volo.da} → ${p.volo.a}` : (p.volo?.iata ?? T.voloMancante)}
          </Text>
          <Text style={stili.sotto}>
            {p.volo ? `${p.volo.iata} · ${dataBreve(p.volo.data)}` : ""}
          </Text>

          {p.importo !== null && (
            <View style={stili.fascia}>
              <Text style={stili.fasciaImporto}>
                {p.importo}€ <Text style={stili.fasciaPer}>{T.perPasseggero}</Text>
              </Text>
              {p.tipo === "famiglia" && p.passeggeri > 1 && (
                <Text style={stili.fasciaNota}>{riempi(T.passeggeri, { n: p.passeggeri })}</Text>
              )}
              <Text style={stili.fasciaFonte}>{T.fonteImporto}</Text>
            </View>
          )}

          {/* -------------------------------------------- la timeline */}
          <View style={stili.scheda}>
            <Text style={stili.schedaTitolo}>{T.cronologia}</Text>
            {ORDINE.map((passo, i) => {
              const fatto = i <= raggiunto;
              const corrente = i === raggiunto;
              const etichetta =
                passo === "esito" && finale ? finale : T.passi[passo];
              const quando = fatto ? dataPasso(passo) : null;
              return (
                <View key={passo} style={stili.passo}>
                  <View style={stili.passoTraccia}>
                    <View
                      style={[
                        stili.pallino,
                        fatto && stili.pallinoFatto,
                        corrente && stili.pallinoCorrente,
                      ]}
                    >
                      {fatto && <Feather name="check" size={11} color={COLORI.bianco} />}
                    </View>
                    {i < ORDINE.length - 1 && (
                      <View style={[stili.linea, i < raggiunto && stili.lineaFatta]} />
                    )}
                  </View>
                  <View style={stili.passoTesti}>
                    <Text
                      style={[
                        stili.passoTesto,
                        fatto && stili.passoTestoFatto,
                        corrente && stili.passoTestoCorrente,
                      ]}
                    >
                      {etichetta}
                    </Text>
                    {quando ? <Text style={stili.passoData}>{quando}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* -------------------------------------------- la lettera */}
          {scheda.lettera ? (
            <View style={stili.scheda}>
              <Text style={stili.schedaTitolo}>{T.lettera.titolo}</Text>
              <Text style={stili.letteraSotto}>{T.lettera.sottotitolo}</Text>

              {scheda.lettera.compagnia && (
                <View style={stili.canale}>
                  <Text style={stili.canaleTitolo}>
                    {riempi(T.lettera.canaleTitolo, { nome: scheda.lettera.compagnia.nome })}
                  </Text>
                  <Text style={stili.canaleTesto}>{scheda.lettera.compagnia.canale}</Text>
                  {scheda.lettera.compagnia.indirizzoPostale && (
                    <Text style={stili.canaleIndirizzo}>
                      {T.lettera.indirizzo}: {scheda.lettera.compagnia.indirizzoPostale}
                    </Text>
                  )}
                </View>
              )}

              <Text style={stili.oggettoEtichetta}>{T.lettera.oggetto}</Text>
              <Text style={stili.oggetto}>{scheda.lettera.oggetto}</Text>

              <View style={stili.corpoRiquadro}>
                <Text style={stili.corpo}>{scheda.lettera.corpo}</Text>
              </View>

              <Text style={stili.allegati}>
                {T.lettera.allegati}: {scheda.lettera.allegati.join(", ")}
              </Text>

              <View style={stili.azioni}>
                <Bottone testo={T.lettera.apriEmail} onPress={() => void apriEmail()} icona="mail" />
                <View style={stili.azioniRiga}>
                  <Pressable
                    onPress={() => void copiaLettera()}
                    accessibilityRole="button"
                    style={stili.azioneSecondaria}
                  >
                    <Feather name="copy" size={14} color={COLORI.verdeScuro} />
                    <Text style={stili.azioneSecondariaTesto}>
                      {copiata ? T.lettera.copiata : T.lettera.copia}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void condividi()}
                    accessibilityRole="button"
                    style={stili.azioneSecondaria}
                  >
                    <Feather name="share-2" size={14} color={COLORI.verdeScuro} />
                    <Text style={stili.azioneSecondariaTesto}>{T.lettera.condividi}</Text>
                  </Pressable>
                </View>
                {scheda.lettera.compagnia?.url ? (
                  <Pressable
                    onPress={() => void openBrowserAsync(scheda.lettera!.compagnia!.url)}
                    accessibilityRole="button"
                    style={stili.azioneSecondaria}
                  >
                    <Feather name="external-link" size={14} color={COLORI.verdeScuro} />
                    <Text style={stili.azioneSecondariaTesto}>{T.lettera.apriCanale}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : (
            p.stato !== "creata" && (
              <View style={stili.scheda}>
                <Text style={stili.letteraSotto}>{T.lettera.manca}</Text>
              </View>
            )
          )}

          {/* -------------------------------------------- l'ho inviata */}
          {puoConfermareInvio && scheda.lettera && (
            <View style={stili.scheda}>
              {invioFatto ? (
                <Text style={stili.grazie}>{T.invio.grazie}</Text>
              ) : (
                <>
                  <Bottone
                    testo={T.invio.bottone}
                    onPress={() => void hoInviato()}
                    caricamento={invioInCorso}
                    icona="send"
                  />
                  <Text style={stili.invioNota}>{T.invio.nota}</Text>
                </>
              )}
            </View>
          )}

          {p.garanziaFinoAl && (
            <Text style={stili.garanzia}>
              {riempi(T.garanzia, { data: dataBreve(p.garanziaFinoAl) })}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, gap: SPAZIO.l },
  indietro: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  indietroTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  centro: { alignItems: "center", paddingVertical: SPAZIO.xxl, gap: SPAZIO.l },
  nota: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo2 },
  errore: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.errore,
    textAlign: "center",
  },
  tratta: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
  },
  sotto: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo, marginTop: -SPAZIO.s },
  fascia: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
  },
  fasciaImporto: {
    fontFamily: FONT.display,
    fontSize: 34,
    letterSpacing: -1.2,
    color: COLORI.bianco,
  },
  fasciaPer: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.menta },
  fasciaNota: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.menta, marginTop: 2 },
  fasciaFonte: {
    fontFamily: FONT.testo,
    fontSize: 11.5,
    color: COLORI.bianco,
    opacity: 0.75,
    marginTop: SPAZIO.s,
  },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
  schedaTitolo: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
    marginBottom: SPAZIO.m,
  },
  passo: { flexDirection: "row", gap: SPAZIO.m },
  passoTraccia: { alignItems: "center", width: 22 },
  pallino: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORI.nebbia2,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  pallinoFatto: { backgroundColor: COLORI.verde, borderColor: COLORI.verde },
  pallinoCorrente: { borderWidth: 3, borderColor: COLORI.menta },
  linea: { width: 2, flex: 1, minHeight: 18, backgroundColor: COLORI.bordo },
  lineaFatta: { backgroundColor: COLORI.verde },
  passoTesti: { flex: 1, paddingBottom: SPAZIO.l },
  passoTesto: { fontFamily: FONT.testo, fontSize: 14.5, color: COLORI.fumo2 },
  passoTestoFatto: { color: COLORI.inchiostro },
  passoTestoCorrente: { fontFamily: FONT.testoSemi },
  passoData: { fontFamily: FONT.testo, fontSize: 12, color: COLORI.fumo2, marginTop: 1 },
  letteraSotto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
  },
  canale: {
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.m,
  },
  canaleTitolo: { fontFamily: FONT.testoSemi, fontSize: 13.5, color: COLORI.verdeNotte },
  canaleTesto: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.verdeNotte,
    marginTop: 2,
  },
  canaleIndirizzo: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 18,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.s,
  },
  oggettoEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORI.fumo2,
    marginTop: SPAZIO.l,
  },
  oggetto: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.inchiostro, marginTop: 2 },
  corpoRiquadro: {
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.m,
    maxHeight: 260,
    overflow: "hidden",
  },
  corpo: { fontFamily: FONT.testo, fontSize: 12.5, lineHeight: 19, color: COLORI.inchiostro },
  allegati: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  azioni: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  azioniRiga: { flexDirection: "row", gap: SPAZIO.l },
  azioneSecondaria: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    paddingVertical: SPAZIO.xs,
  },
  azioneSecondariaTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
  invioNota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  grazie: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.verdeScuro },
  garanzia: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo,
    textAlign: "center",
  },
});
