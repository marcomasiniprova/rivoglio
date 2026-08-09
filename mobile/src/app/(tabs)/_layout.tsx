import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { classifica } from "@/lib/api";
import { CHIAVE_BENVENUTO } from "@/app/benvenuto";
import { useSessione } from "@/lib/sessione";
import { TESTI } from "@/lib/testi";

/**
 * Le tab di Rivolio: Controlla, Pratiche, Classifica, Profilo.
 *
 * Nessuna è protetta: chi non ha l'account controlla lo stesso i voli, e
 * le tab che hanno bisogno dell'accesso lo chiedono da sole con un invito,
 * non con un muro all'avvio. È la regola del sito, portata nell'app.
 *
 * La CLASSIFICA la accende il server (CLASSIFICA_ATTIVA): al lancio sta
 * spenta finché non ci sono vincite vere da mostrare, e questa tab non
 * esiste proprio. Quando Valerio la accende, compare da sola al primo
 * avvio, senza aggiornare l'app.
 */
export default function LayoutTab() {
  const router = useRouter();
  const { utente, pronto } = useSessione();
  const [conClassifica, setConClassifica] = useState(false);

  /* LA WELCOME, una volta sola: al primo avvio (nessun account, mai
     vista) si va alla scena d'ingresso. Da lì si torna qui con "Salta"
     o dopo l'accesso, e il segno resta scritto sul telefono. */
  useEffect(() => {
    if (!pronto || utente) return;
    let montato = true;
    void AsyncStorage.getItem(CHIAVE_BENVENUTO).then((vista) => {
      if (montato && !vista) router.replace("/benvenuto");
    });
    return () => {
      montato = false;
    };
  }, [pronto, utente, router]);

  useEffect(() => {
    let montato = true;
    void classifica().then((esito) => {
      if (montato && esito.attiva) setConClassifica(true);
    });
    return () => {
      montato = false;
    };
  }, []);

  return (
    /* tabBar viene INVOCATA come funzione dal navigatore, non montata come
       componente: va restituito un elemento, così React la tratta da
       componente vero e gli hook al suo interno restano leciti. */
    <Tabs
      tabBar={(p: BottomTabBarProps) => <BarraTab {...p} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: TESTI.comune.tab.controlla }} />
      <Tabs.Screen name="pratiche" options={{ title: TESTI.comune.tab.pratiche }} />
      <Tabs.Screen
        name="classifica"
        options={
          conClassifica
            ? { title: TESTI.comune.tab.classifica }
            : /* href: null = la rotta esiste ma la tab non si vede. */
              { title: TESTI.comune.tab.classifica, href: null }
        }
      />
      <Tabs.Screen name="profilo" options={{ title: TESTI.comune.tab.profilo }} />
    </Tabs>
  );
}
