import { redirect } from "next/navigation";

/**
 * Qui viveva l'onboarding dell'idea viaggi (base di partenza, criteri).
 * Col pivot a Rivolio non c'è più niente da chiedere all'ingresso: la
 * pratica nasce dal check e dal pagamento, non da un questionario.
 *
 * Il file resta SOLO perché /benvenuto è in giro in email e link vecchi:
 * chi ci arriva finisce sulle sue pratiche. Chi non è collegato viene
 * girato a /entra dal controllo dentro /app.
 */
export const dynamic = "force-dynamic";

export default function PaginaBenvenuto() {
  redirect("/app");
}
