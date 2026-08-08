import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { TESTI } from "@/lib/testi";

/**
 * Le tre tab di Rivoglio (8/08): Controlla, Pratiche, Profilo.
 *
 * Nessuna è protetta: chi non ha l'account controlla lo stesso i voli, e
 * le tab che hanno bisogno dell'accesso lo chiedono da sole con un invito,
 * non con un muro all'avvio. È la regola del sito, portata nell'app.
 */
export default function LayoutTab() {
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
      <Tabs.Screen name="profilo" options={{ title: TESTI.comune.tab.profilo }} />
    </Tabs>
  );
}
