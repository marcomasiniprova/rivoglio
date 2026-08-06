import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { costruisci, PARTENZE } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";
import BaseDiPartenza from "@/components/app/BaseDiPartenza";
import NuovaRicerca from "@/components/app/NuovaRicerca";
import SchedaRicerca from "@/components/app/SchedaRicerca";

/**
 * Mai pre-generata: il contenuto dipende da chi è collegato.
 * Senza questa riga la build prova a costruirla a vuoto e si pianta.
 */
export const dynamic = "force-dynamic";

/** Media nazionale self service, osservatorio MIMIT 06/08/2026.
 *  DA LEGGERE DAL VIVO quando colleghiamo l'osservatorio: qui è fermo. */
const BENZINA = 1.994;

type RigaRicerca = {
  id: string;
  budget_max_persona: number;
  ore_viaggio_max: number;
  notti_min: number;
  notti_max: number;
  persone: number;
  tipi: Tipo[];
  attiva: boolean;
  creata_il: string;
};

export default async function PaginaApp() {
  /* Il layout reindirizza già chi non è collegato, ma React costruisce layout
     e pagina insieme: senza questo controllo la pagina interroga Supabase lo
     stesso e riempie i log di errori che poi nascondono quelli veri. */
  if (!SUPABASE_CONFIGURATO) redirect("/entra");
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  const supabase = await supabaseServer();

  const [{ data: profilo }, { data: ricerche }] = await Promise.all([
    supabase.from("profili").select("comune, lat, lng").eq("id", utente.id).single(),
    supabase
      .from("ricerche")
      .select("id, budget_max_persona, ore_viaggio_max, notti_min, notti_max, persone, tipi, attiva, creata_il")
      .eq("utente_id", utente.id)
      .order("creata_il", { ascending: false }),
  ]);

  const partenza = profilo?.comune ?? null;
  const elenco = (ricerche ?? []) as RigaRicerca[];

  /**
   * Per ogni ricerca calcoliamo cosa troveresti ADESSO.
   *
   * Non è un alert e non consuma crediti: è l'anteprima onesta di dove
   * arrivi col budget che hai messo. L'alert vero arriverà quando ci sarà
   * un'offerta verificata dietro, e allora ci sarà anche il prezzo del letto.
   */
  const anteprime = new Map(
    partenza
      ? elenco.map((r) => [
          r.id,
          costruisci({
            partenza,
            budgetPersona: Number(r.budget_max_persona),
            notti: r.notti_max,
            persone: r.persone,
            tipi: r.tipi ?? [],
            oreMax: Number(r.ore_viaggio_max),
            prezzoBenzina: BENZINA,
          }),
        ])
      : [],
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[2.3rem] leading-none tracking-[-0.04em] sm:text-[2.8rem]">
          {partenza ? `Parti da ${partenza}.` : "Cominciamo dalla cosa più importante."}
        </h1>
        <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-fumo">
          {partenza
            ? "Imposta quanto vuoi spendere e quanto sei disposto a guidare. Ti scrivo io quando il conto torna."
            : "Dimmi da dove parti: senza quello non posso calcolarti né i chilometri né la benzina."}
        </p>
      </div>

      <BaseDiPartenza
        attuale={partenza}
        citta={PARTENZE.map((p) => p.nome)}
      />

      {partenza && (
        <>
          <NuovaRicerca prima={elenco.length === 0} />

          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl tracking-[-0.03em]">
                Le tue ricerche
              </h2>
              {elenco.length > 0 && (
                <span className="text-sm text-fumo">
                  {elenco.filter((r) => r.attiva).length} attive su {elenco.length}
                </span>
              )}
            </div>

            {elenco.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-bordo bg-white/60 px-6 py-12 text-center">
                <MapPin className="mx-auto size-6 text-fumo-2" aria-hidden="true" />
                <p className="mt-3 text-sm text-fumo">
                  Non hai ancora nessuna ricerca. Creane una qui sopra: ci metti trenta secondi.
                </p>
              </div>
            ) : (
              elenco.map((r) => (
                <SchedaRicerca key={r.id} ricerca={r} anteprima={anteprime.get(r.id)} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
