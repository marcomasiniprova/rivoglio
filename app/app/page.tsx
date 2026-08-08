import AppRivoglio, { type CardPratica } from "@/components/app/AppRivoglio";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { COPY } from "@/lib/copy";
import type { StatoPratica, TipoPratica } from "@/lib/pratiche/pratiche";

/**
 * LA WEB APP: le stesse sezioni dell'app sul telefono (Controlla,
 * Le tue pratiche, Profilo). Questo file fa solo la spesa: legge
 * pratiche (con la RLS), voli (con la chiave di servizio, limitati agli
 * id già filtrati) e profilo, e passa tutto già apparecchiato al
 * componente client che sceglie il pannello.
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

export default async function PaginaApp() {
  const utente = SUPABASE_CONFIGURATO ? await utenteCollegato() : null;

  if (!utente) {
    return (
      <AppRivoglio
        email={null}
        nickname={null}
        classificaOptin={false}
        pratiche={[]}
        erroreLettura={false}
      />
    );
  }

  const supabase = await supabaseServer();

  const [{ data, error }, { data: profilo }] = await Promise.all([
    supabase
      .from("pratiche")
      .select("id, stato, tipo, importo_fascia, volo_id, creata_il, aggiornata_il")
      .order("aggiornata_il", { ascending: false }),
    supabase.from("profili").select("nickname, classifica_optin").eq("id", utente.id).maybeSingle(),
  ]);

  const righe = (data ?? []) as RigaPratica[];

  /* I voli delle pratiche, in un colpo solo. Se la chiave di servizio manca
     l'elenco resta in piedi lo stesso: si mostra la data della pratica. */
  const voli = new Map<string, VoloBreve>();
  const voloIds = [...new Set(righe.map((p) => p.volo_id).filter(Boolean))] as string[];
  if (SERVIZIO_ATTIVO && voloIds.length > 0) {
    const { data: vr } = await supabaseServizio()
      .from("voli")
      .select("id, volo_iata, data_locale")
      .in("id", voloIds);
    for (const v of vr ?? []) {
      voli.set(v.id as string, { volo_iata: v.volo_iata, data_locale: v.data_locale });
    }
  }

  const C = COPY.pratica.elenco;
  const pratiche: CardPratica[] = righe.map((p) => {
    const stato = COPY.pratica.stati[p.stato] ?? null;
    const volo = p.volo_id ? voli.get(p.volo_id) : undefined;
    return {
      id: p.id,
      statoNome: stato?.nome ?? p.stato,
      statoClassi: classiStato(p.stato),
      fascia:
        p.importo_fascia !== null
          ? riempi(C.fasciaTemplate, { importo: `${p.importo_fascia}€` })
          : null,
      fasciaFonte: C.fasciaFonte,
      famiglia: p.tipo === "famiglia",
      titolo: volo
        ? riempi(C.voloTemplate, { volo: volo.volo_iata, data: dataIt(volo.data_locale) })
        : riempi(C.voloMancante, { data: dataIt(p.creata_il) }),
      prossimoPasso: stato?.prossimoPasso ?? null,
      apri: C.apri,
    };
  });

  return (
    <AppRivoglio
      email={utente.email ?? null}
      nickname={(profilo?.nickname as string | null) ?? null}
      classificaOptin={Boolean(profilo?.classifica_optin)}
      pratiche={pratiche}
      erroreLettura={Boolean(error)}
    />
  );
}
