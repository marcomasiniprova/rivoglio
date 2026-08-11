/**
 * IL MURO DEL CHECK, nell'app.
 *
 * Stessa sostanza di quello del sito, stesse parole: prima quanto vale
 * il volo, poi il prezzo. Senza questa schermata l'app riceveva il no
 * dal server e lo mostrava come una riga rossa d'errore, cioè come un
 * guasto: chi la leggeva restava fermo lì senza sapere che poteva
 * sbloccare l'analisi (visto il 11/08).
 *
 * Il pagamento si apre nel browser, non nell'app: dentro l'app Apple e
 * Google trattengono dal 15 al 30%, e su 1,99 sarebbe la metà del
 * margine (decisione di Valerio, 8/08).
 */
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Bottone from "@/components/Bottone";
import { SITO, type MuroCheckDati } from "@/lib/api";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";

/** La fascia più alta del Regolamento: il confronto che fa decidere. */
const FASCIA_MASSIMA = 600;

const COSA_OTTIENI = [
  "Gli orari certificati di partenza e atterraggio, al minuto",
  "La prova archiviata, se un giorno la compagnia contesta",
  "Gli avvisi sul volo e la scadenza calcolata sul tuo caso",
  "Se apri la pratica, questi euro si scalano dal prezzo",
];

export default function MuroCheck({
  dati,
  onAnnulla,
}: {
  dati: MuroCheckDati;
  onAnnulla: () => void;
}) {
  async function apriLaCassa() {
    const dove = dati.cassa ? `${SITO}${dati.cassa}` : `${SITO}/#prezzi`;
    try {
      await Linking.openURL(dove);
    } catch {
      /* Nessun browser: il tasto non resta muto, resta il testo sopra. */
    }
  }

  return (
    <ScrollView style={stili.pagina} contentContainerStyle={stili.contenuto}>
      <View style={stili.scheda}>
        <Text style={stili.occhiello}>L&apos;ANALISI DEL TUO VOLO</Text>

        {/* La cifra grande è quella che vale il volo, non il prezzo. */}
        <Text style={stili.titolo}>
          Voli come il tuo valgono{"\n"}fino a{" "}
          <Text style={stili.titoloVerde}>{FASCIA_MASSIMA}€</Text>
        </Text>
        <Text style={stili.testo}>
          Quanto spetta a te lo dice il ritardo certificato del tuo volo, e può anche essere
          zero. L&apos;analisi lo verifica sugli archivi ufficiali e ti dà il numero esatto.
        </Text>

        <View style={stili.riga} />

        <View style={stili.prezzoRiga}>
          <Text style={stili.prezzo}>{dati.prezzoTesto}</Text>
          <Text style={stili.prezzoNota}>una volta, per questo volo</Text>
        </View>

        {dati.inLancio && (
          <Text style={stili.lancio}>
            Prezzo di lancio.{" "}
            {dati.postiRimasti !== null
              ? `Ne restano ${dati.postiRimasti} a questa cifra, poi passa a ${dati.prezzoPienoTesto}.`
              : `Quando i posti di lancio finiscono passa a ${dati.prezzoPienoTesto}.`}
          </Text>
        )}

        <View style={stili.elenco}>
          {COSA_OTTIENI.map((v) => (
            <View key={v} style={stili.voce}>
              <Feather name="check" size={15} color={COLORI.verde} style={stili.spunta} />
              <Text style={stili.voceTesto}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={stili.azioni}>
          <Bottone testo={`Sblocca l'analisi · ${dati.prezzoTesto}`} onPress={() => void apriLaCassa()} />
          <Pressable onPress={onAnnulla} accessibilityRole="button" style={stili.annulla}>
            <Text style={stili.annullaTesto}>Non ora</Text>
          </Pressable>
        </View>

        <Text style={stili.piede}>
          Il pagamento si fa nel browser: dentro l&apos;app gli store trattengono una
          percentuale, e quella percentuale la pagheresti tu.
        </Text>
        <Text style={stili.piede}>
          Se il verdetto esce incerto non ti costa niente: il credito resta e lo usi su un
          altro volo.
        </Text>
      </View>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { padding: SPAZIO.schermata, paddingBottom: SPAZIO.xxl },
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
  occhiello: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORI.verdeScuro,
  },
  titolo: {
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.m,
  },
  titoloVerde: { color: COLORI.verde },
  testo: {
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  riga: { height: 1, backgroundColor: COLORI.bordo, marginTop: SPAZIO.l },
  prezzoRiga: { flexDirection: "row", alignItems: "baseline", gap: SPAZIO.s, marginTop: SPAZIO.l },
  prezzo: {
    fontFamily: FONT.display,
    fontSize: 34,
    letterSpacing: -1,
    color: COLORI.inchiostro,
  },
  prezzoNota: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo },
  lancio: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  elenco: { marginTop: SPAZIO.l, gap: SPAZIO.s },
  voce: { flexDirection: "row", gap: SPAZIO.s },
  spunta: { marginTop: 2 },
  voceTesto: { flex: 1, fontFamily: FONT.testo, fontSize: 13.5, lineHeight: 19, color: COLORI.fumo },
  azioni: { marginTop: SPAZIO.l, gap: SPAZIO.s },
  annulla: { alignItems: "center", paddingVertical: SPAZIO.s },
  annullaTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.fumo },
  piede: {
    fontFamily: FONT.testo,
    fontSize: 12,
    lineHeight: 17,
    color: COLORI.fumo2,
    marginTop: SPAZIO.m,
    textAlign: "center",
  },
});
