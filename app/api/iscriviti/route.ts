import { NextResponse } from "next/server";
import { salvaIscritto } from "@/lib/archivio";

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

  return NextResponse.json({ ok: true });
}
