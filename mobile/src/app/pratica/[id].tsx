/**
 * LA SCHEDA DELLA PRATICA: i quattro fogli (tavola 6e, giro #49).
 *
 * Richiesta di Valerio (8/08, popup): "tutto tranne pagare". Qui dentro
 * la pratica si segue e si combatte: il reclamo, la replica al loro no
 * (o il sollecito), la segnalazione all'ente, la conciliazione. Ogni
 * foglio si apre a schermo pieno (6g), si copia e si manda dalla email
 * dell'utente. Il no della compagnia si dichiara qui (6d), a scelta
 * chiusa.
 *
 * Regole di sempre: l'app non decide niente. I fogli arrivano dal
 * server, calcolati dallo stesso codice del sito; i tempi (42 giorni,
 * +14, 30 per la conciliazione) sono suoi, non nostri. E non si promette
 * mai l'esito: "richiesta di 400€", mai "la compagnia deve".
 */
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { condividi as condividiApp } from "@/lib/sistema";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import {
  confermaInvio,
  dichiaraRifiuto,
  motiviRifiuto,
  schedaPratica,
  type MotivoRifiutoApp,
  type SchedaPratica,
} from "@/lib/api";
import { DEMO, schedaDemo } from "@/lib/dati";
import { ID_ESEMPIO, schedaEsempio } from "@/lib/esempio";
import { scenaDa } from "@/lib/anteprima";
import { dataBreve, euro } from "@/lib/formati";
import { tokenSessione } from "@/lib/sessione";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.praticaScheda;

const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

const dataLunga = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
};

/** Un foglio aperto a schermo pieno (6g). */
type FoglioAperto = {
  titolo: string;
  oggetto: string;
  corpo: string;
  /** Indirizzo email a cui si manda, se un indirizzo esiste. */
  email: string | null;
  /** true per la segnalazione: si presenta sul portale, non per email. */
  soloPortale?: boolean;
};

