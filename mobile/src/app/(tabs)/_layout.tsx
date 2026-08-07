import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { TESTI } from "@/lib/testi";

export default function LayoutTab() {
  return (
    /* tabBar viene INVOCATA come funzione dal navigatore, non montata come
       componente: va restituito un elemento, così React la tratta da
       componente vero e gli hook al suo interno restano leciti. */
    <Tabs
      tabBar={(p: BottomTabBarProps) => <BarraTab {...p} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: TESTI.comune.tab.destinazioni }}
      />
      <Tabs.Screen
        name="ricerche"
        options={{ title: TESTI.comune.tab.ricerche }}
      />
      <Tabs.Screen
        name="profilo"
        options={{ title: TESTI.comune.tab.profilo }}
      />
    </Tabs>
  );
}
