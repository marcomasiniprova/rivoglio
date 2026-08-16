import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import CaricaDocumento from "@/components/pratica/CaricaDocumento";
import HoInviato from "@/components/pratica/HoInviato";
import SpeseCura from "@/components/pratica/SpeseCura";
import PreparaReclamo from "@/components/pratica/PreparaReclamo";
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
import {
  EVENTO_ANALISI_RIFIUTO,
  EVENTO_RIFIUTO_DOCUMENTO,
  EVENTO_TESTO_RIFIUTO,
} from "@/lib/pratiche/dossier";
import { GIORNI_PRIMA_DEL_SOLLECITO, schedaRifiuto } from "@/lib/pratiche/rifiuto";
/* Il tempo viene tutto da un posto solo: fusi, giorni di calendario e
   giorni della settimana. Vedi lib/tempo.ts. */
import {
  adesso,
  dataConGiorno,
  dataIt,
  dataItArticolo,
  dataOraIt,
  fraQuanto,
  giorniDaQuando,
  giorniFra,
  giornoPiu,
} from "@/lib/tempo";
import { COPY } from "@/lib/copy";
import LasciaRecensione from "@/components/rivolio/LasciaRecensione";
import DichiaraEsito from "@/components/pratica/DichiaraEsito";
import Traguardo from "@/components/pratica/Traguardo";
import ProvaPagamento from "@/components/pratica/ProvaPagamento";

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

/** Gli eventi che servono a noi e non dicono niente a chi ha pagato.
 *  Restano nel database e nel fascicolo; fuori dalla cronologia. */
