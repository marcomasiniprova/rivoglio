import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";
import Comandi from "@/components/admin/Comandi";
import { Button } from "@/components/ui/button";
import { confermaVerifica, correggiVerifica } from "./azioni";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * Il pannello dello SHADOW MODE (SPEC §4): il motore emette il verdetto,
 * ma finché lo shadow è acceso ogni "idoneo" aspetta qui la conferma di
 * un umano PRIMA che l'utente possa pagare. Si spegne dopo 100 verdetti
 * consecutivi senza correzioni; ogni correzione è un caso nuovo per il
 * golden set del motore.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pannello | Rivolio",
  robots: { index: false },
};

type RigaVerifica = {
  id: string;
  volo_iata: string;
  data_locale: string;
  importo: number | null;
  ritardo_minuti: number | null;
  motivo: string | null;
  versione_regole: string;
  email: string | null;
  creata_il: string;
  voli: {
    arrivo_previsto_utc: string | null;
    arrivo_effettivo_utc: string | null;
    vettore_operativo: string | null;
    fonte: string;
  } | null;
};

type RigaPratica = {
  id: string;
  stato: string;
  tipo: string;
  email: string;
  importo_fascia: number | null;
  prezzo_pagato: number | null;
  creata_il: string;
  voli: { volo_iata: string; data_locale: string } | null;
};

const STATI_PRATICA: Record<string, string> = {
  creata: "creata",
  pagata: "pagata",
  pronta: "pronta",
  inviata: "inviata",
  sollecito: "sollecito",
  enac: "ENAC",
  esito_pagata: "pagata dalla compagnia",
  esito_rifiutata: "rifiutata",
  rimborsata: "rimborsata (garanzia)",
};

const dataIt = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const oraUtc = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : "?";

const ritardoUmano = (minuti: number | null) =>
  minuti === null ? "?" : `${Math.floor(minuti / 60)}h${String(minuti % 60).padStart(2, "0")}`;

/**
 * La mezzanotte italiana di oggi, come istante UTC: i contatori "di oggi"
 * seguono il giorno di chi guarda il pannello, non quello del server.
 */
