import Link from "next/link";
import { FASCE_GARANTITE, SIGNIFICATO, TINTA } from "@/lib/eventi/significato";
import { giornoEData } from "@/lib/date";
import type { ScioperoPubblico } from "@/lib/scioperi/scioperi";

/**
 * I mattoni delle pagine evento.
 *
 * Le pagine evento sono l'opposto del blog: il blog lo scrivo a mano una
 * volta e resta buono per anni, queste si costruiscono da sole dai dati
 * che abbiamo già (la tabella `scioperi` e l'Osservatorio) e servono un
 * giorno solo. Il giorno di uno sciopero la gente cerca "sciopero aerei
 * oggi", non "reclamo Ryanair": un blog quel traffico non lo prende,
 * perché non può avere un articolo per ogni giorno del calendario.
 *
 * Tutto quello che sta qui dentro deve reggere anche a database spento:
 * senza righe, le pagine mostrano comunque le regole, le fasce e il check.
 */

/* ---------------- la testata di una pagina evento ---------------- */

export function TestataEvento({
  occhiello,
  titolo,
  corsivo,
  sottotitolo,
  briciole,
}: {
  occhiello: string;
  titolo: string;
  corsivo?: string;
  sottotitolo: string;
  briciole: { nome: string; dove: string }[];
}) {
  return (
    <header className="px-5 pt-12 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-[860px]">
        <nav aria-label="Percorso" className="text-[14px] text-fumo">
          {briciole.map((b, i) => (
            <span key={b.dove}>
              {i > 0 && <span className="px-2">/</span>}
              <Link href={b.dove} className="font-medium transition-colors hover:text-verde-scuro">
                {b.nome}
              </Link>
            </span>
          ))}
        </nav>

        <p className="mt-6 text-[15px] font-semibold text-verde-scuro">{occhiello}</p>
        <h1 className="mt-2 font-display text-[clamp(2.1rem,5.2vw,3.3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-inchiostro">
          {titolo}
          {corsivo && (
            <>
              {" "}
              <span className="corsivo font-normal text-verde-scuro">{corsivo}</span>
            </>
          )}
        </h1>
        <p className="mt-5 text-[18px] leading-relaxed text-fumo">{sottotitolo}</p>
      </div>
    </header>
  );
}

/* ---------------- il riquadro "com'è messa adesso" ---------------- */

