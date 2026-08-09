import { Linking, Platform, Share } from "react-native";

/**
 * Le cose che il telefono sa fare e il browser no.
 *
 * Perché esiste: l'anteprima dell'app gira NEL BROWSER (è l'unico modo
 * che ha Valerio di provarla finché non è negli store). Lì `Share.share`
 * non fa niente e `Linking.openSettings` non esiste proprio: si tocca il
 * tasto e non succede nulla. Un tasto che non risponde è peggio di un
 * tasto assente, quindi qui ogni funzione o fa la cosa vera, o dice
 * chiaramente perché non può.
 *
 * Ogni funzione restituisce il MESSAGGIO da mostrare, oppure null se è
 * andata fino in fondo e non c'è niente da dire.
 */

type Esito = string | null;

/** Condivide l'app. Telefono: il foglio di sistema. Browser: Web Share, o gli appunti. */
export async function condividi(messaggio: string): Promise<Esito> {
  if (Platform.OS !== "web") {
    try {
      await Share.share({ message: messaggio });
      return null;
    } catch (e) {
      console.warn("[sistema] condivisione fallita:", e);
      return "Non sono riuscito ad aprire la condivisione.";
    }
  }

  const nav = globalThis.navigator as
    | (Navigator & { share?: (d: { text: string }) => Promise<void> })
    | undefined;

  if (typeof nav?.share === "function") {
    try {
      await nav.share({ text: messaggio });
      return null;
    } catch (e) {
      /* L'utente che chiude il foglio non è un errore: si esce zitti. */
      if ((e as { name?: string })?.name === "AbortError") return null;
    }
  }

  try {
    await nav?.clipboard?.writeText(messaggio);
    return "Invito copiato: incollalo dove vuoi.";
  } catch {
    return "Copia questo link e mandalo a chi vuoi: rivoglio.netlify.app";
  }
}

/**
 * Apre le impostazioni dell'app (dove si concedono le notifiche).
 * Nel browser non esistono: si dice com'è, senza far finta di niente.
 */
export function apriImpostazioni(): Esito {
  if (Platform.OS === "web") {
    return "Gli avvisi sui voli arrivano nell'app installata sul telefono: dal browser non si possono accendere.";
  }
  try {
    void Linking.openSettings();
    return null;
  } catch (e) {
    console.warn("[sistema] impostazioni non aperte:", e);
    return "Apri le impostazioni del telefono e cerca Rivolio fra le app.";
  }
}

/** Scrive al supporto. Sul web il mailto può essere ignorato: si dice l'indirizzo. */
export async function scriviA(email: string): Promise<Esito> {
  const indirizzo = `mailto:${email}`;
  try {
    const puo = Platform.OS === "web" ? true : await Linking.canOpenURL(indirizzo);
    if (!puo) return `Scrivici a ${email}`;
    await Linking.openURL(indirizzo);
    return null;
  } catch {
    return `Scrivici a ${email}`;
  }
}
