/**
 * Il profilo, rifatto l'8/08 sul riferimento scelto da Valerio:
 * avatar al centro, nome e email sotto, "Modifica il profilo", il
 * riquadro dell'invito agli amici e le voci in elenco con l'icona.
 *
 * Cosa NON c'è, di proposito: carte di pagamento (si paga sul sito,
 * scelta di Valerio: Apple e Google trattengono il 15-30%) e premi in
 * denaro per gli inviti (nessuna promessa che non possiamo mantenere:
 * l'invito condivide l'app e basta).
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { SITO } from "@/lib/api";
import { praticheEsempio } from "@/lib/esempio";
import { scenaDa } from "@/lib/anteprima";
import { caricaPratiche } from "@/lib/dati";
import { euro } from "@/lib/formati";
import { leggiProfilo } from "@/lib/profilo";
import { esci, useSessione } from "@/lib/sessione";
import { apriImpostazioni, condividi, scriviA } from "@/lib/sistema";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";

const P = TESTI.profiloApp;
const ARIA_BARRA = 116;

type Voce = {
  chiave: string;
  icona: React.ComponentProps<typeof Feather>["name"];
  titolo: string;
  sotto: string;
  fai: () => void;
};

/** Le iniziali per l'avatar: dal nome pubblico, o dall'email. */
function iniziali(nickname: string | null, email: string | null | undefined): string {
  const base = nickname ?? email?.split("@")[0] ?? "";
  const pulita = base.replace(/[^a-zA-Z0-9]/g, "");
  return (pulita.slice(0, 2) || "??").toUpperCase();
}

