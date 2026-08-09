"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { casa, spedisci } from "@/lib/email/posta";
import { bottone, COLORI as C, FONT, vestito } from "@/lib/email/modello";

/**
 * Le azioni dello shadow mode (SPEC §4): il motore emette il verdetto,
 * ma finché lo shadow è acceso un umano lo conferma da qui PRIMA che
 * l'utente possa pagare. Ogni correzione è oro: un caso vero in cui il
 * motore ha sbagliato, da mettere nel golden set.
 *
 * OGNI azione ricontrolla da capo che chi chiama sia admin: le server
 * action sono endpoint pubblici con un altro vestito, e fidarsi del fatto
 * che "il bottone lo vede solo l'admin" è il modo classico di farsi
 * confermare i verdetti da una chiamata scritta a mano.
 */
async function soloAdmin(): Promise<string | null> {
  const utente = await utenteCollegato();
  if (!utente) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("profili").select("ruolo").eq("id", utente.id).single();
  return data?.ruolo === "admin" ? utente.id : null;
}

export type EsitoAdmin = { ok?: string; errore?: string; dettaglio?: string };

type EsitoVerifica = "idoneo" | "incerto" | "non_idoneo";
const ESITI: EsitoVerifica[] = ["idoneo", "incerto", "non_idoneo"];

const dataIt = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const ritardoUmano = (minuti: number) =>
  `${Math.floor(minuti / 60)}h${String(minuti % 60).padStart(2, "0")}`;

/**
 * Conferma un verdetto idoneo in attesa: da adesso si può vendere.
 * Se il check aveva lasciato un'email, l'utente viene avvisato subito
 * col link al suo risultato: è il momento in cui torna a pagare.
 */
export async function confermaVerifica(id: string): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  if (!SERVIZIO_ATTIVO) return { errore: "SUPABASE_SECRET_KEY assente." };

  const db = supabaseServizio();
  const { data: v, error: errLettura } = await db
    .from("verifiche")
    .select("id, volo_iata, data_locale, importo, ritardo_minuti, email, conferma")
    .eq("id", id)
    .maybeSingle();
  if (errLettura || !v) return { errore: "Verifica non trovata." };
  if (v.conferma !== "in_attesa") return { errore: "Già lavorata: ricarica la pagina." };

  // Il filtro su `conferma` chiude la corsa: se due mani premono insieme,
  // una sola riga cambia davvero e l'email parte una volta sola.
  const { data: cambiata, error } = await db
    .from("verifiche")
    .update({ conferma: "confermata" })
    .eq("id", id)
    .eq("conferma", "in_attesa")
    .select("id");
  if (error || !cambiata?.length) return { errore: "Conferma fallita: ricarica la pagina." };

  revalidatePath("/admin");
  if (!v.email) return { ok: "Confermata. Nessuna email da avvisare." };

  const link = `${casa()}/verifica/${v.id}`;
  const quando = ` del ${dataIt(v.data_locale)}`;
  const dettagli =
    v.ritardo_minuti !== null && v.importo !== null
      ? ` Ritardo di ${ritardoUmano(v.ritardo_minuti)}, fascia da ${v.importo}€ a passeggero (Reg. CE 261/2004).`
      : "";

  const par = (t: string) =>
    `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${t}</p>`;

  const esito = await spedisci({
    a: v.email,
    oggetto: "Il tuo controllo è confermato",
    html: vestito({
      titolo: "Il tuo controllo è confermato",
      corpo:
        `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">Ricontrollato a mano: il verdetto regge.</h1>` +
        par(
          `Abbiamo riguardato i dati del volo <strong style="color:${C.inchiostro}">${v.volo_iata}</strong>${quando}.${dettagli}`,
        ) +
        par(
          "Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia. Dal risultato apri la pratica quando vuoi.",
        ) +
        bottone("Vedi il tuo risultato", link),
      coda: "Ricevi questa email perché hai chiesto un controllo su Rivolio.",
    }),
    testo: `Ricontrollato a mano: il verdetto regge.\n\nVolo ${v.volo_iata}${quando}.${dettagli}\n\nRestano da verificare le circostanze straordinarie, che può invocare solo la compagnia.\n\nIl tuo risultato: ${link}`,
  });

  return esito.ok
    ? { ok: "Confermata. Email di avviso partita." }
    : { ok: `Confermata. Email NON partita: ${esito.motivo}` };
}

/**
 * Corregge un verdetto: il motore ha detto una cosa, l'umano un'altra.
 * La verifica passa a `corretta` con l'esito giusto, e il caso completo
 * finisce nei log in modo VISTOSO: ogni correzione è un caso nuovo per
 * il golden set (prove del motore), e azzera il conto dei 100 verdetti
 * consecutivi che spegne lo shadow mode.
 */
