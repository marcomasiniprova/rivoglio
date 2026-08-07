import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { COLORI, RAGGIO, SPAZIO } from "@/lib/tema";
import { TESTI } from "@/lib/testi";
import type { Tipo } from "@/lib/tipi";

/**
 * Il flusso di benvenuto: 6 passi, una decisione per schermata (PROGETTO.md).
 * Niente header: ogni schermata gestisce da sé titolo e ritorno.
 */
export default function LayoutBenvenuto() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORI.nebbia },
      }}
    />
  );
}

/** Quanti passi ha il flusso. I pallini compaiono dal passo 2 al 6. */
export const PASSI_TOTALI = 6;

/**
 * I valori di partenza della prima ricerca: l'onboarding chiede solo
 * partenza, soglia e ore, il resto parte da qui e si cambia dalle ricerche.
 * `aggancio` li mostra nel riepilogo e `registrati` li salva: stessa fonte.
 */
export const RICERCA_BASE = {
  nottiMin: 1,
  nottiMax: 2,
  persone: 2,
  tipi: [] as Tipo[],
} as const;

/**
 * La barra di avanzamento discreta dei passi 2-6. Vive qui e non in
 * `src/components/` perché quella cartella è di un altro cantiere
 * (PROGETTO.md) e nessuna schermata fuori dal benvenuto la usa.
 */
export function Pallini({ passo }: { passo: number }) {
  const etichetta = TESTI.comune.passoDi
    .replace("{passo}", String(passo))
    .replace("{totale}", String(PASSI_TOTALI));

  return (
    <View accessibilityLabel={etichetta} style={stili.riga}>
      {Array.from({ length: PASSI_TOTALI }, (_, i) => i + 1).map((n) => (
        <View
          key={n}
          style={[stili.pallino, n === passo && stili.attivo, n < passo && stili.passato]}
        />
      ))}
    </View>
  );
}

const stili = StyleSheet.create({
  riga: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPAZIO.s,
    marginBottom: SPAZIO.xl,
  },
  pallino: {
    width: 6,
    height: 6,
    borderRadius: RAGGIO.pillola,
    backgroundColor: COLORI.bordo,
  },
  attivo: {
    width: 18,
    backgroundColor: COLORI.verde,
  },
  passato: {
    backgroundColor: COLORI.menta,
  },
});
