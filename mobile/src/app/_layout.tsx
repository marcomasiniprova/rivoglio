/**
 * La radice dell'app: carica i caratteri del marchio, monta la sessione e
 * smista. Senza utente si va in (benvenuto), con utente in (tabs): sono le
 * guardie dello Stack a fare il reindirizzamento, in entrambe le direzioni.
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
  const { utente, pronto } = useSessione();
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
      <Stack.Protected guard={!utente}>
        <Stack.Screen name="(benvenuto)" />
      </Stack.Protected>
      <Stack.Protected guard={!!utente}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="destinazione/[id]" />
        <Stack.Screen name="ricerca/nuova" options={{ presentation: "modal" }} />
      </Stack.Protected>
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
