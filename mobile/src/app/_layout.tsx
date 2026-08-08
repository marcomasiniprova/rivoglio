/**
 * La radice dell'app: carica i caratteri del marchio, monta la sessione e
 * apre sulle tab.
 *
 * Regola di prodotto (uguale al sito, 8/08): il check è APERTO A TUTTI.
 * Niente muro di registrazione all'avvio: si entra, si controlla un volo e
 * si vede il verdetto senza account. L'accesso serve solo per seguire le
 * pratiche, e lo chiede la schermata che ne ha bisogno.
 */
import { useEffect } from "react";
import { Geist_500Medium } from "@expo-google-fonts/geist";
import { InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ProviderSessione, useSessione } from "@/lib/sessione";
import { COLORI } from "@/lib/tema";

// In ambito globale, non in un componente: chiamato dopo arriverebbe tardi
// e lo splash sparirebbe da solo prima che font e sessione siano pronti.
SplashScreen.preventAutoHideAsync().catch(() => {});

function Smistamento({ fontiPronte }: { fontiPronte: boolean }) {
  const { pronto } = useSessione();
  const tuttoPronto = fontiPronte && pronto;

  useEffect(() => {
    if (tuttoPronto) SplashScreen.hideAsync().catch(() => {});
  }, [tuttoPronto]);

  // Finché non è tutto pronto resta lo splash nativo: niente schermo vuoto.
  if (!tuttoPronto) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORI.nebbia },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="verdetto" />
      <Stack.Screen name="accesso" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function LayoutRadice() {
  // Le chiavi sono i nomi usati in FONT (tema.ts): devono restare identiche.
  const [fontiCaricate, erroreFonti] = useFonts({
    Geist_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    InstrumentSerif_400Regular_Italic,
  });

  useEffect(() => {
    // Se un font non arriva l'app parte lo stesso col carattere di sistema:
    // meglio una sessione brutta che uno splash che non finisce mai.
    if (erroreFonti) console.error("[radice] font non caricati:", erroreFonti);
  }, [erroreFonti]);

  return (
    <ProviderSessione>
      <StatusBar style="dark" />
      <Smistamento fontiPronte={fontiCaricate || !!erroreFonti} />
    </ProviderSessione>
  );
}
