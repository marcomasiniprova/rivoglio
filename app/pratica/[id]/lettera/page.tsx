import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink, Paperclip, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import ApriEmail from "@/components/pratica/ApriEmail";
import Foglio from "@/components/pratica/Foglio";
import { Button } from "@/components/ui/button";
import AzioniFoglio from "@/components/pratica/AzioniFoglio";
import { colonnaMancante } from "@/lib/supabase/colonne";
import { eventiPratica, type StatoPratica } from "@/lib/pratiche/pratiche";
import { paragrafoSuMisura } from "@/lib/pratiche/dossier";
import { percorsoPratica } from "@/lib/pratiche/passi";
import { utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { compagniaPerVettore, modoInvio } from "@/lib/lettera/compagnie";
import {
  ALLEGATI,
  generaReclamo,
  generaSegnalazioneEnte,
  generaSollecito,
  istruzioniOrganismo,
} from "@/lib/lettera/genera";
import {
  GIORNI_PRIMA_DELL_ENTE,
  GIORNI_PRIMA_DEL_SOLLECITO,
  prontoPerSollecito,
  schedaRifiuto,
  type MotivoRifiuto,
} from "@/lib/pratiche/rifiuto";
import { conciliazionePerPartenza, prontoPerConciliazione } from "@/lib/lettera/conciliazione";
import { METEO_ATTIVO, fraseMeteo, meteoStorico } from "@/lib/meteo/openmeteo";
import { aeroporto } from "@/lib/voli/distanza";
import type { FattoVolo, Verdetto } from "@/lib/regole/eu261";
import type { Passeggero, TipoPratica } from "@/lib/pratiche/pratiche";

/**
 * La lettera della pratica: il documento che l'utente ha comprato.
 *
 * Chi entra: SOLO il proprietario collegato. La lettura passa dal client
 * di servizio (scavalca la RLS), quindi il controllo `utente_id` qui
 * sotto è esplicito e non negoziabile: senza, chiunque con un id in mano
 * leggerebbe le pratiche degli altri.
 *
 * La pagina è pulita e stampabile (css print in fondo): la lettera parte
 * dalla casella dell'utente, questa pagina serve a copiarla giusta.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La tua lettera | Rivolio",
  robots: { index: false },
};

/* Le righe delle tabelle, come arrivano da Supabase. */
type RigaPratica = {
  id: string;
  utente_id: string | null;
  volo_id: string | null;
  verifica_id: string | null;
  stato: string;
  tipo: TipoPratica;
  passeggeri: Passeggero[] | null;
  inviata_il: string | null;
  /** L'email con cui la pratica è stata aperta: finisce in fondo alla lettera. */
  email: string | null;
  /** Il motivo del no della compagnia, se il cliente l'ha dichiarato. */
  rifiuto_motivo?: string | null;
};

const COLONNE_PRATICA =
  "id, utente_id, volo_id, verifica_id, stato, tipo, passeggeri, inviata_il, email";

type RigaVolo = {
  volo_iata: string;
  data_locale: string;
  vettore_operativo: string | null;
  vettore_marketing: string | null;
  /* Servono a scegliere l'organismo nazionale competente: la competenza è
     dello Stato dell'aeroporto di PARTENZA (art. 16 par. 1). */
  partenza_iata: string | null;
  arrivo_iata: string | null;
  arrivo_previsto_utc: string | null;
  arrivo_effettivo_utc: string | null;
  stato: FattoVolo["stato"];
  km_ortodromica: number | null;
  fonte: string;
  fonti_discordanti: boolean;
  /** Il payload archiviato del fornitore: qui dentro c'è l'IATA di arrivo. */
  payload_grezzo: unknown;
};

/** L'aeroporto di arrivo, letto dal payload archiviato (AeroDataBox). */
function iataArrivoDaPayload(payload: unknown): string | null {
  const iata = (
    payload as { arrival?: { airport?: { iata?: string | null } | null } | null } | null
  )?.arrival?.airport?.iata;
  return typeof iata === "string" && iata.trim().length === 3 ? iata.trim().toUpperCase() : null;
}

type RigaVerifica = {
  esito: "idoneo" | "incerto" | "non_idoneo";
  importo: number | null;
  ritardo_minuti: number | null;
  versione_regole: string;
  /* Negato imbarco e coincidenza persa: il caso lo dichiara il
     passeggero e cambia la NORMA della lettera, non solo il testo. */
  caso_dichiarato: string | null;
  dichiarazione: unknown;
};

/**
 * Un campo della dichiarazione, letto senza fidarsi della forma.
 * Arriva da una colonna JSON: se un domani cambia struttura, qui si
 * torna null e la lettera perde una frase, invece di rompersi.
 */
function leggiDichiarazione(d: unknown, campo: string): string | null {
  if (!d || typeof d !== "object") return null;
  const v = (d as Record<string, unknown>)[campo];
  return typeof v === "string" && v ? v : null;
}

/** Il prezzo del declassamento, che nella dichiarazione è un numero. */
function leggiPrezzo(d: unknown): number | null {
  if (!d || typeof d !== "object") return null;
  const v = (d as Record<string, unknown>).prezzo;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

const dataIt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Il riquadro dei casi in cui la lettera non c'è ancora. */
function Avviso({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-bordo bg-white px-6 py-8">
      <h2 className="font-display text-xl tracking-[-0.03em]">{titolo}</h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{children}</p>
      <Link
        href="/app"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Torna all&apos;app
      </Link>
    </div>
  );
}

/**
 * 🔴 DA QUI NON SI TORNAVA INDIETRO. Valerio, 13/08: «apro la lettera e
 * resto bloccato nella pagina della lettera, fai che posso ritornare a
 * tutti gli step con pulsante indietro».
 *
 * Aveva ragione: in cima c'era «Torna all'app», che porta all'ELENCO
 * delle pratiche. Cioè per rientrare nella pratica da cui eri appena
 * uscito dovevi ritrovarla in una lista. Con una pratica sola non si
 * nota; con tre diventa un labirinto.
 *
 * Adesso il ritorno è alla PRATICA, che è il posto da cui sei arrivato e
 * dove stanno i passi. Sta in cima e si ripete in fondo: chi ha letto
 * tutto il foglio non deve risalire per uscire.
 */
function Cornice({ praticaId, children }: { praticaId: string | null; children: ReactNode }) {
  const indietro = praticaId ? `/pratica/${praticaId}` : "/app";
  const etichetta = praticaId ? "Torna alla pratica" : "Torna all'app";
  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="no-stampa sticky top-0 z-40 border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href={indietro}
            className="inline-flex items-center gap-1.5 rounded-bottone border border-bordo bg-white px-3.5 py-2 text-sm font-medium text-inchiostro transition-colors hover:bg-nebbia"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {etichetta}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">
        {children}
        <Link
          href={indietro}
          className="no-stampa inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {etichetta}
        </Link>
      </main>
    </div>
  );
}

/** Da quanti giorni è stato inviato il reclamo. Fuori dal componente:
 *  leggere l'orologio dentro il corpo di un componente è un effetto, e la
 *  regola di React lo vieta. */
function giorniPassati(inviataIl: string | null): number {
  if (!inviataIl) return 0;
  const t = Date.parse(inviataIl);
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : 0;
}

export default async function PaginaLettera({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  if (!SERVIZIO_ATTIVO) {
    return (
      <Cornice praticaId={id}>
        <Avviso titolo="Configurazione incompleta">
          Manca la chiave di servizio del database: la lettera non si può leggere. Riprova tra
          poco; se il problema resta, scrivici.
        </Avviso>
      </Cornice>
    );
  }

  const db = supabaseServizio();
  /* Come nella scheda dell'app: `rifiuto_motivo` arriva con la migrazione
     del 15/08, e finché non è applicata chiederla farebbe fallire tutta
     la lettura. Senza quel campo la lettera esce lo stesso. */
  const leggiPratica = (colonne: string) =>
    db.from("pratiche").select(colonne).eq("id", id).maybeSingle();
  const primoGiro = await leggiPratica(`${COLONNE_PRATICA}, rifiuto_motivo`);
  const pratica = (
    primoGiro.error && colonnaMancante(primoGiro.error.message)
      ? (await leggiPratica(COLONNE_PRATICA)).data
      : primoGiro.data
  ) as RigaPratica | null;

  // Il controllo del proprietario. Esplicito, prima di qualunque render:
  // chi non è il titolare non deve nemmeno sapere che la pratica esiste.
  if (!pratica || !pratica.utente_id || pratica.utente_id !== utente.id) redirect("/app");

  /* IL PASSO 1 SI CONTROLLA QUI, NON SOLO SUL BOTTONE. Dal 12/08 la
     lettera si apre dopo aver caricato la carta d'imbarco (scelta di
     Valerio col popup). Spegnere il bottone sulla pagina della pratica
     non basta: questo indirizzo si digita, sta nella cronologia del
     browser e finisce nei segnalibri. Chi arriva qui prima del tempo
     torna alla pratica, dove il passo c'è e si fa. */
  const eventi = await eventiPratica(pratica.id);
  /* ⚠️ Il muro dei documenti vale solo prima che il reclamo parta: dopo,
     aprire la lettera è un diritto già pagato. La regola sta in un posto
     solo (lib/pratiche/passi.ts) e questa pagina la chiede a lui, invece
     di riscriverla per conto suo come faceva prima. */
  if (!percorsoPratica(pratica.stato as StatoPratica, eventi, pratica.rifiuto_motivo ?? null).riquadri.letteraApribile) {
    redirect(`/pratica/${pratica.id}`);
  }

  if (pratica.stato === "creata") {
    return (
      <Cornice praticaId={id}>
        <Avviso titolo="La lettera arriva col pagamento">
          Questa pratica è aperta ma il pagamento non risulta ancora. Appena arriva, qui trovi la
          lettera pronta da copiare e inviare.
        </Avviso>
      </Cornice>
    );
  }

  const { data: volo } = pratica.volo_id
    ? ((await db
        .from("voli")
        .select(
          "volo_iata, data_locale, vettore_operativo, vettore_marketing, partenza_iata, arrivo_iata, arrivo_previsto_utc, arrivo_effettivo_utc, stato, km_ortodromica, fonte, fonti_discordanti, payload_grezzo",
        )
        .eq("id", pratica.volo_id)
        .maybeSingle()) as { data: RigaVolo | null })
    : { data: null };

  const { data: verifica } = pratica.verifica_id
    ? ((await db
        .from("verifiche")
        .select("esito, importo, ritardo_minuti, versione_regole, caso_dichiarato, dichiarazione")
        .eq("id", pratica.verifica_id)
        .maybeSingle()) as { data: RigaVerifica | null })
    : { data: null };

  /* 🔴 IL CASO DICHIARATO CAMBIA LA LETTERA, e non è un dettaglio.
     Negato imbarco e coincidenza persa hanno una norma diversa da quella
     del ritardo: fino all'11/08 finivano tutti nella lettera del ritardo
     e uscivano così, chiedendo 400 euro accanto a «ritardo 2 h e 35» e
     citando la regola delle TRE ore. Una lettera che si contraddice da
     sola, pagata 14,90. Il declassamento (art. 10) ha la SUA lettera e
     un importo che non è una fascia ma una quota del prezzo. */
  const dichiarato =
    verifica?.caso_dichiarato === "negato" || verifica?.caso_dichiarato === "coincidenza"
      ? {
          caso: verifica.caso_dichiarato as "negato" | "coincidenza",
          ritardoFinale: leggiDichiarazione(verifica.dichiarazione, "ritardoFinale"),
          destinazioneFinale: leggiDichiarazione(verifica.dichiarazione, "destinazioneFinale"),
        }
      : verifica?.caso_dichiarato === "declassamento"
        ? { caso: "declassamento" as const, prezzo: leggiPrezzo(verifica.dichiarazione) }
        : null;

  /* L'importo: per ritardo, negato e coincidenza è una delle fasce note;
     per il declassamento è una quota del prezzo, quindi un numero
     qualsiasi positivo. Il controllo sulle fasce esiste per non far
     uscire una lettera con un importo sballato, ma su una quota va tolto,
     se no il declassamento non passerebbe mai. */
  const importo =
    dichiarato?.caso === "declassamento"
      ? typeof verifica?.importo === "number" && verifica.importo > 0
        ? verifica.importo
        : undefined
      : verifica && ([250, 300, 400, 600] as const).find((i) => i === verifica.importo);

  /* Il ritardo serve SOLO alla lettera del ritardo: per un negato
     imbarco non esiste un arrivo da confrontare, e pretenderlo qui
     bloccava la lettera di un caso perfettamente valido. */
  if (
    !volo ||
    !verifica ||
    verifica.esito !== "idoneo" ||
    !importo ||
    (!dichiarato && verifica.ritardo_minuti === null)
  ) {
    return (
      <Cornice praticaId={id}>
        <Avviso titolo="Qui manca un pezzo">
          Per scrivere la lettera servono i dati del volo e un verdetto idoneo, e a questa pratica
          ne manca uno. Non è normale: scrivici rispondendo a una qualsiasi email della pratica e
          la sistemiamo noi.
        </Avviso>
      </Cornice>
    );
  }

  /* Il fatto e il verdetto, ricostruiti da quanto ARCHIVIATO al momento
     della verifica: la lettera deve dire ciò che è stato venduto, con la
     versione delle regole del suo tempo, non un ricalcolo di oggi. */
  const fatto: FattoVolo = {
    voloIata: volo.volo_iata,
    dataLocale: volo.data_locale,
    vettoreOperativo: volo.vettore_operativo ?? "",
    vettoreMarketing: volo.vettore_marketing,
    /* Servono a scegliere l'organismo nazionale giusto: la competenza e'
       dello Stato dell'aeroporto di PARTENZA (art. 16 par. 1). */
    partenzaIata: volo.partenza_iata,
    arrivoIata: volo.arrivo_iata,
    arrivoPrevistoUtc: volo.arrivo_previsto_utc,
    arrivoEffettivoUtc: volo.arrivo_effettivo_utc,
    stato: volo.stato,
    kmOrtodromica: volo.km_ortodromica,
    fontiDiscordanti: volo.fonti_discordanti,
    fonte: volo.fonte,
  };

  const verdetto: Verdetto = {
    esito: "idoneo",
    importo,
    ritardoMinuti: verifica.ritardo_minuti ?? 0,
    motivo: "",
    versioneRegole: verifica.versione_regole,
  };

  /* La riga meteo che disinnesca la scusa "maltempo": SPENTA finché
     Valerio non sottoscrive il piano commerciale di Open-Meteo
     (OPENMETEO_COMMERCIALE=1). Ogni buco nella catena = niente riga,
     la lettera non muore mai per il meteo. */
  let meteo: string | null = null;
  if (METEO_ATTIVO && volo.arrivo_effettivo_utc) {
    const scalo = aeroporto(iataArrivoDaPayload(volo.payload_grezzo));
    if (scalo) {
      meteo = fraseMeteo(
        await meteoStorico(
          scalo.lat,
          scalo.lon,
          volo.arrivo_effettivo_utc.slice(0, 10),
          volo.arrivo_effettivo_utc,
        ),
      );
    }
  }

  const lettera = generaReclamo(
    { passeggeri: pratica.passeggeri ?? [], tipo: pratica.tipo, email: pratica.email },
    fatto,
    verdetto,
    { meteo, dichiarato },
  );

  if (!lettera) {
    return (
      <Cornice praticaId={id}>
        <Avviso titolo="Qui manca un pezzo">
          Mancano gli orari archiviati del volo, e senza quelli la lettera non si scrive.
          Scrivici rispondendo a una qualsiasi email della pratica e la sistemiamo noi.
        </Avviso>
      </Cornice>
    );
  }

  /* IL SECONDO COLPO. Compare quando serve davvero: o la compagnia ha
     già risposto no (e allora il motivo dichiarato decide la replica), o
     sono passate sei settimane di silenzio. Prima non si mostra: un
     sollecito mandato al giorno 10 arriva quando nessuno ha ancora
     aperto la pratica, e ci fa sembrare automatici. */
  const motivoRifiuto = (pratica.rifiuto_motivo ?? null) as MotivoRifiuto | null;
  const giorniDallInvio = giorniPassati(pratica.inviata_il);
  const scheda = schedaRifiuto(motivoRifiuto);
  const sollecito =
    pratica.inviata_il && prontoPerSollecito(giorniDallInvio, motivoRifiuto)
      ? generaSollecito(
          { passeggeri: pratica.passeggeri ?? [], tipo: pratica.tipo, email: pratica.email },
          fatto,
          verdetto,
          pratica.inviata_il.slice(0, 10),
          motivoRifiuto,
          /* Il paragrafo scritto sui fatti che LORO hanno dichiarato, se
             il cliente ci ha dato la loro risposta e il controllo l'ha
             lasciato passare. Senza, la replica resta quella fissa. */
          paragrafoSuMisura(eventi),
        )
      : null;

  /* IL TERZO COLPO. Compare solo quando il secondo è stato dato e ha
     avuto il suo tempo: due settimane, che è il termine che il sollecito
     stesso concede. Mandare all'ente prima significa farsi rispondere
     "il vettore ha ancora tempo". */
  const segnalazione =
    sollecito && giorniDallInvio >= GIORNI_PRIMA_DEL_SOLLECITO + GIORNI_PRIMA_DELL_ENTE
      ? generaSegnalazioneEnte(
          { passeggeri: pratica.passeggeri ?? [], tipo: pratica.tipo, email: pratica.email },
          fatto,
          verdetto,
          pratica.inviata_il ? pratica.inviata_il.slice(0, 10) : null,
          null,
          motivoRifiuto,
        )
      : null;

  /* IL QUARTO COLPO: la conciliazione. Non segue il nostro calendario ma
     quello dell'organismo: serve il reclamo già mandato e poi 30 giorni
     di silenzio, oppure una risposta che non soddisfa. Un no dichiarato
     è una risposta che non soddisfa, quindi apre subito. */
  const conciliazione =
    verdetto.esito === "idoneo" &&
    pratica.inviata_il &&
    prontoPerConciliazione(giorniDallInvio, Boolean(motivoRifiuto && motivoRifiuto !== "silenzio"))
      ? conciliazionePerPartenza(volo.partenza_iata)
      : null;

  const compagnia =
    compagniaPerVettore(volo.vettore_operativo) ?? compagniaPerVettore(volo.volo_iata);
  /* Dove va la lettera, deciso una volta sola (vedi modoInvio): email se
     la compagnia ne pubblica una, altrimenti il suo modulo ufficiale.
     Mai "cercatelo tu". */
  const invio = modoInvio(compagnia);
  const organismo = istruzioniOrganismo(volo.partenza_iata);
  const passeggeriDaCompilare = (pratica.passeggeri ?? []).length === 0;

  /* Il riferimento in cima al foglio, al posto del numero di protocollo.
     ⚠️ NON è un numero inventato da noi: è il volo e la sua data, cioè
     le due cose che l'ufficio reclami usa per ritrovare il caso. Un
     "Prot. 2026/0001" darebbe l'aria di un ufficio che non esiste, e al
     primo cliente si vedrebbe pure che è il numero uno. */
  const protocollo = `${volo.volo_iata} · ${dataIt(volo.data_locale)}`;

  /**
   * 🔴 QUAL È LA LETTERA DI ADESSO.
   *
   * Valerio, 13/08: «la pagina della lettera è un chilometro, è tutto
   * così necessario?». Il collaudo ha trovato di peggio della lunghezza:
   * dopo un no della compagnia questa pagina si apriva ancora con «La tua
   * lettera è pronta» e col bottone verde che apriva l'email **del
   * reclamo già mandato**. Cioè il gesto più in vista della pagina
   * rimandava lo stesso documento una seconda volta, mentre la replica
   * (quella che serve adesso) stava sotto quattro riquadri, senza
   * bottone per mandarla.
   *
   * Adesso in cima c'è SEMPRE il documento del momento, con il suo
   * bottone. Gli altri restano, chiusi, in fondo: servono a rileggere
   * cosa si è già mandato, non a essere rimandati.
   */
  const attuale = segnalazione
    ? {
        chiave: "ente" as const,
        titolo: "La segnalazione all'ente è pronta.",
        sotto:
          "Premi il bottone: si apre la tua email con tutto già scritto. L'indirizzo dell'ente è qui sotto.",
        oggetto: segnalazione.oggetto,
        corpo: segnalazione.corpo,
      }
    : sollecito
      ? {
          chiave: "replica" as const,
          titolo:
            scheda && scheda.motivo !== "silenzio"
              ? "La risposta al loro no è pronta."
              : "Il sollecito è pronto.",
          sotto: "Premi il bottone: si apre la tua email con tutto già scritto. Tu premi Invia.",
          oggetto: sollecito.oggetto,
          corpo: sollecito.corpo,
        }
      : {
          chiave: "reclamo" as const,
          titolo: "La tua lettera è pronta.",
          sotto: "Premi il bottone: si apre la tua email con tutto già scritto. Tu premi Invia.",
          oggetto: lettera.oggetto,
          corpo: lettera.corpo,
        };
  /** Vero quando il reclamo non è più il documento del momento. */
  const reclamoDaArchivio = attuale.chiave !== "reclamo";

  return (
    <Cornice praticaId={id}>
      {/* ------------------------------------------------ la testata */}
      <div className="no-stampa">
        <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em]">
          {attuale.titolo}
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">{attuale.sotto}</p>
      </div>

      {/* ---------------------------------- IL BOTTONE, prima di tutto.
          🔴 Valerio, 12/08: «nella parte in cui apro le pratiche non si
          capisce un cazzo, è un ammasso di regole, di indicazioni, di
          testo lungo chilometri». Aveva ragione: prima del documento
          c'erano due riquadri di spiegazioni, e l'unica cosa da fare
          (mandare la lettera) stava in fondo dietro "copia il testo".
          Adesso in cima c'è il gesto, e le spiegazioni stanno sotto,
          chiuse: chi le vuole le apre. */}
      <section className="no-stampa rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-6">
        <ApriEmail modo={invio} oggetto={attuale.oggetto} corpo={attuale.corpo} />
      </section>

      {/* ------------------------------------------------ a chi va */}
      <details className="no-stampa group rounded-2xl border border-bordo bg-white px-6 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-display text-lg tracking-[-0.03em] marker:hidden">
          A chi la mandi
          <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        {compagnia ? (
          <div className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed">
            <p>
              <span className="font-medium">{compagnia.nome}</span>{" "}
              <span className="text-fumo">({compagnia.nomeLegale})</span>
            </p>
            <p className="text-fumo">{compagnia.canale}</p>
            <a
              href={compagnia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-verde hover:text-verde-scuro"
            >
              <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              {compagnia.url}
            </a>
            {compagnia.verificato ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fumo">
                <ShieldCheck className="size-4 text-verde" aria-hidden="true" />
                Canale verificato il {dataIt(compagnia.verificatoIl)}.
              </p>
            ) : (
              /* Il canale c'è ed è sul dominio della compagnia: quello che
                 non abbiamo potuto confermare è che sia il modulo DEI
                 RECLAMI e non l'assistenza generica. Si dice, e si dice
                 anche cosa fare arrivati lì: prima c'era scritto "cerca
                 reclami sul sito ufficiale", che è mandare la persona a
                 fare il lavoro nostro. */
              <p className="mt-1 flex items-start gap-1.5 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed text-inchiostro">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Questa è la pagina di assistenza ufficiale, non il modulo reclami dedicato:
                  arrivato lì, scegli la voce che parla di ritardo, cancellazione o diritti del
                  passeggero. La lettera è la stessa.
                </span>
              </p>
            )}
            {compagnia.accettaIntermediari === false && (
              <p className="mt-1 text-sm leading-relaxed text-fumo">
                {compagnia.nome} dichiara di lavorare solo i reclami mandati dal passeggero. È il
                motivo per cui la lettera parte dalla tua casella: così la compensazione ti arriva
                intera.
              </p>
            )}
            {compagnia.indirizzoPostale && (
              <p className="mt-1 text-sm leading-relaxed text-fumo-2">
                Sede legale, se un giorno servisse la raccomandata: {compagnia.indirizzoPostale}.
              </p>
            )}
          </div>
        ) : (
          /* 🔴 Qui c'era scritto: «Non abbiamo in archivio il canale
             reclami di questa compagnia. Cerca "reclami" sul sito
             ufficiale». Valerio, 12/08: «ma che cazzo vuol dire, stai
             dicendo all'utente cercati le cose e fatti mille ricerche da
             solo». Aveva ragione. Adesso l'indirizzo si dice DOVE STA, e
             sta in un posto che ha chiunque abbia volato: in fondo
             all'email di conferma della prenotazione, ogni compagnia ci
             mette il proprio servizio clienti. Un posto, non una ricerca. */
          <div className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed">
            <p>
              <span className="font-medium">
                {volo.vettore_operativo ?? volo.volo_iata.slice(0, 2)}
              </span>{" "}
              <span className="text-fumo">(compagnia non ancora in archivio)</span>
            </p>
            <p className="text-fumo">
              L&apos;indirizzo del loro servizio clienti è in fondo all&apos;email di conferma
              della prenotazione: ogni compagnia lo scrive lì. Copia la lettera qui sopra e
              mandala a quell&apos;indirizzo.
            </p>
            <p className="text-sm leading-relaxed text-fumo-2">
              Se non rispondono, il passo dopo è la segnalazione all&apos;organismo nazionale, e
              quel documento lo prepariamo noi: compare qui sotto quando è il momento.
            </p>
          </div>
        )}
      </details>

      {/* --------------------- perché la replica dice quello che dice.
          Sta PRIMA del documento, non dopo: è il motivo per cui quel
          testo è fatto così, e leggerlo dopo non serve a niente. */}
      {attuale.chiave === "replica" && sollecito && (
        <section className="no-stampa rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-verde">
            Il secondo colpo
          </p>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-verde-notte/85">
            {scheda && scheda.motivo !== "silenzio"
              ? scheda.spiegazione
              : `Le compagnie rispondono in otto-quattordici settimane, quindi il silenzio a questo punto è normale. Ma da oggi ${GIORNI_PRIMA_DEL_SOLLECITO} giorni sono passati, e mettere agli atti che non hanno risposto serve al passo dopo: la segnalazione all'ente nazionale.`}
          </p>
          {scheda && scheda.peso === "dipende" && (
            <p className="mt-3 max-w-xl rounded-xl bg-white/70 px-4 py-3 text-sm leading-relaxed text-verde-notte">
              Qui non ti prometto niente: su questo motivo la compagnia può avere ragione. La
              replica serve a farglielo dimostrare, che è una cosa diversa.
            </p>
          )}
          {scheda && (
            <p className="mt-4 text-xs leading-relaxed text-verde-notte/70">
              Su cosa si fonda: {scheda.riferimenti.join(" · ")}
            </p>
          )}
        </section>
      )}

      {/* ------------------------------------------------ il foglio */}
      <Foglio
        id="foglio"
        atto={
          attuale.chiave === "ente"
            ? "Segnalazione all'organismo nazionale · art. 16 Reg. (CE) 261/2004"
            : attuale.chiave === "replica"
              ? scheda && scheda.motivo !== "silenzio"
                ? "Replica al diniego · Reg. (CE) 261/2004"
                : "Sollecito · Reg. (CE) 261/2004"
              : "Reclamo · Reg. (CE) 261/2004"
        }
        riferimento={protocollo}
        oggetto={attuale.oggetto}
        corpo={attuale.corpo}
      />

      {/* ------------------------------------------------ le azioni
          🔴 Erano collegate da uno <script> nel JSX, che non viene mai
          eseguito: due bottoni finti. Vedi components/pratica/AzioniFoglio. */}
      <AzioniFoglio oggetto={attuale.oggetto} corpo={attuale.corpo} />

      <p className="no-stampa rounded-xl bg-menta-tenue px-4 py-3 text-sm leading-relaxed text-verde-notte">
        Una cosa sola prima di premere Invia: al posto di [da compilare] metti il tuo IBAN
        {passeggeriDaCompilare ? " e il tuo nome" : ""}.
      </p>

      {/* ------------------------------------------------ gli allegati */}
      <details className="no-stampa group rounded-2xl border border-bordo bg-white px-6 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-display text-lg tracking-[-0.03em] marker:hidden">
          <span className="flex items-center gap-2">
            <Paperclip className="size-4.5 text-verde" aria-hidden="true" />
            Cosa allegare
          </span>
          <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <ul className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed text-fumo">
          {ALLEGATI.map((a) => (
            <li key={a} className="flex gap-2.5">
              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-verde" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </details>

      {/* ------------------------------------------------ se tacciono
          🔴 «PERCHÉ IL BOX DELL'ENAC APPARE SEMPRE? Non è necessario al
          primo invio!» (Valerio, 13/08). Aveva ragione: le istruzioni per
          l'ente stavano sotto il reclamo dal primo giorno, cioè sei
          settimane prima che servissero. Adesso compaiono quando l'ente è
          davvero il passo del momento. */}
      {attuale.chiave === "ente" && (
      <details className="no-stampa group rounded-2xl border border-bordo bg-white px-6 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-display text-lg tracking-[-0.03em] marker:hidden">
          {organismo.titolo}
          <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{organismo.premessa}</p>
        <ol className="mt-3 flex list-none flex-col gap-2 text-[0.95rem] leading-relaxed text-fumo">
          {organismo.passi.map((passo, i) => (
            <li key={passo} className="flex gap-3">
              <span className="numeri mt-0.5 font-medium text-verde">{i + 1}.</span>
              {passo}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-col gap-1.5">
          <a
            href={organismo.urlPortale}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-verde hover:text-verde-scuro"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            {organismo.urlPortale}
          </a>
          <a
            href={organismo.urlModalita}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-sm text-fumo hover:text-inchiostro"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            Le regole del reclamo, sul sito ENAC
          </a>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-fumo-2">{organismo.avvertenza}</p>
      </details>
      )}

      {/* ------ quando l'ente è il documento di adesso, si dice cos'è */}
      {attuale.chiave === "ente" && (
        <section className="no-stampa rounded-2xl border border-sole/40 bg-sole/10 px-6 py-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-inchiostro/60">
            Il terzo colpo
          </p>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-inchiostro/80">
            È il passo che le compagnie non ignorano: l&apos;ente accerta la violazione e può
            sanzionarle. Dirti come funziona davvero: <span className="font-medium">non ti paga
            lui</span>, la compensazione resta una cosa fra te e la compagnia. Serve a farla
            muovere, e di solito funziona.
          </p>
          <div className="mt-4">
            <Button asChild variant="contorno">
              <Link href="/giudice-di-pace">Se anche l&apos;ente non basta</Link>
            </Button>
          </div>
        </section>
      )}

      {/* ------------------------------- quello che hai già mandato.
          🔴 Prima stavano tutti aperti, uno sotto l'altro, e il primo
          della fila era il reclamo di sei settimane prima: la pagina
          diventava un chilometro e la cosa da fare ADESSO era la più
          nascosta. Adesso i documenti vecchi sono un cassetto chiuso:
          servono a rileggere cosa è stato mandato, non a essere
          rimandati. */}
      {reclamoDaArchivio && (
        <details className="no-stampa group rounded-2xl border border-bordo bg-white px-6 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-display text-lg tracking-[-0.03em] marker:hidden">
            Quello che hai già mandato
            <span aria-hidden="true" className="text-fumo-2 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-fumo">
            Sono qui per essere riletti. Il documento da mandare adesso è quello in cima alla
            pagina.
          </p>

          <div className="mt-4">
            <Foglio
              id="foglio-reclamo"
              atto="Reclamo · Reg. (CE) 261/2004"
              riferimento={protocollo}
              oggetto={lettera.oggetto}
              corpo={lettera.corpo}
            />
          </div>

          {attuale.chiave === "ente" && sollecito && (
            <div className="mt-4">
              <Foglio
                id="foglio-replica"
                atto={
                  scheda && scheda.motivo !== "silenzio"
                    ? "Replica al diniego · Reg. (CE) 261/2004"
                    : "Sollecito · Reg. (CE) 261/2004"
                }
                riferimento={protocollo}
                oggetto={sollecito.oggetto}
                corpo={sollecito.corpo}
              />
            </div>
          )}
        </details>
      )}

      {/* ------------------------------------------- il quarto colpo */}
      {conciliazione && (
        <section className="no-stampa rounded-2xl border border-verde/25 bg-verde/[0.06] px-6 py-7 sm:px-8">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-verde-scuro">
            Il quarto colpo
          </p>
          <h2 className="mt-2 font-display text-xl tracking-[-0.03em]">{conciliazione.titolo}</h2>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-inchiostro/80">
            {conciliazione.premessa}
          </p>

          <ol className="mt-5 space-y-3 text-[0.95rem] leading-relaxed">
            {conciliazione.passi.map((passo, i) => (
              <li key={passo} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-verde/15 text-[0.75rem] font-semibold text-verde-scuro">
                  {i + 1}
                </span>
                <span>{passo}</span>
              </li>
            ))}
          </ol>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-fumo-2">
                Quanto costa
              </dt>
              <dd className="mt-1 text-[0.95rem] leading-relaxed">{conciliazione.costo}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-fumo-2">
                Entro quando
              </dt>
              <dd className="mt-1 text-[0.95rem] leading-relaxed">{conciliazione.scadenza}</dd>
            </div>
          </dl>

          <p className="mt-6 flex gap-2.5 rounded-xl border border-bordo bg-white px-4 py-3 text-sm leading-relaxed text-fumo">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-sole" aria-hidden="true" />
            <span>{conciliazione.avvertenza}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href={conciliazione.url} target="_blank" rel="noopener noreferrer">
                Apri {conciliazione.sigla ?? conciliazione.nome}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="contorno">
              <Link href="/giudice-di-pace">E se non basta nemmeno questo</Link>
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-fumo-2">
            Fonte: {conciliazione.fonte}
          </p>
        </section>
      )}

      <p className="no-stampa text-sm leading-relaxed text-fumo-2">
        {sollecito
          ? "Mandalo dalla stessa casella del primo reclamo, in risposta al messaggio di prima se ce l'hai ancora: così la loro pratica resta una sola. Se anche stavolta non rispondono, il passo dopo è l'ente nazionale, e te lo prepariamo noi."
          : "Quando l'hai inviata, tienila: ti scriviamo noi al momento giusto per il sollecito, col testo già pronto. E se la compagnia non paga, vale la garanzia: ti rimborsiamo la pratica per intero."}
      </p>

      {/* Il testo per i bottoni di copia: invisibile, mai stampato. */}

      { }
      <style dangerouslySetInnerHTML={{ __html: CSS_STAMPA }} />
      { }
    </Cornice>
  );
}

/**
 * In stampa resta solo il foglio: carta bianca, niente interfaccia.
 *
 * ⚠️ Il vestito del foglio (fascia, piede, margini di pagina) sta in
 * `globals.css` sotto `.foglio`, perché è del componente e vale ovunque
 * lo si monti. Qui resta solo quello che riguarda QUESTA pagina: cosa
 * sparisce e come si dispone il contenitore.
 */
const CSS_STAMPA = `
@media print {
  .no-stampa { display: none !important; }
  body { background: #fff !important; }
  main { max-width: none !important; padding: 0 !important; gap: 0 !important; }
  header { display: none !important; }
}
`;

