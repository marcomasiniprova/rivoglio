/**
 * La creazione di una ricerca, presentata come modale (la presentazione è
 * dichiarata nello Stack della radice). Contatori e chip tengono ogni
 * valore dentro i limiti; la stessa validazione la rifà dati.creaRicerca.
 */
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Chip from "@/components/Chip";
import Titolo from "@/components/Titolo";
import { creaRicerca } from "@/lib/dati";
import { euro, oreLeggibili } from "@/lib/formati";
import { COLORI, FONT, RAGGIO, SPAZIO, TINTE_TIPO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Tipo } from "@/lib/tipi";

/** Stessi limiti di dati.ts e del sito: budget 30-600, notti 1-3, persone 1-8. */
const SOGLIA = { min: 30, max: 600, passo: 10 } as const;
const PERSONE = { min: 1, max: 8 } as const;

/** Scelte proposte per le ore di auto, dentro i limiti 0,5-8 di dati.ts. */
const ORE_SCELTE = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8] as const;

/** Tutte le combinazioni valide di notti (minimo mai sopra il massimo). */
const NOTTI_SCELTE = [
  { min: 1, max: 1 },
  { min: 2, max: 2 },
  { min: 3, max: 3 },
  { min: 1, max: 2 },
  { min: 2, max: 3 },
  { min: 1, max: 3 },
] as const;

const TIPI: Tipo[] = ["mare", "monte", "citta", "terme"];

/** Valori di partenza: gli stessi della prima ricerca dell'onboarding. */
const BASE = { soglia: 120, ore: 3, notti: { min: 1, max: 2 }, persone: 2 } as const;

// Sostituisce i segnaposto {nome} delle stringhe di testi.ts.
const riempi = (testo: string, valori: Record<string, string | number>) =>
  testo.replace(/\{(\w+)\}/g, (_, chiave: string) => String(valori[chiave] ?? ""));

const S = TESTI.ricerche.scheda;
const T = TESTI.ricerche.nuova;

function testoNotti(min: number, max: number): string {
  if (min === max) return min === 1 ? S.unaNotte : riempi(S.nottiUguali, { n: min });
  return riempi(S.notti, { min, max });
}

type PropContatore = {
  etichetta: string;
  valore: string;
  su: () => void;
  giu: () => void;
  puoSu: boolean;
  puoGiu: boolean;
};

/** Il più e il meno attorno al valore già formattato con la sua unità. */
function Contatore({ etichetta, valore, su, giu, puoSu, puoGiu }: PropContatore) {
  return (
    <View style={stili.contatore}>
      <Pressable
        onPress={giu}
        disabled={!puoGiu}
        accessibilityRole="button"
        accessibilityLabel={riempi(T.diminuisci, { campo: etichetta })}
        style={({ pressed }) => [
          stili.passo,
          !puoGiu && stili.passoSpento,
          pressed && stili.passoPremuto,
        ]}
      >
        <Feather name="minus" size={18} color={COLORI.verdeScuro} />
      </Pressable>
      <Text style={stili.contatoreValore}>{valore}</Text>
      <Pressable
        onPress={su}
        disabled={!puoSu}
        accessibilityRole="button"
        accessibilityLabel={riempi(T.aumenta, { campo: etichetta })}
        style={({ pressed }) => [
          stili.passo,
          !puoSu && stili.passoSpento,
          pressed && stili.passoPremuto,
        ]}
      >
        <Feather name="plus" size={18} color={COLORI.verdeScuro} />
      </Pressable>
    </View>
  );
}

