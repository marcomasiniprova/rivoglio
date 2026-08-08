import { NextResponse } from "next/server";
import { salvaIscritto } from "@/lib/archivio";
import { chiediConferma } from "@/lib/email/messaggi";

/** Controllo volutamente permissivo: meglio un'email strana che perdere un iscritto. */
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non leggibile." }, { status: 400 });
  }

  const { email, comune } = (corpo ?? {}) as { email?: string; comune?: string };
  const pulita = (email ?? "").trim().toLowerCase();

  if (!EMAIL_OK.test(pulita)) {
    return NextResponse.json(
      { errore: "Controlla l'indirizzo email: non mi torna." },
      { status: 400 },
    );
  }

  try {
    await salvaIscritto({
      email: pulita,
      comune: (comune ?? "").trim() || null,
      creatoIl: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[iscriviti] salvataggio fallito:", e);
    return NextResponse.json(
      { errore: "Non sono riuscito a salvarti. Riprova fra un attimo." },
      { status: 500 },
    );
  }

  /* DOPPIO OPT-IN (scelta di Valerio, 9/08): qui NON parte il benvenuto,
     parte la richiesta di conferma. L'iscritto è salvato ma non è ancora
     iscritto: lo diventa quando clicca, in /api/iscriviti/conferma.

     L'invio si ASPETTA prima di rispondere. Non è pignoleria: su Netlify
     la funzione viene congelata nell'istante in cui risponde, e un invio
     lanciato senza await muore lì. È il motivo per cui la newsletter
     "funzionava" senza che arrivasse mai niente (trovato l'8/08 col test
     di Valerio). Se Resend fallisce, l'indirizzo resta salvato e la
     risposta lo dice, senza fingere. */
  const invio = await chiediConferma(pulita);
  if (!invio.ok) console.warn("[iscriviti] richiesta di conferma non spedita:", invio.motivo);

  return NextResponse.json({ ok: true, email: invio.ok });
}
