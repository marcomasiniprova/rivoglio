import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { classifica } from "@/lib/api";
import { caricaPratiche } from "@/lib/dati";
import { CHIAVE_BENVENUTO } from "@/app/benvenuto";
import { useSessione } from "@/lib/sessione";
import { TESTI } from "@/lib/testi";

/**
 * Le tab di Rivolio, coi nomi della tavola definitiva: Home, Check,
 * Pratiche, Account (più la Classifica, che la accende il server).
 *
 * Nessuna è protetta: chi non ha l'account controlla lo stesso i voli, e
 * le tab che hanno bisogno dell'accesso lo chiedono da sole con un invito,
 * non con un muro all'avvio. È la regola del sito, portata nell'app.
 *
 * LA HOME COMPARE CON LA PRIMA PRATICA (scelta di Valerio, 10/08): senza
 * pratiche ogni suo numero vale zero e l'app si apre sul Check. La tab
 * spunta da sola quando c'è qualcosa di vero da mostrare, come la
 * Classifica quando il server la accende.
 */
export default function LayoutTab() {
  const router = useRouter();
  const { utente, pronto } = useSessione();
  const [conClassifica, setConClassifica] = useState(false);
  const [conHome, setConHome] = useState(false);

  useEffect(() => {
    let montato = true;
    /* Il setState vive SOLO nel callback asincrono (regola dei hooks):
       senza utente si azzera lì dentro, non nel corpo dell'effetto. */
    void (async () => {
      if (!utente) return montato && setConHome(false);
      const lette = await caricaPratiche();
      if (montato && lette !== null) setConHome(lette.length > 0);
    })();
    return () => {
      montato = false;
    };
  }, [utente]);

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
      /* L'app si apre sul Check anche quando la Home esiste: il gesto
         più frequente resta controllare un volo. */
      initialRouteName="index"
    >
      <Tabs.Screen
        name="home"
        options={
          conHome
            ? { title: TESTI.comune.tab.home }
            : { title: TESTI.comune.tab.home, href: null }
        }
      />
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
