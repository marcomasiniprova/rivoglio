/**
 * LA CARTA D'IMBARCO FOTOGRAFATA.
 *
 * È l'ultimo pezzo di frizione. Anche con la ricerca per tratta bisogna
 * ricordarsi il giorno; con la carta d'imbarco in mano non si ricorda
 * niente, si fotografa. Tre secondi invece di tre campi.
 *
 * LA FOTO NON SI SALVA, da nessuna parte: si manda al sito, il sito la
 * legge, restituisce volo e data e la butta. Non tocca il disco, non
 * tocca il database. È scritto anche nella privacy, ed è vero.
 *
 * E non decide niente: torna due caselle da compilare, che l'utente vede
 * e può correggere prima di premere Controlla.
 */
import * as ImagePicker from "expo-image-picker";
import { SITO } from "./api";

export type LetturaCarta =
  | { ok: true; volo: string | null; data: string | null }
  | { ok: false; errore: string; annullato?: boolean };

/* Foto compressa e ridotta: l'OCR non ha bisogno di 12 megapixel, e una
   foto enorme ci mette tre volte tanto a salire su una rete mobile. */
const QUALITA = 0.6;

const ANNULLATO: LetturaCarta = { ok: false, errore: "", annullato: true };

/** Manda l'immagine al sito e riporta quello che ci ha letto. */
async function leggi(base64: string, tipo: string): Promise<LetturaCarta> {
  try {
    const r = await fetch(`${SITO}/api/leggi-carta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ immagine: base64, tipo }),
    });
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string"
            ? dati.errore
            : "Non sono riuscito a leggere la foto. Prova a scrivere i dati a mano.",
      };
    }
    return { ok: true, volo: dati.volo ?? null, data: dati.data ?? null };
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}

/** Il tipo dell'immagine come lo dichiara il telefono, o il solito JPEG. */
function tipoDi(asset: ImagePicker.ImagePickerAsset): string {
  return asset.mimeType ?? "image/jpeg";
}

/** Scatta la foto con la fotocamera. */
export async function fotografaCarta(): Promise<LetturaCarta> {
  const permesso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permesso.granted) {
    return {
      ok: false,
      errore:
        "Senza il permesso della fotocamera non posso leggere la carta d'imbarco. Puoi darlo dalle impostazioni del telefono, oppure scegliere una foto dalla galleria.",
    };
  }

  const scatto = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: QUALITA,
    base64: true,
  });
  if (scatto.canceled) return ANNULLATO;

  const foto = scatto.assets?.[0];
  if (!foto?.base64) return { ok: false, errore: "La foto non è arrivata. Riprova." };
  return leggi(foto.base64, tipoDi(foto));
}

/** Sceglie una foto già scattata (o un file, sul browser). */
export async function scegliCarta(): Promise<LetturaCarta> {
  const scelta = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: QUALITA,
    base64: true,
  });
  if (scelta.canceled) return ANNULLATO;

  const foto = scelta.assets?.[0];
  if (!foto?.base64) return { ok: false, errore: "La foto non è arrivata. Riprova." };
  return leggi(foto.base64, tipoDi(foto));
}
