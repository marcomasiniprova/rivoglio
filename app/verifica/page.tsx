import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import { COOKIE_ULTIMA_VERIFICA } from "@/lib/check/verifica-cookie";
import { contenutoVerifica } from "./contenuto";

/**
 * /verifica: la pagina del risultato con l'INDIRIZZO PULITO (scelta di
 * Valerio, 14/08: «gli indirizzi sono sempre sporchi, /verifica/f1677518-...»).
 *
 * Dopo un check appena fatto ci si arriva qui, SENZA il codice lungo:
 * l'id dell'ultima verifica lo porta un cookie di sessione, scritto da
 * /api/verifica. Se il cookie non c'è più (scaduto, o si è aperto /verifica a
 * mano), si spiega con calma e si rimanda al check. Il contenuto vero sta in
 * ./contenuto.tsx, lo stesso di /verifica/[id].
 *
 * ⚠️ È il limite dichiarato della scelta «indirizzo pulito»: il risultato si
 * riapre sullo stesso dispositivo entro un'ora, non da un altro telefono. Chi
 * vuole tenerlo se lo salva aprendo la pratica o lasciando la mail.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il risultato del tuo check | Rivolio",
  robots: { index: false },
};

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaVerifica({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { checkout } = await searchParams;
  const id = (await cookies()).get(COOKIE_ULTIMA_VERIFICA)?.value ?? "";
  if (UUID_OK.test(id) || id.startsWith("demo-")) {
    return contenutoVerifica(id, checkout);
  }

  // Nessun risultato recente in questa sessione: si spiega, con l'uscita.
  const T = COPY.risultato.nessunRecente;
  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link href="/" className="text-sm text-fumo transition-colors hover:text-inchiostro">
            {COPY.risultato.nonIdoneo.cta}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-2xl border border-bordo bg-white px-6 py-8">
          <h1 className="font-display text-[1.6rem] leading-tight tracking-[-0.035em]">
            {T.titolo}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{T.testo}</p>
          <Button asChild className="mt-6">
            <Link href="/#controllo">{T.cta}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
