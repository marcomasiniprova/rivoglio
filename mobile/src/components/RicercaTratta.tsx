/**
 * LA RICERCA PER TRATTA: il modo di controllare un volo senza saperne il numero.
 *
 * Perché è il modo principale e non un'alternativa: l'utente medio non ha
 * il numero di volo in testa e non sa dove trovarlo. Ha in testa da dove è
 * partito, dove è arrivato e più o meno l'ora. Quindi si chiede quello, si
 * mostra l'elenco dei voli di quel giorno e lui riconosce il suo.
 *
 * Ridisegnata sul riferimento (tavola 6a, giro #49):
 * - l'elenco parte DA SOLO appena i tre campi sono completi: nella tavola
 *   un bottone "cerca" non esiste, e infatti non serve;
 * - ogni volo è raccontato con una frase ("Doveva arrivare alle 09:55.
 *   Atterrato alle 13:47."), non con una griglia di orari: è così che una
 *   persona riconosce il SUO volo;
 * - si SCEGLIE il volo e si conferma col bottone in fondo alla schermata,
 *   che è del genitore: qui si segnala solo la scelta.
 *
 * Qui non si decide niente: il ritardo mostrato nell'elenco viene
 * dall'orario aggiornato del fornitore e serve a riconoscersi; il verdetto
 * lo dà il motore dopo, sull'orario certificato.
 */
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Campo from "@/components/Campo";
import CampoAeroporto from "@/components/CampoAeroporto";
import { voliDiTratta, type AeroportoTrovato, type VoloDiTratta } from "@/lib/api";
import { conBarre, dataIso } from "@/lib/data";
import { durataLunga } from "@/lib/formati";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.tratta;

type Props = {
  /**
   * La scelta corrente, o null se non c'è: il bottone "Controlla questo
   * volo" sta nel genitore, in fondo alla schermata come nella tavola.
   */
  onSeleziona: (scelta: { volo: string; iso: string } | null) => void;
  /** true mentre il check è in corso: l'elenco non accetta altri tocchi. */
  occupato?: boolean;
};

/**
 * I minuti fra previsto ed effettivo, da due orari "HH:MM" senza data.
 * Il giro di mezzanotte si gestisce col modulo: una differenza sopra le
 * 12 ore non è un ritardo credibile, è un anticipo o un dato sporco, e
 * in entrambi i casi il badge non esce. Non è un verdetto: è la frase
 * con cui l'utente riconosce il suo volo.
 */
function minutiDiRitardo(prev: string, eff: string): number | null {
  const [ph, pm] = prev.split(":").map(Number);
  const [eh, em] = eff.split(":").map(Number);
  if ([ph, pm, eh, em].some((n) => !Number.isFinite(n))) return null;
  const diff = (eh * 60 + em - ph * 60 - pm + 1440) % 1440;
  return diff > 720 ? null : diff;
}

/** La frase della riga, come nella tavola: racconta, non elenca. */
function frase(v: VoloDiTratta): { testo: string; ritardo: number | null } {
  if (v.cancellato) return { testo: T.elenco.cancellato, ritardo: null };
  if (v.arrivoEffettivoOra && v.arrivoOra) {
    const min = minutiDiRitardo(v.arrivoOra, v.arrivoEffettivoOra);
    if (min !== null && min > 0) {
      return {
        testo: T.elenco.doveva
          .replace("{prev}", v.arrivoOra)
          .replace("{eff}", v.arrivoEffettivoOra),
        ritardo: min,
      };
    }
    return { testo: T.elenco.inOrario.replace("{eff}", v.arrivoEffettivoOra), ritardo: null };
  }
  if (v.arrivoOra) return { testo: T.elenco.soloPrevisto.replace("{prev}", v.arrivoOra), ritardo: null };
  return { testo: "", ritardo: null };
}

