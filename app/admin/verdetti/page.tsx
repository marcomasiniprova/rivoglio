import { ExternalLink } from "lucide-react";
import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Bollo, Vuoto } from "@/components/admin/Pezzi";
import { Button } from "@/components/ui/button";
import { confermaVerifica, correggiVerifica } from "@/app/admin/azioni";
import { dataIt, inizioOggiRoma } from "@/lib/admin/dati";
import { soloAdmin } from "@/lib/admin/guardia";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * I VERDETTI: il pannello dello SHADOW MODE (SPEC §4).
 *
 * Il motore emette il verdetto, ma finché lo shadow è acceso ogni
 * "idoneo" aspetta qui la conferma di un umano PRIMA che l'utente possa
 * pagare. Si spegne dopo 100 verdetti di fila senza correzioni; ogni
 * correzione è un caso nuovo per il golden set del motore.
 *
 * Prima questa era la schermata principale del retrobottega. Adesso è
 * una sezione fra le altre, ed è giusto così: è la coda di lavoro, non il
 * quadro della situazione.
 */
export const dynamic = "force-dynamic";

type RigaVerifica = {
  id: string;
  volo_iata: string;
  data_locale: string;
  importo: number | null;
  ritardo_minuti: number | null;
  motivo: string | null;
  versione_regole: string;
  email: string | null;
  creata_il: string;
  voli: {
    arrivo_previsto_utc: string | null;
    arrivo_effettivo_utc: string | null;
    vettore_operativo: string | null;
    fonte: string;
  } | null;
};

const oraUtc = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : "?";

const ritardoUmano = (minuti: number | null) =>
  minuti === null ? "?" : `${Math.floor(minuti / 60)}h${String(minuti % 60).padStart(2, "0")}`;

