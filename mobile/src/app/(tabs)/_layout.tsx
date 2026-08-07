import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import BarraTab from "@/components/BarraTab";
import { TESTI } from "@/lib/testi";

/**
 * Rotte del gruppo che NON vanno in barra. `ricerche.tsx` resta sul disco
 * (tornerà utile col tracker completo) ma la tab non si mostra: le tab del
 * pivot sono due, Pratiche e Profilo.
 */
const NASCOSTE = ["ricerche"];

/**
 * `href: null` da solo non basta: la barra è nostra (BarraTab) e disegna
 * tutte le rotte che riceve in `state.routes`. Qui si filtrano le nascoste
 * e si ricalcola l'indice attivo sulla lista filtrata.
 */
function senzaNascoste(p: BottomTabBarProps): BottomTabBarProps {
  const visibili = p.state.routes.filter((r) => !NASCOSTE.includes(r.name));
  const attiva = p.state.routes[p.state.index];
  const indice = visibili.findIndex((r) => r.key === attiva?.key);
  return {
    ...p,
    state: { ...p.state, routes: visibili, index: Math.max(0, indice) },
  };
}

export default function LayoutTab() {
  return (
    /* tabBar viene INVOCATA come funzione dal navigatore, non montata come
       componente: va restituito un elemento, così React la tratta da
       componente vero e gli hook al suo interno restano leciti. */
    <Tabs
      tabBar={(p: BottomTabBarProps) => <BarraTab {...senzaNascoste(p)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: TESTI.comune.tab.pratiche }}
      />
      {/* Fuori dalla barra e senza link: raggiungibile solo dal codice. */}
      <Tabs.Screen name="ricerche" options={{ href: null }} />
      <Tabs.Screen
        name="profilo"
        options={{ title: TESTI.comune.tab.profilo }}
      />
    </Tabs>
  );
}
