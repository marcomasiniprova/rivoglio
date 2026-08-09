import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { VoloSalvato } from "@/lib/voliSalvati";

/**
 * Un volo salvato, disegnato come un BIGLIETTO AEREO vero (richiesta di
 * Valerio, 8/08: "più realistico, una roba seria, non un gioco").
 *
 * L'anatomia è quella di una carta d'imbarco: la tratta grande in alto,
 * lo strappo tratteggiato coi due fori laterali, l'esito nel corpo e il
 * codice a barre in fondo. Il codice a barre è DERIVATO dal numero del
 * volo (stesso volo = stesse barre): è un elemento grafico, non un
 * codice leggibile, e non finge di esserlo.
 *
 * I tre esiti hanno tre facce diverse, e nessuna promette niente: un
 * idoneo mostra la fascia di legge, un incerto dice che non si vende,
 * un non idoneo dice il perché. Un volo mai controllato resta grigio.
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

/**
 * Le barre del codice, derivate dal codice volo: deterministiche, così
 * lo stesso biglietto ha sempre lo stesso disegno.
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
    <View style={stili.biglietto}>
      {/* ------------------------------------------------ la testata */}
      <View style={stili.testata}>
        <View style={stili.intestazione}>
          {/* Prima la tratta, perché è così che uno riconosce il suo volo;
              il codice resta sotto, per chi lo cerca. */}
          <Text style={stili.trattaTesto} numberOfLines={1}>
            {volo.da && volo.a ? (
              <>
                {volo.da} <Text style={stili.freccia}>→</Text> {volo.a}
              </>
            ) : (
              volo.volo
            )}
          </Text>
          <View style={stili.sottoRiga}>
            <Text style={stili.etichettaVolo}>VOLO</Text>
            <Text style={stili.codice}>{volo.volo}</Text>
            <Text style={stili.data}>{dataIt(volo.data)}</Text>
          </View>
        </View>
        <Pressable
          onPress={onTogli}
          accessibilityRole="button"
          accessibilityLabel={T.togli}
          hitSlop={10}
        >
          <Feather name="x" size={16} color={COLORI.fumo2} />
        </Pressable>
      </View>

      {/* ------------------------------- lo strappo, coi fori laterali */}
      <View style={stili.strappo}>
        <View style={[stili.foro, stili.foroSinistro]} />
        <View style={stili.tratteggio} />
        <View style={[stili.foro, stili.foroDestro]} />
      </View>

      {/* ------------------------------------------------ l'esito */}
      <View style={stili.corpo}>
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
          <View style={[stili.esito, stili.esitoNeutro]}>
            <Text style={stili.esitoTitolo}>{T.esiti.incerto}</Text>
            {volo.motivo ? <Text style={stili.dettaglio}>{volo.motivo}</Text> : null}
          </View>
        )}

        {nonIdoneo && (
          <View style={[stili.esito, stili.esitoNeutro]}>
            <Text style={stili.esitoTitolo}>{T.esiti.nonIdoneo}</Text>
            {typeof volo.ritardoMinuti === "number" && (
              <Text style={stili.dettaglio}>
                {T.ritardo}: {durata(volo.ritardoMinuti)}
              </Text>
            )}
          </View>
        )}

        {!volo.esito && (
          <View style={[stili.esito, stili.esitoNeutro]}>
            <Text style={stili.dettaglio}>{T.esiti.daControllare}</Text>
          </View>
        )}

        <Pressable onPress={onApri} accessibilityRole="button" style={stili.azione}>
          <Feather name="refresh-cw" size={14} color={COLORI.verdeScuro} />
          <Text style={stili.azioneTesto}>{volo.esito ? T.ricontrolla : T.controlla}</Text>
        </Pressable>
      </View>

      {/* --------------------------------------- il codice a barre */}
      <View style={stili.piede}>
        <View style={stili.codiceBarre} accessibilityElementsHidden>
          {barre(volo.volo).map((larghezza, i) => (
            <View
              key={i}
              style={[stili.barra, { width: larghezza, opacity: larghezza === 1 ? 0.55 : 1 }]}
            />
          ))}
        </View>
        <Text style={stili.timbro}>RIVOLIO · REG. CE 261/2004</Text>
      </View>
    </View>
  );
}

const stili = StyleSheet.create({
  biglietto: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    ...OMBRA.scheda,
    // I fori dello strappo escono di mezzo cerchio: senza clip resterebbero quadrati.
    overflow: "hidden",
  },
  testata: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.l,
    paddingTop: SPAZIO.l,
    paddingBottom: SPAZIO.m,
  },
  intestazione: { flex: 1, minWidth: 0 },
  trattaTesto: {
    fontFamily: FONT.display,
    fontSize: 20,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  freccia: { color: COLORI.verde },
  sottoRiga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    marginTop: SPAZIO.xs,
  },
  etichettaVolo: {
    fontFamily: FONT.testoMedio,
    fontSize: 9,
    letterSpacing: 1.2,
    color: COLORI.fumo2,
  },
  codice: { fontFamily: FONT.testoSemi, fontSize: 12.5, color: COLORI.inchiostro },
  data: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo },
  strappo: {
    height: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  tratteggio: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORI.bordo,
    marginHorizontal: SPAZIO.l + 2,
  },
  foro: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
  },
  foroSinistro: { marginLeft: -9 },
  foroDestro: { marginRight: -9 },
  corpo: { paddingHorizontal: SPAZIO.l, paddingTop: SPAZIO.s },
  esito: {
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.m,
    borderWidth: 1,
  },
  esitoIdoneo: { backgroundColor: COLORI.mentaTenue, borderColor: COLORI.menta },
  esitoNeutro: { backgroundColor: COLORI.nebbia, borderColor: COLORI.bordo },
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
    marginTop: SPAZIO.s,
    alignSelf: "flex-start",
    paddingVertical: SPAZIO.xs,
  },
  azioneTesto: { fontFamily: FONT.testoMedio, fontSize: 14, color: COLORI.verdeScuro },
  piede: {
    paddingHorizontal: SPAZIO.l,
    paddingBottom: SPAZIO.m,
    paddingTop: SPAZIO.xs,
  },
  codiceBarre: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 2,
    height: 22,
  },
  barra: { backgroundColor: COLORI.inchiostro, borderRadius: 0.5 },
  timbro: {
    fontFamily: FONT.testoMedio,
    fontSize: 8.5,
    letterSpacing: 1.4,
    color: COLORI.fumo2,
    marginTop: SPAZIO.xs + 2,
  },
});