export function Semaforo({
  stato,
  titolo,
  testo,
}: {
  stato: "calmo" | "attenzione" | "brutto";
  titolo: string;
  testo: string;
}) {
  const tinta =
    stato === "calmo"
      ? "border-verde/35 bg-verde/8"
      : stato === "attenzione"
        ? "border-sole/60 bg-sole/12"
        : "border-red-300 bg-red-50";
  const pallino =
    stato === "calmo" ? "bg-verde" : stato === "attenzione" ? "bg-sole" : "bg-red-500";

  return (
    <div className={`rounded-[16px] border px-6 py-5 sm:px-7 ${tinta}`}>
      <div className="flex items-start gap-3.5">
        <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${pallino}`} aria-hidden="true" />
        <div>
          <p className="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] text-inchiostro">
            {titolo}
          </p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-fumo">{testo}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- la scheda di un singolo sciopero ---------------- */

export function SchedaSciopero({
  sciopero,
  conLink = true,
}: {
  sciopero: ScioperoPubblico;
  conLink?: boolean;
}) {
  const s = SIGNIFICATO[sciopero.tipo] ?? SIGNIFICATO.altro;
  const tinta = TINTA[s.peso];

  return (
    <article className="rounded-[16px] border border-bordo bg-white p-6 shadow-[0_18px_44px_-36px_rgba(5,46,31,.5)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {conLink ? (
          <Link
            href={`/sciopero-aerei/${sciopero.data}`}
            className="font-display text-[19px] font-semibold tracking-[-0.02em] text-inchiostro underline-offset-4 hover:underline"
          >
            {giornoEData(sciopero.data)}
          </Link>
        ) : (
          <p className="font-display text-[19px] font-semibold tracking-[-0.02em] text-inchiostro">
            {giornoEData(sciopero.data)}
          </p>
        )}
        <span
          className={`inline-flex items-center rounded-pillola border px-2.5 py-1 text-[12.5px] font-medium leading-none ${tinta.pillola}`}
        >
          {s.etichetta}
        </span>
      </div>

      <p className="mt-3 text-[15.5px] leading-relaxed text-fumo">{sciopero.descrizione}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-bordo pt-4 text-[14.5px] sm:grid-cols-2">
        <div>
          <dt className="font-medium text-inchiostro">Chi si ferma</dt>
          <dd className="mt-0.5 text-fumo">{sciopero.settore}</dd>
        </div>
        <div>
          <dt className="font-medium text-inchiostro">Compagnie coinvolte</dt>
          <dd className="mt-0.5 text-fumo">
            {sciopero.compagnie.length > 0
              ? sciopero.compagnie.join(", ")
              : "Tutte: è un'agitazione che tocca i voli del giorno, non una compagnia sola."}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[15px] leading-relaxed text-inchiostro">{s.spiegazione}</p>

      {sciopero.fonteUrl && (
        <p className="mt-4 text-[13.5px] text-fumo">
          Fonte:{" "}
          <a
            href={sciopero.fonteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-verde-scuro underline underline-offset-2"
          >
            la proclamazione
          </a>
        </p>
      )}
    </article>
  );
}

/* ---------------- cosa ti spetta comunque ---------------- */

export function CosaTiSpettaComunque() {
  return (
    <section className="rounded-[18px] border border-bordo bg-white p-7 sm:p-8">
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
        Quello che ti spetta comunque, sciopero o no
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-fumo">
        Questa è la parte che quasi nessuno sa, ed è la più utile: la compensazione
        può saltare, ma queste tre cose no. Valgono anche quando lo sciopero viene
        riconosciuto come circostanza eccezionale.
      </p>
      <ol className="mt-6 flex flex-col gap-5">
        {[
          {
            titolo: "La scelta: rimborso o volo alternativo",
            testo:
              "Se il volo è cancellato puoi scegliere fra il rimborso del biglietto e un altro volo verso la stessa destinazione, appena possibile o in una data che decidi tu. La scelta è tua, non della compagnia. Il rimborso è dovuto entro sette giorni.",
          },
          {
            titolo: "L'assistenza mentre aspetti",
            testo:
              "Pasti e bevande in proporzione all'attesa, due telefonate o email, e se l'attesa passa la notte l'albergo con il trasferimento da e per l'aeroporto. Se al banco non c'è nessuno, paga tu e tieni gli scontrini: si chiedono dopo.",
          },
          {
            titolo: "Le fasce garantite",
            testo: `Durante gli scioperi del trasporto aereo restano garantiti i voli nelle fasce ${FASCE_GARANTITE.join(" e ")}, e l'elenco dei voli garantiti viene pubblicato. Se il tuo era dentro una fascia ed è saltato lo stesso, è un elemento che pesa a tuo favore.`,
          },
        ].map((v, i) => (
          <li key={v.titolo} className="flex gap-4">
            <span className="numeri mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-verde text-[15px] font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-display text-[17.5px] font-semibold tracking-[-0.02em] text-inchiostro">
                {v.titolo}
              </p>
              <p className="mt-1 text-[15.5px] leading-relaxed text-fumo">{v.testo}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- la tabella dei tipi ---------------- */

export function TabellaTipiSciopero() {
  const ordine: (keyof typeof SIGNIFICATO)[] = [
    "personale_compagnia",
    "atc_esterno",
    "handling",
    "generale",
  ];
  return (
    <section>
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
        Non tutti gli scioperi valgono uguale
      </h2>
      <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-fumo">
        È la distinzione che decide se la compagnia deve pagarti la compensazione oppure
        no, e quasi nessuno la scrive. In ogni caso la regola di fondo è una sola: tocca
        alla compagnia dimostrare la circostanza eccezionale e il suo effetto sul tuo volo,
        non a te dimostrare il contrario.
      </p>

      <div className="tabella-scorrevole mt-6 rounded-[16px] border border-bordo bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-bordo">
              <th className="px-5 py-4 text-left font-semibold text-inchiostro">Chi sciopera</th>
              <th className="px-5 py-4 text-left font-semibold text-inchiostro">
                La compensazione
              </th>
              <th className="px-5 py-4 text-left font-semibold text-inchiostro">Perché</th>
            </tr>
          </thead>
          <tbody>
            {ordine.map((chiave) => {
              const s = SIGNIFICATO[chiave];
              return (
                <tr key={chiave} className="border-b border-bordo last:border-0 align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-inchiostro">{s.etichetta}</p>
                    <p className="mt-1 text-[14px] leading-snug text-fumo">{s.chi}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-pillola border px-2.5 py-1 text-[12.5px] font-medium leading-none ${TINTA[s.peso].pillola}`}
                    >
                      {TINTA[s.peso].parola}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[14.5px] leading-relaxed text-fumo">
                    {s.spiegazione}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- le fonti in fondo ---------------- */

export function FontiEvento({
  fonti,
  nota,
}: {
  fonti: readonly { titolo: string; url: string }[];
  nota?: string;
}) {
  return (
    <section className="rounded-[16px] border border-bordo bg-nebbia-2/60 p-6 sm:p-7">
      <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-inchiostro">
        Da dove vengono questi dati
      </h2>
      {nota && <p className="mt-2 text-[14.5px] leading-relaxed text-fumo">{nota}</p>}
      <ol className="mt-4 flex flex-col gap-2.5">
        {fonti.map((f, i) => (
          <li key={f.url} className="flex gap-3 text-[14.5px] leading-relaxed">
            <span className="numeri shrink-0 font-semibold text-fumo-2">{i + 1}.</span>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-verde-scuro underline decoration-verde/40 underline-offset-[3px] hover:decoration-verde"
            >
              {f.titolo}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- il ponte verso le guide ---------------- */

export function DaLeggere({
  voci,
}: {
  voci: { titolo: string; dove: string; testo: string }[];
}) {
  return (
    <section>
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-inchiostro">
        Se vuoi capirci di più
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {voci.map((v) => (
          <Link
            key={v.dove}
            href={v.dove}
            className="group rounded-[14px] border border-bordo bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/40"
          >
            <p className="font-display text-[17px] font-semibold leading-snug tracking-[-0.02em] text-inchiostro">
              {v.titolo}
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumo">{v.testo}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
