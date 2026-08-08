import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { estraiCampi, testoDaDocumento } from "@/lib/ocr/carta-imbarco";

/**
 * POST /api/leggi-carta  {immagine: "<base64>", tipo: "image/jpeg"}
 *
 * La foto della carta d'imbarco diventa numero di volo e data.
 *
 * A cosa serve: è l'ultimo pezzo di frizione. Anche con la ricerca per
 * tratta bisogna ricordarsi il giorno; con la carta d'imbarco in mano
 * non si ricorda niente, si fotografa. Tre secondi invece di tre campi.
 *
 * LA FOTO NON SI SALVA. Si legge, si restituiscono i due campi, e
 * l'immagine sparisce con la richiesta: non tocca il disco, non tocca il
 * database, non finisce in un registro. È scritto anche nella privacy.
 *
 * Divisione dei ruoli, la stessa di sempre: l'AI (Mistral OCR) fa UNA
 * cosa, trasforma l'immagine in testo. L'estrazione dei campi è a regex,
 * deterministica. E qui NON si dà nessun verdetto: si compilano due
 * caselle, che l'utente vede e può correggere prima di controllare.
 */

/* L'OCR costa a chiamata: il tetto è stretto apposta. Chi fotografa una
   carta d'imbarco lo fa una volta, non venti. */
const MASSIMO_AL_MINUTO = 6;

/* Limite di sicurezza sulla foto: 8 MB di base64 sono circa 6 MB di
   immagine, molto più di una foto compressa da telefono. Sopra, si
   risponde con una frase chiara invece di far scadere la funzione. */
const MASSIMO_BASE64 = 8 * 1024 * 1024;

const TIPI = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"]);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite("carta", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe foto di fila. Aspetta un minuto e riprova." },
      { status: 429, headers: CORS },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Richiesta non leggibile." },
      { status: 400, headers: CORS },
    );
  }

  const { immagine, tipo } = (corpo ?? {}) as { immagine?: unknown; tipo?: unknown };
  if (typeof immagine !== "string" || !immagine) {
    return NextResponse.json(
      { ok: false, errore: "Manca la foto." },
      { status: 400, headers: CORS },
    );
  }
  if (immagine.length > MASSIMO_BASE64) {
    return NextResponse.json(
      { ok: false, errore: "La foto è troppo grande. Riprova con uno scatto normale." },
      { status: 413, headers: CORS },
    );
  }
  const tipoMime = typeof tipo === "string" && TIPI.has(tipo) ? tipo : "image/jpeg";

  const testo = await testoDaDocumento(immagine, tipoMime);
  if (!testo) {
    /* Senza chiave o con l'OCR giù non si finge: si dice che non si è
       letto niente e l'utente scrive a mano. Mai un dato inventato. */
    return NextResponse.json(
      {
        ok: false,
        errore:
          "Non sono riuscito a leggere questa foto. Prova con più luce, oppure scrivi i dati a mano.",
      },
      { status: 422, headers: CORS },
    );
  }

  const campi = estraiCampi(testo);
  if (!campi.volo && !campi.data) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          "Ho letto il documento ma non ci ho trovato il volo. Inquadra la parte con il numero del volo e la data.",
      },
      { status: 422, headers: CORS },
    );
  }

  return NextResponse.json(
    { ok: true, volo: campi.volo, data: campi.data, anteprima: campi.anteprima },
    { headers: CORS },
  );
}
