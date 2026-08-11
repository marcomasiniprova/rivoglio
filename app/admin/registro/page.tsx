import Link from "next/link";
import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Bollo, Vuoto, euro, type Tono } from "@/components/admin/Pezzi";
import { oraIt } from "@/lib/admin/dati";
import { soloAdmin } from "@/lib/admin/guardia";
import { leggiRegistro } from "@/lib/eventi/lettura";

/**
 * IL REGISTRO: tutti i fatti, dal più recente.
 *
 * È la scatola nera del sito. Quando qualcosa non torna (un incasso che
 * non diventa pratica, un'analisi che sparisce) si guarda qui, e la
 * risposta è una riga con l'ora dentro.
 *
 * ⚠️ IL FILTRO NON RICARICA NIENTE E NON HA BISOGNO DI JAVASCRIPT: le
 * linguette sono link con un parametro nell'indirizzo. Così un filtro si
 * può mandare a qualcun altro copiando la barra del browser, e la
 * schermata continua ad aggiornarsi da sola come tutte le altre.
 */
export const dynamic = "force-dynamic";

/** I tipi, coi nomi che userebbe una persona. */
const TIPI: { chiave: string; nome: string; tono: Tono }[] = [
  { chiave: "visita", nome: "Visite", tono: "grigio" },
  { chiave: "check", nome: "Analisi", tono: "grigio" },
  { chiave: "verdetto", nome: "Verdetti", tono: "grigio" },
  { chiave: "muro", nome: "Muro", tono: "attesa" },
  { chiave: "sbloccato", nome: "Analisi pagate", tono: "verde" },
  { chiave: "pratica", nome: "Pratiche aperte", tono: "grigio" },
  { chiave: "pagato", nome: "Pratiche pagate", tono: "verde" },
  { chiave: "iscritto", nome: "Iscrizioni", tono: "grigio" },
  { chiave: "guasto", nome: "Guasti", tono: "rosso" },
];

const COLORE: Record<string, string> = {
  pagato: "text-verde",
  sbloccato: "text-verde",
  guasto: "text-red-600",
};

export default async function PaginaRegistro({ searchParams }: PageProps<"/admin/registro">) {
  /* Prima riga, sempre. Vedi lib/admin/guardia.ts. */
  await soloAdmin();

  const p = await searchParams;
  const cerca = typeof p.cerca === "string" ? p.cerca : "";
  const tipoChiesto = typeof p.tipo === "string" ? p.tipo : "";
  const tipo = TIPI.some((t) => t.chiave === tipoChiesto) ? tipoChiesto : "";

  const registro = await leggiRegistro(cerca);
  const righe = (registro?.righe ?? []).filter((r) => !tipo || r.tipo === tipo);

  /** L'indirizzo di una linguetta, tenendo la ricerca in corso. */
  const link = (t: string) => {
    const q = new URLSearchParams();
    if (t) q.set("tipo", t);
    if (cerca) q.set("cerca", cerca);
    const s = q.toString();
    return s ? `/admin/registro?${s}` : "/admin/registro";
  };

  return (
    <div className="flex flex-col gap-5">
      {registro === null && (
        <Avviso titolo="Il registro non si è aperto.">
          O la tabella degli eventi non c&apos;è ancora, o il database non ha risposto. Non è
          un guasto del sito: il check funziona lo stesso.
        </Avviso>
      )}

      {cerca && (
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-bordo bg-white px-4 py-3">
          <p className="text-[13.5px] text-fumo">
            Stai cercando <span className="font-medium text-inchiostro">{cerca}</span> fra volo,
            provenienza, paese, tipo ed esito.
          </p>
          <Link
            href={tipo ? `/admin/registro?tipo=${tipo}` : "/admin/registro"}
            className="ml-auto rounded-[10px] border border-bordo px-3 py-1.5 text-[12.5px] font-medium text-fumo transition-colors hover:border-verde/40 hover:text-inchiostro"
          >
            Togli la ricerca
          </Link>
        </div>
      )}

      {/* Le linguette portano il loro conto: senza, per sapere se ci sono
          guasti bisogna cliccare e scoprire che non ce n'è nessuno. */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Filtra per tipo">
        <Linguetta href={link("")} nome="Tutti" quanti={registro?.righe.length ?? null} acceso={!tipo} />
        {TIPI.map((t) => (
          <Linguetta
            key={t.chiave}
            href={link(t.chiave)}
            nome={t.nome}
            quanti={registro ? (registro.perTipo[t.chiave] ?? 0) : null}
            acceso={tipo === t.chiave}
          />
        ))}
      </nav>

      <Scheda
        titolo="I fatti"
        sotto="Dal più recente. Si guardano gli ultimi 400; il registro non tiene niente che identifichi una persona."
        destra={
          /* "0 righe" sopra un riquadro che dice "Non letto" erano due
             frasi in disaccordo sulla stessa scheda. */
          <Bollo tono="grigio">{registro === null ? "non letto" : `${righe.length} righe`}</Bollo>
        }
      >
        {righe.length === 0 ? (
          <Vuoto
            titolo={
              registro === null
                ? "Non letto."
                : cerca || tipo
                  ? "Nessun fatto con questi filtri."
                  : "Ancora nessun fatto registrato."
            }
            spiega={
              registro !== null && !cerca && !tipo
                ? "Ogni visita, analisi, pagamento e guasto compare qui da solo, con l'ora."
                : undefined
            }
          />
        ) : (
          <ul className="-mx-1 divide-y divide-bordo/70">
            {righe.map((r, i) => (
              <li
                key={`${r.quando}-${i}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1 py-2.5"
              >
                <span className="numeri shrink-0 text-[12px] text-fumo-2">
                  {oraIt.format(new Date(r.quando))}
                </span>
                <span className={`min-w-0 flex-1 text-[13.5px] ${COLORE[r.tipo] ?? "text-fumo"}`}>
                  {r.testo}
                </span>
                {r.paese && (
                  <span className="shrink-0 rounded-pillola bg-nebbia-2 px-2 py-0.5 text-[11px] font-medium text-fumo-2">
                    {r.paese}
                  </span>
                )}
                {r.euro !== null && (
                  <span className="numeri shrink-0 text-[13px] font-medium text-verde">
                    {euro(r.euro)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Scheda>
    </div>
  );
}

function Linguetta({
  href,
  nome,
  quanti,
  acceso,
}: {
  href: string;
  nome: string;
  quanti: number | null;
  acceso: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={acceso ? "true" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-pillola border px-3 py-1.5 text-[12.5px] transition-colors ${
        acceso
          ? "border-verde/35 bg-menta-tenue font-medium text-verde-scuro"
          : "border-bordo bg-white text-fumo hover:border-verde/35 hover:text-inchiostro"
      }`}
    >
      {nome}
      {/* ⚠️ Quando il registro non si è letto il conto NON si scrive: dieci
          punti interrogativi in fila sono rumore, e l'avviso in cima ha già
          detto cosa è successo (visto nel giro visivo). */}
      {quanti !== null && (
        <span className={`numeri text-[11.5px] ${acceso ? "text-verde" : "text-fumo-2"}`}>
          {quanti}
        </span>
      )}
    </Link>
  );
}
