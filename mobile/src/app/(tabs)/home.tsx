/**
 * LA HOME PREMIUM (tavola 3d): la tab che compare con la prima pratica.
 *
 * Perché non c'è al primo avvio: senza pratiche ogni suo numero vale
 * zero, e un'app che ti accoglie con "Recuperati 0€" ti sta dicendo che
 * non hai fatto niente. Finché non esiste una pratica l'app si apre sul
 * Check (scelta di Valerio, 10/08); la tab spunta da sola dopo.
 *
 * ⚠️ OGNI NUMERO È CALCOLATO DALLE PRATICHE VERE. Della tavola originale
 * qui mancano due cose, di proposito: la percentuale di successo (una
 * statistica che non abbiamo) e il "giorno 42/42" (il giorno esatto
 * dell'invio non è nel dato dell'elenco, e un conto stimato sarebbe un
 * numero inventato: la card "Da fare oggi" è guidata dallo STATO).
 */
import { useCallback, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { VeloVerde } from "@/components/ScenaVerdetto";
import BadgeDemo from "@/components/BadgeDemo";
import { caricaPratiche, type Pratica } from "@/lib/dati";
import { praticheEsempio } from "@/lib/esempio";
import { scenaDa } from "@/lib/anteprima";
import { euro, dataBreve } from "@/lib/formati";
import { leggiProfilo } from "@/lib/profilo";
import { useSessione } from "@/lib/sessione";
import { leggiVoli } from "@/lib/voliSalvati";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const T = TESTI.home;
const ARIA_BARRA = 116;

/** Gli stati in cui la pratica è ancora viva, in attesa di un esito. */
const APERTE = new Set(["creata", "pagata", "pronta", "inviata", "sollecito", "enac"]);

/** Lo stato della pratica come lo legge una persona (da testi.pratiche). */
const nomeStato = (stato: string): string =>
  (TESTI.pratiche.stati as Record<string, string>)[stato] ?? stato;

export default function Home() {
  const router = useRouter();
  const { scena } = useLocalSearchParams<{ scena?: string }>();
  const momento = scenaDa(scena);
  const { utente } = useSessione();
  const [pratiche, setPratiche] = useState<Pratica[]>([]);
  const [checkFatti, setCheckFatti] = useState(0);
  const [nome, setNome] = useState<string | null>(null);
  const [aggiorno, setAggiorno] = useState(false);
  const caricato = useRef(false);

  const carica = useCallback(async () => {
    /* La Home dimostrativa, solo dalla lavagna del sito: senza pratiche
       vere questa schermata non compare affatto (compare con la prima
       pratica, scelta di Valerio) e non si potrebbe guardare. */
    if (momento === "elenco") {
      setPratiche(praticheEsempio() as unknown as Pratica[]);
      setCheckFatti(2);
      return;
    }
    if (!utente) return;
    const [lette, voli, profilo] = await Promise.all([
      caricaPratiche(),
      leggiVoli(),
      leggiProfilo(),
    ]);
    if (lette !== null) {
      caricato.current = true;
      setPratiche(lette);
    }
    setCheckFatti(voli.length);
    setNome(profilo?.nickname ?? null);
  }, [utente, momento]);

  useFocusEffect(
    useCallback(() => {
      void carica();
    }, [carica]),
  );

  const aperte = pratiche.filter((p) => APERTE.has(p.stato));
  const pagate = pratiche.filter((p) => p.stato === "esito_pagata");
  const richiesto = aperte.reduce((s, p) => s + (p.importo_fascia ?? 0), 0);
  const recuperato = pagate.reduce((s, p) => s + (p.importo_fascia ?? 0), 0);
  const demo = pratiche.some((p) => p.demo);

  /* La card gialla: la prima pratica che aspetta UN GESTO DELL'UTENTE.
     "pronta" = la lettera va mandata; "sollecito" = il secondo colpo va
     mandato. Gli altri stati aspettano la compagnia, non lui. */
  const daFare = pratiche.find((p) => p.stato === "pronta" || p.stato === "sollecito");

  return (
    <ScrollView
      style={stili.pagina}
      contentContainerStyle={stili.contenuto}
      refreshControl={
        <RefreshControl
          refreshing={aggiorno}
          onRefresh={() => {
            setAggiorno(true);
            void carica().finally(() => setAggiorno(false));
          }}
          tintColor={COLORI.verde}
        />
      }
    >
      <VeloVerde />

      {/* ------------------------------------------------ il saluto */}
      <View style={stili.testata}>
        <View>
          {nome ? (
            <Text style={stili.ciao}>{T.ciao.replace("{nome}", nome)}</Text>
          ) : null}
          <Text style={stili.saluto}>{T.saluto}</Text>
        </View>
        {nome ? (
          <View style={stili.avatar}>
            <Text style={stili.avatarTesto}>{nome.slice(0, 2).toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      {demo && <BadgeDemo />}

      {/* --------------------------------------- il numero che conta */}
      <View style={stili.cassa}>
        <Text style={stili.cassaEtichetta}>{T.richiesti.toUpperCase()}</Text>
        <Text style={stili.cassaImporto}>{euro(richiesto)}</Text>
        <Text style={stili.cassaSotto}>
          {aperte.length === 1
            ? T.richiestiSottoUna
            : T.richiestiSotto.replace("{n}", String(aperte.length))}
          {" · "}
          {T.perPasseggero}
        </Text>

        <View style={stili.statRiga}>
          <View style={stili.stat}>
            <Text style={stili.statEtichetta}>{T.statRecuperati}</Text>
            <Text style={stili.statValore}>{euro(recuperato)}</Text>
          </View>
          <View style={stili.stat}>
            <Text style={stili.statEtichetta}>{T.statCheck}</Text>
            <Text style={stili.statValore}>{checkFatti}</Text>
          </View>
          <View style={stili.stat}>
            <Text style={stili.statEtichetta}>{T.statAttesa}</Text>
            <Text style={stili.statValore}>{aperte.length}</Text>
          </View>
        </View>
      </View>

      {/* ------------------------------------------- le due azioni */}
      <View style={stili.azioni}>
        <Pressable
          onPress={() => router.navigate({ pathname: "/", params: { modo: "tratta" } })}
          accessibilityRole="button"
          style={[stili.azione, stili.azioneVerde]}
        >
          <Feather name="search" size={18} color={COLORI.bianco} />
          <Text style={stili.azioneTitoloChiaro}>{T.nuovoCheck}</Text>
          <Text style={stili.azioneSottoChiaro}>{T.nuovoCheckSotto}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.navigate({ pathname: "/", params: { modo: "carta" } })}
          accessibilityRole="button"
          style={stili.azione}
        >
          <Feather name="camera" size={18} color={COLORI.verdeScuro} />
          <Text style={stili.azioneTitolo}>{T.scansiona}</Text>
          <Text style={stili.azioneSotto}>{T.scansionaSotto}</Text>
        </Pressable>
      </View>

      {/* -------------------------------------------- da fare oggi */}
      {daFare && (
        <Pressable
          onPress={() => router.push(`/pratica/${daFare.id}`)}
          accessibilityRole="button"
          style={stili.daFare}
        >
          <Text style={stili.daFareTag}>{T.daFare.toUpperCase()}</Text>
          <Text style={stili.daFareTesto}>
            {(daFare.stato === "sollecito" ? T.daFareSollecito : T.daFarePronta).replace(
              "{volo}",
              daFare.volo_iata ?? "",
            )}
          </Text>
          <Text style={stili.daFareApri}>{T.apriPratica}</Text>
        </Pressable>
      )}

      {/* ----------------------------------------- pratiche aperte */}
      {aperte.length > 0 && (
        <View style={stili.blocco}>
          <View style={stili.bloccoTesta}>
            <Text style={stili.bloccoTitolo}>{T.praticheAperte}</Text>
            <Pressable onPress={() => router.navigate("/pratiche")} accessibilityRole="link">
              <Text style={stili.bloccoLink}>{T.vaiATutte}</Text>
            </Pressable>
          </View>
          {aperte.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/pratica/${p.id}`)}
              accessibilityRole="button"
              style={stili.riga}
            >
              <View style={stili.rigaTesti}>
                <Text style={stili.rigaVolo}>
                  {p.volo_iata ?? "—"}
                  {p.data_locale ? ` · ${dataBreve(p.data_locale)}` : ""}
                </Text>
                <Text style={stili.rigaStato}>{nomeStato(p.stato)}</Text>
              </View>
              {p.importo_fascia ? (
                <Text style={stili.rigaImporto}>{euro(p.importo_fascia)}</Text>
              ) : null}
              <Feather name="chevron-right" size={18} color={COLORI.fumo2} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: {
    paddingHorizontal: SPAZIO.schermata,
    paddingTop: SPAZIO.xxl + SPAZIO.l,
    paddingBottom: ARIA_BARRA,
  },
  testata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPAZIO.l,
  },
  ciao: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo },
  saluto: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.8,
    color: COLORI.inchiostro,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTesto: { fontFamily: FONT.testoSemi, fontSize: 13, color: COLORI.verdeScuro },

  /* La card scura del numero: verde notte, come nella tavola. */
  cassa: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    marginTop: SPAZIO.s,
    ...OMBRA.sollevata,
  },
  cassaEtichetta: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORI.menta,
  },
  cassaImporto: {
    fontFamily: FONT.display,
    fontSize: 56,
    lineHeight: 62,
    letterSpacing: -2.4,
    color: COLORI.bianco,
    marginTop: SPAZIO.s,
  },
  cassaSotto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: "rgba(255,255,255,0.65)",
    marginTop: SPAZIO.xs,
  },
  statRiga: { flexDirection: "row", gap: SPAZIO.s, marginTop: SPAZIO.l },
  stat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: RAGGIO.campo,
    paddingHorizontal: SPAZIO.m,
    paddingVertical: SPAZIO.m,
  },
  statEtichetta: {
    fontFamily: FONT.testo,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  statValore: {
    fontFamily: FONT.display,
    fontSize: 18,
    letterSpacing: -0.4,
    color: COLORI.bianco,
    marginTop: 3,
  },

  azioni: { flexDirection: "row", gap: SPAZIO.m, marginTop: SPAZIO.l },
  azione: {
    flex: 1,
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    gap: 3,
    ...OMBRA.scheda,
  },
  azioneVerde: { backgroundColor: COLORI.verde },
  azioneTitolo: {
    fontFamily: FONT.testoSemi,
    fontSize: 15,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  azioneTitoloChiaro: {
    fontFamily: FONT.testoSemi,
    fontSize: 15,
    color: COLORI.bianco,
    marginTop: SPAZIO.s,
  },
  azioneSotto: { fontFamily: FONT.testo, fontSize: 12, color: COLORI.fumo },
  azioneSottoChiaro: { fontFamily: FONT.testo, fontSize: 12, color: "rgba(255,255,255,0.8)" },

  /* La card gialla del prossimo gesto. */
  daFare: {
    backgroundColor: "#FDF6E3",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.5)",
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    marginTop: SPAZIO.l,
  },
  daFareTag: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: COLORI.ambra,
  },
  daFareTesto: {
    fontFamily: FONT.testoMedio,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.s,
  },
  daFareApri: {
    fontFamily: FONT.testoSemi,
    fontSize: 13.5,
    color: COLORI.verdeScuro,
    marginTop: SPAZIO.m,
  },

  blocco: { marginTop: SPAZIO.xl },
  bloccoTesta: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  bloccoTitolo: {
    fontFamily: FONT.testoSemi,
    fontSize: 16,
    color: COLORI.inchiostro,
  },
  bloccoLink: { fontFamily: FONT.testoMedio, fontSize: 13, color: COLORI.verdeScuro },
  riga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.interno,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m + 2,
    marginTop: SPAZIO.s,
  },
  rigaTesti: { flex: 1 },
  rigaVolo: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.inchiostro },
  rigaStato: { fontFamily: FONT.testo, fontSize: 12.5, color: COLORI.fumo, marginTop: 1 },
  rigaImporto: { fontFamily: FONT.display, fontSize: 17, color: COLORI.inchiostro },
});