export default function SchermataProfilo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scena } = useLocalSearchParams<{ scena?: string }>();
  const momento = scenaDa(scena);
  const { utente } = useSessione();
  const [nickname, setNickname] = useState<string | null>(null);
  /* Il portafoglio (tavola 3f), SENZA le cifre di acquisto: quelle
     vivono nel venditore e oggi un venditore attivo non c'è. Qui stanno
     solo i numeri che abbiamo davvero: le fasce richieste e recuperate,
     e quante pratiche la garanzia ha rimborsato. */
  const [portafoglio, setPortafoglio] = useState<{
    richiesto: number;
    recuperato: number;
    aperteN: number;
    chiuseN: number;
    rimborsate: number;
  } | null>(null);
  /* Quando un'azione non può andare fino in fondo (il browser non ha le
     impostazioni di sistema, la condivisione non c'è) si dice perché,
     invece di lasciare il tasto muto. */
  const [avviso, setAvviso] = useState<string | null>(null);

  /* Il nome pubblico si rilegge a ogni ritorno: se è appena stato
     cambiato in Dati personali, qui deve vedersi subito. */
  useFocusEffect(
    useCallback(() => {
      /* Il portafoglio dimostrativo, solo dalla lavagna del sito: senza
         pratiche vere questo blocco non comparirebbe mai. I numeri sono
         le fasce del Regolamento sulle due pratiche di esempio. */
      if (momento === "portafoglio") {
        const finte = praticheEsempio();
        const aperte = finte.filter((x) => x.stato === "inviata");
        const pagate = finte.filter((x) => x.stato === "esito_pagata");
        setPortafoglio({
          richiesto: aperte.reduce((s, x) => s + (x.importo_fascia ?? 0), 0),
          recuperato: pagate.reduce((s, x) => s + (x.importo_fascia ?? 0), 0),
          aperteN: aperte.length,
          chiuseN: finte.length - aperte.length,
          rimborsate: 0,
        });
        return;
      }
      if (!utente) {
        setNickname(null);
        return;
      }
      void leggiProfilo().then((p) => setNickname(p?.nickname ?? null));
      void caricaPratiche().then((lette) => {
        if (lette === null) return;
        const APERTE = new Set(["creata", "pagata", "pronta", "inviata", "sollecito", "enac"]);
        const aperte = lette.filter((x) => APERTE.has(x.stato));
        const pagate = lette.filter((x) => x.stato === "esito_pagata");
        setPortafoglio({
          richiesto: aperte.reduce((s, x) => s + (x.importo_fascia ?? 0), 0),
          recuperato: pagate.reduce((s, x) => s + (x.importo_fascia ?? 0), 0),
          aperteN: aperte.length,
          chiuseN: lette.length - aperte.length,
          rimborsate: lette.filter((x) => x.stato === "rimborsata").length,
        });
      });
    }, [utente, momento]),
  );

  async function invita() {
    setAvviso(await condividi(P.invita.messaggio.replace("{sito}", SITO)));
  }

  const voci: Voce[] = [
    {
      chiave: "sicurezza",
      icona: "lock",
      titolo: TESTI.sicurezza.voce,
      sotto: TESTI.sicurezza.voceSotto,
      fai: () => router.push("/sicurezza"),
    },
    {
      chiave: "dati",
      icona: "user",
      titolo: P.voci.dati,
      sotto: P.voci.datiSotto,
      fai: () => router.push("/modifica-profilo"),
    },
    {
      chiave: "notifiche",
      icona: "bell",
      titolo: P.voci.notifiche,
      sotto: P.voci.notificheSotto,
      // Le notifiche si governano dalle impostazioni di sistema: si
      // aprono quelle, non una copia finta dentro l'app.
      fai: () => setAvviso(apriImpostazioni()),
    },
    {
      chiave: "privacy",
      icona: "shield",
      titolo: P.voci.privacy,
      sotto: P.voci.privacySotto,
      fai: () => void openBrowserAsync(`${SITO}/privacy`),
    },
    {
      chiave: "condizioni",
      icona: "file-text",
      titolo: P.voci.condizioni,
      sotto: P.voci.condizioniSotto,
      fai: () => void openBrowserAsync(`${SITO}/condizioni`),
    },
    {
      chiave: "supporto",
      icona: "mail",
      titolo: P.voci.supporto,
      sotto: P.voci.supportoSotto,
      fai: () => void scriviA(P.email).then(setAvviso),
    },
    {
      chiave: "sito",
      icona: "globe",
      titolo: P.voci.sito,
      sotto: P.voci.sitoSotto.replace("{sitoBreve}", SITO.replace(/^https?:\/\//, "")),
      fai: () => void openBrowserAsync(SITO),
    },
  ];

  return (
    <ScrollView
      style={stili.schermo}
      contentContainerStyle={[
        stili.contenuto,
        { paddingTop: insets.top + SPAZIO.l, paddingBottom: insets.bottom + ARIA_BARRA },
      ]}
    >
      <Titolo prima={P.titolo.prima} corsivo={P.titolo.corsivo} />

      {/* ------------------------------------------------ chi sei */}
      <View style={stili.carta}>
        <View style={stili.avatar}>
          {utente ? (
            <Text style={stili.avatarTesto}>{iniziali(nickname, utente.email)}</Text>
          ) : (
            <Feather name="user" size={30} color={COLORI.verdeScuro} />
          )}
        </View>

        {utente ? (
          <>
            <Text style={stili.nome}>{nickname ?? utente.email?.split("@")[0]}</Text>
            <Text style={stili.emailTesto}>{utente.email}</Text>
            <Pressable
              onPress={() => router.push("/modifica-profilo")}
              accessibilityRole="button"
              style={stili.modifica}
            >
              <Text style={stili.modificaTesto}>{P.modifica}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={stili.nome}>{P.ospite.titolo}</Text>
            <Text style={stili.ospiteTesto}>{P.ospite.testo}</Text>
            <View style={stili.spazio} />
            <Bottone testo={P.ospite.azione} onPress={() => router.push("/accesso")} />
          </>
        )}
      </View>

      {/* -------------------------------------------- portafoglio */}
      {portafoglio && (portafoglio.aperteN > 0 || portafoglio.chiuseN > 0) && (
        <View style={stili.borsa}>
          <Text style={stili.borsaTitolo}>{P.portafoglio.titolo.toUpperCase()}</Text>
          <View style={stili.borsaRighe}>
            <View style={stili.borsaRiga}>
              <Text style={stili.borsaEtichetta}>{P.portafoglio.recuperati}</Text>
              <Text style={stili.borsaValore}>{euro(portafoglio.recuperato)}</Text>
            </View>
            <View style={stili.borsaRiga}>
              <Text style={stili.borsaEtichetta}>{P.portafoglio.richiesti}</Text>
              <Text style={stili.borsaValore}>{euro(portafoglio.richiesto)}</Text>
            </View>
            {portafoglio.rimborsate > 0 && (
              <View style={stili.borsaRiga}>
                <Text style={stili.borsaEtichetta}>{P.portafoglio.garanzia}</Text>
                <Text style={stili.borsaValore}>{portafoglio.rimborsate}</Text>
              </View>
            )}
          </View>
          <Text style={stili.borsaNota}>{P.portafoglio.nota}</Text>
        </View>
      )}

      {/* ------------------------------------------------ invita */}
      <Pressable onPress={() => void invita()} accessibilityRole="button" style={stili.invita}>
        <View style={stili.invitaIcona}>
          <Feather name="share" size={17} color={COLORI.verdeScuro} />
        </View>
        <View style={stili.invitaTesti}>
          <Text style={stili.invitaTitolo}>{P.invita.titolo}</Text>
          <Text style={stili.invitaSotto}>{P.invita.testo}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={COLORI.verdeScuro} />
      </Pressable>

      {/* ------------------------------------------------ le voci */}
      <View style={stili.elenco}>
        {voci.map((v, i) => (
          <Pressable
            key={v.chiave}
            onPress={() => {
              setAvviso(null);
              v.fai();
            }}
            accessibilityRole="button"
            style={[stili.voce, i < voci.length - 1 && stili.voceBordo]}
          >
            <View style={stili.voceIcona}>
              <Feather name={v.icona} size={16} color={COLORI.verdeScuro} />
            </View>
            <View style={stili.voceTesti}>
              <Text style={stili.voceTitolo}>{v.titolo}</Text>
              <Text style={stili.voceSotto}>{v.sotto}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORI.fumo2} />
          </Pressable>
        ))}
      </View>

      {avviso && (
        <View style={stili.avviso}>
          <Feather name="info" size={15} color={COLORI.verdeScuro} />
          <Text style={stili.avvisoTesto}>{avviso}</Text>
        </View>
      )}

      {utente && (
        <Bottone testo={P.esci} onPress={() => void esci()} variante="fantasma" />
      )}

      <Text style={stili.piede}>{P.piede}</Text>
    </ScrollView>
  );
}