export async function correggiVerifica(
  id: string,
  esitoGiusto: string,
  nota: string,
): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  if (!SERVIZIO_ATTIVO) return { errore: "SUPABASE_SECRET_KEY assente." };
  if (!ESITI.includes(esitoGiusto as EsitoVerifica)) {
    return { errore: "Esito non valido: idoneo, incerto o non_idoneo." };
  }

  const db = supabaseServizio();
  const { data: v, error: errLettura } = await db
    .from("verifiche")
    .select(
      "*, voli(volo_iata, data_locale, vettore_operativo, arrivo_previsto_utc, arrivo_effettivo_utc, stato, km_ortodromica, fonte, fonti_discordanti)",
    )
    .eq("id", id)
    .maybeSingle();
  if (errLettura || !v) return { errore: "Verifica non trovata." };
  if (v.conferma !== "in_attesa") return { errore: "Già lavorata: ricarica la pagina." };

  const campi: Record<string, string | number | null> = {
    conferma: "corretta",
    esito: esitoGiusto,
  };
  // Un caso che non è più idoneo non ha una fascia: lasciarla sarebbe
  // un numero finto pronto a finire davanti a un utente.
  if (esitoGiusto !== "idoneo") campi.importo = null;
  if (nota.trim()) campi.motivo = nota.trim();

  const { data: cambiata, error } = await db
    .from("verifiche")
    .update(campi)
    .eq("id", id)
    .eq("conferma", "in_attesa")
    .select("id");
  if (error || !cambiata?.length) return { errore: "Correzione fallita: ricarica la pagina." };

  // Il log vistoso: è il canale con cui il caso arriva al golden set.
  console.error(
    [
      "",
      "⚠️ ══════════ CORREZIONE IN SHADOW MODE: CASO NUOVO PER IL GOLDEN SET ══════════ ⚠️",
      "Il motore ha sbagliato su un caso vero. Va etichettato a mano e aggiunto",
      "alle prove del motore (lib/regole/casi-oro.ts) prima di fidarsi di nuovo.",
      `verifica:         ${v.id}`,
      `volo:             ${v.volo_iata} del ${v.data_locale}`,
      `esito del motore: ${v.esito} (importo ${v.importo ?? "-"}€, ritardo ${v.ritardo_minuti ?? "-"} min)`,
      `motivo del motore: ${v.motivo ?? "-"}`,
      `versione regole:  ${v.versione_regole}`,
      `esito corretto:   ${esitoGiusto}`,
      `nota dell'admin:  ${nota.trim() || "(nessuna)"}`,
      `fatto del volo:   ${JSON.stringify(v.voli ?? null)}`,
      "═══════════════════════════════════════════════════════════════════════════════",
      "",
    ].join("\n"),
  );

  revalidatePath("/admin");
  return { ok: `Corretta in "${esitoGiusto}". Il caso è nei log per il golden set.` };
}

type RispostaSegui = {
  ok?: boolean;
  motivo?: string;
  errore?: string;
  aperte?: number;
  esaminate?: number;
  inviate?: { pratica: string; passo: string }[];
};

/**
 * Un giro di follow-up, a mano: la stessa logica del cron
 * (app/api/motore/segui), chiamata via fetch interno. La rotta non può
 * esportare la funzione (Next accetta solo i verbi HTTP), quindi la si
 * chiama come farà l'orologio in produzione: stessa porta, stessa prova.
 */
export async function giroFollowUp(): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };

  try {
    const risposta = await fetch(`${casa()}/api/motore/segui`, {
      method: "POST",
      headers: { "x-motore-segreto": process.env.MOTORE_SEGRETO ?? "" },
      cache: "no-store",
    });
    const corpo = (await risposta.json()) as RispostaSegui;
    if (!risposta.ok || !corpo.ok) {
      return { errore: corpo.motivo ?? corpo.errore ?? `Giro fallito (HTTP ${risposta.status}).` };
    }

    revalidatePath("/admin");
    const inviate = corpo.inviate ?? [];
    return {
      ok: `${corpo.aperte ?? 0} pratiche aperte, ${corpo.esaminate ?? 0} esaminate, ${inviate.length} email partite.`,
      dettaglio:
        inviate.map((i) => `${i.pratica} → ${i.passo}`).join("\n") ||
        "Nessuna email dovuta oggi: le pratiche sono tutte al passo.",
    };
  } catch (e) {
    console.error("[admin] giro di follow-up fallito:", e);
    return { errore: "Il giro non è partito: il server non risponde." };
  }
}
