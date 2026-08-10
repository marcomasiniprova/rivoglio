/**
 * Il verdetto del check, coi tre esiti del motore (SPEC §4).
 *
 * Non ricalcola niente: legge quello che il server ha già deciso e lo
 * mostra. Un caso incerto NON si vende, e lo dice apertamente; un caso
 * idoneo mostra la fascia di legge senza mai promettere il pagamento.
 */
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChiHaOperato from "@/components/ChiHaOperato";
import marchio from "../../assets/images/marchio.png";
import Bottone from "@/components/Bottone";
import DomandeCaso from "@/components/DomandeCaso";
import Titolo from "@/components/Titolo";
import { Chip, Fasce, Soglia, VeloVerde } from "@/components/ScenaVerdetto";
import { SITO } from "@/lib/api";
import { durataLunga } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import * as WebBrowser from "expo-web-browser";

const V = TESTI.verdetto;
const SC = TESTI.verdetto.scena;

/** "2026-08-06" → "6 agosto 2026". */
const dataIt = (iso: string) =>
  iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

/** "2026-08-06T18:35Z" → "18:35". Vuoto se l'orario non c'è. */
const oraDa = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};

export default function SchermataVerdetto() {
  const router = useRouter();
  /* Il passaggio alla cassa (4d): un fermo che dice DOVE si paga e
     perché, prima di aprire il browser. */
  const [cassaAperta, setCassaAperta] = useState(false);
  const p = useLocalSearchParams<{
    volo: string;
    data: string;
    id: string;
    da: string;
    a: string;
    esito: string;
    motivo: string;
    importo: string;
    ritardo: string;
    previsto: string;
    effettivo: string;
    km: string;
    demo: string;
  }>();

  const idoneo = p.esito === "idoneo";
  const incerto = p.esito === "incerto";
  /* Il motore segnala il volo cancellato dentro il motivo: è la stessa
     frase che cerca il sito (lib/regole/eu261.ts), e non va cambiata alla
     leggera né qui né là. */
  const cancellato = (p.motivo ?? "").includes("risulta cancellato");
  const testa = idoneo ? V.idoneo : incerto ? V.incerto : V.nonIdoneo;
  const ritardo = Number(p.ritardo);
  const haRitardo = Number.isFinite(ritardo) && ritardo > 0;
  const haOrari = Boolean(p.previsto && p.effettivo);
  const importo = Number(p.importo) || 0;
  const km = Number(p.km) || 0;

  return (
    <ScrollView style={stili.pagina} contentContainerStyle={stili.contenuto}>
      {/* Il velo dice col colore quanto è certo il dato, prima ancora che
          si legga una parola: verde se verificato, giallo se incerto,
          niente se il no è solido. */}
      {(idoneo || incerto) && <VeloVerde tinta={incerto ? COLORI.sole : COLORI.menta} />}
      <View style={stili.testata}>
        <Image source={marchio} style={stili.segno} accessibilityLabel="Rivolio" />
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={stili.altro}>{V.altroVolo}</Text>
        </Pressable>
      </View>

      {/* IL BOLLO: dice da dove viene il verdetto, non cosa dice. È la
          prima cosa che si legge, e su un caso incerto è la più
          importante di tutta la schermata. */}
      <View
        style={[
          stili.bollo,
          incerto && stili.bolloIncerto,
          !idoneo && !incerto && stili.bolloGrigio,
        ]}
      >
        <View
          style={[
            stili.bolloPunto,
            incerto && stili.bolloPuntoIncerto,
            !idoneo && !incerto && stili.bolloPuntoGrigio,
          ]}
        />
        <Text
          style={[
            stili.bolloTesto,
            incerto && stili.bolloTestoIncerto,
            !idoneo && !incerto && stili.bolloTestoGrigio,
          ]}
        >
          {p.demo === "1"
            ? V.demo
            : idoneo
              ? SC.bolloIdoneo
              : incerto
                ? SC.bolloIncerto
                : SC.bolloNonIdoneo}
        </Text>
      </View>

      {/* IL FATTO, non il verdetto: il ritardo è lo stesso numero
          qualunque sia l'esito, e va detto per primo. Solo quando gli
          orari mancano si ripiega sul titolo dello stato. */}
      {haRitardo ? (
        <Text style={stili.titolone}>
          {SC.atterrato}{" "}
          <Text style={idoneo ? stili.titoloneTempo : stili.titoloneTempoNeutro}>
            {/* Spazi non separabili: senza, "3 h e 52 min" si spezza a
                capo e resta un "min" orfano su una riga da solo. */}
            {durataLunga(ritardo).replace(/ /g, " ")}
          </Text>{" "}
          {SC.diRitardo}
        </Text>
      ) : (
        <Titolo prima={testa.titolo.prima} corsivo={testa.titolo.corsivo} />
      )}

      <Text style={stili.tratta}>
        {p.da && p.a ? `${p.da} → ${p.a}` : p.volo} · {dataIt(p.data)}
      </Text>

      {/* ------------------------------------------------ la fascia */}
      {idoneo && importo > 0 && (
        <View style={stili.blocco}>
          <Text style={stili.fasciaEtichetta}>{SC.laTuaFascia}</Text>
          <View style={stili.importoRiga}>
            <Text style={stili.importone}>{importo}€</Text>
            <Text style={stili.importoPer}>{SC.perPasseggero}</Text>
          </View>
          <Fasce scelta={importo} />
        </View>
      )}

      {/* LA DIMOSTRAZIONE: gli orari e la soglia delle tre ore. Vale su
          tutti e tre gli esiti, perché è proprio quando il verdetto è no
          che la persona vuole vedere quanto le è mancato. */}
      {haOrari && haRitardo && (
        <View style={stili.blocco}>
          <Soglia
            previsto={oraDa(p.previsto)}
            effettivo={oraDa(p.effettivo)}
            minuti={ritardo}
            tono={idoneo ? "verde" : "neutro"}
          />
        </View>
      )}

      {/* I CHIP: solo dati che il motore ha davvero. */}
      <View style={stili.chips}>
        {km > 0 && <Chip etichetta={SC.chipTratta} valore={`${km.toLocaleString("it-IT")} km`} />}
        <Chip
          etichetta={SC.chipFonte}
          valore={p.demo === "1" ? SC.chipFonteDemo : SC.chipFonteValore}
        />
      </View>

      <Text style={stili.motivo}>{p.motivo}</Text>

      {/* IL CODESHARE SI CHIUDE QUI (6c): quando il motore si è fermato
          perché non sa chi ha fatto volare l'aereo, la risposta ce l'ha
          l'utente sulla carta d'imbarco. La parola codeshare non compare. */}
      {incerto && (p.motivo ?? "").toLowerCase().includes("codeshare") && (
        <ChiHaOperato
          volo={p.volo}
          dataIso={p.data}
          verificaId={p.id || null}
        />
      )}

      {/* Su un caso incerto la cosa più importante non è il motivo: è che
          non pagherai. Va detta in un blocco che si vede, non in una nota
          grigia in fondo dove nessuno arriva. */}
      {incerto && (
        <View style={stili.rassicura}>
          <Text style={stili.rassicuraTesto}>{SC.incertoRassicura}</Text>
        </View>
      )}

      {/* I CASI CHE GLI ARCHIVI NON VEDONO.
          Cancellato: le due domande dell'art. 5 compaiono da sole, perché
          il motore ha già detto che il volo risulta cancellato.
          Negato imbarco e coincidenza persa: l'invito compare sotto un
          "no" o un "incerto", cioè proprio quando il verdetto automatico
          sembra chiuso ma il caso dell'utente può essere un altro.
          Su un idoneo non serve: ha già la sua fascia. */}
      {!idoneo && (
        <DomandeCaso
          volo={p.volo}
          data={p.data}
          verificaId={p.id || null}
          cancellato={cancellato}
          demo={p.demo === "1"}
        />
      )}

      <Text style={stili.nota}>{testa.nota}</Text>

      <View style={stili.azioni}>
        {idoneo && (
          <>
            <Bottone
              testo={SC.preparaPratica}
              onPress={() => setCassaAperta(true)}
              icona="arrow-right"
            />
            {/* ⚠️ Il prezzo NON si scrive nel bottone: è acceso il test
                dei due prezzi e la variante la decide il sito con un
                cookie. Scrivere 14,90 qui manderebbe metà delle persone
                a una cassa con un'altra cifra. */}
            <Text style={stili.prezzoNota}>{SC.prezzoNota}</Text>
            <Text style={stili.nonPromessa}>{SC.nonPromessa}</Text>
          </>
        )}
        <Bottone
          testo={V.altroVolo}
          onPress={() => router.back()}
          variante={idoneo ? "fantasma" : "pieno"}
        />
      </View>

      {/* ------------------------------- il passaggio alla cassa (4d) */}
      <Modal
        visible={cassaAperta}
        animationType="slide"
        transparent
        onRequestClose={() => setCassaAperta(false)}
      >
        <View style={stili.cassaSfondo}>
          <View style={stili.cassaFoglio}>
            <Text style={stili.cassaTitolo}>{TESTI.cassa.titolo}</Text>
            <Text style={stili.cassaTesto}>{TESTI.cassa.testo}</Text>
            <Text style={stili.cassaPrezzo}>{TESTI.cassa.prezzoNota}</Text>
            <View style={stili.cassaAzioni}>
              <Bottone
                testo={TESTI.cassa.apri}
                icona="external-link"
                onPress={() => {
                  setCassaAperta(false);
                  void WebBrowser.openBrowserAsync(`${SITO}/#controllo`);
                }}
              />
              <Bottone
                testo={TESTI.cassa.dopo}
                variante="fantasma"
                onPress={() => setCassaAperta(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.l,
    paddingBottom: SPAZIO.xxl,
  },
  testata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPAZIO.xl,
  },
  segno: { width: 30, height: 30 },
  altro: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  /* IL BOLLO. Cambia colore col grado di certezza, non con l'esito:
     verde quando il dato è verificato, giallo quando non lo è. Un non
     idoneo su dato certo resta grigio, perché il no è solido. */
  bollo: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 6,
    marginBottom: SPAZIO.l,
  },
  bolloIncerto: { backgroundColor: "#FDF6E3" },
  bolloGrigio: { backgroundColor: COLORI.nebbia2 },
  bolloPunto: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORI.verde },
  bolloPuntoIncerto: { backgroundColor: COLORI.sole },
  bolloPuntoGrigio: { backgroundColor: COLORI.fumo2 },
  bolloTesto: {
    fontFamily: FONT.testoSemi,
    fontSize: 11.5,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: COLORI.verdeScuro,
  },
  bolloTestoIncerto: { color: "#8A6A16" },
  bolloTestoGrigio: { color: COLORI.fumo },

  /* IL TITOLONE. Il numero dentro la frase è il protagonista: prima era
     una riga di servizio sotto la scheda, e nessuno la leggeva. */
  titolone: {
    fontFamily: FONT.display,
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -1.1,
    color: COLORI.inchiostro,
  },
  titoloneTempo: { color: COLORI.verde },
  titoloneTempoNeutro: { color: COLORI.fumo },
  tratta: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },

  blocco: { marginTop: SPAZIO.xl },
  fasciaEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORI.fumo2,
  },
  importoRiga: { flexDirection: "row", alignItems: "baseline", gap: SPAZIO.m },
  importone: {
    fontFamily: FONT.display,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -3.4,
    color: COLORI.inchiostro,
  },
  importoPer: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo },

  chips: { flexDirection: "row", gap: SPAZIO.s, marginTop: SPAZIO.xl },

  motivo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.xl,
  },
  rassicura: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
  },
  rassicuraTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    lineHeight: 21,
    color: COLORI.verdeScuro,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 21,
    color: COLORI.fumo,
    marginTop: SPAZIO.l,
  },
  azioni: { marginTop: SPAZIO.xl, gap: SPAZIO.m },
  cassaSfondo: {
    flex: 1,
    backgroundColor: "rgba(5,46,31,0.55)",
    justifyContent: "flex-end",
  },
  cassaFoglio: {
    backgroundColor: COLORI.bianco,
    borderTopLeftRadius: RAGGIO.massimo,
    borderTopRightRadius: RAGGIO.massimo,
    padding: SPAZIO.xl,
    paddingBottom: SPAZIO.xxl,
  },
  cassaTitolo: {
    fontFamily: FONT.display,
    fontSize: 23,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  cassaTesto: {
    fontFamily: FONT.testo,
    fontSize: 14,
    lineHeight: 21,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  cassaPrezzo: {
    fontFamily: FONT.testoMedio,
    fontSize: 12.5,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.m,
  },
  cassaAzioni: { marginTop: SPAZIO.l, gap: SPAZIO.m },
  prezzoNota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo,
    textAlign: "center",
    marginTop: -SPAZIO.xs,
  },
  nonPromessa: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 18,
    color: COLORI.fumo2,
    marginTop: SPAZIO.s,
  },
});
