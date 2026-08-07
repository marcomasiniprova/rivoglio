import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Risultato, { type DatiVerifica } from "@/components/verifica/Risultato";
import { COPY } from "@/lib/copy";
import { scadenzaStimata, valuta } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { demo as fornitoreDemo } from "@/lib/voli/fornitori/demo";
import { normalizzaData, normalizzaVolo } from "@/lib/voli/normalizza";

/**
 * /verifica/[id]: la pagina del risultato. Il momento che vale metà
 * del progetto (SPEC §8): qui vive il reveal.
 *
 * È PUBBLICA e senza login, per scelta (SPEC §3: niente prima del
 * reveal). Regge perché:
 * - l'id è un UUID casuale: lo conosce solo chi ha fatto il check
 *   (o chi riceve il link, ed è il punto: si condivide);
 * - la pagina non mostra MAI dati personali: l'email della verifica
 *   non viene nemmeno letta dalla query.
 *
 * Due forme di id:
 * - UUID → riga vera in `verifiche`, letta col client di servizio;
 * - "demo-ZZ250-2026-08-06" → esempio dimostrativo ricalcolato dal
 *   fornitore demo, senza database e senza chiavi. Serve all'anteprima
 *   e alle prove; il fornitore demo risponde SOLO ai voli ZZ, quindi
 *   da qui non esce mai un dato che sembra vero.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Il titolo non anticipa il verdetto: il reveal avviene nella pagina.
  title: "Il risultato del tuo check | Rivoglio",
  robots: { index: false },
};

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEMO_OK = /^demo-([a-z0-9]{2,8})-([0-9]{4}-[0-9]{2}-[0-9]{2})$/i;

/** Gli unici valori ammessi per ?checkout=: tutto il resto si ignora. */
function avvisoCheckoutDa(grezzo: string | string[] | undefined): DatiVerifica["avvisoCheckout"] {
  return grezzo === "demo" || grezzo === "non-attivo" || grezzo === "errore" || grezzo === "recesso"
    ? grezzo
    : null;
}

/** I checkout link Polar configurati: il client non tocca mai gli env. */
function checkoutConfigurato() {
  return {
    singola: Boolean(process.env.POLAR_CHECKOUT_PRATICA),
    famiglia: Boolean(process.env.POLAR_CHECKOUT_FAMIGLIA),
  };
}

/* --------------------------------------------------------- la cornice */