export default function RicercaTratta({ onSeleziona, occupato }: Props) {
  const [da, setDa] = useState<AeroportoTrovato | null>(null);
  const [a, setA] = useState<AeroportoTrovato | null>(null);
  const [data, setData] = useState("");
  const [erroreRete, setErroreRete] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [voli, setVoli] = useState<VoloDiTratta[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [giorno, setGiorno] = useState("");
  const [scelto, setScelto] = useState<string | null>(null);
  /* L'ultima ricerca partita: se nel frattempo i campi cambiano ancora,
     la risposta vecchia non deve sovrascrivere quella nuova. */
  const ultima = useRef(0);

  /* Un campo che cambia azzera scelta ed elenco. Sta QUI e non in un
     effetto: la regola dei hooks vieta il setState sincrono negli
     effetti, e ha ragione lei (cascata di render). */
  function cambia<V>(imposta: (v: V) => void) {
    return (v: V) => {
      imposta(v);
      setErroreRete(null);
      setScelto(null);
      setVoli(null);
      onSeleziona(null);
    };
  }
  const cambiaDa = cambia(setDa);
  const cambiaA = cambia(setA);
  const cambiaData = cambia(setData);

  /* Due scali uguali non sono un errore di rete: si deducono, non si
     tengono in uno stato. */
  const stessoScalo = Boolean(da && a && da.iata === a.iata);
  const iso = !stessoScalo && da && a ? dataIso(data) : null;
  const errore = erroreRete ?? (stessoScalo ? T.errori.stessoScalo : null);

  /* La ricerca parte DA SOLA quando i tre campi sono completi: nella
     tavola non c'è nessun bottone "cerca", e ha ragione lei. Il
     setState avviene solo nel callback asincrono, a risposta arrivata. */
  useEffect(() => {
    if (!da || !a || !iso) return;
    const id = ++ultima.current;
    const timer = setTimeout(async () => {
      setInCorso(true);
      const esito = await voliDiTratta(da.iata, a.iata, iso);
      if (id !== ultima.current) return;
      setInCorso(false);
      if (!esito.ok) return setErroreRete(esito.errore);
      setGiorno(iso);
      setDemo(esito.demo);
      setVoli(esito.voli);
    }, 350);
    return () => clearTimeout(timer);
  }, [da, a, iso]);

  function scegli(v: VoloDiTratta) {
    if (occupato) return;
    const nuovo = scelto === v.volo ? null : v.volo;
    setScelto(nuovo);
    onSeleziona(nuovo ? { volo: nuovo, iso: giorno } : null);
  }

  return (
    <View>
      {/* ------------------------------------------------ i tre campi */}
      <View style={stili.scheda}>
        <CampoAeroporto
          etichetta={T.da.etichetta}
          segnaposto={T.da.segnaposto}
          scelto={da}
          onScegli={cambiaDa}
        />

        <View style={stili.spazio} />

        <CampoAeroporto
          etichetta={T.a.etichetta}
          segnaposto={T.a.segnaposto}
          scelto={a}
          onScegli={cambiaA}
        />

        <View style={stili.spazio} />

        <Campo
          etichetta={T.data.etichetta}
          valore={data}
          onChange={(t) => cambiaData(conBarre(t))}
          segnaposto={T.data.segnaposto}
          tipo="numero"
        />
        <Text style={stili.aiuto}>{T.data.aiuto}</Text>

        {errore && (
          <Text style={stili.errore} accessibilityRole="alert">
            {errore}
          </Text>
        )}
      </View>

      {inCorso && (
        <View style={stili.attesa}>
          <ActivityIndicator size="small" color={COLORI.verde} />
        </View>
      )}

      {/* ------------------------------------------------ l'elenco */}
      {voli !== null && voli.length === 0 && !inCorso && (
        <View style={stili.nulla}>
          <Text style={stili.nullaTitolo}>{T.nessuno.titolo}</Text>
          <Text style={stili.nullaTesto}>{T.nessuno.testo}</Text>
        </View>
      )}

      {voli !== null && voli.length > 0 && (
        <View style={stili.elenco}>
          <View style={stili.elencoTesta}>
            <Text style={stili.elencoTitolo}>{T.elenco.titolo}</Text>
            <Text style={stili.elencoConto}>
              {voli.length === 1
                ? T.elenco.conteggioUno
                : T.elenco.conteggio.replace("{n}", String(voli.length))}
            </Text>
          </View>

          {demo && <Text style={stili.demo}>{T.elenco.demo}</Text>}

          <View style={stili.righe}>
            {voli.map((v) => {
              const { testo, ritardo } = frase(v);
              const attivo = scelto === v.volo;
              return (
                <Pressable
                  key={v.volo}
                  onPress={() => scegli(v)}
                  disabled={occupato}
                  accessibilityRole="button"
                  accessibilityState={{ selected: attivo }}
                  accessibilityLabel={`${v.partenzaOra}, ${v.compagnia ?? v.volo}. ${testo}`}
                  style={[stili.riga, attivo && stili.rigaAttiva, occupato && stili.rigaSpenta]}
                >
                  <View style={stili.rigaTesta}>
                    <Text style={stili.partenza}>{v.partenzaOra || "--:--"}</Text>
                    <Text style={stili.compagnia} numberOfLines={1}>
                      {v.compagnia ?? v.volo}
                    </Text>
                  </View>
                  {testo !== "" && <Text style={stili.fraseRiga}>{testo}</Text>}
                  {ritardo !== null && (
                    <View style={stili.badge}>
                      <Text style={stili.badgeTesto}>
                        {T.elenco.ritardoBadge.replace("{durata}", durataLunga(ritardo))}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const stili = StyleSheet.create({
  scheda: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.xl,
    ...OMBRA.scheda,
  },
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
  attesa: { paddingVertical: SPAZIO.l, alignItems: "center" },
  nulla: {
    marginTop: SPAZIO.l,
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.interno,
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
  elencoTesta: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  elencoTitolo: {
    fontFamily: FONT.testoSemi,
    fontSize: 16,
    color: COLORI.inchiostro,
  },
  elencoConto: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo2 },
  demo: {
    fontFamily: FONT.testoMedio,
    fontSize: 12,
    color: COLORI.fumo,
    marginTop: SPAZIO.s,
  },
  righe: { marginTop: SPAZIO.m, gap: SPAZIO.s },
  riga: {
    backgroundColor: COLORI.bianco,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderLeftWidth: 3,
    borderLeftColor: COLORI.bordo,
    borderRadius: RAGGIO.interno,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m + 2,
  },
  rigaAttiva: {
    backgroundColor: COLORI.mentaTenue,
    borderColor: COLORI.menta,
    borderLeftColor: COLORI.verde,
  },
  rigaSpenta: { opacity: 0.5 },
  rigaTesta: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  partenza: {
    fontFamily: FONT.display,
    fontSize: 22,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
  },
  compagnia: {
    fontFamily: FONT.testoMedio,
    fontSize: 13.5,
    color: COLORI.fumo,
    flexShrink: 1,
  },
  fraseRiga: {
    fontFamily: FONT.testo,
    fontSize: 13,
    lineHeight: 19,
    color: COLORI.fumo,
    marginTop: 3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORI.verde,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: 4,
    marginTop: SPAZIO.s,
  },
  badgeTesto: { fontFamily: FONT.testoSemi, fontSize: 11.5, color: COLORI.bianco },
});
