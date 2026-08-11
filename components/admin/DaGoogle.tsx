import { Scheda } from "@/components/admin/Grafici";
import { leggiRicerche, SEARCH_CONSOLE_ATTIVA } from "@/lib/admin/search-console";

/**
 * COSA CERCA LA GENTE SU GOOGLE PER TROVARCI.
 *
 * ⚠️ PERCHÉ QUESTI NUMERI VALGONO PIÙ DI QUELLI DEL REGISTRO. Il registro
 * dice cosa fa chi è GIÀ arrivato; questo dice **chi non è arrivato**:
 * quante volte siamo comparsi su Google senza che nessuno ci cliccasse, e
 * per quali parole. È l'unico posto dove si vede la domanda che c'è là
 * fuori invece della propria bolla.
 *
 * ⚠️ Se le tre variabili non ci sono, la scheda non tace: spiega cosa
 * manca e cosa ci vedresti. Una sezione che sparisce fa credere che non
 * esista.
 */

const NUM = new Intl.NumberFormat("it-IT");

export default async function DaGoogle() {
  const r = SEARCH_CONSOLE_ATTIVA ? await leggiRicerche(10) : null;

  if (!SEARCH_CONSOLE_ATTIVA) {
    return (
      <Scheda
        titolo="Cosa cerca la gente su Google"
        sotto="Non ancora collegato: mancano le chiavi di Search Console."
      >
        <div className="rounded-[12px] bg-nebbia px-5 py-4">
          <p className="text-[14px] leading-relaxed text-fumo">
            Quando è collegato, qui vedi <strong>per quali parole</strong> Rivolio compare
            su Google, <strong>quante volte</strong> lo vedono, quanti ci cliccano e a che
            posizione siamo. Sono i numeri che dicono su cosa scrivere il prossimo
            articolo.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-fumo-2">
            Non mette cookie e non serve nessun banner: i dati li ha già Google perché è
            Google a mostrare i risultati, e arrivano già sommati. Per accenderlo servono
            tre variabili su Netlify: <code>GOOGLE_SA_EMAIL</code>,{" "}
            <code>GOOGLE_SA_KEY</code> e <code>GSC_SITO</code>.
          </p>
        </div>
      </Scheda>
    );
  }

  if (!r) {
    return (
      <Scheda titolo="Cosa cerca la gente su Google" sotto="Google non ha risposto.">
        <p className="text-[14px] text-fumo-2">
          Le chiavi ci sono ma la lettura non è riuscita. Di solito è una cosa sola:
          l&apos;account di servizio non è stato aggiunto fra gli utenti della proprietà
          in Search Console.
        </p>
      </Scheda>
    );
  }

  const vuoto = r.parole.length === 0;

  return (
    <Scheda
      titolo="Cosa cerca la gente su Google"
      sotto={`Dal ${r.da} al ${r.a}. Google consolida i dati con due o tre giorni di ritardo.`}
    >
      {vuoto ? (
        <p className="text-[14px] leading-relaxed text-fumo-2">
          Google non ha ancora registrato nessuna ricerca che porti qui. È normale prima
          del lancio: le pagine devono essere indicizzate, e poi salire. Si misura in
          settimane, non in giorni.
        </p>
      ) : (
        <>
          <p className="mb-4 text-[13.5px] leading-relaxed text-fumo">
            In queste dieci parole siamo comparsi{" "}
            <strong className="text-inchiostro">{NUM.format(r.visteTotali)}</strong> volte e
            ci hanno cliccato <strong className="text-inchiostro">{NUM.format(r.clicTotali)}</strong>{" "}
            volte. La <em>posizione</em> è il posto medio nei risultati: 1 è il primo. Sotto
            il decimo posto quasi nessuno clicca, quindi le parole con tante viste e
            posizione alta sono quelle su cui conviene scrivere.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[14px]">
              <thead>
                <tr className="border-b border-bordo text-left text-[11.5px] uppercase tracking-[0.1em] text-fumo-2">
                  <th className="py-2 font-medium">Parola cercata</th>
                  <th className="py-2 text-right font-medium">Viste</th>
                  <th className="py-2 text-right font-medium">Clic</th>
                  <th className="py-2 text-right font-medium">Posizione</th>
                </tr>
              </thead>
              <tbody>
                {r.parole.map((p) => (
                  <tr key={p.chiave} className="border-b border-bordo/60">
                    <td className="py-2.5 pr-3 text-fumo">{p.chiave}</td>
                    <td className="py-2.5 text-right text-fumo">{NUM.format(p.viste)}</td>
                    <td className="py-2.5 text-right font-medium text-inchiostro">
                      {NUM.format(p.clic)}
                    </td>
                    <td className="py-2.5 text-right text-fumo">
                      {p.posizione.toLocaleString("it-IT", { minimumFractionDigits: 1 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Scheda>
  );
}
