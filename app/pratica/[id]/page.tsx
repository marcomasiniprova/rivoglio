import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import CaricaDocumento from "@/components/pratica/CaricaDocumento";
import DichiaraRifiuto from "@/components/pratica/DichiaraRifiuto";
import HoInviato from "@/components/pratica/HoInviato";
import { Button } from "@/components/ui/button";
import { utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { caricaPratica, eventiPratica, type StatoPratica } from "@/lib/pratiche/pratiche";
import { COPY } from "@/lib/copy";

/**
 * Il tracker della pratica: la linea del tempo dagli eventi, lo stato
 * attuale spiegato, il prossimo passo, la garanzia e la scadenza stimata.
 *
 * Chi entra: SOLO il proprietario collegato. La lettura passa dal client
 * di servizio (scavalca la RLS), quindi il controllo `utente_id` qui sotto
 * è esplicito e non negoziabile: senza, chiunque con un id in mano
 * leggerebbe le pratiche degli altri. Stesso schema della lettera.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La tua pratica | Rivolio",
  robots: { index: false },
};

type VoloBreve = { volo_iata: string; data_locale: string };

/* Gli stati in cui "Ho inviato il reclamo" ha senso: la lettera esiste
   ma l'invio non risulta ancora. Dopo, il bottone sparisce. */
const CONFERMABILE: StatoPratica[] = ["pagata", "pronta"];

/* Gli stati in cui "la compagnia mi ha risposto no" ha senso: il reclamo
   è partito e l'esito non è ancora arrivato. Prima non c'è niente da
   rifiutare, dopo la pratica è chiusa. */
const DICHIARABILE: StatoPratica[] = ["inviata", "sollecito", "enac"];

/* Da qui in poi la lettera esiste e il link si mostra. In `creata` no:
   la pagina della lettera direbbe solo "arriva col pagamento". */
const CON_LETTERA: StatoPratica[] = [
  "pagata",
  "pronta",
  "inviata",
  "sollecito",
  "enac",
  "esito_pagata",
  "esito_rifiutata",
  "rimborsata",
];

const dataIt = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  });

const dataOraIt = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });

const riempi = (template: string, valori: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (tutto, chiave) => valori[chiave] ?? tutto);

