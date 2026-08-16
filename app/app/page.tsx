import { redirect } from "next/navigation";
import AppRivolio, { type CardPratica } from "@/components/app/AppRivolio";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { EMAIL_ADMIN } from "@/lib/admin/guardia";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { colonnaMancante } from "@/lib/supabase/colonne";
import { giorniDaQuando } from "@/lib/tempo";
import { COPY } from "@/lib/copy";
import type {
  EventoPratica,
  StatoPratica,
  TipoPratica,
} from "@/lib/pratiche/pratiche";
import {
  aChePunto,
  diChiELaPalla,
  percorsoPratica,
  type DiChiELaPalla,
} from "@/lib/pratiche/passi";

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
  rifiuto_motivo?: string | null;
  inviata_il?: string | null;
};

type VoloBreve = { volo_iata: string; data_locale: string };

const dataIt = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(
    "it-IT",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome",
    },
  );

const riempi = (template: string, valori: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (tutto, chiave) => valori[chiave] ?? tutto);

/**
 * 🔴 QUI TUTTE LE PRATICHE APERTE AVEVANO LO STESSO VESTITO.
 *
 * Valerio, 13/08: «se ho 3 pratiche non si capisce lo stato di ognuna,
 * ognuna sembra uguale, ha sempre gli stessi box stessi colori uguali».
 * Aveva ragione: questa funzione dava `bg-menta-tenue` a TUTTO quello che
 * non era chiuso, cioè a cinque stati diversi su nove. Tre pratiche in
 * fila erano tre rettangoli identici.
 *
 * E il difetto non era il colore, era cosa il colore raccontava: lo stato
 * tecnico ("pagata", "inviata", "sollecito") è una parola nostra. Quello
 * che una persona con tre pratiche vuole sapere in mezzo secondo è
 * **su quale deve muoversi lei**. Adesso il colore dice quello.
 */
function classiStato(palla: DiChiELaPalla, stato: StatoPratica): string {
  if (stato === "esito_pagata") return "bg-verde text-white";
  if (stato === "esito_rifiutata") return "bg-sole/25 text-inchiostro";
  if (stato === "rimborsata") return "bg-nebbia-2 text-fumo";
  // Tocca a te: giallo, che è il colore di "guardami". Tocca a loro:
  // grigio, che è il colore di "non fare niente".
  return palla === "tua"
    ? "bg-sole/25 text-inchiostro"
    : "bg-nebbia-2 text-fumo";
}

