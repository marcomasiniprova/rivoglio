import { NextResponse } from "next/server";
import { ipDi, oltreIlLimite } from "@/lib/api/limite";
import { traccia } from "@/lib/eventi/registra";

/**
 * «HA INVITATO UN AMICO.» (TIENITELI, il passaparola.)
 *
 * Il primo gradino del passaparola: qualcuno, dal momento d'oro, ha
 * premuto "invita un amico". L'amico che poi arriva si conta da solo (il
 * link porta utm_source=invito, e la visita finisce nel registro): qui si
 * conta il gesto di CHI invita, così nel pannello si vede l'imbuto intero,
 * inviti mandati contro amici arrivati.
 *
 * Come la visita: un beacon a pagina già davanti agli occhi, niente che
 * l'utente debba aspettare, e se non parte non se ne accorge nessuno.
 * Nessun dato sulla persona: si conta il fatto, non chi l'ha fatto.
 */
export const dynamic = "force-dynamic";

/* Un invito è un gesto, non un ciclo: sopra questo tetto è automatico. */
const MASSIMO_AL_MINUTO = 20;

export async function POST(req: Request) {
  if (oltreIlLimite("invito", ipDi(req), MASSIMO_AL_MINUTO)) {
    return new Response(null, { status: 204 });
  }

  traccia(req, { tipo: "invito" });

  /* 204: niente da dire, e il browser non deve leggere niente. */
  return new NextResponse(null, { status: 204 });
}
