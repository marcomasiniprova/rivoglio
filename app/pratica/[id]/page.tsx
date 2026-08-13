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
import BarraPassi from "@/components/pratica/BarraPassi";
import Fascicolo from "@/components/pratica/Fascicolo";
import { costruisciDossier, type VoloDossier } from "@/lib/pratiche/dossier";
import { colonnaMancante } from "@/lib/supabase/colonne";
import { caricaPratica, eventiPratica, type StatoPratica } from "@/lib/pratiche/pratiche";
import { percorsoPratica } from "@/lib/pratiche/passi";
import { GIORNI_PRIMA_DEL_SOLLECITO, schedaRifiuto } from "@/lib/pratiche/rifiuto";
/* Il tempo viene tutto da un posto solo: fusi, giorni di calendario e
   giorni della settimana. Vedi lib/tempo.ts. */
import { adesso, dataConGiorno, dataIt, dataOraIt, fraQuanto, giorniFra, giornoPiu } from "@/lib/tempo";
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

/* 🔴 QUI C'ERANO TRE LISTE DI STATI SCRITTE A MANO (`CONFERMABILE`,
   `DICHIARABILE`, `CON_LETTERA`), una accanto al riquadro che
   accendevano. Nessuna sapeva delle altre, quindi potevano essere accese
   tutte insieme e contraddirsi: il riquadro «PASSO 1 DI 2 · prima carica
   la carta d'imbarco» restava su anche quando la lettera era già partita,
   e «Apri la lettera» restava grigio anche dopo aver dichiarato il no
   della compagnia. Sono i due difetti che Valerio ha visto il 13/08.
   Adesso decide un file solo: lib/pratiche/passi.ts. */

/**
 * «Inviato il 12 agosto. Se non rispondono, il sollecito è pronto il 23
 * settembre.» La riga che mancava dopo aver premuto il bottone.
 *
 * ⚠️ Il giorno non è scritto a mano: si conta da
 * `GIORNI_PRIMA_DEL_SOLLECITO`, cioè dalla stessa costante che decide
 * quando il sollecito compare davvero. Due numeri scritti in due posti
 * divergono al primo cambio, e qui divergerebbero verso una promessa
 * fatta a un cliente pagante.
 *
 * Torna `null` quando non c'è niente da aspettare: prima dell'invio, o
 * quando la pratica è già andata avanti da sola.
 */