export default async function PaginaApp() {
  const utente = SUPABASE_CONFIGURATO ? await utenteCollegato() : null;

  /* 🔴 IL PADRONE DI CASA NON DEVE FINIRE NELLA WEB APP (Valerio, 16/08:
     «io ho permessi speciali, quando accedo con la mia email mi deve SEMPRE
     portare nel pannello, non nell'app da utente normale»). Entrando con la
     sua email si va dritti al pannello: la guardia di `/admin` la lascia
     entrare per la stessa email, quindi niente rimbalzo. */
  if (utente?.email?.toLowerCase() === EMAIL_ADMIN) redirect("/admin");

  if (!utente) {
    return (
      <AppRivolio
        email={null}
        nickname={null}
        classificaOptin={false}
        pratiche={[]}
        erroreLettura={false}
      />
    );
  }

  const supabase = await supabaseServer();

  /* ⚠️ `rifiuto_motivo` arriva con la migrazione del 15/08: se non fosse
     applicata, chiederla farebbe fallire TUTTA la lettura e l'elenco
     resterebbe vuoto. Stessa rete della lettera e della scheda. */
  /* `inviata_il` serve ai passi: senza, l'elenco non sa che al giorno 42
     il sollecito è pronto e continua a scrivere "in attesa di risposta"
     accanto a una pratica che aspetta te. */
  const COLONNE =
    "id, stato, tipo, importo_fascia, volo_id, creata_il, aggiornata_il, inviata_il";
  const elenco = async (colonne: string) =>
    supabase
      .from("pratiche")
      .select(colonne)
      .order("aggiornata_il", { ascending: false });
  const primoGiro = await elenco(`${COLONNE}, rifiuto_motivo`);
  const [{ data, error }, { data: profilo }] = await Promise.all([
    primoGiro.error && colonnaMancante(primoGiro.error.message)
      ? await elenco(COLONNE)
      : primoGiro,
    supabase
      .from("profili")
      .select("nickname, classifica_optin")
      .eq("id", utente.id)
      .maybeSingle(),
  ]);

  const righe = (data ?? []) as unknown as RigaPratica[];

  /* Gli eventi di TUTTE le pratiche in una lettura sola: servono a sapere
     a che punto è ognuna (il passo dei documenti sta lì dentro). Una
     query per pratica sarebbe una query per riga a ogni apertura
     dell'elenco. */
  const eventiPer = new Map<
    string,
    { tipo: string; nota: string | null; creato_il: string }[]
  >();
  if (righe.length > 0) {
    const { data: ev } = await supabase
      .from("pratiche_eventi")
      .select("pratica_id, tipo, nota, creato_il")
      .in(
        "pratica_id",
        righe.map((p) => p.id),
      )
      .order("creato_il", { ascending: true });
    for (const e of ev ?? []) {
      const lista = eventiPer.get(e.pratica_id as string) ?? [];
      lista.push({
        tipo: e.tipo as string,
        nota: e.nota as string | null,
        creato_il: e.creato_il as string,
      });
      eventiPer.set(e.pratica_id as string, lista);
    }
  }

  /* I voli delle pratiche, in un colpo solo. Se la chiave di servizio manca
     l'elenco resta in piedi lo stesso: si mostra la data della pratica. */
  const voli = new Map<string, VoloBreve>();
  const voloIds = [
    ...new Set(righe.map((p) => p.volo_id).filter(Boolean)),
  ] as string[];
  if (SERVIZIO_ATTIVO && voloIds.length > 0) {
    const { data: vr } = await supabaseServizio()
      .from("voli")
      .select("id, volo_iata, data_locale")
      .in("id", voloIds);
    for (const v of vr ?? []) {
      voli.set(v.id as string, {
        volo_iata: v.volo_iata,
        data_locale: v.data_locale,
      });
    }
  }

  const C = COPY.pratica.elenco;
  const pratiche: CardPratica[] = righe.map((p) => {
    const percorso = percorsoPratica(
      p.stato,
      (eventiPer.get(p.id) ?? []) as EventoPratica[],
      p.rifiuto_motivo ?? null,
      giorniDaQuando(p.inviata_il ?? null),
    );
    /* ⚠️ Il testo NON si prende dallo stato del database: allo stesso
       `sollecito` si arriva per silenzio o perché hanno risposto, e qui
       l'elenco scriveva «sei settimane, nessuna risposta» accanto a una
       pratica in cui la risposta era arrivata. Vedi chiaveTesto. */
    const stato =
      COPY.pratica.stati[percorso.chiaveTesto] ??
      COPY.pratica.stati[p.stato] ??
      null;
    const volo = p.volo_id ? voli.get(p.volo_id) : undefined;

    const palla = diChiELaPalla(percorso.attivo);
    const punto = aChePunto(percorso);
    return {
      id: p.id,
      palla,
      passoNome: punto.nome,
      passoIndice: punto.indice,
      passoTotale: punto.totale,
      statoNome: stato?.nome ?? p.stato,
      statoClassi: classiStato(palla, p.stato),
      fascia:
        p.importo_fascia !== null
          ? riempi(C.fasciaTemplate, { importo: `${p.importo_fascia}€` })
          : null,
      fasciaFonte: C.fasciaFonte,
      famiglia: p.tipo === "famiglia",
      titolo: volo
        ? riempi(C.voloTemplate, {
            volo: volo.volo_iata,
            data: dataIt(volo.data_locale),
          })
        : riempi(C.voloMancante, { data: dataIt(p.creata_il) }),
      prossimoPasso: stato?.prossimoPasso ?? null,
      apri: C.apri,
    };
  });

  return (
    <AppRivolio
      email={utente.email ?? null}
      nickname={(profilo?.nickname as string | null) ?? null}
      classificaOptin={Boolean(profilo?.classifica_optin)}
      pratiche={pratiche}
      erroreLettura={Boolean(error)}
    />
  );
}