export default function NuovaRicerca() {
  const router = useRouter();

  const [soglia, setSoglia] = useState<number>(BASE.soglia);
  const [ore, setOre] = useState<number>(BASE.ore);
  const [notti, setNotti] = useState<{ min: number; max: number }>(BASE.notti);
  const [persone, setPersone] = useState<number>(BASE.persone);
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [errore, setErrore] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const cambiaTipo = (tipo: Tipo) => {
    setTipi((prima) =>
      prima.includes(tipo) ? prima.filter((t) => t !== tipo) : [...prima, tipo],
    );
  };

  // I controlli tengono già i valori nei limiti: questo è il doppio nodo
  // prima della rete, con gli stessi messaggi di testi.ts.
  const controlla = (): string | null => {
    if (soglia < SOGLIA.min || soglia > SOGLIA.max) return TESTI.ricerche.limiti.soglia;
    if (!ORE_SCELTE.some((o) => o === ore)) return TESTI.ricerche.limiti.ore;
    if (notti.min < 1 || notti.max > 3 || notti.min > notti.max) {
      return TESTI.ricerche.limiti.notti;
    }
    if (persone < PERSONE.min || persone > PERSONE.max) return TESTI.ricerche.limiti.persone;
    return null;
  };

  const salva = async () => {
    const problema = controlla();
    if (problema) {
      setErrore(problema);
      return;
    }
    setErrore(null);
    setSalvo(true);
    const esito = await creaRicerca({
      budget: soglia,
      ore,
      nottiMin: notti.min,
      nottiMax: notti.max,
      persone,
      tipi,
    });
    setSalvo(false);
    if (esito.errore) {
      setErrore(esito.errore);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <ScrollView contentContainerStyle={stili.contenuto}>
        <View style={stili.testata}>
          <View style={stili.colonnaTitolo}>
            <Titolo prima={T.titolo.prima} corsivo={T.titolo.corsivo} />
            <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={TESTI.comune.chiudi}
            style={({ pressed }) => [stili.chiudi, pressed && stili.chiudiPremuto]}
          >
            <Feather name="x" size={20} color={COLORI.inchiostro} />
          </Pressable>
        </View>

        <View style={stili.blocco}>
          <Text style={stili.etichetta}>{T.campi.soglia}</Text>
          <Contatore
            etichetta={T.campi.soglia}
            valore={euro(soglia)}
            giu={() => setSoglia((v) => Math.max(SOGLIA.min, v - SOGLIA.passo))}
            su={() => setSoglia((v) => Math.min(SOGLIA.max, v + SOGLIA.passo))}
            puoGiu={soglia > SOGLIA.min}
            puoSu={soglia < SOGLIA.max}
          />
          <Text style={stili.nota}>{T.campi.sogliaNota}</Text>
        </View>

        <View style={stili.blocco}>
          <Text style={stili.etichetta}>{T.campi.ore}</Text>
          <View style={stili.elenco}>
            {ORE_SCELTE.map((o) => (
              <Chip
                key={o}
                testo={oreLeggibili(o)}
                attivo={ore === o}
                onPress={() => setOre(o)}
              />
            ))}
          </View>
          <Text style={stili.nota}>{T.campi.oreNota}</Text>
        </View>

        <View style={stili.blocco}>
          <Text style={stili.etichetta}>{T.campi.notti}</Text>
          <View style={stili.elenco}>
            {NOTTI_SCELTE.map((n) => (
              <Chip
                key={`${n.min}-${n.max}`}
                testo={testoNotti(n.min, n.max)}
                attivo={notti.min === n.min && notti.max === n.max}
                onPress={() => setNotti({ min: n.min, max: n.max })}
              />
            ))}
          </View>
        </View>

        <View style={stili.blocco}>
          <Text style={stili.etichetta}>{T.campi.persone}</Text>
          <Contatore
            etichetta={T.campi.persone}
            valore={persone === 1 ? S.unaPersona : riempi(S.persone, { n: persone })}
            giu={() => setPersone((v) => Math.max(PERSONE.min, v - 1))}
            su={() => setPersone((v) => Math.min(PERSONE.max, v + 1))}
            puoGiu={persone > PERSONE.min}
            puoSu={persone < PERSONE.max}
          />
          <Text style={stili.nota}>{T.campi.personeNota}</Text>
        </View>

        <View style={stili.blocco}>
          <Text style={stili.etichetta}>{T.campi.tipi}</Text>
          <View style={stili.elenco}>
            {TIPI.map((tipo) => (
              <Chip
                key={tipo}
                testo={TINTE_TIPO[tipo].nome}
                attivo={tipi.includes(tipo)}
                onPress={() => cambiaTipo(tipo)}
                tinta={TINTE_TIPO[tipo]}
              />
            ))}
          </View>
          <Text style={stili.nota}>{T.campi.tipiNota}</Text>
        </View>

        {errore ? (
          <Text accessibilityLiveRegion="polite" style={stili.messaggioErrore}>
            {errore}
          </Text>
        ) : null}

        <View style={stili.azioni}>
          <Bottone testo={T.bottoni.crea} onPress={() => void salva()} caricamento={salvo} />
          <Bottone
            testo={T.bottoni.annulla}
            variante="fantasma"
            onPress={() => router.back()}
            disabilitato={salvo}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  schermo: {
    flex: 1,
    backgroundColor: COLORI.nebbia,
  },
  contenuto: {
    flexGrow: 1,
    padding: SPAZIO.schermata,
    paddingTop: SPAZIO.xl,
  },
  testata: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  colonnaTitolo: {
    flexShrink: 1,
    gap: SPAZIO.m,
  },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.fumo,
  },
  chiudi: {
    width: 40,
    height: 40,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.bianco,
    alignItems: "center",
    justifyContent: "center",
  },
  chiudiPremuto: {
    opacity: 0.7,
  },
  blocco: {
    marginTop: SPAZIO.xl,
    gap: SPAZIO.m,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.inchiostro,
  },
  elenco: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPAZIO.s,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo2,
  },
  contatore: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.l,
    alignSelf: "flex-start",
  },
  contatoreValore: {
    fontFamily: FONT.display,
    fontSize: 24,
    letterSpacing: -0.9,
    color: COLORI.inchiostro,
    fontVariant: ["tabular-nums"],
    minWidth: 96,
    textAlign: "center",
  },
  passo: {
    width: 44,
    height: 44,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.mentaTenue,
    alignItems: "center",
    justifyContent: "center",
  },
  passoSpento: {
    opacity: 0.4,
  },
  passoPremuto: {
    opacity: 0.7,
  },
  messaggioErrore: {
    fontFamily: FONT.testo,
    fontSize: 14,
    lineHeight: 21,
    color: COLORI.errore,
    marginTop: SPAZIO.xl,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: SPAZIO.xxl,
    paddingBottom: SPAZIO.l,
    gap: SPAZIO.s,
  },
});