export default async function PaginaVerdetti() {
  /* Prima riga, sempre. Vedi lib/admin/guardia.ts. */
  await soloAdmin();

  /* Niente uscita anticipata senza chiave: resta l'intelaiatura, coi
     numeri marcati "non letto". Una pagina ridotta a un riquadro rosso non
     fa capire cosa ci sarà quando funzionerà. */
  if (!SERVIZIO_ATTIVO) {
    return (
      <div className="flex flex-col gap-5">
        <Avviso titolo="Senza chiave del database questa coda non esiste." tono="rosso">
          Manca <code>SUPABASE_SECRET_KEY</code>: il pannello non può leggere le verifiche in
          attesa.
        </Avviso>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] border border-bordo bg-white px-5 py-4">
          {["Analisi oggi", "Idonei", "Incerti", "Non idonei"].map((nome) => (
            <div key={nome} className="flex items-baseline gap-2">
              <span className="font-display text-[17px] leading-none text-fumo-2">non letto</span>
              <span className="text-[12.5px] text-fumo">{nome}</span>
            </div>
          ))}
        </div>
        <Scheda titolo="Da confermare">
          <Vuoto titolo="Non letto." />
        </Scheda>
      </div>
    );
  }

  const db = supabaseServizio();
  const oggi = inizioOggiRoma();
  const [
    { data: codaGrezza },
    { count: nCheck },
    { count: nIdonei },
    { count: nIncerti },
    { count: nNonIdonei },
  ] = await Promise.all([
    db
      .from("verifiche")
      .select(
        "id, volo_iata, data_locale, importo, ritardo_minuti, motivo, versione_regole, email, creata_il, voli(arrivo_previsto_utc, arrivo_effettivo_utc, vettore_operativo, fonte)",
      )
      .eq("esito", "idoneo")
      .eq("conferma", "in_attesa")
      .order("creata_il", { ascending: true })
      .limit(30),
    db.from("verifiche").select("id", { count: "exact", head: true }).gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "idoneo")
      .gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "incerto")
      .gte("creata_il", oggi),
    db
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("esito", "non_idoneo")
      .gte("creata_il", oggi),
  ]);

  const coda = (codaGrezza ?? []) as unknown as RigaVerifica[];
  const oggiContatori = [
    { nome: "Analisi oggi", valore: nCheck ?? 0 },
    { nome: "Idonei", valore: nIdonei ?? 0, tono: "verde" as const },
    { nome: "Incerti", valore: nIncerti ?? 0, tono: "attesa" as const },
    { nome: "Non idonei", valore: nNonIdonei ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* La riga dei verdetti di oggi: quattro numeri secchi, non quattro
          card. Sono di contorno, la coda qui sotto è il lavoro. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] border border-bordo bg-white px-5 py-4">
        {oggiContatori.map((k) => (
          <div key={k.nome} className="flex items-baseline gap-2">
            <span
              className={`numeri font-display text-[22px] leading-none tracking-[-0.03em] ${
                k.tono === "verde" ? "text-verde" : ""
              }`}
            >
              {k.valore}
            </span>
            <span className="text-[12.5px] text-fumo">{k.nome}</span>
          </div>
        ))}
        <span className="ml-auto text-[12px] text-fumo-2">Dalla mezzanotte italiana</span>
      </div>

      <Scheda
        titolo="Da confermare"
        sotto="Dalla più vecchia. Controlla gli orari del fatto contro la fonte: se il verdetto regge, conferma. Se il motore ha sbagliato, correggi e scrivi perché."
        destra={
          coda.length > 0 ? (
            <Bollo tono="attesa">{coda.length} in coda</Bollo>
          ) : (
            <Bollo tono="verde">coda pulita</Bollo>
          )
        }
      >
        {coda.length === 0 ? (
          <Vuoto
            titolo="Niente in attesa."
            spiega="Ogni analisi che esce idonea, con lo shadow mode acceso, compare qui e aspetta la tua conferma prima che quel cliente possa pagare."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {coda.map((v) => (
              <li key={v.id} className="rounded-[12px] border border-bordo bg-nebbia/50 px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {v.volo_iata} · {dataIt(v.data_locale)}
                      {v.voli?.vettore_operativo ? (
                        <span className="text-fumo"> · {v.voli.vettore_operativo}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-fumo">
                      ritardo{" "}
                      <span className="numeri font-medium text-inchiostro">
                        {ritardoUmano(v.ritardo_minuti)}
                      </span>{" "}
                      · fascia{" "}
                      <span className="numeri font-medium text-verde">
                        {v.importo !== null ? `${v.importo}€` : "?"}
                      </span>{" "}
                      · previsto {oraUtc(v.voli?.arrivo_previsto_utc ?? null)} → effettivo{" "}
                      {oraUtc(v.voli?.arrivo_effettivo_utc ?? null)} UTC · fonte{" "}
                      {v.voli?.fonte ?? "?"} · regole {v.versione_regole}
                    </p>
                    {v.motivo && (
                      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-fumo">
                        {v.motivo}
                      </p>
                    )}
                    <p className="mt-1.5 text-[12px] text-fumo-2">
                      in coda dal {dataIt(v.creata_il)} ·{" "}
                      {v.email ? `avvisiamo ${v.email}` : "analisi anonima, nessuna email"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.flightradar24.com/data/flights/${v.volo_iata.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-bottone border border-bordo bg-white px-3.5 py-2 text-sm font-medium text-fumo transition-colors hover:border-verde/40 hover:text-inchiostro"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      Controlla
                    </a>
                    {/* l'azione torna un esito per il pannello comandi;
                        qui il modulo vuole void, quindi si incarta */}
                    <form
                      action={async () => {
                        "use server";
                        await confermaVerifica(v.id);
                      }}
                    >
                      <Button type="submit" size="sm">
                        Conferma
                      </Button>
                    </form>
                  </div>
                </div>

                <details className="mt-3 border-t border-bordo pt-3">
                  <summary className="cursor-pointer text-[13px] font-medium text-fumo transition-colors hover:text-inchiostro">
                    Correggi il verdetto
                  </summary>
                  <form
                    action={async (dati: FormData) => {
                      "use server";
                      await correggiVerifica(
                        v.id,
                        String(dati.get("esito") ?? ""),
                        String(dati.get("nota") ?? ""),
                      );
                    }}
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    <select
                      name="esito"
                      defaultValue="non_idoneo"
                      className="h-9 rounded-bottone border border-bordo bg-white px-3 text-sm"
                    >
                      <option value="non_idoneo">Non idoneo</option>
                      <option value="incerto">Incerto</option>
                    </select>
                    <input
                      name="nota"
                      required
                      placeholder="Perché il motore ha sbagliato"
                      className="h-9 min-w-56 flex-1 rounded-bottone border border-bordo bg-white px-3 text-sm placeholder:text-fumo-2"
                    />
                    <Button type="submit" variant="scuro" size="sm">
                      Registra la correzione
                    </Button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Scheda>

      <p className="pb-2 text-[12.5px] leading-relaxed text-fumo-2">
        Lo shadow mode si spegne dopo 100 verdetti di fila senza correzioni, e si spegne dalle
        impostazioni, non dal codice. Ogni correzione che registri qui finisce nei log come
        caso nuovo per il golden set del motore.
      </p>
    </div>
  );
}