const stili = StyleSheet.create({
  schermo: { flex: 1, backgroundColor: COLORI.nebbia },
  contenuto: { paddingHorizontal: SPAZIO.schermata, gap: SPAZIO.l },
  /* Il portafoglio (tavola 3f), coi soli numeri veri. */
  borsa: {
    backgroundColor: COLORI.verdeNotte,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
    ...OMBRA.sollevata,
  },
  borsaTitolo: {
    fontFamily: FONT.testoSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORI.menta,
  },
  borsaRighe: { marginTop: SPAZIO.m, gap: SPAZIO.s },
  borsaRiga: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: SPAZIO.m,
  },
  borsaEtichetta: {
    flex: 1,
    fontFamily: FONT.testo,
    fontSize: 12.5,
    color: "rgba(255,255,255,0.7)",
  },
  borsaValore: {
    fontFamily: FONT.display,
    fontSize: 18,
    letterSpacing: -0.4,
    color: COLORI.bianco,
  },
  borsaNota: {
    fontFamily: FONT.testo,
    fontSize: 11.5,
    lineHeight: 17,
    color: "rgba(255,255,255,0.55)",
    marginTop: SPAZIO.m,
  },
  carta: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    padding: SPAZIO.xl,
    alignItems: "center",
    ...OMBRA.scheda,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 2,
    borderColor: COLORI.menta,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTesto: {
    fontFamily: FONT.display,
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORI.verdeScuro,
  },
  nome: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: -0.6,
    color: COLORI.inchiostro,
    marginTop: SPAZIO.m,
  },
  emailTesto: { fontFamily: FONT.testo, fontSize: 13.5, color: COLORI.fumo, marginTop: 2 },
  modifica: {
    marginTop: SPAZIO.l,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    borderRadius: RAGGIO.pillola,
    paddingHorizontal: SPAZIO.xl,
    paddingVertical: SPAZIO.s + 2,
    minHeight: 38,
    justifyContent: "center",
  },
  modificaTesto: { fontFamily: FONT.testoMedio, fontSize: 13.5, color: COLORI.inchiostro },
  ospiteTesto: {
    fontFamily: FONT.testo,
    fontSize: 14,
    lineHeight: 21,
    color: COLORI.fumo,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
  spazio: { height: SPAZIO.l },
  invita: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    backgroundColor: COLORI.mentaTenue,
    borderWidth: 1,
    borderColor: COLORI.menta,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.l,
  },
  invitaIcona: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORI.bianco,
    alignItems: "center",
    justifyContent: "center",
  },
  invitaTesti: { flex: 1, minWidth: 0 },
  invitaTitolo: { fontFamily: FONT.testoSemi, fontSize: 14.5, color: COLORI.verdeNotte },
  invitaSotto: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORI.verdeScuro,
    marginTop: 1,
  },
  elenco: {
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.grande,
    ...OMBRA.scheda,
  },
  voce: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.m,
    paddingHorizontal: SPAZIO.l,
    paddingVertical: SPAZIO.m + 2,
    minHeight: 60,
  },
  voceBordo: { borderBottomWidth: 1, borderBottomColor: COLORI.bordo },
  voceIcona: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORI.nebbia,
    borderWidth: 1,
    borderColor: COLORI.bordo,
    alignItems: "center",
    justifyContent: "center",
  },
  voceTesti: { flex: 1, minWidth: 0 },
  voceTitolo: { fontFamily: FONT.testoMedio, fontSize: 15, color: COLORI.inchiostro },
  voceSotto: { fontFamily: FONT.testo, fontSize: 12, color: COLORI.fumo2, marginTop: 1 },
  avviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPAZIO.s,
    backgroundColor: COLORI.mentaTenue,
    borderRadius: RAGGIO.scheda,
    padding: SPAZIO.m,
  },
  avvisoTesto: {
    flex: 1,
    fontFamily: FONT.testo,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORI.verdeScuro,
  },
  piede: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
});
