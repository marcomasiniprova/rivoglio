import type { Metadata } from "next";
import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Bollo } from "@/components/admin/Pezzi";
import { soloAdmin } from "@/lib/admin/guardia";
import { fonti, passiDelCheck } from "@/lib/admin/motore";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * COME LAVORA IL MOTORE, E CON COSA.
 *
 * 🔴 Valerio, 13/08: «spiegami pezzo per pezzo come lavora il nostro
 * motore, perché io ho capito che non usiamo solo AeroDataBox ma usiamo
 * anche un database nostro, giusto? Indicami tutte le fonti, indicami
 * dalla A alla Z cosa succede quando uno sta facendo il check. Dimmi
 * anche come vederlo, dimmi anche lo stato del database, dimmi tutto
 * letteralmente. Voglio capire con cosa stiamo lavorando».
 *
 * Perché è una PAGINA e non un documento nel repository: regola sua del
 * 12/08, «non lo leggerò mai, dammi il sunto in chat o dentro il sito».
 * E perché un documento invecchia in silenzio, mentre questa pagina i
 * numeri li conta ogni volta che la apri.
 *
 * ⚠️ Nessuna chiave e nessun valore segreto compare qui: si spiegano
 * meccanismi. Il ruolo admin serve lo stesso, per prudenza.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il motore | Rivolio",
  robots: { index: false, follow: false },
};

/** Le tabelle vere, con quello che ci sta dentro spiegato in una riga. */
const TABELLE: { nome: string; cosa: string }[] = [
  { nome: "voli", cosa: "Un volo per riga, con gli orari veri e la risposta grezza del fornitore. È la memoria che evita di ricomprare due volte lo stesso dato." },
  { nome: "verifiche", cosa: "Ogni analisi fatta da chiunque, anche senza account. È l'imbuto e la prova di cosa abbiamo detto." },
  { nome: "pratiche", cosa: "I reclami aperti e pagati. Una riga per cliente pagante." },
  { nome: "pratiche_eventi", cosa: "La storia di ogni pratica, passo per passo. Ci vive anche la risposta della compagnia e la sua analisi." },
  { nome: "scioperi", cosa: "Le date di sciopero proclamate. Rendono il motore più prudente in quei giorni." },
  { nome: "osservatorio_ritardi", cosa: "L'indice ritardi degli otto scali italiani, per la striscia sulla landing." },
  { nome: "iscritti", cosa: "Chi si è iscritto all'Osservatorio, col doppio consenso." },
  { nome: "profili", cosa: "Gli account: nickname, ruolo, adesione alla classifica." },
  { nome: "eventi", cosa: "Il registro di cosa succede sul sito: fatti, non persone." },
];

type Riga = { nome: string; cosa: string; righe: number | null };

