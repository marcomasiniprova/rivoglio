import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";
import Comandi from "@/components/admin/Comandi";
import { Button } from "@/components/ui/button";
import { attivaOfferta, scartaOfferta } from "./azioni";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { notti } from "@/lib/offerte/tipi";

/**
 * Il pannello di verifica: il cancello fra la spazzatura del web e gli
 * utenti paganti. Ogni offerta raccolta nasce `demo`; qui la si apre, si
 * controlla che il link viva e che il prezzo sia quello, e SOLO allora la
 * si attiva. Nessuna destinazione parte da un'offerta non guardata.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pannello | Rivoglio",
  robots: { index: false },
};

const euro = (n: number) => `${Math.round(Number(n)).toLocaleString("it-IT")}€`;

export default async function PaginaAdmin() {
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  const supabase = await supabaseServer();
  const { data: profilo } = await supabase
    .from("profili")
    .select("ruolo")
    .eq("id", utente.id)
    .single();
  // chi non è admin non deve nemmeno sapere che questa pagina esiste
  if (profilo?.ruolo !== "admin") redirect("/app");

  if (!SERVIZIO_ATTIVO) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="font-display text-3xl tracking-[-0.03em]">Pannello</h1>
        <p className="mt-4 rounded-2xl bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-700">
          Manca <code>SUPABASE_SECRET_KEY</code> nell&apos;ambiente: senza, il pannello non può
          leggere le offerte da verificare né far girare il motore.
        </p>
      </main>
    );
  }

  const db = supabaseServizio();
  const [{ data: daVerificare }, { count: nDemo }, { count: nAttive }, { count: nStrutture }] =
    await Promise.all([
      db
        .from("offerte")
        .select("id, struttura, comune, check_in, check_out, prezzo_alloggio, link, fonte, creata_il")
        .eq("stato", "demo")
        .order("creata_il", { ascending: false })
        .limit(30),
      db.from("offerte").select("id", { count: "exact", head: true }).eq("stato", "demo"),
      db.from("offerte").select("id", { count: "exact", head: true }).eq("stato", "attiva"),
      db.from("strutture").select("id", { count: "exact", head: true }),
    ]);

  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Torna all&apos;app
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8">
        <div>
          <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em]">
            Il motore, a mano.
          </h1>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
            {nDemo ?? 0} da verificare · {nAttive ?? 0} attive · {nStrutture ?? 0} strutture in
            anagrafe. In produzione questi due giri li farà un orologio; da qui li lanci quando
            vuoi.
          </p>
        </div>

        <Comandi />

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-[-0.03em]">Da verificare</h2>
          <p className="text-sm text-fumo">
            Apri il link, controlla che il prezzo sia quello. Poi attiva o scarta: finché è
            demo, non parte niente verso nessuno.
          </p>

          {(daVerificare ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-bordo bg-white/60 px-5 py-10 text-center text-sm text-fumo">
              Niente in coda. Lancia una raccolta qui sopra.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {(daVerificare ?? []).map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bordo bg-white px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.struttura}</p>
                    <p className="mt-0.5 text-sm text-fumo">
                      {o.comune} · {notti(o.check_in, o.check_out)} notti ·{" "}
                      <span className="numeri font-medium text-inchiostro">
                        {euro(o.prezzo_alloggio)}
                      </span>{" "}
                      camera · fonte {o.fonte}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={o.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-offerta-link
                      className="inline-flex items-center gap-1.5 rounded-bottone border border-bordo bg-white px-3.5 py-2 text-sm font-medium text-fumo transition-colors hover:border-verde/40 hover:text-inchiostro"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      Apri
                    </a>
                    {/* le azioni tornano un esito per il pannello comandi;
                        qui il modulo vuole void, quindi si incarta */}
                    <form
                      action={async () => {
                        "use server";
                        await attivaOfferta(o.id);
                      }}
                    >
                      <Button type="submit" size="sm">
                        Attiva
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await scartaOfferta(o.id);
                      }}
                    >
                      <Button type="submit" variant="fantasma" size="sm">
                        Scarta
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
