import { Tabs } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { TESTI } from "@/lib/testi";

export default function LayoutTab() {
  return (
    <Tabs tabBar={BarraTab} screenOptions={{ headerShown: false }}>
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