const EVENTI_TECNICI = new Set<string>([
  EVENTO_TESTO_RIFIUTO,
  EVENTO_ANALISI_RIFIUTO,
  EVENTO_RIFIUTO_DOCUMENTO,
]);

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
        .select("importo, ritardo_minuti, motivo, versione_regole, caso_dichiarato")
        .eq("id", pratica.verifica_id)
        .maybeSingle()
    : { data: null };

  const eventi = await eventiPratica(pratica.id);

  const C = COPY.pratica;
  const etichetteEventi: Record<string, string> = C.lineaTempo.eventi;
  /* Un posto solo decide cosa è fatto, cosa si fa adesso e cosa dopo.
     La pagina qui sotto non fa più ragionamenti suoi. */
  /* I giorni passati dall'invio: senza, i passi non sanno del silenzio e
     la pratica continua a dire "niente da fare" mentre il sollecito è
     già pronto (vedi passoDelSilenzio in lib/pratiche/passi.ts). */
  /**
   * 🔴 «I BOX DOVE SIAMO NON COMUNICANO MOLTO: troppo testo noioso tutto
   * attaccato, sinceramente non è molto utile» (Valerio, 13/08).
   *
   * Aveva ragione: c'erano un titolo di stato («Pagata», «Inviata»), un
   * paragrafo di spiegazione e un secondo paragrafo col prossimo passo.
   * Tre blocchi di testo per dire una cosa sola, e quella cosa sola non
   * era scritta da nessuna parte: DI CHI È LA PALLA, e cosa si tocca
   * adesso.
   *
   * Adesso in cima c'è quella riga e basta. Il perché sta in un cassetto
   * che si apre solo se uno lo cerca.
   */
  const RIGA_DEL_PASSO: Record<string, { tocca: boolean; riga: string }> = {
    pagamento: { tocca: true, riga: "Manca il pagamento" },
    lettera: { tocca: true, riga: "Tocca a te: manda il reclamo" },
    attesa: { tocca: false, riga: "Aspetti la compagnia" },
    replica: { tocca: true, riga: "Tocca a te: manda la replica" },
    ente: { tocca: true, riga: "Tocca a te: scrivi all'ente" },
    chiusa: { tocca: false, riga: "Pratica chiusa" },
  };

  const percorso = percorsoPratica(
    pratica.stato,
    eventi,
    pratica.rifiuto_motivo ?? null,
    giorniDaQuando(pratica.inviata_il),
  );
  const R = percorso.riquadri;
  /* 🔴 I TESTI NON SI SCELGONO PIÙ CON LO STATO DEL DATABASE. Allo stato
     `sollecito` ci si arriva per silenzio (sei settimane) o perché la
     compagnia ha risposto no: due fatti opposti, un nome solo. Chi
     dichiarava il no cinque minuti dopo l'invio leggeva «Sei settimane,
     nessuna risposta» (Valerio, 13/08). Adesso decide `chiaveTesto`, che
     guarda cosa è SUCCESSO. Vedi lib/pratiche/passi.ts. */
  const stato = C.stati[percorso.chiaveTesto] ?? C.stati[pratica.stato] ?? null;
  const passoDelMomento = RIGA_DEL_PASSO[percorso.attivo] ?? {
    tocca: true,
    riga: stato?.nome ?? "La tua pratica",
  };
  const attesa = attesaDopoInvio(pratica.inviata_il, pratica.stato);
  /* LA PRATICA VINTA (la compagnia ha pagato): è il traguardo, e la
     schermata cambia mestiere (Valerio, 16/08). Via la garanzia, «come
     mai», il fascicolo: non servono più. Al loro posto la festa. */
  const vinta = pratica.stato === "esito_pagata";
  const chiusa = ["esito_pagata", "esito_rifiutata", "rimborsata"].includes(pratica.stato);
  /* IL FASCICOLO (scelta di Valerio col popup, 13/08). Lo stesso che
     legge l'AI prima di scrivere una replica: se lo mostriamo a lei e non
     a lui, la trasparenza che vendiamo si ferma alla porta di casa. */
  /* 🔴 LA CRONOLOGIA MOSTRAVA IL CODICE DELL'AI. Valerio, 13/08: un suo
     clic solo («hanno risposto no») produceva quattro righe, e due erano
     `rifiuto_testo` e `rifiuto_analisi`, cioè il testo grezzo dell'email e
     un blocco JSON con dentro il ragionamento del modello. Un cliente che
     apre la sua pratica e trova del codice smette di crederci.
     Quei due eventi restano scritti nel database e restano nel FASCICOLO,
     che è il posto dove hanno senso: lì si legge la loro risposta e cosa
     ne abbiamo capito. Nella cronologia no: lì ci vanno i fatti, uno per
     gesto. Scelta di Valerio col popup, 13/08. */
  const eventiVisibili = eventi.filter((e) => !EVENTI_TECNICI.has(e.tipo));

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
      {/* ------------------------------------------------ la cronologia.
          🔴 STA QUI, SOPRA I PASSI, E SI APRE SOLO SE LA VUOI. Valerio,
          13/08: «tagliala da tutti gli step, mettila in una posizione
          visibile apribile, tipo sotto la scritta del volo o leggermente
          sopra la progress bar».
          Aveva ragione sul posto: la cronologia non è un passo e non è
          un'azione, è la prova che qualcosa sta succedendo mentre
          aspetti. In mezzo alle cose da fare allungava la pagina di
          mezzo schermo per chi non la stava cercando; qui è una riga, e
          chi la vuole la apre. */}
      <details className="group rounded-2xl border border-bordo bg-white px-6 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-display text-lg tracking-[-0.03em] marker:hidden">
          {C.lineaTempo.titolo}
          <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        {eventiVisibili.length === 0 ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{C.lineaTempo.vuota}</p>
        ) : (
          <>
            <ol className="mt-5 flex flex-col">
              {eventiVisibili.map((evento, i) => (
                <li key={evento.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* il filo che unisce i punti; l'ultimo non lo tira oltre */}
                  {i < eventiVisibili.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-[5px] h-full w-px bg-bordo"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ${
                      i === eventiVisibili.length - 1
                        ? "bg-verde shadow-[0_0_0_4px_var(--color-menta-tenue)]"
                        : "border-2 border-verde/50 bg-white"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-medium leading-snug">
                      {/* ⚠️ Il passaggio a `sollecito` si chiama così anche
                          quando ci si arriva perché hanno RISPOSTO: nella
                          cronologia diventerebbe «Sollecito pronto» sotto
                          la riga «hanno risposto no», che è la stessa
                          confusione fra calendario e fatti. */}
                      {evento.tipo === "sollecito" && pratica.rifiuto_motivo
                        ? C.lineaTempo.replicaPronta
                        : (etichetteEventi[evento.tipo] ?? evento.tipo)}
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
      </details>

      <BarraPassi passi={percorso.passi} />

      {/* ------------------------------------------------ il traguardo (vinta) */}
      {vinta && (
        <Traguardo
          importoTesto={pratica.importo_fascia ? `${pratica.importo_fascia}€` : null}
          famiglia={pratica.tipo === "famiglia"}
        />
      )}

      {/* La foto della prova di pagamento: FACOLTATIVA, solo sulla pratica
          vinta, per un testimonial anonimo (Valerio, 16/08). */}
      {vinta && <ProvaPagamento praticaId={pratica.id} />}

      {/* ------------------------------------------------ dove siamo
          🔴 Sparisce a pratica VINTA: lì comanda la festa, e «In attesa» +
          garanzia + «come mai» sono rumore su una cosa finita bene
          (Valerio, 16/08). */}
      {!vinta && (
      <section className="rounded-2xl border border-bordo bg-white px-6 py-6">
        <p
          className={`text-[0.7rem] font-medium uppercase tracking-[0.16em] ${
            passoDelMomento.tocca ? "text-verde" : "text-fumo-2"
          }`}
        >
          {/* 🔴 «In attesa» su una pratica CHIUSA era assurdo (Valerio,
              16/08: «che cazzo attesa quando la pratica è finita»). Ora una
              pratica chiusa dice «Chiusa». */}
          {passoDelMomento.tocca ? "Tocca a te" : chiusa ? "Chiusa" : "In attesa"}
        </p>
        <h2 className="mt-2 font-display text-2xl leading-tight tracking-[-0.03em]">
          {passoDelMomento.riga}
        </h2>

        {stato && (
          <div className="mt-4">
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

        {/* PREPARA IL RECLAMO: i due passi facoltativi (carta d'imbarco,
            spese art. 9) PRIMA, la lettera DOPO (Valerio, 15/08: «la
            lettera deve essere fatta dopo questi due passi, e visibile non
            prima, sennò diventano inutili e hanno meno importanza»).
            Il gate vale SOLO nella fase "lettera", cioè il primo reclamo
            non ancora inviato. Su replica ed ente la lettera si apre
            dritta: è la regola tolta al muro il 13/08 (non si trattiene la
            replica di chi si è appena preso un no). */}
        {(() => {
          const prepNode = (
            <>
              {R.documentoExtra && <CaricaDocumento praticaId={pratica.id} />}
              {![
                "inviata",
                "sollecito",
                "enac",
                "esito_pagata",
                "esito_rifiutata",
                "rimborsata",
              ].includes(pratica.stato) &&
                (verificaRiga as { caso_dichiarato?: string | null } | null)?.caso_dichiarato !==
                  "declassamento" && (
                  <SpeseCura praticaId={pratica.id} iniziale={pratica.cura_richiesta ?? false} />
                )}
            </>
          );

          const letteraNode = (
            <>
              {R.letteraVisibile && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {R.letteraApribile ? (
                    <Button asChild variant="pieno">
                      <Link href={`/pratica/${pratica.id}/lettera`}>
                        <FileText className="size-4" aria-hidden="true" />
                        {/* Dopo un no dichiarato il foglio che si apre non è
                            più il reclamo: è la replica. Chiamarlo ancora
                            "la lettera" fa credere di riaprire quella di
                            prima. */}
                        {percorso.attivo === "replica"
                          ? C.azioni.apriReplica
                          : percorso.attivo === "ente"
                            ? C.azioni.apriSegnalazione
                            : C.azioni.apriLettera}
                      </Link>
                    </Button>
                  ) : (
                    /* Spento, non nascosto: chi ha appena pagato deve
                       vedere che la lettera c'è, e capire cosa manca per
                       aprirla. Un bottone che sparisce fa pensare di aver
                       comprato una cosa che non esiste. */
                    <Button disabled variant="contorno" className="pointer-events-none opacity-55">
                      <FileText className="size-4" aria-hidden="true" />
                      {C.azioni.apriLettera}
                    </Button>
                  )}
                  {/* 🔴 CHIUDE IL GIRO, e prima non esisteva: la pagina
                      restava ferma sulla replica anche dopo averla mandata,
                      quindi un secondo no non aveva dove andare (Valerio,
                      13/08: «ti blocchi al passo 4»). */}
                  {R.confermaReplica && (
                    <HoInviato
                      praticaId={pratica.id}
                      gesto="replica"
                      etichetta={C.azioni.confermaReplica}
                      inCorso={C.azioni.confermaReplicaInCorso}
                      fatta={C.azioni.confermaReplicaFatta}
                      errore={C.azioni.confermaReplicaErrore}
                    />
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
                /* `text-fumo` e non `text-fumo-2`: questa riga spiega
                   perché il bottone accanto è spento, quindi in quel
                   momento è la cosa più importante della sezione. Nel
                   grigio più chiaro, negli scatti, spariva proprio dove
                   serviva. */
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo">
                  {C.azioni.letteraChiusa}
                </p>
              )}
              {R.confermaInvio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo-2">
                  {C.azioni.confermaInvioNota}
                </p>
              )}
              {R.confermaReplica && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fumo-2">
                  {C.azioni.confermaReplicaNota}
                </p>
              )}
            </>
          );

          return percorso.attivo === "lettera" ? (
            <PreparaReclamo praticaId={pratica.id} prep={prepNode} lettera={letteraNode} />
          ) : (
            letteraNode
          );
        })()}

        {/* Il perché, per chi lo cerca. Fuori dalla strada di chi deve
            solo fare la cosa del momento. */}
        {stato && (
          <details className="group mt-5 border-t border-bordo pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-fumo marker:hidden">
              Come mai?
              <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
              {stato.descrizione}
            </p>
            <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
              {stato.prossimoPasso}
            </p>
          </details>
        )}

        {/* LA GARANZIA, UNA RIGA E IN CIMA (scelta di Valerio col popup,
            12/08). Prima era un riquadro verde scuro a metà pagina: si
            notava, ma arrivava dopo la cronologia, cioè dopo che uno
            aveva già finito di preoccuparsi. Qui sta nel punto in cui
            guardi a che punto sei, che è quando la domanda "e se non
            pagano?" te la fai davvero.
            🔴 SPARISCE A PRATICA CHIUSA (Valerio, 16/08): se ti hanno
            pagato, o se ti abbiamo già rimborsato, «ti rimborsiamo se non
            pagano» è una promessa che non ha più senso. */}
        {!chiusa && (
          <p className="mt-5 flex items-start gap-2 border-t border-bordo pt-4 text-sm leading-relaxed text-fumo">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
            <span>
              {pratica.garanzia_fino_al
                ? riempi(C.garanzia.template, { data: dataItArticolo(pratica.garanzia_fino_al) })
                : C.garanzia.senzaData}
            </span>
          </p>
        )}
      </section>
      )}

      {/* IL TRAGUARDO: solo l'utente sa se i soldi sono arrivati sul suo
          conto (la compagnia paga lui, non noi). Compare appena il reclamo
          è partito, e chiude la pratica: pagata (vittoria, entra in
          classifica) o no (parte la garanzia). Prima non c'era, e la
          pratica non finiva mai. */}
      {/* IL BOX UNICO «Come è andata con la compagnia?» (Valerio, 15/08:
          «fondi tutto in un box solo, mi hanno pagato o mi hanno risposto
          no»). Prima erano due riquadri separati: qui dentro c'è sia il
          «mi hanno pagato» (chiude la pratica) sia la strada del «mi hanno
          risposto no» (carica il loro no, preparo la replica). La garanzia
          NON scatta più sulla parola: solo con un no scritto registrato. */}
      {["inviata", "sollecito", "enac"].includes(pratica.stato) && (
        <DichiaraEsito
          praticaId={pratica.id}
          rifiutoRegistrato={Boolean(pratica.rifiuto_motivo)}
          /* La garanzia parte solo se il no è un DOCUMENTO vero caricato,
             non testo scritto a mano (anti-frode, Valerio 15/08). */
          rifiutoProvato={eventi.some((e) => e.tipo === EVENTO_RIFIUTO_DOCUMENTO)}
          /* Il rimborso è l'ultima spiaggia: si sblocca solo dopo che
             l'utente ha mandato almeno una replica (Valerio, 16/08). */
          haCombattuto={percorso.giri.replicheMandate > 0}
          giaDichiarato={pratica.rifiuto_motivo ?? null}
          etichettaScelta={schedaRifiuto(pratica.rifiuto_motivo)?.etichetta ?? null}
          nuovoGiro={percorso.giri.no > 0 && percorso.giri.no === percorso.giri.replicheMandate}
        />
      )}

      {/* --------------------------------------- il fascicolo, in fondo.
          Scelta di Valerio (13/08): resta raggiungibile ma non ingombra.
          Serve quando si scrive o si contesta, non mentre si aspetta.
          🔴 QUI C'ERA UN DOPPIONE (Valerio, 14/08: «il fascicolo dice di
          chiuderlo quando è già chiuso»): questo riquadro era un
          collapsible «Il fascicolo del tuo caso» che dentro ne conteneva
          un ALTRO identico, perché `Fascicolo` è già di suo un
          apri/chiudi con lo stesso titolo. Aprendo il primo comparivano
          due «Il fascicolo del tuo caso» uno dentro l'altro, uno che
          diceva «chiudi» e uno «×». Tolto il guscio: il componente si
          apre e si chiude da solo. */}
      {/* 🔴 SPARISCE A PRATICA VINTA (Valerio, 16/08: «è tutto chiuso, non
          servono altri box»). Il fascicolo serve mentre si combatte, non
          dopo aver vinto. */}
      {!vinta && <Fascicolo dossier={dossier} />}

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

      {/* La recensione della pratica: chi è arrivato qui ha pagato, quindi
          ha un'esperienza vera da raccontare. Una per pratica (indice unico),
          e sblocca un'analisi gratis. */}
      <LasciaRecensione
        eventoTipo="pratica"
        eventoRif={pratica.id}
        titolo="Com'è andata con Rivolio? Lascia una recensione"
      />

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
