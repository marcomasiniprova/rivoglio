import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import ContoAperto from "@/components/ContoAperto";
import SchedaDestinazione from "@/components/SchedaDestinazione";
import Titolo from "@/components/Titolo";
import { COLORI, FONT, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Destinazione } from "@/lib/tipi";
import { costruisci, type Proposta } from "@/motore/costruttore";
import { Pallini } from "./_layout";

/**
 * Media nazionale self service, osservatorio MIMIT del 06/08/2026 (lo stesso
 * valore dei dati demo in lib/dati.ts). In produzione la legge il server.
 */
const BENZINA_ESEMPIO = 1.994;

/** L'esempio del passo 2: Bologna, 120€ a testa in 2. I conti li fa il motore. */
const RICHIESTA_ESEMPIO = {
  partenza: "Bologna",
  budgetPersona: 120,
  notti: 2,
  persone: 2,
  tipi: [],
  oreMax: 3,
  prezzoBenzina: BENZINA_ESEMPIO,
} as const;

const giornoIso = (d: Date) => d.toISOString().slice(0, 10);

function prossimoVenerdi(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d;
}

type Esempio = {
  proposta: Proposta;
  destinazione: Destinazione;
  alloggioATesta: number;
  totale: number;
};

function costruisciEsempio(): Esempio | null {
  const esito = costruisci({ ...RICHIESTA_ESEMPIO, tipi: [] });
  // Con questi ingressi fissi il motore trova sempre qualcosa (è provato nei
  // test del motore): il ramo null esiste solo per non fidarsi alla cieca.
  if (!esito.ok || !esito.proposte.length) return null;

  const proposta = esito.proposte[0];
  // Come per i dati demo: la camera costa l'80% di quel che resta dopo
  // l'auto, arrotondata ai 5€. Sotto la soglia per costruzione.
  const camera =
    Math.round((0.8 * proposta.restaPerDormire * RICHIESTA_ESEMPIO.persone) / 5) * 5;
  const alloggioATesta = camera / RICHIESTA_ESEMPIO.persone;
  const arrivo = prossimoVenerdi();
  const partenza = new Date(arrivo);
  partenza.setDate(partenza.getDate() + RICHIESTA_ESEMPIO.notti);

  return {
    proposta,
    alloggioATesta,
    totale: alloggioATesta + proposta.conto.aPersona,
    destinazione: {
      id: "esempio",
      inviato_il: new Date().toISOString(),
      aperto_il: null,
      demo: true,
      offerta: {
        struttura: TESTI.onboarding.valore.struttura,
        comune: proposta.destinazione.nome,
        check_in: giornoIso(arrivo),
        check_out: giornoIso(partenza),
        prezzo_alloggio: camera,
        link: "https://example.com/offerta-demo",
        tipo: proposta.destinazione.tipo,
        lat: proposta.destinazione.lat,
        lng: proposta.destinazione.lng,
      },
    },
  };
}

/** Passo 2: il momento aha è il conto, non una promessa. */
export default function Valore() {
  const router = useRouter();
  const T = TESTI.onboarding.valore;
  const esempio = useMemo(() => costruisciEsempio(), []);
  const avanti = () => router.push("/(benvenuto)/criteri");

  return (
    <SafeAreaView edges={["top", "bottom"]} style={stili.schermo}>
      <ScrollView contentContainerStyle={stili.contenuto}>
        <Pallini passo={2} />
        <Titolo {...T.titolo} />
        <Text style={stili.sottotitolo}>{T.sottotitolo}</Text>

        {esempio ? (
          <View style={stili.esempio}>
            <SchedaDestinazione
              destinazione={esempio.destinazione}
              totale={esempio.totale}
              avanzo={RICHIESTA_ESEMPIO.budgetPersona - esempio.totale}
              persone={RICHIESTA_ESEMPIO.persone}
              km={esempio.proposta.conto.kmSolaAndata}
              ore={esempio.proposta.conto.ore}
              onPress={avanti}
            />
            <ContoAperto
              alloggio={esempio.alloggioATesta}
              auto={esempio.proposta.conto.aPersona}
              totale={esempio.totale}
              soglia={RICHIESTA_ESEMPIO.budgetPersona}
              persone={RICHIESTA_ESEMPIO.persone}
              km={esempio.proposta.conto.kmSolaAndata}
              ore={esempio.proposta.conto.ore}
              dettaglio={{
                litri: esempio.proposta.conto.litri,
                benzina: esempio.proposta.conto.benzina,
                pedaggi: esempio.proposta.conto.pedaggi,
              }}
            />
          </View>
        ) : null}

        <Text style={stili.nota}>{T.nota}</Text>

        <View style={stili.azioni}>
          <Bottone testo={T.bottoni.avanti} onPress={avanti} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  schermo: {
    flex: 1,
  },
  contenuto: {
    flexGrow: 1,
    padding: SPAZIO.schermata,
    paddingTop: SPAZIO.xl,
  },
  sottotitolo: {
    fontFamily: FONT.testo,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORI.fumo,
    marginTop: SPAZIO.m,
  },
  esempio: {
    gap: SPAZIO.l,
    marginTop: SPAZIO.xl,
  },
  nota: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.fumo2,
    marginTop: SPAZIO.l,
  },
  azioni: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: SPAZIO.xl,
    paddingBottom: SPAZIO.l,
  },
});
