import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, Copy, ExternalLink, Paperclip, Printer, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { compagniaPerVettore } from "@/lib/lettera/compagnie";
import { ALLEGATI, generaReclamo, testoEnac } from "@/lib/lettera/genera";
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
};

type RigaVolo = {
  volo_iata: string;
  data_locale: string;
  vettore_operativo: string | null;
  vettore_marketing: string | null;
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
};

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

function Cornice({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="no-stampa border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
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
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}

export default async function PaginaLettera({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  if (!SERVIZIO_ATTIVO) {
    return (
      <Cornice>
        <Avviso titolo="Configurazione incompleta">
          Manca la chiave di servizio del database: la lettera non si può leggere. Riprova tra
          poco; se il problema resta, scrivici.
        </Avviso>
      </Cornice>
    );
  }

  const db = supabaseServizio();
  const { data: pratica } = (await db
    .from("pratiche")
    .select("id, utente_id, volo_id, verifica_id, stato, tipo, passeggeri, inviata_il")
    .eq("id", id)
    .maybeSingle()) as { data: RigaPratica | null };

  // Il controllo del proprietario. Esplicito, prima di qualunque render:
  // chi non è il titolare non deve nemmeno sapere che la pratica esiste.
  if (!pratica || !pratica.utente_id || pratica.utente_id !== utente.id) redirect("/app");

  if (pratica.stato === "creata") {
    return (
      <Cornice>
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
          "volo_iata, data_locale, vettore_operativo, vettore_marketing, arrivo_previsto_utc, arrivo_effettivo_utc, stato, km_ortodromica, fonte, fonti_discordanti, payload_grezzo",
        )
        .eq("id", pratica.volo_id)
        .maybeSingle()) as { data: RigaVolo | null })
    : { data: null };

  const { data: verifica } = pratica.verifica_id
    ? ((await db
        .from("verifiche")
        .select("esito, importo, ritardo_minuti, versione_regole")
        .eq("id", pratica.verifica_id)
        .maybeSingle()) as { data: RigaVerifica | null })
    : { data: null };

  const importo =
    verifica && ([250, 300, 400, 600] as const).find((i) => i === verifica.importo);

  if (!volo || !verifica || verifica.esito !== "idoneo" || !importo || verifica.ritardo_minuti === null) {
    return (
      <Cornice>
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
    ritardoMinuti: verifica.ritardo_minuti,
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
    { passeggeri: pratica.passeggeri ?? [], tipo: pratica.tipo },
    fatto,
    verdetto,
    { meteo },
  );

  if (!lettera) {
    return (
      <Cornice>
        <Avviso titolo="Qui manca un pezzo">
          Mancano gli orari archiviati del volo, e senza quelli la lettera non si scrive.
          Scrivici rispondendo a una qualsiasi email della pratica e la sistemiamo noi.
        </Avviso>
      </Cornice>
    );
  }

  const compagnia =
    compagniaPerVettore(volo.vettore_operativo) ?? compagniaPerVettore(volo.volo_iata);
  const enac = testoEnac();
  const passeggeriDaCompilare = (pratica.passeggeri ?? []).length === 0;

  return (
    <Cornice>
      {/* ------------------------------------------------ la testata */}
      <div className="no-stampa">
        <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em]">
          La tua lettera è pronta.
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
          La invii tu, dalla tua email. È un tuo diritto e non serve nessun intermediario: le
          compagnie, Ryanair per prima, trattano meglio i passeggeri che scrivono in proprio.
          Quello che recuperi resta tuo al 100%.
        </p>
      </div>

      {/* ------------------------------------------------ a chi va */}
      <section className="no-stampa rounded-2xl border border-bordo bg-white px-6 py-5">
        <h2 className="font-display text-lg tracking-[-0.03em]">A chi la mandi</h2>
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
              <p className="mt-1 flex items-start gap-1.5 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed text-inchiostro">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Questo è il canale assistenza generico: al {dataIt(compagnia.verificatoIl)} non
                  abbiamo trovato con certezza il modulo reclami. Prima di inviare, cerca
                  &quot;reclami&quot; sul sito ufficiale della compagnia.
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Non abbiamo in archivio il canale reclami di questa compagnia. Cerca
              &quot;reclami&quot; sul sito ufficiale del vettore che ha operato il volo e usa il
              suo modulo: mai un intermediario.
            </span>
          </p>
        )}
      </section>

      {/* ------------------------------------------------ il foglio */}
      <section id="foglio" className="rounded-2xl border border-bordo bg-white px-6 py-7 sm:px-9 sm:py-9">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[0.95rem] leading-relaxed">
            <span className="font-medium">Oggetto:</span> {lettera.oggetto}
          </p>
          <button
            type="button"
            data-copia="#t-oggetto"
            className="no-stampa inline-flex shrink-0 items-center gap-1.5 rounded-pillola border border-bordo bg-nebbia px-3 py-1.5 text-xs font-medium text-fumo transition-colors hover:border-verde/40 hover:text-inchiostro"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            <span data-etichetta>Copia l&apos;oggetto</span>
          </button>
        </div>
        <hr className="my-5 border-bordo" />
        <div className="whitespace-pre-wrap text-[0.95rem] leading-[1.75]">{lettera.corpo}</div>
      </section>

      {/* ------------------------------------------------ le azioni */}
      <div className="no-stampa flex flex-wrap items-center gap-3">
        <Button type="button" data-copia="#t-corpo">
          <Copy className="size-4" aria-hidden="true" />
          <span data-etichetta>Copia il testo email</span>
        </Button>
        <Button type="button" variant="contorno" data-stampa>
          <Printer className="size-4" aria-hidden="true" />
          Stampa o salva in PDF
        </Button>
      </div>

      <p className="no-stampa rounded-xl bg-menta-tenue px-4 py-3 text-sm leading-relaxed text-verde-notte">
        Prima di inviare, sostituisci i campi tra parentesi quadre: le coordinate per il
        pagamento{passeggeriDaCompilare ? ", i nomi dei passeggeri" : ""} e la data.
      </p>

      {/* ------------------------------------------------ gli allegati */}
      <section className="no-stampa rounded-2xl border border-bordo bg-white px-6 py-5">
        <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
          <Paperclip className="size-4.5 text-verde" aria-hidden="true" />
          Nella tua email allega
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed text-fumo">
          {ALLEGATI.map((a) => (
            <li key={a} className="flex gap-2.5">
              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-verde" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ se tacciono */}
      <section className="no-stampa rounded-2xl border border-bordo bg-white px-6 py-5">
        <h2 className="font-display text-lg tracking-[-0.03em]">{enac.titolo}</h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{enac.premessa}</p>
        <ol className="mt-3 flex list-none flex-col gap-2 text-[0.95rem] leading-relaxed text-fumo">
          {enac.passi.map((passo, i) => (
            <li key={passo} className="flex gap-3">
              <span className="numeri mt-0.5 font-medium text-verde">{i + 1}.</span>
              {passo}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-col gap-1.5">
          <a
            href={enac.urlPortale}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-verde hover:text-verde-scuro"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            {enac.urlPortale}
          </a>
          <a
            href={enac.urlModalita}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-sm text-fumo hover:text-inchiostro"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            Le regole del reclamo, sul sito ENAC
          </a>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-fumo-2">{enac.avvertenza}</p>
      </section>

      <p className="no-stampa text-sm leading-relaxed text-fumo-2">
        Quando l&apos;hai inviata, tienila: ti scriviamo noi al momento giusto per il sollecito,
        col testo già pronto. E se la compagnia non paga, vale la garanzia: ti rimborsiamo la
        pratica per intero.
      </p>

      {/* Il testo per i bottoni di copia: invisibile, mai stampato. */}
      <textarea id="t-oggetto" hidden readOnly defaultValue={lettera.oggetto} />
      <textarea id="t-corpo" hidden readOnly defaultValue={lettera.corpo} />

      { }
      <style dangerouslySetInnerHTML={{ __html: CSS_STAMPA }} />
      { }
      <script dangerouslySetInnerHTML={{ __html: COPIONE }} />
    </Cornice>
  );
}

/** In stampa resta solo il foglio: carta bianca, niente interfaccia. */
const CSS_STAMPA = `
@page { margin: 2cm; }
@media print {
  .no-stampa { display: none !important; }
  body { background: #fff !important; }
  #foglio {
    border: 0 !important;
    border-radius: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  main { max-width: none !important; padding: 0 !important; gap: 0 !important; }
  header { display: none !important; }
}
`;

/**
 * La copia negli appunti. Niente framework: due bottoni, un listener.
 * Se la clipboard è negata (http, permessi), ripiega su select + copy;
 * se fallisce anche quello, lo dice invece di fingere.
 */
const COPIONE = `
(function () {
  function trova(sel) { return document.querySelector(sel); }
  document.querySelectorAll("[data-copia]").forEach(function (bottone) {
    bottone.addEventListener("click", function () {
      var area = trova(bottone.getAttribute("data-copia"));
      if (!area) return;
      var etichetta = bottone.querySelector("[data-etichetta]") || bottone;
      var prima = etichetta.textContent;
      function esito(ok) {
        etichetta.textContent = ok ? "Copiato." : "Non riesco: copia a mano dal foglio";
        setTimeout(function () { etichetta.textContent = prima; }, 2200);
      }
      function ripiego() {
        var ok = false;
        area.hidden = false;
        area.select();
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        area.hidden = true;
        esito(ok);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(function () { esito(true); }, ripiego);
      } else {
        ripiego();
      }
    });
  });
  var stampa = document.querySelector("[data-stampa]");
  if (stampa) stampa.addEventListener("click", function () { window.print(); });
})();
`;
