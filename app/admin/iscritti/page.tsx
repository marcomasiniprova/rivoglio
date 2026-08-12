import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Bollo, Kpi, Vuoto } from "@/components/admin/Pezzi";
import { dataIt } from "@/lib/admin/dati";
import { soloAdmin } from "@/lib/admin/guardia";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * GLI ISCRITTI ALL'OSSERVATORIO.
 *
 * Il numero che conta non è "quanti si sono iscritti" ma **quanti hanno
 * confermato**: l'iscrizione è a doppio consenso, e chi non ha cliccato
 * il link nella posta non riceverà mai niente. Contarlo fra gli iscritti
 * gonfierebbe una lista che poi non apre nessuno.
 *
 * ⚠️ Chi disdice NON viene cancellato, e non è una dimenticanza: la riga
 * resta come prova del consenso e come promemoria di non riscrivergli fra
 * un mese. Qui si vede, marcata.
 */
export const dynamic = "force-dynamic";

type RigaIscritto = {
  id: string;
  email: string;
  comune: string | null;
  creato_il: string;
  confermato_il: string | null;
  disdetto_il: string | null;
};

export default async function PaginaIscritti() {
  /* Prima riga, sempre. Vedi lib/admin/guardia.ts. */
  await soloAdmin();

  /* Niente uscita anticipata quando manca la chiave: l'intelaiatura resta
     in piedi coi numeri marcati "non letto". Una pagina che si riduce a un
     riquadro rosso non fa capire cosa ci sarà quando funzionerà. */
  let righe: RigaIscritto[] = [];
  let nonLetto = !SERVIZIO_ATTIVO;
  let nVivi: number | null = null;
  let nAttesa: number | null = null;
  let nUsciti: number | null = null;

  if (SERVIZIO_ATTIVO) {
    /* 🔴 I TRE NUMERI IN CIMA SI CONTAVANO SULLE SOLE 200 RIGHE LETTE per
       l'elenco, ma erano etichettati come i numeri della lista intera:
       al 201esimo iscritto avrebbero smesso di crescere senza dirlo, e
       "Iscritti veri" e' il numero su cui si decide se una newsletter
       vale la pena. Adesso li conta il DATABASE su tutte le righe;
       l'elenco resta alle ultime 200 perche' e' un elenco.
       Trovato dall'ispezione del 12/08. */
    const partenza = () =>
      supabaseServizio().from("iscritti").select("id", { count: "exact", head: true });
    const [
      { data, error },
      { count: cVivi, error: eVivi },
      { count: cAttesa, error: eAttesa },
      { count: cUsciti, error: eUsciti },
    ] = await Promise.all([
      supabaseServizio()
        .from("iscritti")
        .select("id, email, comune, creato_il, confermato_il, disdetto_il")
        .order("creato_il", { ascending: false })
        .limit(200),
      partenza().not("confermato_il", "is", null).is("disdetto_il", null),
      partenza().is("confermato_il", null).is("disdetto_il", null),
      partenza().not("disdetto_il", "is", null),
    ]);
    for (const e of [error, eVivi, eAttesa, eUsciti]) {
      if (e) console.error("[pannello] iscritti non letti:", e.message);
    }
    nonLetto = Boolean(error);
    righe = (data ?? []) as RigaIscritto[];
    nVivi = eVivi ? null : (cVivi ?? 0);
    nAttesa = eAttesa ? null : (cAttesa ?? 0);
    nUsciti = eUsciti ? null : (cUsciti ?? 0);
  }

  /** I numeri VERI, contati dal database. null = non letto. */
  const q = (v: number | null) => (v === null ? "non letto" : String(v));
  const n = (v: number) => (nonLetto ? "non letto" : String(v));

  return (
    <div className="flex flex-col gap-5">
      {!SERVIZIO_ATTIVO ? (
        <Avviso titolo="Senza chiave del database gli iscritti non si leggono." tono="rosso">
          Manca <code>SUPABASE_SECRET_KEY</code> nell&apos;ambiente.
        </Avviso>
      ) : (
        nonLetto && (
          <Avviso titolo="La lista non si è letta." tono="rosso">
            Il database non ha risposto. Qui sotto non c&apos;è &quot;nessun iscritto&quot;: c&apos;è
            &quot;non lo so&quot;.
          </Avviso>
        )
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi
          forte
          etichetta="Iscritti veri"
          valore={q(nVivi)}
          nota="Hanno confermato e non hanno disdetto: sono gli unici a cui si può scrivere."
        />
        <Kpi
          etichetta="In attesa di conferma"
          valore={q(nAttesa)}
          nota="Hanno lasciato l'email ma non hanno cliccato il link. Non ricevono niente."
        />
        <Kpi etichetta="Disdette" valore={q(nUsciti)} nota="La riga resta come prova del consenso." />
        <Kpi
          etichetta="Righe mostrate"
          valore={n(righe.length)}
          nota="Le ultime 200, dalla più recente. I tre numeri qui accanto invece li conta il database su tutta la lista."
        />
      </div>

      <Scheda
        titolo="La lista"
        sotto="Dalla più recente. Il verde è chi riceverà davvero le email."
      >
        {righe.length === 0 ? (
          <Vuoto
            titolo={nonLetto ? "Non letto." : "Nessuna iscrizione, ancora."}
            spiega={
              nonLetto
                ? undefined
                : "Il modulo dell'Osservatorio sta sulla landing e in fondo agli articoli del Tabellone."
            }
          />
        ) : (
          <>
            {/* Da 640 in su la tabella; sotto, una scheda per riga: quattro
                colonne dentro 390 punti si spezzavano illeggibili. */}
            <div className="-mx-4 hidden overflow-x-auto sm:-mx-5 sm:block">
            <table className="w-full min-w-[560px] text-[13.5px]">
              <thead>
                <tr className="border-b border-bordo text-left text-[11px] uppercase tracking-[0.1em] text-fumo-2">
                  <th className="px-4 py-2 font-medium sm:px-5">Email</th>
                  <th className="px-4 py-2 font-medium">Comune</th>
                  <th className="px-4 py-2 font-medium">Iscritto il</th>
                  <th className="px-4 py-2 pr-4 font-medium sm:pr-5">Stato</th>
                </tr>
              </thead>
              <tbody>
                {righe.map((r) => (
                  <tr key={r.id} className="border-b border-bordo/60 last:border-0">
                    <td className="max-w-[240px] truncate px-4 py-2.5 sm:px-5" title={r.email}>
                      {r.email}
                    </td>
                    <td className="px-4 py-2.5 text-fumo">{r.comune ?? "-"}</td>
                    <td className="px-4 py-2.5 text-fumo">{dataIt(r.creato_il)}</td>
                    <td className="px-4 py-2.5 pr-4 sm:pr-5">
                      {r.disdetto_il ? (
                        <Bollo tono="rosso">uscito il {dataIt(r.disdetto_il)}</Bollo>
                      ) : r.confermato_il ? (
                        <Bollo tono="verde">confermato</Bollo>
                      ) : (
                        <Bollo tono="attesa">non ha confermato</Bollo>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <ul className="flex flex-col gap-2.5 sm:hidden">
              {righe.map((r) => (
                <li key={r.id} className="rounded-[12px] border border-bordo bg-nebbia/50 p-3.5">
                  <p className="truncate text-[14px] font-medium" title={r.email}>
                    {r.email}
                  </p>
                  <p className="mt-1 text-[12.5px] text-fumo-2">
                    {r.comune ? `${r.comune} · ` : ""}iscritto il {dataIt(r.creato_il)}
                  </p>
                  <p className="mt-2">
                    {r.disdetto_il ? (
                      <Bollo tono="rosso">uscito il {dataIt(r.disdetto_il)}</Bollo>
                    ) : r.confermato_il ? (
                      <Bollo tono="verde">confermato</Bollo>
                    ) : (
                      <Bollo tono="attesa">non ha confermato</Bollo>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Scheda>

      <p className="pb-2 text-[12.5px] leading-relaxed text-fumo-2">
        Le email partono solo verso chi ha confermato. Finché il dominio non è verificato su
        Resend, partono comunque verso il solo indirizzo con cui è stato aperto l&apos;account:
        lo decide Resend, non il nostro codice.
      </p>
    </div>
  );
}