function Cornice({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/"
            className="text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            {COPY.risultato.nonIdoneo.cta}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}

/** Il pannello dei casi in cui il risultato non c'è: chiaro, con l'uscita. */
function Pannello({
  titolo,
  testo,
  cta,
}: {
  titolo: string;
  testo: string;
  cta?: string;
}) {
  return (
    <div className="rounded-2xl border border-bordo bg-white px-6 py-8">
      <h1 className="font-display text-[1.6rem] leading-tight tracking-[-0.035em]">{titolo}</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{testo}</p>
      {cta && (
        <Button asChild className="mt-6">
          <Link href="/">{cta}</Link>
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ i dati */

/** La riga di `verifiche` col volo agganciato. L'email NON si legge. */
type RigaVerifica = {
  id: string;
  volo_iata: string;
  data_locale: string;
  esito: "idoneo" | "incerto" | "non_idoneo";
  importo: number | null;
  ritardo_minuti: number | null;
  motivo: string | null;
  conferma: "automatica" | "in_attesa" | "confermata" | "corretta";
  voli: {
    arrivo_previsto_utc: string | null;
    arrivo_effettivo_utc: string | null;
    km_ortodromica: number | null;
    vettore_operativo: string | null;
    fonte: string;
  } | null;
};

/** Ricostruisce un esempio dimostrativo, senza database e senza chiavi. */
async function datiDemo(
  idPagina: string,
  voloGrezzo: string,
  dataGrezza: string,
  avvisoCheckout: DatiVerifica["avvisoCheckout"],
): Promise<DatiVerifica | { errore: string } | null> {
  const volo = normalizzaVolo(voloGrezzo);
  if (!volo.ok) return { errore: volo.errore };
  const data = normalizzaData(dataGrezza);
  if (!data.ok) return { errore: data.errore };

  // SOLO il fornitore demo, mai quelli veri: un link "demo-FR1234-..."
  // non deve né consumare chiamate API né vestire da demo un volo reale.
  const fatto = await fornitoreDemo.cerca(volo.valore, data.valore);
  if (!fatto) return null;

  const verdetto = valuta(fatto);
  return {
    idPagina,
    idVerifica: null,
    esito: verdetto.esito,
    volo: fatto.voloIata,
    dataVolo: fatto.dataLocale,
    importo: verdetto.esito === "idoneo" ? verdetto.importo : null,
    ritardoMinuti: "ritardoMinuti" in verdetto ? verdetto.ritardoMinuti : null,
    motivo: verdetto.motivo,
    demo: true,
    inAttesa: false,
    arrivoPrevistoUtc: fatto.arrivoPrevistoUtc,
    arrivoEffettivoUtc: fatto.arrivoEffettivoUtc,
    km: fatto.kmOrtodromica,
    scadenza:
      verdetto.esito === "idoneo"
        ? scadenzaStimata(fatto.dataLocale, fatto.vettoreOperativo)
        : null,
    checkout: checkoutConfigurato(),
    avvisoCheckout,
  };
}

/* ----------------------------------------------------------- la pagina */

export default async function PaginaVerifica({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const avvisoCheckout = avvisoCheckoutDa((await searchParams).checkout);

  // ── Esempio dimostrativo: si ricalcola, non si legge ────────────────
  const demoMatch = id.match(DEMO_OK);
  if (demoMatch) {
    const dati = await datiDemo(id, demoMatch[1], demoMatch[2], avvisoCheckout);
    if (!dati) {
      return (
        <Cornice>
          <Pannello
            titolo={COPY.risultato.nonTrovata.titolo}
            testo={COPY.risultato.nonTrovata.testo}
            cta={COPY.risultato.nonTrovata.cta}
          />
        </Cornice>
      );
    }
    if ("errore" in dati) {
      // La data o il volo dell'esempio non stanno in piedi: si spiega
      // con l'errore vero del normalizzatore, non con un generico.
      return (
        <Cornice>
          <Pannello
            titolo={COPY.risultato.nonTrovata.titolo}
            testo={dati.errore}
            cta={COPY.risultato.nonTrovata.cta}
          />
        </Cornice>
      );
    }
    return (
      <Cornice>
        <Risultato dati={dati} />
      </Cornice>
    );
  }

  // ── Link non riconoscibile: né UUID né demo ─────────────────────────
  if (!UUID_OK.test(id)) {
    return (
      <Cornice>
        <Pannello
          titolo={COPY.risultato.nonTrovata.titolo}
          testo={COPY.risultato.nonTrovata.testo}
          cta={COPY.risultato.nonTrovata.cta}
        />
      </Cornice>
    );
  }

  // ── Verifica vera: si legge col client di servizio ──────────────────
  if (!SERVIZIO_ATTIVO) {
    return (
      <Cornice>
        <Pannello
          titolo={COPY.risultato.nonDisponibile.titolo}
          testo={COPY.risultato.nonDisponibile.testo}
        />
      </Cornice>
    );
  }

  let riga: RigaVerifica | null = null;
  try {
    const db = supabaseServizio();
    const { data, error } = (await db
      .from("verifiche")
      .select(
        "id, volo_iata, data_locale, esito, importo, ritardo_minuti, motivo, conferma, voli(arrivo_previsto_utc, arrivo_effettivo_utc, km_ortodromica, vettore_operativo, fonte)",
      )
      .eq("id", id)
      .maybeSingle()) as { data: RigaVerifica | null; error: { message: string } | null };
    if (error) throw new Error(error.message);
    riga = data;
  } catch (e) {
    console.error("[verifica/pagina] lettura fallita:", e);
    return (
      <Cornice>
        <Pannello
          titolo={COPY.risultato.nonDisponibile.titolo}
          testo={COPY.risultato.nonDisponibile.testo}
        />
      </Cornice>
    );
  }

  if (!riga) {
    return (
      <Cornice>
        <Pannello
          titolo={COPY.risultato.nonTrovata.titolo}
          testo={COPY.risultato.nonTrovata.testo}
          cta={COPY.risultato.nonTrovata.cta}
        />
      </Cornice>
    );
  }

  const dati: DatiVerifica = {
    idPagina: id,
    idVerifica: riga.id,
    esito: riga.esito,
    volo: riga.volo_iata,
    dataVolo: riga.data_locale,
    importo: riga.importo,
    ritardoMinuti: riga.ritardo_minuti,
    motivo: riga.motivo,
    // Il marchio demo viaggia con la fonte del volo: se il dato viene
    // dal fornitore dimostrativo, l'interfaccia DEVE dirlo (regola 3).
    demo: riga.voli?.fonte === "demo",
    inAttesa: riga.conferma === "in_attesa",
    arrivoPrevistoUtc: riga.voli?.arrivo_previsto_utc ?? null,
    arrivoEffettivoUtc: riga.voli?.arrivo_effettivo_utc ?? null,
    km: riga.voli?.km_ortodromica ?? null,
    scadenza:
      riga.esito === "idoneo"
        ? scadenzaStimata(riga.data_locale, riga.voli?.vettore_operativo ?? riga.volo_iata)
        : null,
    checkout: checkoutConfigurato(),
    avvisoCheckout,
  };

  return (
    <Cornice>
      <Risultato dati={dati} />
    </Cornice>
  );
}
