/**
 * LA SCENA DEL VERDETTO (giro #49, sul riferimento della board).
 *
 * Perché è un componente a sé e non tre pezzi sparsi nella schermata:
 * questa è la superficie che vende, ed è l'unica dove la promessa del
 * marchio ("la trasparenza è il prodotto") si può mostrare invece che
 * dichiarare. Non basta scrivere 250€: si fa vedere DA DOVE ESCE, cioè
 * le tre fasce dell'articolo 7 con la tua accesa, e la soglia delle tre
 * ore con quanto la superi.
 *
 * ⚠️ QUI NON SI DECIDE NIENTE. L'esito, l'importo e i minuti arrivano
 * dal motore sul server: questo file li dispone e basta. Se un domani
 * qualcuno ci mette dentro un `if` che cambia un importo, ha spostato il
 * motore dentro l'interfaccia, ed è la cosa che la SPEC vieta.
 */
import { StyleSheet, Text, View } from "react-native";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import { durataLunga } from "@/lib/formati";

const S = TESTI.verdetto.scena;

/** La soglia dell'articolo 6, in minuti. Il motore usa la stessa. */
const SOGLIA_MINUTI = 180;

/* ------------------------------------------------------------------ velo */

/**
 * La sfumatura verde in cima, fatta a bande invece che con
 * `expo-linear-gradient`.
 *
 * Non è pigrizia: quella libreria non è fra le dipendenze del progetto e
 * aggiungerla significa un modulo nativo in più da ricostruire. Otto
 * bande da 22px con opacità che scende leggono come una sfumatura e
 * costano zero.
 */
export function VeloVerde({ tinta = COLORI.menta }: { tinta?: string }) {
  return (
    <View style={stili.velo} pointerEvents="none">
      {Array.from({ length: 8 }, (_, i) => (
        <View
          key={i}
          style={{
            height: 22,
            backgroundColor: tinta,
            opacity: 0.22 * (1 - i / 8) ** 1.6,
          }}
        />
      ))}
    </View>
  );
}

/* ----------------------------------------------------------- le tre fasce */

/**
 * Le tre fasce affiancate, con la tua accesa.
 *
 * È il pezzo che il vecchio verdetto non aveva, e che cambia il modo in
 * cui la cifra viene letta: da "quanto mi danno" a "perché proprio
 * questa". Le altre due restano visibili di proposito: nascoste
 * sembrerebbe che la cifra ce la siamo inventata noi.
 */
