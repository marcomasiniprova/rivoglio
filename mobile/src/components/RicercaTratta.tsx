/**
 * LA RICERCA PER TRATTA: il modo di controllare un volo senza saperne il numero.
 *
 * Perché è il modo principale e non un'alternativa: l'utente medio non ha
 * il numero di volo in testa e non sa dove trovarlo. Ha in testa da dove è
 * partito, dove è arrivato e più o meno l'ora. Quindi si chiede quello, si
 * mostra l'elenco dei voli di quel giorno e lui riconosce il suo.
 *
 * Qui non si decide niente: si sceglie un volo e si passa il numero a chi
 * chiama, che fa partire il check di sempre.
 */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Bottone from "@/components/Bottone";
import Campo from "@/components/Campo";
import CampoAeroporto from "@/components/CampoAeroporto";
import { voliDiTratta, type AeroportoTrovato, type VoloDiTratta } from "@/lib/api";
import { conBarre, dataIso } from "@/lib/data";
import { COLORI, FONT, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.tratta;

type Props = {
  /** Il volo scelto dall'elenco, col giorno già in forma "2026-08-06". */
  onScegli: (volo: string, iso: string) => void;
  /** true mentre il check è in corso: l'elenco non deve accettare altri tocchi. */
  occupato?: boolean;
};

export default function RicercaTratta({ onScegli, occupato }: Props) {
  const [da, setDa] = useState<AeroportoTrovato | null>(null);
  const [a, setA] = useState<AeroportoTrovato | null>(null);
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [voli, setVoli] = useState<VoloDiTratta[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [giorno, setGiorno] = useState("");

  async function cerca() {
    setErrore(null);
    setVoli(null);
    if (!da) return setErrore(T.errori.partenza);
    if (!a) return setErrore(T.errori.arrivo);
    if (da.iata === a.iata) return setErrore(T.errori.stessoScalo);
    if (!data.trim()) return setErrore(T.errori.data);
    const iso = dataIso(data);
    if (!iso) return setErrore(T.errori.dataStrana);

    setInCorso(true);
    const esito = await voliDiTratta(da.iata, a.iata, iso);
    setInCorso(false);
    if (!esito.ok) return setErrore(esito.errore);
    setGiorno(iso);
    setDemo(esito.demo);
    setVoli(esito.voli);
  }

  return (
    <View>
      <CampoAeroporto
        etichetta={T.da.etichetta}
        segnaposto={T.da.segnaposto}
        scelto={da}
        onScegli={setDa}
      />

      <View style={stili.spazio} />

      <CampoAeroporto
        etichetta={T.a.etichetta}
        segnaposto={T.a.segnaposto}
        scelto={a}
        onScegli={setA}
      />

      <View style={stili.spazio} />

      <Campo
        etichetta={T.data.etichetta}
        valore={data}
        onChange={(t) => setData(conBarre(t))}
        segnaposto={T.data.segnaposto}
        tipo="numero"
      />
      <Text style={stili.aiuto}>{T.data.aiuto}</Text>

      {errore && (
        <Text style={stili.errore} accessibilityRole="alert">
          {errore}
        </Text>
      )}

      <View style={stili.spazio} />
      <Bottone testo={T.bottone} onPress={cerca} caricamento={inCorso} icona="search" />

      {/* ------------------------------------------------ l'elenco */}
      {voli !== null && voli.length === 0 && (
        <View style={stili.nulla}>
          <Text style={stili.nullaTitolo}>{T.nessuno.titolo}</Text>
          <Text style={stili.nullaTesto}>{T.nessuno.testo}</Text>
        </View>
      )}

      {voli !== null && voli.length > 0 && (
        <View style={stili.elenco}>
          <Text style={stili.elencoTitolo}>{T.elenco.titolo}</Text>
          <Text style={stili.elencoSotto}>{T.elenco.sottotitolo}</Text>

          {demo && <Text style={stili.demo}>{T.elenco.demo}</Text>}

          <View style={stili.righe}>
            {voli.map((v) => (
              <Pressable
                key={v.volo}
                onPress={() => !occupato && onScegli(v.volo, giorno)}
                disabled={occupato}
                accessibilityRole="button"
                accessibilityLabel={`${v.partenzaOra}, volo ${v.volo}`}
                style={[stili.riga, occupato && stili.rigaSpenta]}
              >
                <View style={stili.orari}>
                  <Text style={stili.partenza}>{v.partenzaOra || "--:--"}</Text>
                  <Text style={stili.arrivo}>
                    {T.elenco.arrivo} {v.arrivoOra || "--:--"}
                  </Text>
                </View>
                <View style={stili.rigaTesti}>
                  <Text style={stili.compagnia} numberOfLines={1}>
                    {v.compagnia ?? v.volo}
                  </Text>
                  <Text style={stili.numero}>
                    {v.volo}
                    {v.cancellato ? ` · ${T.elenco.cancellato}` : ""}
                  </Text>
                </View>
                {occupato ? (
                  <ActivityIndicator size="small" color={COLORI.fumo2} />
                ) : (
                  <Feather name="chevron-right" size={18} color={COLORI.fumo2} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const stili = StyleSheet.create({
  spazio: { height: SPAZIO.l },
  aiuto: {
    fontFamily: FONT.testo,
    fontSize: 12,
    color: COLORI.fumo2,
    marginTop: SPAZIO.xs + 2,
  },
  errore: {
    fontFamily: FONT.testoMedio,
    fontSize: 13,
    color: COLORI.errore,
    marginTop: SPAZIO.m,
  },
  nulla: {
    marginTop: SPAZIO.l,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    padding: SPAZIO.l,
  },
  nullaTitolo: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro },
  nullaTesto: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  elenco: { marginTop: SPAZIO.xl },
  elencoTitolo: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
  },
  elencoSotto: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 20,
    color: COLORI.fumo,
    marginTop: SPAZIO.xs,
  },
  demo: {
    fontFamily: FONT.testoMedio,
    fontSize: 12,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  righe: { marginTop: SPAZIO.m, gap: SPAZIO.s },
  riga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m,
    minHeight: 60,
  },
  rigaSpenta: { opacity: 0.5 },
  orari: { minWidth: 62 },
  partenza: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.5,
    color: COLORI.inchiostro,
  },
  arrivo: { fontFamily: FONT.testo, fontSize: 11.5, color: COLORI.fumo2, marginTop: 1 },
  rigaTesti: { flex: 1, minWidth: 0 },
  compagnia: { fontFamily: FONT.testoMedio, fontSize: 14.5, color: COLORI.inchiostro },
  numero: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo, marginTop: 1 },
});