function inizioOggiRoma(): string {
  const giorno = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
  const mezzodiUtc = new Date(`${giorno}T12:00:00Z`);
  const oraRoma = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    }).format(mezzodiUtc),
  );
  const scarto = oraRoma - 12; // +1 d'inverno, +2 d'estate
  return new Date(Date.parse(`${giorno}T00:00:00Z`) - scarto * 3_600_000).toISOString();
}

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
          leggere le verifiche in attesa né far girare i follow-up.
        </p>
      </main>
    );
  }

  const db = supabaseServizio();
  const oggi = inizioOggiRoma();
  const [
    { data: codaGrezza },
    { count: nInAttesa },
    { count: nCheck },
    { count: nIdonei },
    { count: nIncerti },
    { count: nNonIdonei },
    { count: nPagate },
    { data: recentiGrezze },
  ] = await Promise.all([
    db
      .from("verifiche")
      .select(
        "id, volo_iata, data_locale, importo, ritardo_minuti, motivo, versione_regole, email, creata_il, voli(arrivo_previsto_utc, arrivo_effettivo_utc, vettore_operativo, fonte)",
      )
      .eq("esito", "idoneo")
      .eq("conferma", "in_attesa")
      .order("creata_il", { ascending: true })
      .limit(30),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "idoneo")
      .eq("conferma", "in_attesa"),
    db.from("verifiche").select("id", { count: "exact", head: true }).gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "idoneo")
      .gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "incerto")
      .gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "non_idoneo")
      .gte("creata_il", oggi),
    db
      .from("pratiche_eventi")
      .select("id", { count: "exact", head: true })
      .eq("tipo", "pagata")
      .gte("creato_il", oggi),
    db
      .from("pratiche")
      .select(
        "id, stato, tipo, email, importo_fascia, prezzo_pagato, creata_il, voli(volo_iata, data_locale)",
      )
      .order("creata_il", { ascending: false })
      .limit(8),
  ]);

  const coda = (codaGrezza ?? []) as unknown as RigaVerifica[];
  const recenti = (recentiGrezze ?? []) as unknown as RigaPratica[];

  const contatori = [
    { nome: "Check oggi", valore: nCheck ?? 0 },
    { nome: "Idonei", valore: nIdonei ?? 0 },
    { nome: "Incerti", valore: nIncerti ?? 0 },
    { nome: "Non idonei", valore: nNonIdonei ?? 0 },
    { nome: "Pratiche pagate", valore: nPagate ?? 0 },
  ];

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
            Shadow mode: l&apos;ultima parola è tua.
          </h1>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
            {nInAttesa ?? 0} verdetti idonei aspettano la tua conferma: finché non la dai,
            nessuno può pagare. Lo shadow si spegne dopo 100 di fila senza correzioni; ogni
            correzione è un caso nuovo per il golden set.
          </p>
        </div>

        <Comandi />

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-[-0.03em]">Da confermare</h2>
          <p className="text-sm text-fumo">
            Dalla più vecchia. Controlla gli orari del fatto contro la fonte: se il verdetto
            regge, conferma. Se il motore ha sbagliato, correggi e scrivi perché.
          </p>

          {coda.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-bordo bg-white/60 px-5 py-10 text-center text-sm text-fumo">
              Niente in attesa. Ogni check idoneo con lo shadow acceso comparirà qui.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {coda.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-3 rounded-2xl border border-bordo bg-white px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {v.volo_iata} · {dataIt(v.data_locale)}
                        {v.voli?.vettore_operativo ? (
                          <span className="text-fumo"> · {v.voli.vettore_operativo}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-sm text-fumo">
                        ritardo{" "}
                        <span className="numeri font-medium text-inchiostro">
                          {ritardoUmano(v.ritardo_minuti)}
                        </span>{" "}
                        · fascia{" "}
                        <span className="numeri font-medium text-verde">
                          {v.importo !== null ? `${v.importo}€` : "?"}
                        </span>{" "}
                        · previsto {oraUtc(v.voli?.arrivo_previsto_utc ?? null)} → effettivo{" "}
                        {oraUtc(v.voli?.arrivo_effettivo_utc ?? null)} UTC · fonte{" "}
                        {v.voli?.fonte ?? "?"} · regole {v.versione_regole}
                      </p>
                      {v.motivo && (
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fumo">
                          {v.motivo}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-fumo-2">
                        in coda dal {dataIt(v.creata_il)} ·{" "}
                        {v.email ? `avvisiamo ${v.email}` : "check anonimo, nessuna email"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.flightradar24.com/data/flights/${v.volo_iata.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-bottone border border-bordo bg-white px-3.5 py-2 text-sm font-medium text-fumo transition-colors hover:border-verde/40 hover:text-inchiostro"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        Controlla
                      </a>
                      {/* l'azione torna un esito per il pannello comandi;
                          qui il modulo vuole void, quindi si incarta */}
                      <form
                        action={async () => {
                          "use server";
                          await confermaVerifica(v.id);
                        }}
                      >
                        <Button type="submit" size="sm">
                          Conferma
                        </Button>
                      </form>
                    </div>
                  </div>

                  <details className="border-t border-bordo pt-3">
                    <summary className="cursor-pointer text-sm font-medium text-fumo transition-colors hover:text-inchiostro">
                      Correggi il verdetto
                    </summary>
                    <form
                      action={async (dati: FormData) => {
                        "use server";
                        await correggiVerifica(
                          v.id,
                          String(dati.get("esito") ?? ""),
                          String(dati.get("nota") ?? ""),
                        );
                      }}
                      className="mt-3 flex flex-wrap items-center gap-2"
                    >
                      <select
                        name="esito"
                        defaultValue="non_idoneo"
                        className="h-9 rounded-bottone border border-bordo bg-white px-3 text-sm"
                      >
                        <option value="non_idoneo">Non idoneo</option>
                        <option value="incerto">Incerto</option>
                      </select>
                      <input
                        name="nota"
                        required
                        placeholder="Perché il motore ha sbagliato"
                        className="h-9 min-w-56 flex-1 rounded-bottone border border-bordo bg-white px-3 text-sm placeholder:text-fumo-2"
                      />
                      <Button type="submit" variant="scuro" size="sm">
                        Registra la correzione
                      </Button>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-[-0.03em]">Pratiche recenti</h2>
          {recenti.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-bordo bg-white/60 px-5 py-10 text-center text-sm text-fumo">
              Nessuna pratica ancora. Nascono dal pagamento, via webhook Polar.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {recenti.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bordo bg-white px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {p.voli ? `${p.voli.volo_iata} · ${dataIt(p.voli.data_locale)}` : "Volo ?"}
                      <span className="text-fumo"> · {p.email}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-fumo">
                      {p.tipo === "famiglia" ? "famiglia" : "singola"} · fascia{" "}
                      <span className="numeri font-medium text-inchiostro">
                        {p.importo_fascia !== null ? `${p.importo_fascia}€` : "?"}
                      </span>
                      {p.prezzo_pagato !== null && (
                        <>
                          {" "}
                          · pagata{" "}
                          <span className="numeri font-medium text-inchiostro">
                            {Number(p.prezzo_pagato).toLocaleString("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        </>
                      )}{" "}
                      · aperta il {dataIt(p.creata_il)}
                    </p>
                  </div>
                  <span
                    className={`rounded-pillola px-3 py-1 text-xs font-medium ${
                      p.stato === "esito_rifiutata"
                        ? "bg-red-50 text-red-700"
                        : p.stato === "esito_pagata" || p.stato === "pagata"
                          ? "bg-menta-tenue text-verde-scuro"
                          : "bg-nebbia text-fumo"
                    }`}
                  >
                    {STATI_PRATICA[p.stato] ?? p.stato}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-[-0.03em]">Oggi</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {contatori.map((c) => (
              <div key={c.nome} className="rounded-2xl border border-bordo bg-white px-4 py-3">
                <p className="numeri font-display text-2xl tracking-[-0.03em]">{c.valore}</p>
                <p className="mt-0.5 text-xs text-fumo">{c.nome}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-fumo-2">
            Conteggi dalla mezzanotte italiana. Le pratiche pagate sono gli eventi
            &quot;pagata&quot; registrati oggi.
          </p>
        </section>
      </main>
    </div>
  );
}