export function Fasce({ scelta }: { scelta: number }) {
  return (
    <View style={stili.fasce}>
      {S.fasce.map((f) => {
        const attiva = f.importo === scelta;
        return (
          <View key={f.importo} style={stili.fasciaColonna}>
            <View style={[stili.fasciaPillola, attiva && stili.fasciaPillolaAttiva]}>
              <Text style={[stili.fasciaImporto, attiva && stili.fasciaImportoAttivo]}>
                {f.importo}€
              </Text>
            </View>
            <Text style={[stili.fasciaQuando, attiva && stili.fasciaQuandoAttivo]}>{f.quando}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------- la soglia */

/**
 * Gli orari e la barra della soglia: la dimostrazione vera e propria.
 *
 * La barra è in scala su sei ore, non sul ritardo: se fosse in scala sul
 * ritardo, un volo con dieci minuti oltre la soglia sembrerebbe identico
 * a uno con tre ore, e la barra racconterebbe una bugia.
 */
export function Soglia({
  previsto,
  effettivo,
  minuti,
  tono = "neutro",
}: {
  previsto: string;
  effettivo: string;
  minuti: number;
  /**
   * Il colore segue l'ESITO, non il segno del ritardo. Un ritardo di
   * quattro minuti oltre la soglia su un caso incerto non è una buona
   * notizia, e dipingerlo di verde lo farebbe sembrare tale.
   */
  tono?: "verde" | "neutro";
}) {
  const oltre = minuti - SOGLIA_MINUTI;
  const scala = Math.max(360, minuti + 30);
  const quotaSoglia = Math.min(0.92, SOGLIA_MINUTI / scala);
  const quotaTua = Math.min(1, minuti / scala);
  const acceso = tono === "verde";

  return (
    <View style={stili.soglia}>
      <View style={stili.orari}>
        <View style={stili.oraColonna}>
          <Text style={stili.oraEtichetta}>{TESTI.verdetto.previsto}</Text>
          <Text style={stili.oraValore}>{previsto}</Text>
        </View>
        <View style={[stili.delta, !acceso && stili.deltaNeutro]}>
          <Text style={[stili.deltaTesto, !acceso && stili.deltaTestoNeutro]}>
            +{durataLunga(minuti)}
          </Text>
        </View>
        <View style={[stili.oraColonna, stili.oraDestra]}>
          <Text style={stili.oraEtichetta}>{TESTI.verdetto.effettivo}</Text>
          <Text style={stili.oraValore}>{effettivo}</Text>
        </View>
      </View>

      <View style={stili.barra}>
        <View
          style={[
            stili.barraPiena,
            {
              width: `${quotaTua * 100}%`,
              backgroundColor: acceso ? COLORI.verde : COLORI.fumo2,
            },
          ]}
        />
        <View style={[stili.tacca, { left: `${quotaSoglia * 100}%` }]} />
      </View>

      {/* Le due etichette agli estremi, come nel riferimento. Prima
          "soglia" stava sotto la tacca con un margine negativo: su un
          ritardo corto finiva addosso all'altra etichetta. */}
      <View style={stili.barraPiedi}>
        <Text style={stili.barraEtichetta}>{S.soglia}</Text>
        <Text style={[stili.barraOltre, !acceso && stili.barraOltreNeutro]}>
          {oltre >= 0
            ? S.oltreSoglia.replace("{minuti}", durataLunga(oltre) || "0 min")
            : S.sottoSoglia.replace("{minuti}", durataLunga(-oltre))}
        </Text>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- i chip */

/**
 * I tre chip di cosa abbiamo guardato.
 *
 * ⚠️ IL METEO NON C'È, e non è una dimenticanza. L'archivio meteo a uso
 * commerciale richiede un piano a pagamento e nel progetto è spento (vedi
 * STATO): un chip "meteo sereno" sarebbe un dato che non abbiamo, cioè
 * esattamente quello che la regola numero due vieta. Quando il piano si
 * accende, il chip si aggiunge qui.
 */
export function Chip({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <View style={stili.chip}>
      <Text style={stili.chipEtichetta}>{etichetta}</Text>
      <Text style={stili.chipValore}>{valore}</Text>
    </View>
  );
}

const stili = StyleSheet.create({
  velo: { position: "absolute", top: 0, left: 0, right: 0 },

  fasce: { flexDirection: "row", gap: SPAZIO.s, marginTop: SPAZIO.l },
  fasciaColonna: { flex: 1 },
  fasciaPillola: {
    borderRadius: RAGGIO.campo,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    backgroundColor: COLORI.bianco,
    paddingVertical: SPAZIO.m,
    alignItems: "center",
  },
  fasciaPillolaAttiva: { backgroundColor: COLORI.verde, borderColor: COLORI.verde },
  fasciaImporto: {
    fontFamily: FONT.display,
    fontSize: 17,
    letterSpacing: -0.4,
    color: COLORI.fumo,
  },
  fasciaImportoAttivo: { color: COLORI.bianco },
  fasciaQuando: {
    fontFamily: FONT.testo,
    fontSize: 11,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
  fasciaQuandoAttivo: { color: COLORI.verdeScuro, fontFamily: FONT.testoMedio },

  soglia: { marginTop: SPAZIO.xl },
  orari: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPAZIO.s,
  },
  oraColonna: { flexShrink: 1 },
  oraDestra: { alignItems: "flex-end" },
  oraEtichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORI.fumo2,
  },
  oraValore: {
    fontFamily: FONT.display,
    fontSize: 24,
    letterSpacing: -0.8,
    color: COLORI.inchiostro,
    marginTop: 2,
  },
  delta: {
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 5,
    marginBottom: 4,
  },
  deltaTesto: { fontFamily: FONT.testoSemi, fontSize: 12, color: COLORI.verdeScuro },
  deltaNeutro: { backgroundColor: COLORI.nebbia2 },
  deltaTestoNeutro: { color: COLORI.fumo },

  barra: {
    height: 8,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.nebbia2,
    marginTop: SPAZIO.l,
    overflow: "hidden",
    justifyContent: "center",
  },
  barraPiena: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: RAGGIO.pillola },
  tacca: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: COLORI.inchiostro },
  barraPiedi: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPAZIO.m,
    marginTop: SPAZIO.s,
  },
  barraEtichetta: { fontFamily: FONT.testoMedio, fontSize: 11.5, color: COLORI.fumo },
  barraOltre: { fontFamily: FONT.testoSemi, fontSize: 12, color: COLORI.verdeScuro },
  barraOltreNeutro: { color: COLORI.fumo },

  chip: {
    flex: 1,
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.campo,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.m,
  },
  chipEtichetta: {
    fontFamily: FONT.testo,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: COLORI.fumo2,
  },
  chipValore: {
    fontFamily: FONT.testoSemi,
    fontSize: 13.5,
    color: COLORI.inchiostro,
    marginTop: 3,
  },
});
