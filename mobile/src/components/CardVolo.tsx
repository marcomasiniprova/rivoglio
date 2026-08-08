import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { VoloSalvato } from "@/lib/voliSalvati";

/**
 * Un volo salvato: numero, giorno e l'ultimo verdetto del motore.
 *
 * I tre esiti hanno tre facce diverse, e nessuna promette niente: un
 * idoneo mostra la fascia di legge, un incerto dice che non si vende,
 * un non idoneo dice il perché. Un volo mai controllato resta grigio,
 * con l'invito a controllarlo: mai un colore che suggerisca un esito
 * che non abbiamo.
 */

const T = TESTI.mieiVoli;

const dataIt = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
};

const durata = (minuti: number) => {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
};

export default function CardVolo({
  volo,
  onApri,
  onTogli,
}: {
  volo: VoloSalvato;
  onApri: () => void;
  onTogli: () => void;
}) {
  const idoneo = volo.esito === "idoneo";
  const incerto = volo.esito === "incerto";
  const nonIdoneo = volo.esito === "non_idoneo";

  return (
    <View style={stili.scheda}>
      <View style={stili.riga}>
        <View style={stili.intestazione}>
          {/* Prima la tratta, perché è così che uno riconosce il suo volo;
              il codice resta sotto, per chi lo cerca. */}
          <Text style={stili.volo}>
            {volo.da && volo.a ? `${volo.da} → ${volo.a}` : volo.volo}
          </Text>
          <Text style={stili.data}>
            {volo.da && volo.a ? `${volo.volo} · ` : ""}
            {dataIt(volo.data)}
          </Text>
        </View>
        <Pressable
          onPress={onTogli}
          accessibilityRole="button"
          accessibilityLabel={T.togli}
          hitSlop={10}
        >
          <Feather name="x" size={17} color={COLORI.fumo2} />
        </Pressable>
      </View>

      {/* L'esito, con la faccia che gli spetta */}
      {idoneo && (
        <View style={[stili.esito, stili.esitoIdoneo]}>
          <Text style={stili.importo}>
            {volo.importo}€ <Text style={stili.perPasseggero}>{T.perPasseggero}</Text>
          </Text>
          {typeof volo.ritardoMinuti === "number" && (
            <Text style={stili.dettaglio}>
              {T.ritardo}: {durata(volo.ritardoMinuti)}
            </Text>
          )}
        </View>
      )}

      {incerto && (
        <View style={[stili.esito, stili.esitoIncerto]}>
          <Text style={stili.esitoTitolo}>{T.esiti.incerto}</Text>
          {volo.motivo ? <Text style={stili.dettaglio}>{volo.motivo}</Text> : null}
        </View>
      )}

      {nonIdoneo && (
        <View style={[stili.esito, stili.esitoNo]}>
          <Text style={stili.esitoTitolo}>{T.esiti.nonIdoneo}</Text>
          {typeof volo.ritardoMinuti === "number" && (
            <Text style={stili.dettaglio}>
              {T.ritardo}: {durata(volo.ritardoMinuti)}
            </Text>
          )}
        </View>
      )}

      {!volo.esito && (
        <View style={[stili.esito, stili.esitoVuoto]}>
          <Text style={stili.dettaglio}>{T.esiti.daControllare}</Text>
        </View>
      )}

      <Pressable onPress={onApri} accessibilityRole="button" style={stili.azione}>
        <Feather name="refresh-cw" size={14} color={COLORI.verdeScuro} />
        <Text style={stili.azioneTesto}>{volo.esito ? T.ricontrolla : T.controlla}</Text>
      </Pressable>
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    ...OMBRA.scheda,
  },
  riga: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  intestazione: { flex: 1, minWidth: 0 },
  volo: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
  },
  data: { fontFamily: FONT.testo, fontSize: 13, color: COLORI.fumo, marginTop: 2 },
  esito: {
    marginTop: SPAZIO.m,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.m,
    borderWidth: 1,
  },
  esitoIdoneo: { backgroundColor: COLORI.mentaTenue, borderColor: COLORI.menta },
  esitoIncerto: { backgroundColor: COLORI.nebbia, borderColor: COLORI.bordo },
  esitoNo: { backgroundColor: COLORI.nebbia, borderColor: COLORI.bordo },
  esitoVuoto: { backgroundColor: COLORI.nebbia, borderColor: COLORI.bordo },
  importo: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.8,
    color: COLORI.verdeNotte,
  },
  perPasseggero: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.verdeScuro },
  esitoTitolo: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.inchiostro },
  dettaglio: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: 3,
  },
  azione: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    marginTop: SPAZIO.m,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  azioneTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
});
