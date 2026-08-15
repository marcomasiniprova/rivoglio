import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Bollo, Vuoto } from "@/components/admin/Pezzi";
import { Button } from "@/components/ui/button";
import { moderaRecensione } from "@/app/admin/azioni";
import { dataIt } from "@/lib/admin/dati";
import { soloAdmin } from "@/lib/admin/guardia";
import { SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import { recensioniPerAdmin, type Recensione } from "@/lib/recensioni/recensioni";

/**
 * LE RECENSIONI: LA MODERAZIONE (Valerio, 15/08).
 *
 * «Qualsiasi recensione io devo vederla e approvarla; appena la approvo,
 * automaticamente la landing si aggiorna con quella recensione.»
 *
 * Come funziona: ogni recensione nasce NASCOSTA. Qui le vedi tutte, dalla
 * più recente. «Approva» la fa comparire in landing (che le legge da sola,
 * con una cache di pochi minuti: nessuna ricostruzione). «Nascondi» la
 * toglie. L'analisi gratis che l'utente ha guadagnato NON dipende da
 * questa decisione: quella scatta quando manda la recensione. Qui decidi
 * solo la vetrina.
 */
export const dynamic = "force-dynamic";

const EVENTO: Record<Recensione["evento_tipo"], string> = {
  check: "dopo un check",
  verdetto: "dopo il verdetto",
  pratica: "dentro una pratica",
};

function Stelline({ n }: { n: number }) {
  return (
    <span className="text-[15px] tracking-tight text-sole" aria-label={`${n} su 5`}>
      {"★".repeat(n)}
      <span className="text-bordo">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default async function PaginaRecensioni() {
  await soloAdmin();

  if (!SERVIZIO_ATTIVO) {
    return (
      <Avviso titolo="Senza chiave del database non c'è niente da moderare." tono="rosso">
        Manca <code>SUPABASE_SECRET_KEY</code>: il pannello non può leggere le recensioni.
      </Avviso>
    );
  }

  const tutte = await recensioniPerAdmin(200);
  const inAttesa = tutte.filter((r) => r.stato === "in_attesa");
  const decise = tutte.filter((r) => r.stato !== "in_attesa");

  const Riga = ({ r }: { r: Recensione }) => (
    <li className="rounded-[12px] border border-bordo bg-nebbia/50 px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <Stelline n={r.stelle} />
            <span className="text-[13px] font-medium text-inchiostro">
              {r.nome?.trim() || "Anonimo"}
            </span>
            {r.stato === "approvata" && <Bollo tono="verde">in landing</Bollo>}
            {r.stato === "nascosta" && <Bollo>nascosta</Bollo>}
          </div>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-inchiostro/85">
            “{r.motivo}”
          </p>
          <p className="mt-1.5 text-[12px] text-fumo-2">
            {EVENTO[r.evento_tipo]} · {dataIt(r.creata_il)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {r.stato !== "approvata" && (
            <form
              action={async () => {
                "use server";
                await moderaRecensione(r.id, "approva");
              }}
            >
              <Button type="submit" size="sm">
                Approva
              </Button>
            </form>
          )}
          {r.stato !== "nascosta" && (
            <form
              action={async () => {
                "use server";
                await moderaRecensione(r.id, "nascondi");
              }}
            >
              <Button type="submit" size="sm" variant="contorno">
                Nascondi
              </Button>
            </form>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div className="flex flex-col gap-5">
      <Scheda
        titolo="Da guardare"
        sotto="Le recensioni nuove, nascoste finché non decidi. Approva e compaiono in landing; nascondi e spariscono."
        destra={
          inAttesa.length > 0 ? (
            <Bollo tono="attesa">{inAttesa.length} in attesa</Bollo>
          ) : (
            <Bollo tono="verde">niente in coda</Bollo>
          )
        }
      >
        {inAttesa.length === 0 ? (
          <Vuoto
            titolo="Niente da guardare."
            spiega="Ogni recensione nuova compare qui. Chi la lascia sblocca subito un'analisi gratis; tu decidi solo se mostrarla in landing."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {inAttesa.map((r) => (
              <Riga key={r.id} r={r} />
            ))}
          </ul>
        )}
      </Scheda>

      {decise.length > 0 && (
        <Scheda titolo="Già decise" sotto="Le ultime che hai approvato o nascosto. Puoi sempre cambiare idea.">
          <ul className="flex flex-col gap-2.5">
            {decise.map((r) => (
              <Riga key={r.id} r={r} />
            ))}
          </ul>
        </Scheda>
      )}
    </div>
  );
}
