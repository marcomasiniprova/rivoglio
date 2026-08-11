import { redirect } from "next/navigation";
import { soloAdmin } from "@/lib/admin/guardia";

/**
 * IL VECCHIO CRUSCOTTO, che adesso è la Panoramica.
 *
 * Questa pagina non disegna più niente: il suo contenuto è diventato la
 * schermata principale del pannello. Resta come indirizzo perché Valerio
 * questo l'aveva già aperto e messo da parte, e un segnalibro che porta a
 * un 404 fa credere che sia stato cancellato qualcosa.
 *
 * ⚠️ Il controllo del ruolo si fa PRIMA del rimando, anche se il rimando
 * porta a una pagina che lo rifà. Se no, chi non è admin scoprirebbe da
 * dove viene mandato via che questo indirizzo esiste.
 */
export const dynamic = "force-dynamic";

export default async function VecchioCruscotto() {
  await soloAdmin();
  redirect("/admin");
}
