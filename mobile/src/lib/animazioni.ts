import { useState } from "react";
import { Animated } from "react-native";

/**
 * Un Animated.Value stabile per tutta la vita del componente.
 *
 * Nasce da useState (con inizializzatore pigro), NON da
 * `useRef(...).current`: il valore si legge durante il render (interpolate
 * negli stili) e le regole dei ref di React lo vietano (react-hooks v6).
 * Lo stato invece si può leggere in render, e non cambiando mai il
 * comportamento è identico.
 */
export function useValoreAnimato(iniziale: number): Animated.Value {
  const [valore] = useState(() => new Animated.Value(iniziale));
  return valore;
}
