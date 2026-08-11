import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import type { TipoEvento } from "./registra";

/**
 * I NUMERI DEL CRUSCOTTO.
 *
 * Legge il registro e ne tira fuori le cose che si guardano davvero:
 * quanti arrivano, quanti provano, quanti pagano, e da dove vengono.
 *
 * ⚠️ Non lancia mai. Un cruscotto che va in errore quando il database
 * ha un singhiozzo è un cruscotto che si guarda una volta sola: qui,
 * quando un numero non si legge, si scrive che non si è potuto leggere.
 * Un `null` onesto vale più di uno zero inventato, perché uno zero
 * inventato si legge come "oggi non è venuto nessuno".
 */

export type Riga = { quando: string; tipo: string; testo: string; euro: number | null };

/** «Questa cosa, tante volte»: vale per le provenienze e per i paesi. */
export type Conteggio = { nome: string; quanti: number };

export type Cruscotto = {
  /** I conteggi di oggi e degli ultimi 7 giorni. null = non letto. */
  oggi: Record<TipoEvento, number> | null;
  settimana: Record<TipoEvento, number> | null;
  /** Quanto è entrato, oggi e nella settimana. */
  incassoOggi: number | null;
  incassoSettimana: number | null;
  /** Da dove arrivano, negli ultimi 7 giorni. */
  provenienze: Conteggio[] | null;
  paesi: Conteggio[] | null;
  /** Gli ultimi fatti, in ordine: è il "tempo reale". */
  ultimi: Riga[] | null;
  /** Quanti di quelli che hanno visto il muro hanno poi pagato. */
  conversioneMuro: number | null;
};

type RigaGrezza = {
  creato_il: string;
  tipo: string;
  volo: string | null;
  esito: string | null;
  importo: number | null;
  provenienza: string | null;
  paese: string | null;
};

const VUOTO: Cruscotto = {
  oggi: null,
  settimana: null,
  incassoOggi: null,
  incassoSettimana: null,
  provenienze: null,
  paesi: null,
  ultimi: null,
  conversioneMuro: null,
};

/** Il fatto, raccontato in una riga leggibile. */
function racconta(r: RigaGrezza): string {
  const volo = r.volo ? ` ${r.volo}` : "";
  switch (r.tipo) {
    case "visita":
      return `Qualcuno è arrivato sul sito${r.provenienza ? ` da ${r.provenienza}` : ""}`;
    case "check":
      return `Analisi lanciata${volo}`;
    case "muro":
      return "Ha visto il muro del pagamento";
    case "sbloccato":
      return "Ha pagato l'analisi";
    case "verdetto":
      return `Verdetto${volo}: ${r.esito ?? "?"}`;
    case "pratica":
      return `Pratica aperta${volo}`;
    case "pagato":
      return `PRATICA PAGATA${volo}`;
    case "iscritto":
      return "Nuova iscrizione all'Osservatorio";
    case "guasto":
      return "Qualcosa non ha funzionato";
    default:
      return r.tipo;
  }
}

export async function leggiCruscotto(quanteRighe = 40): Promise<Cruscotto> {
  if (!SERVIZIO_ATTIVO) return VUOTO;
  try {
    const db = supabaseServizio();
    const adesso = new Date();
    const inizioOggi = new Date(adesso);
    inizioOggi.setHours(0, 0, 0, 0);
    const settimanaFa = new Date(adesso.getTime() - 7 * 86_400_000);

    /* Una lettura sola per la settimana, poi si conta in memoria: sette
       giorni di eventi stanno in una manciata di migliaia di righe, e
       fare otto interrogazioni separate costerebbe di più. */
    const { data, error } = await db
      .from("eventi")
      .select("creato_il, tipo, volo, esito, importo, provenienza, paese")
      .gte("creato_il", settimanaFa.toISOString())
      .order("creato_il", { ascending: false })
      .limit(20_000);

    if (error || !data) {
      /* Tabella non ancora creata = non è un guasto, è un "non ancora". */
      if (error && !/does not exist|schema cache/i.test(error.message)) {
        console.error("[cruscotto] lettura fallita:", error.message);
      }
      return VUOTO;
    }

    const righe = data as RigaGrezza[];
    const conta = (dentro: RigaGrezza[]) => {
      const m = {} as Record<TipoEvento, number>;
      for (const r of dentro) m[r.tipo as TipoEvento] = (m[r.tipo as TipoEvento] ?? 0) + 1;
      return m;
    };
    const diOggi = righe.filter((r) => new Date(r.creato_il) >= inizioOggi);
    const somma = (dentro: RigaGrezza[]) =>
      dentro.reduce((s, r) => s + (r.tipo === "pagato" ? Number(r.importo ?? 0) : 0), 0);

    const perChiave = (campo: "provenienza" | "paese") => {
      const m = new Map<string, number>();
      for (const r of righe) {
        const v = r[campo];
        if (v) m.set(v, (m.get(v) ?? 0) + 1);
      }
      return [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([nome, quanti]) => ({ nome, quanti }));
    };

    const muri = righe.filter((r) => r.tipo === "muro").length;
    const sbloccati = righe.filter((r) => r.tipo === "sbloccato").length;

    return {
      oggi: conta(diOggi),
      settimana: conta(righe),
      incassoOggi: somma(diOggi),
      incassoSettimana: somma(righe),
      provenienze: perChiave("provenienza"),
      paesi: perChiave("paese"),
      ultimi: righe.slice(0, quanteRighe).map((r) => ({
        quando: r.creato_il,
        tipo: r.tipo,
        testo: racconta(r),
        euro: r.importo === null ? null : Number(r.importo),
      })),
      /* Si mostra solo se qualcuno il muro l'ha visto davvero: una
         percentuale su zero visite non è un dato, è una divisione per
         zero travestita. */
      conversioneMuro: muri > 0 ? Math.round((sbloccati / muri) * 1000) / 10 : null,
    };
  } catch (e) {
    console.error("[cruscotto] lettura fallita:", e);
    return VUOTO;
  }
}
