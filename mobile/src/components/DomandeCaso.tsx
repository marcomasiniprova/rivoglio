/**
 * I CASI CHE GLI ARCHIVI NON VEDONO, dentro l'app.
 *
 * Sul sito questi due flussi esistevano da giorni; sull'app un volo
 * cancellato diceva "incerto" e finiva lì, che è il vicolo cieco più caro
 * che avevamo (è il caso in cui la compensazione spetta più spesso).
 *
 * Due flussi, stesse regole del sito:
 *  - CANCELLATO: preavviso e volo alternativo (art. 5). Compare da solo,
 *    perché il motore ha già detto che il volo risulta cancellato.
 *  - DICHIARATO: negato imbarco (art. 4) o coincidenza persa (Folkerts).
 *    Lo apre l'utente, perché sono fatti che nessun archivio registra.
 *
 * IL VERDETTO NON SI CALCOLA QUI. Si spediscono le risposte e si mostra
 * quello che decide il motore sul server: in questo file non c'è una sola
 * regola del Regolamento, e non deve entrarci mai.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  cercaAeroporti,
  chiudiCancellato,
  chiudiDichiarato,
  type AeroportoTrovato,
  type EsitoDomande,
} from "@/lib/api";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import Bottone from "./Bottone";

const T = TESTI.domande;

type Voce = { valore: string; testo: string };

/** Un gruppo di risposte a scelta chiusa: niente testo libero, mai. */
function Scelte({
  domanda,
  aiuto,
  voci,
  scelta,
  scegli,
}: {
  domanda: string;
  aiuto?: string;
  voci: readonly Voce[];
  scelta: string | null;
  scegli: (v: string) => void;
}) {
  return (
    <View style={stili.gruppo}>
      <Text style={stili.domanda}>{domanda}</Text>
      {aiuto ? <Text style={stili.aiuto}>{aiuto}</Text> : null}
      {voci.map((v) => {
        const attiva = scelta === v.valore;
        return (
          <Pressable
            key={v.valore}
            onPress={() => scegli(v.valore)}
            accessibilityRole="radio"
            accessibilityState={{ selected: attiva }}
            style={[stili.voce, attiva && stili.voceAttiva]}
          >
            <View style={[stili.pallino, attiva && stili.pallinoAttivo]}>
              {attiva ? <View style={stili.pallinoPieno} /> : null}
            </View>
            <Text style={[stili.voceTesto, attiva && stili.voceTestoAttivo]}>{v.testo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** La destinazione finale: si scrive la città, si sceglie lo scalo vero. */
function CampoDestinazione({
  scelto,
  scegli,
}: {
  scelto: AeroportoTrovato | null;
  scegli: (a: AeroportoTrovato | null) => void;
}) {
  const [testo, setTesto] = useState("");
  const [trovati, setTrovati] = useState<AeroportoTrovato[]>([]);

  async function scrivi(v: string) {
    setTesto(v);
    if (v.trim().length < 2) {
      setTrovati([]);
      return;
    }
    /* cercaAeroporti torna già l'elenco, e un elenco vuoto quando non
       trova o quando la rete cade: un suggerimento mancato non è un
       errore da mostrare. */
    setTrovati((await cercaAeroporti(v.trim())).slice(0, 5));
  }

  if (scelto) {
    return (
      <View style={stili.gruppo}>
        <Text style={stili.domanda}>{T.dichiara.coincidenza.destinazione.domanda}</Text>
        <Pressable
          onPress={() => {
            scegli(null);
            setTesto("");
          }}
          style={[stili.voce, stili.voceAttiva]}
        >
          <Text style={stili.voceTestoAttivo}>
            {scelto.citta} ({scelto.iata})
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={stili.gruppo}>
      <Text style={stili.domanda}>{T.dichiara.coincidenza.destinazione.domanda}</Text>
      <TextInput
        value={testo}
        onChangeText={(v) => void scrivi(v)}
        placeholder={T.dichiara.coincidenza.destinazione.segnaposto}
        placeholderTextColor={COLORI.fumo2}
        autoCorrect={false}
        style={stili.campo}
      />
      {trovati.map((a) => (
        <Pressable key={a.iata} onPress={() => scegli(a)} style={stili.voce}>
          <Text style={stili.voceTesto}>
            {a.citta} · {a.nome}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** L'esito che torna dal motore, mostrato come lo mostra il sito. */
function Esito({ esito }: { esito: Extract<EsitoDomande, { ok: true }> }) {
  const buono = esito.esito === "idoneo";
  return (
    <View style={[stili.esito, buono && stili.esitoBuono]}>
      {buono && esito.importo ? <Text style={stili.importo}>{esito.importo}€</Text> : null}
      <Text style={stili.esitoTesto}>{esito.motivo}</Text>
    </View>
  );
}

export default function DomandeCaso({
  volo,
  data,
  verificaId,
  cancellato,
  demo,
}: {
  volo: string;
  data: string;
  verificaId: string | null;
  /** Vero quando il motore ha detto che il volo risulta cancellato. */
  cancellato: boolean;
  demo: boolean;
}) {
  const [aperto, setAperto] = useState<"negato" | "coincidenza" | null>(null);
  const [preavviso, setPreavviso] = useState<string | null>(null);
  const [alternativa, setAlternativa] = useState<string | null>(null);
  const [presenza, setPresenza] = useState<string | null>(null);
  const [volonta, setVolonta] = useState<string | null>(null);
  const [unica, setUnica] = useState<string | null>(null);
  const [ritardoFinale, setRitardoFinale] = useState<string | null>(null);
  const [destinazione, setDestinazione] = useState<AeroportoTrovato | null>(null);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState<Extract<EsitoDomande, { ok: true }> | null>(null);

  const prontoCancellato = preavviso !== null && alternativa !== null;
  const prontoNegato = presenza !== null && volonta !== null;
  const prontoCoincidenza =
    unica !== null && ritardoFinale !== null && destinazione !== null;

  async function manda(quale: "cancellato" | "negato" | "coincidenza") {
    if (invio) return;
    setInvio(true);
    setErrore("");
    const base = { volo, data, verificaId };
    const r =
      quale === "cancellato"
        ? await chiudiCancellato({ ...base, preavviso: preavviso!, alternativa: alternativa! })
        : quale === "negato"
          ? await chiudiDichiarato({ ...base, caso: "negato", presenza: presenza!, volonta: volonta! })
          : await chiudiDichiarato({
              ...base,
              caso: "coincidenza",
              unica: unica!,
              ritardoFinale: ritardoFinale!,
              destinazioneFinale: destinazione!.iata,
            });
    setInvio(false);
    if (!r.ok) {
      setErrore(r.errore);
      return;
    }
    setEsito(r);
  }

  if (esito) return <Esito esito={esito} />;

  /* ---------- il volo risulta cancellato: le due domande dell'art. 5 ---------- */
  if (cancellato) {
    return (
      <View style={stili.scheda}>
        <Text style={stili.occhiello}>{T.cancellato.occhiello}</Text>
        <Text style={stili.titolo}>{T.cancellato.titolo}</Text>
        <Text style={stili.testo}>{T.cancellato.testo}</Text>

        <Scelte
          domanda={T.cancellato.preavviso.domanda}
          aiuto={T.cancellato.preavviso.aiuto}
          voci={T.cancellato.preavviso.voci}
          scelta={preavviso}
          scegli={setPreavviso}
        />
        <Scelte
          domanda={T.cancellato.alternativa.domanda}
          aiuto={T.cancellato.alternativa.aiuto}
          voci={T.cancellato.alternativa.voci}
          scelta={alternativa}
          scegli={setAlternativa}
        />

        {errore ? <Text style={stili.errore}>{errore}</Text> : null}
        <Bottone
          testo={T.dichiara.bottone}
          onPress={() => void manda("cancellato")}
          disabilitato={!prontoCancellato}
          caricamento={invio}
        />
        <Text style={stili.nota}>{demo ? T.dichiara.notaDemo : T.dichiara.nota}</Text>
      </View>
    );
  }

  /* ---------- negato imbarco e coincidenza persa: li apre l'utente ---------- */
  return (
    <View style={stili.scheda}>
      <Text style={stili.titolo}>{T.dichiara.invito}</Text>
      <Text style={stili.testo}>{T.dichiara.invitoSotto}</Text>

      <View style={stili.schede}>
        {(
          [
            ["negato", T.dichiara.negato.scheda],
            ["coincidenza", T.dichiara.coincidenza.scheda],
          ] as const
        ).map(([chiave, etichetta]) => (
          <Pressable
            key={chiave}
            onPress={() => setAperto(aperto === chiave ? null : chiave)}
            style={[stili.tasto, aperto === chiave && stili.tastoAttivo]}
          >
            <Text style={[stili.tastoTesto, aperto === chiave && stili.tastoTestoAttivo]}>
              {etichetta}
            </Text>
          </Pressable>
        ))}
      </View>

      {aperto === "negato" && (
        <View style={stili.corpo}>
          <Scelte
            domanda={T.dichiara.negato.presenza.domanda}
            voci={T.dichiara.negato.presenza.voci}
            scelta={presenza}
            scegli={setPresenza}
          />
          <Scelte
            domanda={T.dichiara.negato.volonta.domanda}
            voci={T.dichiara.negato.volonta.voci}
            scelta={volonta}
            scegli={setVolonta}
          />
          {errore ? <Text style={stili.errore}>{errore}</Text> : null}
          <Bottone
            testo={T.dichiara.bottone}
            onPress={() => void manda("negato")}
            disabilitato={!prontoNegato}
            caricamento={invio}
          />
          <Text style={stili.nota}>{demo ? T.dichiara.notaDemo : T.dichiara.nota}</Text>
        </View>
      )}

      {aperto === "coincidenza" && (
        <View style={stili.corpo}>
          <Scelte
            domanda={T.dichiara.coincidenza.unica.domanda}
            aiuto={T.dichiara.coincidenza.unica.aiuto}
            voci={T.dichiara.coincidenza.unica.voci}
            scelta={unica}
            scegli={setUnica}
          />
          <CampoDestinazione scelto={destinazione} scegli={setDestinazione} />
          <Scelte
            domanda={T.dichiara.coincidenza.ritardo.domanda}
            voci={T.dichiara.coincidenza.ritardo.voci}
            scelta={ritardoFinale}
            scegli={setRitardoFinale}
          />
          {errore ? <Text style={stili.errore}>{errore}</Text> : null}
          <Bottone
            testo={T.dichiara.bottone}
            onPress={() => void manda("coincidenza")}
            disabilitato={!prontoCoincidenza}
            caricamento={invio}
          />
          <Text style={stili.nota}>{demo ? T.dichiara.notaDemo : T.dichiara.nota}</Text>
        </View>
      )}
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.xl,
    gap: SPAZIO.s,
  },
  occhiello: {
    fontFamily: FONT.testoMedio,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLORI.verde,
  },
  titolo: { fontFamily: FONT.display, fontSize: 21, color: COLORI.inchiostro, lineHeight: 27 },
  testo: { fontFamily: FONT.testo, fontSize: 14.5, color: COLORI.fumo, lineHeight: 21 },
  gruppo: { marginTop: SPAZIO.l, gap: 8 },
  domanda: { fontFamily: FONT.testoMedio, fontSize: 15, color: COLORI.inchiostro },
  aiuto: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo, lineHeight: 19 },
  voce: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORI.bianco,
  },
  voceAttiva: { borderColor: COLORI.verde, backgroundColor: COLORI.mentaTenue },
  voceTesto: { fontFamily: FONT.testo, fontSize: 14, color: COLORI.fumo, flex: 1 },
  voceTestoAttivo: { fontFamily: FONT.testoMedio, color: COLORI.inchiostro },
  pallino: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  pallinoAttivo: { borderColor: COLORI.verde },
  pallinoPieno: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORI.verde },
  campo: {
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: FONT.testo,
    fontSize: 15,
    color: COLORI.inchiostro,
    backgroundColor: COLORI.bianco,
  },
  schede: { flexDirection: "row", gap: 8, marginTop: SPAZIO.l },
  tasto: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORI.nebbia,
  },
  tastoAttivo: { borderColor: COLORI.verde, backgroundColor: COLORI.mentaTenue },
  tastoTesto: { fontFamily: FONT.testoMedio, fontSize: 13.5, color: COLORI.fumo, textAlign: "center" },
  tastoTestoAttivo: { color: COLORI.inchiostro },
  corpo: { marginTop: SPAZIO.l, gap: SPAZIO.s },
  errore: { fontFamily: FONT.testo, fontSize: 14, color: "#dc2626", marginTop: SPAZIO.s },
  attesa: { marginTop: SPAZIO.l },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
  esito: {
    marginTop: SPAZIO.xl,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    backgroundColor: COLORI.nebbia,
    padding: SPAZIO.xl,
    gap: SPAZIO.s,
  },
  esitoBuono: { borderColor: COLORI.verde, backgroundColor: COLORI.mentaTenue },
  importo: { fontFamily: FONT.display, fontSize: 40, color: COLORI.verde },
  esitoTesto: { fontFamily: FONT.testo, fontSize: 15, color: COLORI.inchiostro, lineHeight: 22 },
});
