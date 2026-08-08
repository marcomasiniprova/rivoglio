/**
 * Le immagini importate come moduli (il marchio, le icone di scena).
 *
 * Metro le trasforma in un numero, l'id della risorsa impacchettata, che
 * <Image source={...}> accetta così com'è. expo/types (SDK 57) non porta
 * questa dichiarazione, quindi vive qui, tracciata: senza, `tsc` non
 * riconosce gli import e l'unica alternativa sarebbe `require()`, che il
 * lint vieta.
 */
declare module "*.png" {
  const risorsa: number;
  export default risorsa;
}

declare module "*.jpg" {
  const risorsa: number;
  export default risorsa;
}

declare module "*.webp" {
  const risorsa: number;
  export default risorsa;
}