export default function SchermataPratica() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, scena } = useLocalSearchParams<{ id: string; scena?: string }>();
  /* La lavagna del sito apre la pratica dimostrativa già sul momento
     che vuole mostrare: il foglio a schermo pieno, il no della
     compagnia, l'esito. Nell'app vera questo parametro non c'è mai. */
  const momento = scenaDa(scena);

  const [stato, setStato] = useState<"caricamento" | "errore" | "pronto">("caricamento");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [scheda, setScheda] = useState<SchedaPratica | null>(null);
  const [aggiorno, setAggiorno] = useState(false);
  const [invioInCorso, setInvioInCorso] = useState(false);
  const [invioFatto, setInvioFatto] = useState(false);

  /* Il foglio aperto a schermo pieno, e il suo "copiato". */
  const [aperto, setAperto] = useState<FoglioAperto | null>(null);
  const [copiato, setCopiato] = useState(false);

  /* Il no della compagnia (6d): la lista si apre, si sceglie, si manda. */
  const [rifiutoAperto, setRifiutoAperto] = useState(false);
  const [motivi, setMotivi] = useState<MotivoRifiutoApp[]>([]);
  const [motivoScelto, setMotivoScelto] = useState<string | null>(null);
  const [rifiutoInCorso, setRifiutoInCorso] = useState(false);

  const carica = useCallback(async () => {
    if (!id) return;

    /* LA PRATICA DIMOSTRATIVA (solo dalla lavagna del sito): id fisso,
       volo ZZ che non appartiene a nessuna compagnia, e un bollo in
       testata che dice cos'è. Non si raggiunge per sbaglio. */
    if (id === ID_ESEMPIO) {
      const finta = schedaEsempio(momento);
      setScheda(finta);
      setStato("pronto");
      if (momento === "rifiuto") setRifiutoAperto(true);
      if (momento === "foglio" && finta.lettera) {
        setAperto({
          titolo: T.fogli.titoli.reclamo,
          oggetto: finta.lettera.oggetto,
          corpo: finta.lettera.corpo,
          email: finta.lettera.compagnia?.email ?? null,
        });
      }
      return;
    }

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
  }, [id, momento]);

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

  async function copia(testo: string) {
    try {
      await Clipboard.setStringAsync(testo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2600);
    } catch (e) {
      console.warn("[pratica] copia fallita:", e);
    }
  }

  async function apriEmail(foglio: FoglioAperto) {
    const a = foglio.email ?? "";
    const url = `mailto:${a}?subject=${encodeURIComponent(foglio.oggetto)}&body=${encodeURIComponent(foglio.corpo)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      // Nessuna app email sul dispositivo: si ripiega sulla condivisione.
      console.warn("[pratica] mailto non aperto:", e);
      const avviso = await condividiApp(`${foglio.oggetto}\n\n${foglio.corpo}`);
      if (avviso) setMessaggio(avviso);
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

  async function apriRifiuto() {
    setRifiutoAperto(true);
    if (motivi.length === 0) setMotivi(await motiviRifiuto());
  }

  async function mandaRifiuto() {
    if (!scheda || !motivoScelto) return;
    if (DEMO) {
      setMessaggio(T.rifiuto.demoNota);
      setRifiutoAperto(false);
      return;
    }
    setRifiutoInCorso(true);
    const token = await tokenSessione();
    const esito = token
      ? await dichiaraRifiuto(scheda.pratica.id, motivoScelto, token)
      : { ok: false, errore: T.entraPrima };
    setRifiutoInCorso(false);
    if (!esito.ok) {
      setMessaggio(esito.errore ?? T.errore);
      return;
    }
    setRifiutoAperto(false);
    await carica();
  }

  const p = scheda?.pratica;
  const inviata = Boolean(p?.inviataIl);
  const rifiutoDichiarato = Boolean(scheda?.rifiutoMotivo && scheda.rifiutoMotivo !== "silenzio");
  const etichettaMotivo =
    motivi.find((m) => m.motivo === scheda?.rifiutoMotivo)?.etichetta ?? scheda?.rifiutoMotivo;
  const puoConfermareInvio = p && (p.stato === "pagata" || p.stato === "pronta");
  const finale =
    p && (T.esitiFinali as Record<string, string>)[p.stato]
      ? (T.esitiFinali as Record<string, string>)[p.stato]
      : null;

  /* Il badge d'etichetta di ogni motivo: il silenzio ha la sua frase. */
  const pesoDi = (m: MotivoRifiutoApp) =>
    m.motivo === "silenzio"
      ? { testo: T.rifiuto.pesi.silenzio, tono: "grigio" as const }
      : m.peso === "dipende"
        ? { testo: T.rifiuto.pesi.dipende, tono: "giallo" as const }
        : { testo: T.rifiuto.pesi.debole, tono: "verde" as const };

  return (
    <ScrollView
      style={stili.pagina}
      contentContainerStyle={[stili.contenuto, { paddingBottom: insets.bottom + SPAZIO.xxl }]}
      refreshControl={
        <RefreshControl refreshing={aggiorno} onRefresh={() => void aggiorna()} tintColor={COLORI.verde} />
      }
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={stili.indietro}>
        <Feather name="arrow-left" size={16} color={COLORI.fumo} />
        <Text style={stili.indietroTesto}>{T.indietro}</Text>
      </Pressable>

      {stato === "caricamento" && (
        <View style={stili.centro}>
          <ActivityIndicator color={COLORI.verde} />
          <Text style={stili.nota}>{T.caricamento}</Text>
        </View>
      )}

      {stato === "errore" && (
        <View style={stili.centro}>
          <Text style={stili.errore}>{messaggio ?? T.errore}</Text>
          <Bottone testo={TESTI.comune.riprova} onPress={() => void carica()} variante="fantasma" />
        </View>
      )}

      {stato === "pronto" && p && scheda && (
        <>
          {/* ------------------------------------------------ testata */}
          {id === ID_ESEMPIO && (
            <View style={stili.esempio}>
              <Text style={stili.esempioTesto}>ESEMPIO DIMOSTRATIVO</Text>
            </View>
          )}
          <Text style={stili.occhiello}>{T.occhiello.toUpperCase()}</Text>
          <Text style={stili.tratta}>
            {p.volo?.da && p.volo?.a ? `${p.volo.da} · ${p.volo.a}` : (p.volo?.iata ?? T.voloMancante)}
          </Text>
          <Text style={stili.sotto}>
            {p.volo?.data ? `${dataBreve(p.volo.data)} · ` : ""}
            {p.importo ? riempi(T.richiestaDi, { importo: euro(p.importo) }) : ""}
          </Text>

          {/* GLI ESITI FINALI IN FACCIA (3h, 4i): quando la partita è
              chiusa, la prima schermata lo dice in grande, non con una
              pillola. La cifra vera del bonifico la conosce solo il suo
              conto: qui si cita la fascia, che è il dato nostro. */}
          {p.stato === "esito_pagata" && (
            <View style={stili.vittoria}>
              <Text style={stili.vittoriaOcchiello}>
                {TESTI.esitoFinale.pagata.occhiello.toUpperCase()}
              </Text>
              <Text style={stili.vittoriaTitolo}>{TESTI.esitoFinale.pagata.titolo}</Text>
              <Text style={stili.vittoriaTesto}>
                {TESTI.esitoFinale.pagata.testo.replace(
                  "{importo}",
                  p.importo ? euro(p.importo) : "quella del Regolamento",
                )}
              </Text>
              <View style={stili.vittoriaAzione}>
                <Bottone
                  testo={TESTI.esitoFinale.pagata.bottone}
                  onPress={() => router.navigate("/")}
                />
              </View>
            </View>
          )}
          {p.stato === "rimborsata" && (
            <View style={stili.garanziaBlocco}>
              <Text style={stili.vittoriaOcchiello}>
                {TESTI.esitoFinale.rimborsata.occhiello.toUpperCase()}
              </Text>
              <Text style={stili.garanziaTitolo}>{TESTI.esitoFinale.rimborsata.titolo}</Text>
              <Text style={stili.garanziaTesto}>{TESTI.esitoFinale.rimborsata.testo}</Text>
            </View>
          )}
          {finale && p.stato !== "esito_pagata" && p.stato !== "rimborsata" && (
            <View style={stili.finale}>
              <Text style={stili.finaleTesto}>{finale}</Text>
            </View>
          )}

          {messaggio && stato === "pronto" && (
            <Text style={stili.avviso} accessibilityRole="alert">
              {messaggio}
            </Text>
          )}

          {/* -------------------------------------- 1° · il reclamo */}
          <View style={stili.foglio}>
            <View style={stili.foglioTesta}>
              <Text style={stili.foglioTitolo}>{T.fogli.titoli.reclamo}</Text>
              <View style={[stili.bollo, inviata ? stili.bolloFatto : stili.bolloPronto]}>
                <Text style={[stili.bolloTesto, inviata ? stili.bolloTestoFatto : stili.bolloTestoPronto]}>
                  {inviata ? T.fogli.stati.inviato : scheda.lettera ? T.fogli.stati.pronto : T.fogli.stati.dopo}
                </Text>
              </View>
            </View>

            {inviata && p.inviataIl ? (
              <Text style={stili.foglioRiga}>{riempi(T.fogli.inviatoIl, { data: dataLunga(p.inviataIl) })}</Text>
            ) : scheda.lettera ? (
              <Text style={stili.foglioRiga}>{T.lettera.sottotitolo}</Text>
            ) : (
              <Text style={stili.foglioRiga}>{T.lettera.manca}</Text>
            )}

            {scheda.lettera && (
              <>
                <View style={stili.oggetto}>
                  <Text style={stili.oggettoEtichetta}>{T.lettera.oggetto.toUpperCase()}</Text>
                  <Text style={stili.oggettoTesto}>{scheda.lettera.oggetto}</Text>
                </View>
                <View style={stili.foglioAzioni}>
                  <Bottone
                    testo={T.fogli.apri}
                    variante="fantasma"
                    onPress={() =>
                      setAperto({
                        titolo: T.fogli.titoli.reclamo,
                        oggetto: scheda.lettera!.oggetto,
                        corpo: scheda.lettera!.corpo,
                        email: scheda.lettera!.compagnia?.email ?? null,
                      })
                    }
                  />
                  {puoConfermareInvio && !invioFatto && (
                    <>
                      <Bottone testo={T.invio.bottone} onPress={() => void hoInviato()} caricamento={invioInCorso} />
                      <Text style={stili.invioNota}>{T.invio.nota}</Text>
                    </>
                  )}
                  {invioFatto && <Text style={stili.grazie}>{T.invio.grazie}</Text>}
                </View>
              </>
            )}
          </View>

          {/* --------------------- 2° · la replica al no o il sollecito */}
          <View style={stili.foglio}>
            <View style={stili.foglioTesta}>
              <Text style={stili.foglioTitolo}>
                {rifiutoDichiarato ? T.fogli.titoli.replica : T.fogli.titoli.sollecito}
              </Text>
              <View style={[stili.bollo, scheda.sollecito ? stili.bolloPronto : stili.bolloDopo]}>
                <Text style={[stili.bolloTesto, scheda.sollecito ? stili.bolloTestoPronto : stili.bolloTestoDopo]}>
                  {scheda.sollecito ? T.fogli.stati.pronto : T.fogli.stati.dopo}
                </Text>
              </View>
            </View>

            {scheda.sollecito ? (
              <>
                <Text style={stili.foglioRiga}>
                  {rifiutoDichiarato && etichettaMotivo
                    ? riempi(T.fogli.replicaAperta, { motivo: etichettaMotivo })
                    : T.fogli.sollecitoChiuso}
                </Text>
                <View style={stili.foglioAzioni}>
                  <Bottone
                    testo={T.fogli.apri}
                    variante="fantasma"
                    onPress={() =>
                      setAperto({
                        titolo: rifiutoDichiarato ? T.fogli.titoli.replica : T.fogli.titoli.sollecito,
                        oggetto: scheda.sollecito!.oggetto,
                        corpo: scheda.sollecito!.corpo,
                        email: scheda.lettera?.compagnia?.email ?? null,
                      })
                    }
                  />
                </View>
              </>
            ) : (
              <Text style={stili.foglioRiga}>{T.fogli.sollecitoChiuso}</Text>
            )}

            {/* Il no si può dichiarare finché non è già dichiarato. */}
            {inviata && !rifiutoDichiarato && (
              <Pressable onPress={() => void apriRifiuto()} accessibilityRole="button" style={stili.rifiutoBottone}>
                <Text style={stili.rifiutoBottoneTesto}>{T.rifiuto.bottone}</Text>
              </Pressable>
            )}
          </View>

          {/* ------------------------- 3° · la segnalazione all'ente */}
          <View style={stili.foglio}>
            <View style={stili.foglioTesta}>
              <Text style={stili.foglioTitolo}>{T.fogli.titoli.segnalazione}</Text>
              <View style={[stili.bollo, scheda.segnalazione ? stili.bolloPronto : stili.bolloDopo]}>
                <Text
                  style={[stili.bolloTesto, scheda.segnalazione ? stili.bolloTestoPronto : stili.bolloTestoDopo]}
                >
                  {scheda.segnalazione ? T.fogli.stati.pronto : T.fogli.stati.dopo}
                </Text>
              </View>
            </View>
            <Text style={stili.foglioRiga}>
              {scheda.segnalazione ? T.fogli.segnalazioneDove : T.fogli.segnalazioneChiusa}
            </Text>
            <View style={stili.notaGialla}>
              <Text style={stili.notaGiallaTesto}>{T.fogli.segnalazioneNota}</Text>
            </View>
            {scheda.segnalazione && (
              <View style={stili.foglioAzioni}>
                <Bottone
                  testo={T.fogli.apri}
                  variante="fantasma"
                  onPress={() =>
                    setAperto({
                      titolo: T.fogli.titoli.segnalazione,
                      oggetto: scheda.segnalazione!.oggetto,
                      corpo: scheda.segnalazione!.corpo,
                      email: null,
                      soloPortale: true,
                    })
                  }
                />
              </View>
            )}
          </View>

          {/* --------------------------------- 4° · la conciliazione */}
          <View style={stili.foglio}>
            <View style={stili.foglioTesta}>
              <Text style={stili.foglioTitolo}>{T.fogli.titoli.conciliazione}</Text>
              <View style={[stili.bollo, scheda.conciliazione ? stili.bolloPronto : stili.bolloDopo]}>
                <Text
                  style={[stili.bolloTesto, scheda.conciliazione ? stili.bolloTestoPronto : stili.bolloTestoDopo]}
                >
                  {scheda.conciliazione ? T.fogli.stati.pronto : T.fogli.stati.dopo}
                </Text>
              </View>
            </View>

            {scheda.conciliazione ? (
              <>
                <Text style={stili.foglioRiga}>{scheda.conciliazione.premessa}</Text>
                <View style={stili.concGriglia}>
                  <View style={stili.concCella}>
                    <Text style={stili.concEtichetta}>{T.conciliazione.costo.toUpperCase()}</Text>
                    <Text style={stili.concValore}>{scheda.conciliazione.costo}</Text>
                  </View>
                  <View style={stili.concCella}>
                    <Text style={stili.concEtichetta}>{T.conciliazione.scadenza.toUpperCase()}</Text>
                    <Text style={stili.concValore}>{scheda.conciliazione.scadenza}</Text>
                  </View>
                </View>
                {scheda.conciliazione.passi.map((passo, i) => (
                  <View key={passo} style={stili.concPasso}>
                    <View style={stili.concNumero}>
                      <Text style={stili.concNumeroTesto}>{i + 1}</Text>
                    </View>
                    <Text style={stili.concPassoTesto}>{passo}</Text>
                  </View>
                ))}
                <View style={stili.notaGialla}>
                  <Text style={stili.notaGiallaTesto}>{scheda.conciliazione.avvertenza}</Text>
                </View>
                <View style={stili.foglioAzioni}>
                  <Bottone
                    testo={riempi(T.conciliazione.apri, {
                      nome: scheda.conciliazione.sigla ?? scheda.conciliazione.nome,
                    })}
                    icona="external-link"
                    onPress={() => {
                      void openBrowserAsync(scheda.conciliazione!.url);
                    }}
                  />
                </View>
                <Text style={stili.concFonte}>
                  {T.conciliazione.fonteTitolo}: {scheda.conciliazione.fonte}
                </Text>
              </>
            ) : (
              <Text style={stili.foglioRiga}>{T.fogli.conciliazioneChiusa}</Text>
            )}
          </View>

          <Text style={stili.tuttiTuoi}>{T.fogli.tuttiTuoi}</Text>
        </>
      )}

      {/* ------------------------------- il no della compagnia (6d) */}
      <Modal visible={rifiutoAperto} animationType="slide" onRequestClose={() => setRifiutoAperto(false)}>
        <ScrollView style={stili.pagina} contentContainerStyle={stili.contenutoModale}>
          <Text style={stili.tratta}>{T.rifiuto.titolo}</Text>
          <Text style={stili.sotto}>{T.rifiuto.sotto}</Text>

          <View style={stili.motivi}>
            {motivi.length === 0 && <ActivityIndicator color={COLORI.verde} />}
            {motivi.map((m) => {
              const attivo = motivoScelto === m.motivo;
              const peso = pesoDi(m);
              return (
                <Pressable
                  key={m.motivo}
                  onPress={() => setMotivoScelto(m.motivo)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: attivo }}
                  style={[stili.motivo, attivo && stili.motivoAttivo]}
                >
                  <View style={[stili.radio, attivo && stili.radioAttivo]}>
                    {attivo && <View style={stili.radioPunto} />}
                  </View>
                  <View style={stili.motivoTesti}>
                    <Text style={stili.motivoTitolo}>{m.etichetta}</Text>
                    <Text style={stili.motivoAiuto}>{m.aiuto}</Text>
                    <View
                      style={[
                        stili.peso,
                        peso.tono === "verde" && stili.pesoVerde,
                        peso.tono === "giallo" && stili.pesoGiallo,
                      ]}
                    >
                      <Text
                        style={[
                          stili.pesoTesto,
                          peso.tono === "verde" && stili.pesoTestoVerde,
                          peso.tono === "giallo" && stili.pesoTestoGiallo,
                        ]}
                      >
                        {peso.testo}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={stili.allegaEmail}>{T.rifiuto.allegaEmail}</Text>

          <View style={stili.foglioAzioni}>
            <Bottone
              testo={T.rifiuto.conferma}
              onPress={() => void mandaRifiuto()}
              caricamento={rifiutoInCorso}
              disabilitato={!motivoScelto}
            />
            <Pressable
              onPress={() => setRifiutoAperto(false)}
              accessibilityRole="button"
              style={stili.annulla}
            >
              <Text style={stili.annullaTesto}>{T.rifiuto.annulla}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>

      {/* ------------------------- il foglio a schermo pieno (6g) */}
      <Modal visible={aperto !== null} animationType="slide" onRequestClose={() => setAperto(null)}>
        {aperto && (
          <View style={stili.pagina}>
            <View style={[stili.foglioPienoTesta, { paddingTop: insets.top + SPAZIO.l }]}>
              <Pressable onPress={() => setAperto(null)} accessibilityRole="button" style={stili.chiudi}>
                <Feather name="x" size={20} color={COLORI.inchiostro} />
              </Pressable>
              <View style={stili.foglioPienoTitoli}>
                <Text style={stili.foglioPienoTitolo}>{aperto.titolo}</Text>
              </View>
              <Pressable
                onPress={() => void copia(`${aperto.oggetto}\n\n${aperto.corpo}`)}
                accessibilityRole="button"
                style={stili.copiaPillola}
              >
                <Text style={stili.copiaPillolaTesto}>
                  {copiato ? T.foglio.copiato : T.foglio.copia}
                </Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={stili.foglioPienoCorpo}>
              <View style={stili.carta}>
                <Text style={stili.cartaOggetto}>{aperto.oggetto}</Text>
                <Text style={stili.cartaCorpo}>{aperto.corpo}</Text>
              </View>
              <Text style={stili.campiGialli}>{T.foglio.campiGialli}</Text>
            </ScrollView>

            <View style={[stili.foglioPienoPiedi, { paddingBottom: insets.bottom + SPAZIO.l }]}>
              {aperto.soloPortale ? (
                <Text style={stili.invioNota}>{T.fogli.segnalazioneDove}</Text>
              ) : (
                <Bottone testo={T.foglio.apriEmail} icona="mail" onPress={() => void apriEmail(aperto)} />
              )}
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, paddingTop: SPAZIO.xxl + SPAZIO.l },
  contenutoModale: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.xl,
    paddingBottom: SPAZIO.xxl,
  },
  indietro: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.s,
    marginBottom: SPAZIO.s,
  },
  indietroTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  centro: { alignItems: "center", gap: SPAZIO.m, paddingVertical: SPAZIO.xxl },
  nota: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo2 },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 14,
    color: COLORI.errore,
    textAlign: "center",
    maxWidth: 300,
  },
  avviso: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },

  occhiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 11,
    letterSpacing: 1.8,
    color: COLORI.verdeScuro,
  },
  /* Il bollo della pratica dimostrativa: non si toglie e non si confonde
     con una pratica vera. Vale la regola 3 del progetto. */
  esempio: {
    alignSelf: "flex-start",
    backgroundColor: COLORI.sole,
    borderRadius: RAGGIO.minimo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 5,
    marginBottom: SPAZIO.m,
  },
  esempioTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: COLORI.inchiostro,
  },
  tratta: {
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  sotto: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo, marginTop: SPAZIO.xs },
  finale: {
    alignSelf: "flex-start",
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 6,
    marginTop: SPAZIO.m,
  },
  finaleTesto: { fontFamily: FONT.testoSemi, fontSize: 12.5, color: COLORI.verdeScuro },
  vittoria: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.l,
    ...OMBRA.sollevata,
  },
  vittoriaOcchiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORI.menta,
  },
  vittoriaTitolo: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.8,
    color: COLORI.bianco,
    marginTop: SPAZIO.s,
  },
  vittoriaTesto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPAZIO.m,
  },
  vittoriaAzione: { marginTop: SPAZIO.l },
  garanziaBlocco: {
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
  },
  garanziaTitolo: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  garanziaTesto: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },

  /* Un foglio della timeline. */
  foglio: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
    ...OMBRA.scheda,
  },
  foglioTesta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  foglioTitolo: {
    flex: 1,
    fontFamily: FONT.testoSemi,
    fontSize: 15,
    color: COLORI.inchiostro,
  },
  bollo: { borderRadius: RAGGIO.pillola, paddingHorizontal: SPAZIO.m, paddingVertical: 4 },
  bolloFatto: { backgroundColor: COLORI.mentaTenue },
  bolloPronto: { backgroundColor: COLORI.verde },
  bolloDopo: { backgroundColor: COLORI.nebbia2 },
  bolloTesto: { fontFamily: FONT.testoSemi, fontSize: 11.5 },
  bolloTestoFatto: { color: COLORI.verdeScuro },
  bolloTestoPronto: { color: COLORI.bianco },
  bolloTestoDopo: { color: COLORI.fumo },
  foglioRiga: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  oggetto: {
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.m,
  },
  oggettoEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 10,
    letterSpacing: 1.2,
    color: COLORI.fumo2,
  },
  oggettoTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORI.inchiostro,
    marginTop: 3,
  },
  foglioAzioni: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  invioNota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    textAlign: "center",
  },
  grazie: { fontFamily: FONT.testoMedio, fontSize: 13.5, color: COLORI.verdeScuro },

  rifiutoBottone: {
    marginTop: SPAZIO.l,
    borderTopWidth: 1,
    borderTopColor: COLORI.bordo,
    paddingTop: SPAZIO.l,
  },
  rifiutoBottoneTesto: { fontFamily: FONT.testoSemi, fontSize: 14, color: COLORI.verdeScuro },

  notaGialla: {
    backgroundColor: "#FDF6E3",
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
    marginTop: SPAZIO.m,
  },
  notaGiallaTesto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.ambra,
  },
  tuttiTuoi: {
    fontFamily: FONT.testo,
    fontSize: 13,
    color: COLORI.fumo,
    textAlign: "center",
    marginTop: SPAZIO.xl,
  },

  /* La conciliazione (6f). */
  concGriglia: { flexDirection: "row", gap: SPAZIO.s, marginTop: SPAZIO.m },
  concCella: {
    flex: 1,
    backgroundColor: COLORI.nebbia,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.m,
  },
  concEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 10,
    letterSpacing: 1,
    color: COLORI.fumo2,
  },
  concValore: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.inchiostro,
    marginTop: 3,
  },
  concPasso: { flexDirection: "row", gap: SPAZIO.m, marginTop: SPAZIO.m },
  concNumero: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORI.mentaTenue,
    alignItems: "center",
    justifyContent: "center",
  },
  concNumeroTesto: { fontFamily: FONT.testoSemi, fontSize: 12, color: COLORI.verdeScuro },
  concPassoTesto: {
    flex: 1,
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.inchiostro,
  },
  concFonte: {
    fontFamily: FONT.testo,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORI.fumo2,
    marginTop: SPAZIO.m,
  },

  /* Il no della compagnia (6d). */
  motivi: { marginTop: SPAZIO.xl, gap: SPAZIO.s },
  motivo: {
    flexDirection: "row",
    gap: SPAZIO.m,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderLeftWidth: 3,
    borderLeftColor: COLORI.bordo,
    borderRadius: RAGGIO.interno,
    padding: SPAZIO.l,
  },
  motivoAttivo: {
    backgroundColor: COLORI.mentaTenue,
    borderColor: COLORI.menta,
    borderLeftColor: COLORI.verde,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioAttivo: { borderColor: COLORI.verde },
  radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORI.verde },
  motivoTesti: { flex: 1 },
  motivoTitolo: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.inchiostro },
  motivoAiuto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: 2,
  },
  peso: {
    alignSelf: "flex-start",
    backgroundColor: COLORI.nebbia2,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.s + 2,
    paddingVertical: 3,
    marginTop: SPAZIO.s,
  },
  pesoVerde: { backgroundColor: COLORI.mentaTenue },
  pesoGiallo: { backgroundColor: "#FDF6E3" },
  pesoTesto: { fontFamily: FONT.testoMedio, fontSize: 11, color: COLORI.fumo },
  pesoTestoVerde: { color: COLORI.verdeScuro },
  pesoTestoGiallo: { color: COLORI.ambra },
  allegaEmail: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
  },
  annulla: { alignSelf: "center", padding: SPAZIO.s },
  annullaTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },

  /* Il foglio a schermo pieno (6g). */
  foglioPienoTesta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.schermata,
    paddingBottom: SPAZIO.m,
    backgroundColor: COLORI.bianco,
    borderBottomWidth: 1,
    borderBottomColor: COLORI.bordo,
  },
  chiudi: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORI.nebbia,
    alignItems: "center",
    justifyContent: "center",
  },
  foglioPienoTitoli: { flex: 1 },
  foglioPienoTitolo: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.inchiostro },
  copiaPillola: {
    borderWidth: 1,
    borderColor: COLORI.verde,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: 7,
  },
  copiaPillolaTesto: { fontFamily: FONT.testoSemi, fontSize: 13, color: COLORI.verdeScuro },
  foglioPienoCorpo: { padding: SPAZIO.schermata, paddingBottom: SPAZIO.xxl },
  carta: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.interno,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.xl,
    ...OMBRA.scheda,
  },
  cartaOggetto: {
    fontFamily: FONT.testoSemi,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.inchiostro,
  },
  cartaCorpo: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 21,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.l,
  },
  campiGialli: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
    textAlign: "center",
  },
  foglioPienoPiedi: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.m,
    backgroundColor: COLORI.bianco,
    borderTopWidth: 1,
    borderTopColor: COLORI.bordo,
  },
});
