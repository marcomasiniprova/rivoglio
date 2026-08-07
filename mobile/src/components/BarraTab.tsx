import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { COLORI, FONT, OMBRA, RAGGIO, SPAZIO } from "@/lib/tema";

type NomeIcona = ComponentProps<typeof Feather>["name"];

/** Un'icona per rotta del gruppo (tabs). Le etichette arrivano dalle opzioni. */
const ICONE: Record<string, NomeIcona> = {
  index: "map-pin",
  ricerche: "sliders",
  profilo: "user",
};

export default function BarraTab({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  return (
    <View style={[stili.barra, { bottom: insets.bottom + SPAZIO.m }]}>
      {state.routes.map((rotta, indice) => {
        const opzioni = descriptors[rotta.key]?.options;
        const etichetta =
          typeof opzioni?.tabBarLabel === "string"
            ? opzioni.tabBarLabel
            : (opzioni?.title ?? rotta.name);
        const attiva = state.index === indice;
        const colore = attiva ? COLORI.verdeScuro : COLORI.fumo;

        const apri = () => {
          const evento = navigation.emit({
            type: "tabPress",
            target: rotta.key,
            canPreventDefault: true,
          });
          if (!attiva && !evento.defaultPrevented) {
            navigation.navigate(rotta.name);
          }
        };

        return (
          <Pressable
            key={rotta.key}
            onPress={apri}
            accessibilityRole="tab"
            accessibilityLabel={etichetta}
            accessibilityState={{ selected: attiva }}
            style={[stili.voce, attiva && stili.voceAttiva]}
          >
            <Feather
              name={ICONE[rotta.name] ?? "circle"}
              size={20}
              color={colore}
            />
            <Text style={[stili.etichetta, { color: colore }]}>{etichetta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const stili = StyleSheet.create({
  barra: {
    // Pillola flottante, staccata dal bordo basso: il bottom si somma
    // agli insets del dispositivo nel componente.
    position: "absolute",
    left: SPAZIO.schermata,
    right: SPAZIO.schermata,
    flexDirection: "row",
    gap: SPAZIO.xs,
    backgroundColor: COLORI.bianco,
    borderRadius: RAGGIO.pillola,
    padding: SPAZIO.s,
    ...OMBRA.scheda,
  },
  voce: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPAZIO.xs,
    paddingVertical: SPAZIO.s,
    borderRadius: RAGGIO.pillola,
  },
  voceAttiva: {
    backgroundColor: COLORI.mentaTenue,
  },
  etichetta: {
    fontFamily: FONT.testoMedio,
    fontSize: 11,
  },
});
