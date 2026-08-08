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
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Bottone from "@/components/Bottone";
import Titolo from "@/components/Titolo";
import { SITO } from "@/lib/api";
import { leggiProfilo } from "@/lib/profilo";
import { esci, useSessione } from "@/lib/sessione";
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
  const { utente } = useSessione();
  const [nickname, setNickname] = useState<string | null>(null);

  /* Il nome pubblico si rilegge a ogni ritorno: se è appena stato
     cambiato in Dati personali, qui deve vedersi subito. */
  useFocusEffect(
    useCallback(() => {
      if (!utente) {
        setNickname(null);
        return;
      }
      void leggiProfilo().then((p) => setNickname(p?.nickname ?? null));
    }, [utente]),
  );

  async function invita() {
    try {
      await Share.share({ message: P.invita.messaggio });
    } catch (e) {
      console.warn("[profilo] condivisione fallita:", e);
    }
  }

  const voci: Voce[] = [
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
      fai: () => void Linking.openSettings(),
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
      fai: () => void Linking.openURL(`mailto:${P.email}`),
    },
    {
      chiave: "sito",
      icona: "globe",
      titolo: P.voci.sito,
      sotto: P.voci.sitoSotto,
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
            onPress={v.fai}
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
  piede: {
    fontFamily: FONT.testo,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORI.fumo2,
    textAlign: "center",
    marginTop: SPAZIO.s,
  },
});