function Cornice({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {COPY.pratica.torna}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}

export default async function PaginaPratica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  /* Il proxy protegge /app, non /pratica: qui la guardia è della pagina.
     Chi non è collegato va al login e poi torna esattamente qui. */
  const utente = await utenteCollegato();
  if (!utente) redirect(`/entra?poi=/pratica/${id}`);
  if (!SUPABASE_CONFIGURATO) redirect("/entra");

  if (!SERVIZIO_ATTIVO) {
    return (
      <Cornice>
        <div className="rounded-2xl border border-bordo bg-white px-6 py-8">
          <h1 className="font-display text-xl tracking-[-0.03em]">{COPY.pratica.titolo}</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">
            {COPY.pratica.errori.configurazione}
          </p>
        </div>
      </Cornice>
    );
  }

  const pratica = await caricaPratica(id);
  // Non tua = inesistente: chi non è il titolare non deve nemmeno sapere
  // che la pratica esiste. Stessa regola della lettera e dell'API.
  if (!pratica || !pratica.utente_id || pratica.utente_id !== utente.id) redirect("/app");

  const { data: volo } = pratica.volo_id
    ? ((await supabaseServizio()
        .from("voli")
        .select("volo_iata, data_locale")
        .eq("id", pratica.volo_id)
        .maybeSingle()) as { data: VoloBreve | null })
    : { data: null };

  const eventi = await eventiPratica(pratica.id);

  const C = COPY.pratica;
  const stato = C.stati[pratica.stato] ?? null;
  const etichetteEventi: Record<string, string> = C.lineaTempo.eventi;
  const confermabile = CONFERMABILE.includes(pratica.stato);
  const conLettera = CON_LETTERA.includes(pratica.stato);
  const dichiarabile = DICHIARABILE.includes(pratica.stato);

  return (
    <Cornice>
      {/* ------------------------------------------------ la testata */}
      <div>
        <p className="text-[0.8rem] font-medium uppercase tracking-[0.18em] text-verde">
          {C.titolo}
        </p>
        <h1 className="mt-3 font-display text-[2.1rem] leading-none tracking-[-0.04em] sm:text-[2.5rem]">
          {volo
            ? riempi(C.sottotitoloTemplate, {
                volo: volo.volo_iata,
                data: dataIt(volo.data_locale),
              })
            : riempi(C.elenco.voloMancante, { data: dataIt(pratica.creata_il) })}
        </h1>

        {pratica.importo_fascia !== null && (
          <details className="group mt-4 max-w-xl">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[0.95rem] [&::-webkit-details-marker]:hidden">
              <span className="numeri inline-flex items-center rounded-pillola bg-menta-tenue px-3 py-1 font-medium text-verde-notte">
                {riempi(C.fascia.template, { importo: `${pratica.importo_fascia}€` })}{" "}
                <span className="ml-1 font-normal text-verde-notte/70">
                  {C.fascia.perPasseggero}
                </span>
              </span>
              <span className="text-sm font-medium text-verde underline decoration-dotted underline-offset-4 group-open:text-verde-scuro">
                {C.fascia.comeNasce.titolo}
              </span>
            </summary>
            <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm leading-relaxed text-fumo">
              {C.fascia.comeNasce.testo}
            </p>
          </details>
        )}
        {pratica.tipo === "famiglia" && (
          <p className="mt-2 text-sm text-fumo">{C.elenco.famiglia}</p>
        )}
      </div>

      {/* ------------------------------------------------ dove siamo */}
      <section className="rounded-2xl border border-bordo bg-white px-6 py-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
          {C.statoEtichetta}
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-[-0.03em]">
          {stato?.nome ?? pratica.stato}
        </h2>
        {stato && (
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
            {stato.descrizione}
          </p>
        )}

        {stato && (
          <div className="mt-5 border-t border-bordo pt-5">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
              {C.prossimoPassoEtichetta}
            </p>
            <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed">{stato.prossimoPasso}</p>
          </div>
        )}

        {(confermabile || conLettera) && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {conLettera && (
              <Button asChild variant={confermabile ? "pieno" : "contorno"}>
                <Link href={`/pratica/${pratica.id}/lettera`}>
                  <FileText className="size-4" aria-hidden="true" />
                  {C.azioni.apriLettera}
                </Link>
              </Button>
            )}
            {confermabile && (
              <HoInviato
                praticaId={pratica.id}
                etichetta={C.azioni.confermaInvio}
                inCorso={C.azioni.confermaInvioInCorso}
                fatta={C.azioni.confermaInvioFatta}
                errore={C.azioni.confermaInvioErrore}
              />
            )}
          </div>
        )}
        {confermabile && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo-2">
            {C.azioni.confermaInvioNota}
          </p>
        )}
      </section>

      {/* ---------------------------- il no della compagnia, dichiarato */}
      {dichiarabile && (
        <DichiaraRifiuto praticaId={pratica.id} giaDichiarato={pratica.rifiuto_motivo ?? null} />
      )}

      {/* ------------------------------------------------ come si invia */}
      {confermabile && (
        <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
          <h2 className="font-display text-lg tracking-[-0.03em]">{C.istruzioniInvio.titolo}</h2>
          <ol className="mt-3 flex list-none flex-col gap-2 text-[0.95rem] leading-relaxed text-fumo">
            {C.istruzioniInvio.passi.map((passo, i) => (
              <li key={passo} className="flex gap-3">
                <span className="numeri mt-0.5 font-medium text-verde">{i + 1}.</span>
                {passo}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-fumo-2">{C.istruzioniInvio.perche}</p>
        </section>
      )}

      {/* ------------------------------------------------ i documenti */}
      {conLettera && <CaricaDocumento praticaId={pratica.id} />}

      {/* ------------------------------------------------ la cronologia */}
      <section className="rounded-2xl border border-bordo bg-white px-6 py-6">
        <h2 className="font-display text-lg tracking-[-0.03em]">{C.lineaTempo.titolo}</h2>
        {eventi.length === 0 ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{C.lineaTempo.vuota}</p>
        ) : (
          <>
            <ol className="mt-5 flex flex-col">
              {eventi.map((evento, i) => (
                <li key={evento.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* il filo che unisce i punti; l'ultimo non lo tira oltre */}
                  {i < eventi.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-[5px] h-full w-px bg-bordo"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ${
                      i === eventi.length - 1
                        ? "bg-verde shadow-[0_0_0_4px_var(--color-menta-tenue)]"
                        : "border-2 border-verde/50 bg-white"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-medium leading-snug">
                      {etichetteEventi[evento.tipo] ?? evento.tipo}
                    </p>
                    <p className="numeri mt-0.5 text-xs text-fumo-2">
                      {dataOraIt(evento.creato_il)}
                    </p>
                    {evento.nota && (
                      <p className="mt-1 text-sm leading-relaxed text-fumo">{evento.nota}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-fumo-2">{C.lineaTempo.notaOrari}</p>
          </>
        )}
      </section>

      {/* ------------------------------------------------ la garanzia */}
      <section className="rounded-2xl bg-verde-notte px-6 py-6 text-white">
        <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
          <ShieldCheck className="size-5 text-menta" aria-hidden="true" />
          {C.garanzia.titolo}
        </h2>
        <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-white/85">
          {pratica.garanzia_fino_al
            ? riempi(C.garanzia.template, { data: dataIt(pratica.garanzia_fino_al) })
            : C.garanzia.senzaData}
        </p>
      </section>

      {/* ------------------------------------------------ la scadenza stimata */}
      {pratica.scadenza_stimata && (
        <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
          <h2 className="font-display text-lg tracking-[-0.03em]">{C.scadenza.titolo}</h2>
          <p className="numeri mt-2 text-[0.95rem] leading-relaxed">
            {riempi(C.scadenza.template, { data: dataIt(pratica.scadenza_stimata) })}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fumo-2">
            {C.scadenza.avvertenza}
          </p>
        </section>
      )}

      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
      >
        {C.torna}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>


    </Cornice>
  );
}