function attesaDopoInvio(inviataIl: string | null, stato: StatoPratica): string | null {
  if (!inviataIl || stato !== "inviata") return null;
  if (!Number.isFinite(Date.parse(inviataIl))) return null;

  /* ⚠️ GIORNI DI CALENDARIO, non blocchi di 24 ore. Chi manda il reclamo
     alle 23:50 e riguarda la pagina venti minuti dopo è al giorno DOPO:
     dividere i millisecondi direbbe che è ancora al giorno zero, e il
     conto alla rovescia mostrerebbe un giorno in più di quelli veri.
     Su una data promessa a un cliente pagante si vede. Vedi lib/tempo.ts. */
  const giorno = giornoPiu(GIORNI_PRIMA_DEL_SOLLECITO, inviataIl);
  const mancano = giorniFra(adesso(), `${giorno}T12:00:00Z`);
  if (mancano <= 0) return null;

  /* Il giorno della settimana lo calcola la data, sempre. Sotto la
     settimana si dice anche in parole, perché "fra 3 giorni" si colloca
     senza pensarci. */
  const parole = fraQuanto(mancano);
  return `Inviato il ${dataIt(inviataIl)}. Se restano in silenzio, il sollecito è pronto ${dataConGiorno(
    giorno,
  )}: ${parole ?? `mancano ${mancano} giorni`}.`;
}

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

  /* ⚠️ IL FASCICOLO NON PUÒ FAR SPARIRE LA PRATICA. Chiedere a Postgres
     una colonna che non c'è non torna "campo vuoto": fa fallire TUTTA la
     lettura. È già successo il 10/08 con `rifiuto_motivo`, e la pratica
     spariva dall'app per un campo accessorio. Quindi si chiede tutto, e
     se una colonna manca si riprova col minimo indispensabile: il
     fascicolo esce con qualche riga in meno, la pratica esce sempre. */
  const VOLO_BASE = "volo_iata, data_locale";
  const VOLO_PIENO = `${VOLO_BASE}, vettore_operativo, km_ortodromica, fonte, arrivo_previsto_utc, arrivo_effettivo_utc, partenza_citta, arrivo_citta`;
  const leggiVolo = (colonne: string) =>
    supabaseServizio().from("voli").select(colonne).eq("id", pratica.volo_id!).maybeSingle();
  let volo: (VoloBreve & VoloDossier) | null = null;
  if (pratica.volo_id) {
    const pieno = await leggiVolo(VOLO_PIENO);
    volo = (
      pieno.error && colonnaMancante(pieno.error.message)
        ? (await leggiVolo(VOLO_BASE)).data
        : pieno.data
    ) as (VoloBreve & VoloDossier) | null;
  }

  const { data: verificaRiga } = pratica.verifica_id
    ? await supabaseServizio()
        .from("verifiche")
        .select("importo, ritardo_minuti, motivo, versione_regole")
        .eq("id", pratica.verifica_id)
        .maybeSingle()
    : { data: null };

  const eventi = await eventiPratica(pratica.id);

  const C = COPY.pratica;
  const stato = C.stati[pratica.stato] ?? null;
  const etichetteEventi: Record<string, string> = C.lineaTempo.eventi;
  /* Un posto solo decide cosa è fatto, cosa si fa adesso e cosa dopo.
     La pagina qui sotto non fa più ragionamenti suoi. */
  const percorso = percorsoPratica(pratica.stato, eventi, pratica.rifiuto_motivo ?? null);
  const R = percorso.riquadri;
  const attesa = attesaDopoInvio(pratica.inviata_il, pratica.stato);
  /* IL FASCICOLO (scelta di Valerio col popup, 13/08). Lo stesso che
     legge l'AI prima di scrivere una replica: se lo mostriamo a lei e non
     a lui, la trasparenza che vendiamo si ferma alla porta di casa. */
  const dossier = costruisciDossier({
    pratica,
    volo,
    verifica: verificaRiga,
    eventi,
    etichette: etichetteEventi,
  });

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

      {/* ------------------------------------------------ i passi.
          Sta prima di tutto perché è la domanda che uno si fa aprendo la
          pagina: a che punto sono. */}
      <BarraPassi passi={percorso.passi} />

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
            {/* IL CONTO ALLA ROVESCIA (scelta di Valerio col popup, 12/08).
                Premi "Ho inviato il reclamo" e sullo schermo non cambiava
                quasi niente: restava il dubbio "e adesso?". Qui c'è la
                data vera del prossimo passo, calcolata dal giorno
                dell'invio con la stessa costante che decide quando parte
                davvero il sollecito. Se un domani si sposta la tappa, si
                sposta anche questa riga. */}
            {/* ⚠️ NON una pillola, e non è pignoleria: guardando gli scatti
                a 390, 768 e 1440 questo testo va a capo a TUTTE E TRE le
                misure, e una forma completamente tonda su due righe si
                legge come un errore di impaginazione. Riquadro con gli
                angoli normali. Trovato guardando, non da una prova. */}
            {attesa && (
              <p className="numeri mt-3 max-w-xl rounded-xl bg-menta-tenue px-4 py-2.5 text-sm leading-relaxed font-medium text-verde-notte">
                {attesa}
              </p>
            )}
          </div>
        )}

        {R.letteraVisibile && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {R.letteraApribile ? (
              <Button asChild variant="pieno">
                <Link href={`/pratica/${pratica.id}/lettera`}>
                  <FileText className="size-4" aria-hidden="true" />
                  {/* Dopo un no dichiarato il foglio che si apre non è più
                      il reclamo: è la replica. Chiamarlo ancora "la
                      lettera" fa credere di riaprire quella di prima. */}
                  {percorso.attivo === "replica"
                    ? C.azioni.apriReplica
                    : percorso.attivo === "ente"
                      ? C.azioni.apriSegnalazione
                      : C.azioni.apriLettera}
                </Link>
              </Button>
            ) : (
              /* Spento, non nascosto: chi ha appena pagato deve vedere
                 che la lettera c'è, e capire cosa manca per aprirla.
                 Un bottone che sparisce fa pensare di aver comprato
                 una cosa che non esiste. */
              <Button disabled variant="contorno" className="pointer-events-none opacity-55">
                <FileText className="size-4" aria-hidden="true" />
                {C.azioni.apriLettera}
              </Button>
            )}
            {R.confermaInvio && (
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
        {R.letteraVisibile && !R.letteraApribile && (
          /* `text-fumo` e non `text-fumo-2`: questa riga spiega perché il
             bottone accanto è spento, quindi in quel momento è la cosa
             più importante della sezione. Nel grigio più chiaro, negli
             scatti, spariva proprio dove serviva. */
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo">
            {C.azioni.letteraChiusa}
          </p>
        )}
        {R.confermaInvio && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo-2">
            {C.azioni.confermaInvioNota}
          </p>
        )}

        {/* LA GARANZIA, UNA RIGA E IN CIMA (scelta di Valerio col popup,
            12/08). Prima era un riquadro verde scuro a metà pagina: si
            notava, ma arrivava dopo la cronologia, cioè dopo che uno
            aveva già finito di preoccuparsi. Qui sta nel punto in cui
            guardi a che punto sei, che è quando la domanda "e se non
            pagano?" te la fai davvero. */}
        <p className="mt-5 flex items-start gap-2 border-t border-bordo pt-4 text-sm leading-relaxed text-fumo">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
          <span>
            {pratica.garanzia_fino_al
              ? riempi(C.garanzia.template, { data: dataIt(pratica.garanzia_fino_al) })
              : C.garanzia.senzaData}
          </span>
        </p>
      </section>

      {/* ------------------------------------------------ i documenti.
          Sta QUI, prima delle istruzioni d'invio, perché finché la lettera
          non è partita è il passo 1.
          ⚠️ DOPO L'INVIO IL RIQUADRO CAMBIA MESTIERE, non resta uguale:
          la carta d'imbarco serve ancora (rafforza il sollecito) ma non è
          più «passo 1 di 2», perché la lettera è già uscita di casa. Era
          il difetto della schermata 2 del 13/08. */}
      {(R.documentoPasso || R.documentoExtra) && (
        <CaricaDocumento
          praticaId={pratica.id}
          bloccante={R.documentoPasso}
          dopoInvio={R.documentoExtra}
        />
      )}

      {/* ---------------------------------------------- il fascicolo */}
      <Fascicolo dossier={dossier} />

      {/* ---------------------------- il no della compagnia, dichiarato */}
      {R.rifiuto && (
        <DichiaraRifiuto
          praticaId={pratica.id}
          giaDichiarato={pratica.rifiuto_motivo ?? null}
          etichettaScelta={schedaRifiuto(pratica.rifiuto_motivo)?.etichetta ?? null}
        />
      )}

      {/* ------------------------------------------------ come si invia */}
      {R.istruzioni && (
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

      {/* La garanzia non è più un riquadro qui: è diventata una riga in
          cima, sotto lo stato. Vedi il commento lassù. */}

      {/* ------------------------------------------------ la scadenza stimata */}
      {pratica.scadenza_stimata && R.scadenza && (
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
