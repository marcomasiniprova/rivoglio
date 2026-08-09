import { NextResponse, type NextRequest } from "next/server";
import { conferma, linkMagico } from "@/lib/email/messaggi";
import { casa } from "@/lib/email/posta";
import { percorsoInterno } from "@/lib/api/percorso";

/**
 * Il gancio "Send Email" di Supabase.
 *
 * A cosa serve: Supabase, invece di spedire lui le email di autenticazione
 * (conferma, link magico, recupero password), le manda QUI. Noi le spediamo
 * con Resend, col nostro vestito e in italiano.
 *
 * Perché è la cosa giusta:
 * - la posta interna di Supabase manda 2 email l'ora e al lancio ti blocca
 * - i loro modelli sono in inglese e non si possono tradurre bene
 * - così TUTTE le email del prodotto escono da un posto solo
 *
 * COME SI ACCENDE (due minuti, nel pannello Supabase):
 *   Authentication → Hooks → "Send Email hook" → Enable
 *   URI: https://TUO-DOMINIO/api/posta-auth
 *   Copia il "secret" generato e mettilo in RESEND_HOOK_SECRET.
 *
 * Finché non è acceso, questo endpoint non riceve niente e non fa danni.
 */

/** Cosa manda Supabase. Solo i campi che ci servono. */
type Payload = {
  user?: { email?: string };
  email_data?: {
    token_hash?: string;
    email_action_type?: string;
    redirect_to?: string;
  };
};

/**
 * Verifica che la chiamata arrivi davvero da Supabase.
 *
 * Senza questo controllo, chiunque conosca l'indirizzo può farci spedire
 * email a chi vuole, a spese nostre e con la nostra reputazione di mittente.
 * È il classico endpoint che si dimentica aperto.
 */
function autorizzata(req: NextRequest): boolean {
  const atteso = process.env.RESEND_HOOK_SECRET;
  if (!atteso) return false; // niente segreto = gancio spento
  const dato =
    req.headers.get("webhook-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return dato === atteso;
}

export async function POST(req: NextRequest) {
  if (!autorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  let corpo: Payload;
  try {
    corpo = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ errore: "Corpo illeggibile." }, { status: 400 });
  }

  const a = corpo.user?.email;
  const token = corpo.email_data?.token_hash;
  const tipo = corpo.email_data?.email_action_type;
  if (!a || !token || !tipo) {
    return NextResponse.json({ errore: "Dati mancanti." }, { status: 400 });
  }

  // Il link deve tornare sulla NOSTRA pagina di conferma, non su Supabase.
  const poi = percorsoInterno(corpo.email_data?.redirect_to);
  const link = `${casa()}/auth/conferma?token_hash=${encodeURIComponent(token)}&type=${encodeURIComponent(tipo)}&poi=${encodeURIComponent(poi)}`;

  const esito =
    tipo === "magiclink" ? await linkMagico(a, link) : await conferma(a, link);

  if (!esito.ok) {
    // 500 = Supabase riprova. Meglio un tentativo in più che un utente
    // bloccato fuori perché l'email non è mai partita.
    return NextResponse.json({ errore: esito.motivo }, { status: 500 });
  }

  return NextResponse.json({});
}