export default async function PaginaMotore() {
  await soloAdmin();

  /* Lo stato del database, contato adesso.
     ⚠️ Quando un numero non si legge si scrive che non si è letto, mai
     zero: è la regola di casa, e qui varrebbe doppio perché uno zero su
     "pratiche" si leggerebbe come "non ha comprato nessuno". */
  let tabelle: Riga[] = TABELLE.map((t) => ({ ...t, righe: null }));
  if (SERVIZIO_ATTIVO) {
    const db = supabaseServizio();
    tabelle = await Promise.all(
      TABELLE.map(async (t) => {
        try {
          const { count, error } = await db
            .from(t.nome)
            .select("*", { count: "exact", head: true });
          return { ...t, righe: error ? null : (count ?? 0) };
        } catch {
          return { ...t, righe: null };
        }
      }),
    );
  }

  const elenco = fonti();
  const passi = passiDelCheck();
  const nostre = elenco.filter((f) => f.chi === "nostra").length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[14px] leading-relaxed text-fumo">
        Il motore non è una cosa sola e non è AeroDataBox.{" "}
        <strong className="text-inchiostro">
          Le fonti sono {elenco.length}, e {nostre} sono nostre.
        </strong>{" "}
        Qui c&apos;è ognuna, cosa succede dal primo all&apos;ultimo passo di un&apos;analisi, e
        quanto c&apos;è dentro il database adesso. I numeri sono contati quando apri la pagina,
        non scritti a mano.
      </p>

      {/* ────────────────────────────────────────────── le fonti */}
      <Scheda
        titolo="Le fonti, una per una"
        sotto="«Nostra» vuol dire che non la paghiamo e non può chiudere da un giorno all'altro."
      >
        <ul className="flex flex-col gap-2.5">
          {elenco.map((f) => (
            <li key={f.nome} className="rounded-[12px] border border-bordo bg-nebbia/50 px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{f.nome}</span>
                <Bollo tono={f.chi === "nostra" ? "verde" : "grigio"}>
                  {f.chi === "nostra" ? "nostra" : "esterna"}
                </Bollo>
                {f.quanto && (
                  <span className="numeri text-[12.5px] text-fumo">{f.quanto}</span>
                )}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fumo">{f.da}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fumo">
                <span className="font-medium text-inchiostro">Se sparisce:</span> {f.seManca}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fumo">
                <span className="font-medium text-inchiostro">Costo:</span> {f.costo}
              </p>
              <p className="numeri mt-1.5 text-[12px] text-fumo-2">{f.dove}</p>
            </li>
          ))}
        </ul>
      </Scheda>

      {/* ────────────────────────────────────── il giro di un check */}
      <Scheda
        titolo="Cosa succede quando uno preme il bottone"
        sotto="Dalla A alla Z. L'ordine non è decorativo: spostare un passo rimette in piedi un difetto che abbiamo già avuto."
      >
        <ol className="flex flex-col gap-2.5">
          {passi.map((p) => (
            <li
              key={p.numero}
              className="rounded-[12px] border border-bordo bg-nebbia/50 px-4 py-3.5"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="numeri flex size-6 shrink-0 items-center justify-center rounded-full bg-verde text-[12px] font-semibold text-white">
                  {p.numero}
                </span>
                <span className="font-medium">{p.titolo}</span>
              </div>
              <p className="mt-1.5 pl-[34px] text-[13px] leading-relaxed text-fumo">{p.cosa}</p>
              {p.nota && (
                <p className="mt-1.5 pl-[34px] text-[13px] leading-relaxed text-fumo">
                  <span className="font-medium text-inchiostro">⚠️ </span>
                  {p.nota}
                </p>
              )}
              <p className="numeri mt-1.5 pl-[34px] text-[12px] text-fumo-2">{p.dove}</p>
            </li>
          ))}
        </ol>
      </Scheda>

      {/* ──────────────────────────────────── lo stato del database */}
      <Scheda
        titolo="Cosa c'è dentro il database, adesso"
        sotto="Un solo database per tutto: sito, web app e app sul telefono leggono e scrivono qui."
        destra={
          SERVIZIO_ATTIVO ? undefined : <Bollo tono="attesa">non letto</Bollo>
        }
      >
        {!SERVIZIO_ATTIVO && (
          <Avviso titolo="Manca la chiave del database." tono="rosso">
            Senza <code>SUPABASE_SECRET_KEY</code> i conteggi non si possono leggere. La struttura
            qui sotto è comunque quella vera.
          </Avviso>
        )}
        <ul className="mt-3 flex flex-col">
          {tabelle.map((t) => (
            <li
              key={t.nome}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-bordo py-2.5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="numeri text-[13.5px] font-medium">{t.nome}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-fumo">{t.cosa}</p>
              </div>
              <span
                className={`numeri shrink-0 font-display leading-none tracking-[-0.03em] ${
                  t.righe === null ? "text-[14px] text-fumo-2" : "text-[19px]"
                }`}
              >
                {t.righe === null ? "non letto" : t.righe.toLocaleString("it-IT")}
              </span>
            </li>
          ))}
        </ul>
      </Scheda>

      {/* ─────────────────────────────────────────── come si guarda */}
      <Scheda
        titolo="Come vederlo con i tuoi occhi"
        sotto="Tre modi, dal più veloce al più profondo."
      >
        <ol className="flex flex-col gap-3 text-[13.5px] leading-relaxed">
          <li>
            <strong className="text-inchiostro">Fai un check vero</strong> dal sito e guarda il
            verdetto: sotto il risultato c&apos;è già scritto da quali orari esce il numero, e
            quella riga la vede anche il cliente. È la prova più onesta, perché è la stessa che
            facciamo vedere a chi paga.
          </li>
          <li>
            <strong className="text-inchiostro">Apri Verdetti</strong> qui nel pannello: ogni
            analisi idonea porta l&apos;orario previsto, quello effettivo, la fonte e la versione
            delle regole. Se un verdetto non ti torna, il confronto con la fonte si fa da lì in
            trenta secondi.
          </li>
          <li>
            <strong className="text-inchiostro">Fai girare le prove del motore</strong> dal tuo
            PC: <code className="numeri">npm run eval</code>. Passa i casi etichettati a mano
            dentro le regole vere e si ferma se anche uno solo esce diverso da come deve. È il
            controllo che gira prima di ogni pubblicazione.
          </li>
        </ol>
      </Scheda>
    </div>
  );
}
