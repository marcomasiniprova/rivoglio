import { FolderOpen } from "lucide-react";
import type { Dossier } from "@/lib/pratiche/dossier";

/**
 * IL FASCICOLO DEL TUO CASO, aperto.
 *
 * Scelta di Valerio col popup del 13/08: il dossier lo legge l'AI prima
 * di scrivere qualsiasi cosa, **e lo vede anche l'utente**. È la
 * trasparenza che vendiamo applicata al suo caso: qui c'è tutto quello
 * che sappiamo del suo volo, da dove viene ogni numero, e cosa gli ha
 * risposto la compagnia.
 *
 * ⚠️ QUELLO CHE NON SAPPIAMO SI SCRIVE, non si nasconde. Una riga
 * mancante fa nascere la domanda giusta ("e questo perché non ce l'hai?")
 * molto meglio di una riga assente, che non la fa nascere affatto.
 *
 * ⚠️ È CHIUSO DI DEFAULT. Chi apre la pratica vuole sapere cosa fare
 * adesso; il fascicolo è la risposta alla domanda successiva, "ma tu cosa
 * sai del mio caso?". Metterlo aperto sopra il prossimo passo
 * seppellirebbe la cosa che conta.
 */

const oraSolo = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : null;

function Riga({ voce, valore }: { voce: string; valore: string | null }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-bordo/70 py-2 last:border-0">
      <span className="text-[13.5px] text-fumo">{voce}</span>
      <span
        className={`text-right text-[14px] ${
          valore === null ? "text-fumo-2 italic" : "font-medium text-inchiostro"
        }`}
      >
        {/* Mai un trattino: "non lo sappiamo" si legge come una risposta,
            un trattino si legge come un campo che si è rotto. */}
        {valore ?? "non lo sappiamo"}
      </span>
    </div>
  );
}

export default function Fascicolo({ dossier }: { dossier: Dossier }) {
  const d = dossier;
  const ritardo =
    d.volo.ritardoMinuti === null
      ? null
      : `${Math.floor(d.volo.ritardoMinuti / 60)} h e ${d.volo.ritardoMinuti % 60} min`;

  return (
    <details className="group rounded-2xl border border-bordo bg-white px-6 py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
          <FolderOpen className="size-4 shrink-0 text-verde" aria-hidden="true" />
          Il fascicolo del tuo caso
        </span>
        <span className="text-sm font-medium text-verde group-open:hidden">Apri</span>
        <span className="hidden text-sm font-medium text-verde group-open:inline">Chiudi</span>
      </summary>

      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-fumo">
        Tutto quello che sappiamo del tuo volo, e da dove lo sappiamo. È lo stesso fascicolo che
        leggiamo noi prima di scriverti il reclamo.
      </p>

      <div className="mt-4">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">Il volo</p>
        <div className="mt-1">
          <Riga voce="Numero" valore={d.volo.numero} />
          <Riga voce="Tratta" valore={d.volo.tratta} />
          <Riga voce="Compagnia che l'ha operato" valore={d.volo.compagnia} />
          <Riga voce="Doveva arrivare alle (UTC)" valore={oraSolo(d.volo.arrivoPrevisto)} />
          <Riga voce="È arrivato alle (UTC)" valore={oraSolo(d.volo.arrivoEffettivo)} />
          <Riga voce="Ritardo verificato" valore={ritardo} />
          <Riga
            voce="Distanza in linea d'aria"
            valore={d.volo.km === null ? null : `${Math.round(d.volo.km)} km`}
          />
          <Riga voce="Da dove viene il dato" valore={d.volo.fonte} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
          Cosa ti spetta
        </p>
        <div className="mt-1">
          <Riga
            voce="Fascia per passeggero"
            valore={d.diritto.fascia === null ? null : `${d.diritto.fascia}€`}
          />
          <Riga voce="Passeggeri nella pratica" valore={String(d.diritto.passeggeri)} />
          <Riga
            voce="Totale richiesto"
            valore={d.diritto.totale === null ? null : `${d.diritto.totale}€`}
          />
          <Riga voce="Perché" valore={d.diritto.motivoMotore} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
          I tuoi documenti
        </p>
        <div className="mt-1">
          <Riga
            voce="Carta d'imbarco"
            valore={
              d.percorso.documentoCaricato
                ? (d.percorso.documentoEsito ?? "caricata")
                : d.percorso.documentoSaltato
                  ? "hai dichiarato di non averla"
                  : "non ancora caricata"
            }
          />
        </div>
      </div>

      {(d.rifiuto.etichetta || d.rifiuto.testoLoro) && (
        <div className="mt-5">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
            Cosa ha risposto la compagnia
          </p>
          <div className="mt-1">
            <Riga voce="Motivo del no" valore={d.rifiuto.etichetta} />
            <Riga
              voce="Quanto regge, secondo noi"
              valore={
                d.rifiuto.peso === "debole"
                  ? "poco: di solito questo no non tiene"
                  : d.rifiuto.peso === "dipende"
                    ? "dipende dai fatti che devono provare loro"
                    : d.rifiuto.peso === "solido"
                      ? "può reggere, e te lo diciamo"
                      : null
              }
            />
          </div>
          {d.rifiuto.testoLoro && (
            <details className="mt-3">
              <summary className="cursor-pointer list-none py-1 text-[13.5px] font-medium text-verde [&::-webkit-details-marker]:hidden">
                Rileggi la loro risposta
              </summary>
              <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-nebbia px-4 py-3 text-[13.5px] leading-relaxed text-fumo">
                {d.rifiuto.testoLoro}
              </p>
            </details>
          )}
        </div>
      )}
    </details>
  );
}
