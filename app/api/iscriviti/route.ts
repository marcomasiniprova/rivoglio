import { NextResponse } from "next/server";
import { salvaIscritto } from "@/lib/archivio";
import { benvenutoLista } from "@/lib/email/messaggi";

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

  /* L'email di benvenuto si ASPETTA prima di rispondere. Non è pignoleria:
     su Netlify la funzione viene congelata nell'istante in cui risponde,
     e un invio lanciato senza await muore lì. È il motivo per cui la
     newsletter "funzionava" senza che arrivasse mai niente (trovato l'8/08
     col test di Valerio). Se Resend fallisce, l'iscritto resta salvato e
     la risposta lo dice, senza fingere. */
  const invio = await benvenutoLista(pulita, (comune ?? "").trim() || null);
  if (!invio.ok) console.warn("[iscriviti] benvenuto non spedito:", invio.motivo);

  return NextResponse.json({ ok: true, email: invio.ok });
}
