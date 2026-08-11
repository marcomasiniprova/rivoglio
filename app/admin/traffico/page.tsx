import { Area, BarreOrizzontali, Legenda, Scheda } from "@/components/admin/Grafici";
import { Avviso, Kpi, oNonLetto } from "@/components/admin/Pezzi";
import DaGoogle from "@/components/admin/DaGoogle";
import { soloAdmin } from "@/lib/admin/guardia";
import { leggiCruscotto, leggiSerie } from "@/lib/eventi/lettura";

/**
 * IL TRAFFICO: da dove arrivano le persone e da che paese.
 *
 * Sono i due soli dati di contorno che il registro raccoglie, e ci sono
 * per una ragione precisa: senza, la distribuzione si fa alla cieca e non
 * si sa quale video ha funzionato.
 *
 * ⚠️ LA PROVENIENZA È SOLO IL DOMINIO. `tiktok.com`, mai l'indirizzo del
 * singolo video: quello direbbe quale video ha guardato quella persona,
 * che è un dato su di lei e a noi non serve. Il paese arriva già da
 * Netlify, non lo calcoliamo da un indirizzo IP.
 */
export const dynamic = "force-dynamic";

const GIORNI = 14;

/** Il codice a due lettere di Netlify, detto in italiano. */
const PAESI = new Intl.DisplayNames(["it"], { type: "region" });

const nomePaese = (codice: string) => {
  try {
    return PAESI.of(codice) ?? codice;
  } catch {
    /* Un codice che non è un paese (uno sbaglio, una sigla ritirata) resta
       com'è: meglio due lettere strane che un nome inventato. */
    return codice;
  }
};

export default async function PaginaTraffico() {
  /* Prima riga, sempre. Vedi lib/admin/guardia.ts. */
  await soloAdmin();

  const [c, serie] = await Promise.all([leggiCruscotto(0), leggiSerie(GIORNI)]);

  const visiteSettimana = c.settimana?.visita ?? null;
  const checkSettimana = c.settimana?.check ?? null;
  /* Quanti, fra quelli che arrivano, provano davvero: è il numero che
     dice se il sito convince o se la gente rimbalza. Si calcola solo con
     un denominatore vero. */
  const provano =
    visiteSettimana !== null && checkSettimana !== null && visiteSettimana > 0
      ? Math.round((checkSettimana / visiteSettimana) * 1000) / 10
      : null;

  return (
    <div className="flex flex-col gap-5">
      {c.provenienze === null && (
        <Avviso titolo="Il registro non ha risposto.">
          I numeri di questa schermata vengono dal registro degli eventi: finché non si apre,
          qui trovi &quot;non letto&quot; invece di zero.
        </Avviso>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi
          etichetta="Visite, 7 giorni"
          valore={oNonLetto(visiteSettimana)}
          nota={`Oggi: ${oNonLetto(c.oggi?.visita)}`}
        />
        <Kpi
          etichetta="Analisi, 7 giorni"
          valore={oNonLetto(checkSettimana)}
          nota={`Oggi: ${oNonLetto(c.oggi?.check)}`}
        />
        <Kpi
          etichetta="Provano, su chi arriva"
          className="col-span-2 sm:col-span-1"
          valore={provano === null ? "non letto" : `${provano}%`}
          nota={
            provano === null
              ? "Serve almeno una visita registrata per fare il conto."
              : "Analisi lanciate su visite, ultimi 7 giorni."
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Scheda
          titolo="Da dove arrivano"
          sotto="Il sito che li ha mandati, negli ultimi 7 giorni. Solo il dominio, mai il link intero."
        >
          <BarreOrizzontali
            righe={c.provenienze}
            vuotoTesto="Nessuna provenienza registrata: finora sono arrivati tutti scrivendo l'indirizzo, oppure il registro è appena partito."
          />
        </Scheda>

        <Scheda titolo="Da che paese" sotto="Come lo dichiara Netlify. Nessun calcolo nostro.">
          <BarreOrizzontali
            righe={
              c.paesi === null ? null : c.paesi.map((p) => ({ ...p, nome: nomePaese(p.nome) }))
            }
            vuotoTesto="Nessun paese registrato ancora."
          />
        </Scheda>
      </div>

      <Scheda
        titolo="Visite e analisi, giorno per giorno"
        sotto={`Gli ultimi ${GIORNI} giorni. La riga tratteggiata è oggi.`}
        destra={
          <Legenda
            voci={[
              { nome: "Visite", classe: "bg-menta" },
              { nome: "Analisi", classe: "bg-verde" },
            ]}
          />
        }
      >
        <Area
          giorni={serie}
          serie={[
            {
              nome: "Visite",
              riempimento: "fill-menta/45",
              tratto: "stroke-menta",
              valore: (g) => g.per.visita ?? 0,
            },
            {
              nome: "Analisi",
              riempimento: "fill-verde/25",
              tratto: "stroke-verde",
              valore: (g) => g.per.check ?? 0,
            },
          ]}
        />
      </Scheda>

      {/* ⚠️ Search Console sta QUI e non in una sezione sua: e' la stessa
          domanda ("da dove arriva la gente"), solo che il registro
          risponde per chi e' gia' arrivato e Google per chi non e'
          ancora arrivato. Separarle vorrebbe dire guardare in due posti
          per capire una cosa sola. */}
      <DaGoogle />

      <p className="pb-2 text-[12.5px] leading-relaxed text-fumo-2">
        Qui non si può sapere se una persona è tornata due volte, ed è voluto: il registro
        raccoglie fatti, non persone. Niente indirizzo IP, niente impronta del browser,
        nessun modo di riconoscere qualcuno domani.
      </p>
    </div>
  );
}
