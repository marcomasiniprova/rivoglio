import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, Plane } from "lucide-react";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { COPY } from "@/lib/copy";
import type { StatoPratica, TipoPratica } from "@/lib/pratiche/pratiche";

/**
 * Le tue pratiche: l'elenco di tutti i reclami dell'utente collegato.
 *
 * La lettura delle pratiche passa dal client di sessione, quindi dalla RLS:
 * la policy "pratiche: le mie" garantisce che arrivino SOLO le righe con
 * utente_id = auth.uid(). I voli invece non hanno policy (li legge solo il
 * server): si agganciano dopo, con la chiave di servizio, limitati agli id
 * delle pratiche già filtrate dalla RLS.
 */
export const dynamic = "force-dynamic";

type RigaPratica = {
  id: string;
  stato: StatoPratica;
  tipo: TipoPratica;
  importo_fascia: number | null;
  volo_id: string | null;
  creata_il: string;
  aggiornata_il: string;
};

type VoloBreve = { volo_iata: string; data_locale: string };

const dataIt = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  });

const riempi = (template: string, valori: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (tutto, chiave) => valori[chiave] ?? tutto);

/** Lo stato, vestito: chiuso bene in verde, chiuso male in oro, il resto menta. */
function classiStato(stato: StatoPratica): string {
  if (stato === "esito_pagata") return "bg-verde text-white";
  if (stato === "esito_rifiutata") return "bg-sole/25 text-inchiostro";
  if (stato === "rimborsata") return "bg-nebbia-2 text-fumo";
  return "bg-menta-tenue text-verde-notte";
}

export default async function PaginaPratiche() {
  /* Il layout reindirizza già chi non è collegato, ma React costruisce layout
     e pagina insieme: senza questo controllo la pagina interroga Supabase lo
     stesso e riempie i log di errori che poi nascondono quelli veri. */
  if (!SUPABASE_CONFIGURATO) redirect("/entra");
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("pratiche")
    .select("id, stato, tipo, importo_fascia, volo_id, creata_il, aggiornata_il")
    .order("aggiornata_il", { ascending: false });

  const pratiche = (data ?? []) as RigaPratica[];

  /* I voli delle pratiche, in un colpo solo. Se la chiave di servizio manca
     l'elenco resta in piedi lo stesso: si mostra la data della pratica. */
  const voli = new Map<string, VoloBreve>();
  const voloIds = [...new Set(pratiche.map((p) => p.volo_id).filter(Boolean))] as string[];
  if (SERVIZIO_ATTIVO && voloIds.length > 0) {
    const { data: righe } = await supabaseServizio()
      .from("voli")
      .select("id, volo_iata, data_locale")
      .in("id", voloIds);
    for (const v of righe ?? []) {
      voli.set(v.id as string, { volo_iata: v.volo_iata, data_locale: v.data_locale });
    }
  }

  const C = COPY.pratica.elenco;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[2.3rem] leading-none tracking-[-0.04em] sm:text-[2.8rem]">
          {C.titolo}
        </h1>
        <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-fumo">{C.sottotitolo}</p>
      </div>

      {error ? (
        /* ---- guasto onesto: si dice, non si mostra un elenco vuoto finto ---- */
        <div className="rounded-3xl border border-bordo bg-white px-6 py-10 text-center">
          <p className="text-[0.95rem] leading-relaxed text-fumo">{C.errore}</p>
        </div>
      ) : pratiche.length === 0 ? (
        /* ---- stato vuoto: la porta è il check sulla home ---- */
        <div className="rounded-3xl border border-dashed border-bordo bg-white/60 px-6 py-12 text-center">
          <Plane className="mx-auto size-6 text-fumo-2" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl tracking-[-0.03em]">{C.vuoto.titolo}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fumo">
            {C.vuoto.testo}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
          >
            {C.vuoto.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {pratiche.map((p) => {
            const stato = COPY.pratica.stati[p.stato] ?? null;
            const volo = p.volo_id ? voli.get(p.volo_id) : undefined;
            const titolo = volo
              ? riempi(C.voloTemplate, { volo: volo.volo_iata, data: dataIt(volo.data_locale) })
              : riempi(C.voloMancante, { data: dataIt(p.creata_il) });

            return (
              <Link
                key={p.id}
                href={`/pratica/${p.id}`}
                className="group block rounded-3xl border border-bordo bg-white px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-verde/40 hover:shadow-[0_18px_36px_-24px_rgba(5,46,31,0.35)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-pillola px-3 py-1 text-xs font-medium ${classiStato(p.stato)}`}
                  >
                    {stato?.nome ?? p.stato}
                  </span>
                  {p.importo_fascia !== null && (
                    <span
                      className="numeri inline-flex items-center rounded-pillola border border-bordo px-3 py-1 text-xs font-medium text-inchiostro"
                      title={C.fasciaFonte}
                    >
                      {riempi(C.fasciaTemplate, { importo: `${p.importo_fascia}€` })}
                    </span>
                  )}
                  {p.tipo === "famiglia" && (
                    <span className="inline-flex items-center rounded-pillola border border-bordo px-3 py-1 text-xs text-fumo">
                      {C.famiglia}
                    </span>
                  )}
                </div>

                <p className="mt-3 font-display text-xl tracking-[-0.03em]">{titolo}</p>

                {stato && (
                  <p className="mt-2 text-sm leading-relaxed text-fumo">
                    <span className="font-medium text-inchiostro">
                      {C.prossimoPassoEtichetta}:
                    </span>{" "}
                    {stato.prossimoPasso}
                  </p>
                )}

                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-verde transition-colors group-hover:text-verde-scuro">
                  <FileText className="size-4" aria-hidden="true" />
                  {C.apri}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
