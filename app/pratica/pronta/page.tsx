import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Logo from "@/components/Logo";
import { stripe, stripeAttivo } from "@/lib/stripe";

/**
 * DOVE ATTERRA CHI HA APPENA PAGATO (success_url della sessione Stripe).
 *
 * Questa pagina NON fa entrare nessuno, ed è una scelta di sicurezza, non
 * una pigrizia. Il check non ha account: al verdetto uno può aver lasciato
 * l'email di un altro. Se qui collegassimo il browser a quell'indirizzo,
 * chiunque paghi con l'email altrui entrerebbe nell'account altrui (è il
 * buco chiuso il 16/08, vedi lib/pratiche/ingresso.ts). Quindi l'accesso
 * alla pratica arriva SOLO nella posta di quell'indirizzo (email T+0 col
 * link magico): entra solo chi apre quella casella.
 *
 * Qui si conferma soltanto che il pagamento è andato a buon fine, leggendo
 * la sessione da Stripe (l'id sta nell'indirizzo, ce l'ha solo chi è appena
 * tornato dalla cassa). Se non risulta pagata, a casa.
 */
export const dynamic = "force-dynamic";

export default async function PaginaPronta({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id || !stripeAttivo()) redirect("/");

  let email: string | null = null;
  let pagato = false;
  try {
    const s = await stripe().checkout.sessions.retrieve(session_id);
    pagato = s.payment_status === "paid";
    email = s.customer_details?.email ?? s.customer_email ?? null;
  } catch (e) {
    console.error("[pratica/pronta] sessione non recuperata:", e);
  }
  if (!pagato) redirect("/");

  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link href="/" className="text-sm text-fumo transition-colors hover:text-inchiostro">
            Torna al sito
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="rounded-2xl border border-verde/25 bg-white px-6 py-9 text-center sm:px-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-menta-tenue">
            <Check aria-hidden="true" strokeWidth={3} className="h-7 w-7 text-verde" />
          </span>

          <h1 className="mt-6 font-display text-[1.7rem] leading-tight tracking-[-0.035em] text-inchiostro">
            Pagamento ricevuto.
          </h1>

          <p className="mt-3 text-[0.98rem] leading-relaxed text-fumo">
            Ti abbiamo mandato l&apos;accesso alla tua pratica per email
            {email ? (
              <>
                , a <strong className="text-inchiostro">{email}</strong>
              </>
            ) : null}
            . Apri quel link ed entri: è il modo sicuro, quel messaggio lo ricevi solo tu.
          </p>

          <p className="mt-4 rounded-xl bg-menta-tenue/60 px-4 py-3 text-[0.9rem] leading-relaxed text-verde-scuro">
            Non la trovi? Guarda anche nello spam. Arriva entro un minuto.
          </p>

          <p className="mt-6 text-[0.85rem] text-fumo-2">
            La ricevuta del pagamento te la manda Stripe, sempre per email.
          </p>
        </div>
      </main>
    </div>
  );
}
