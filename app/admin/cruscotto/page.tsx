import type { Metadata } from "next";
import { soloAdmin } from "@/lib/admin/guardia";
import { leggiCruscotto } from "@/lib/eventi/lettura";
import { TELEGRAM_ATTIVO } from "@/lib/eventi/telegram";

/**
 * IL CRUSCOTTO (richiesta di Valerio, 11/08).
 *
 * «Così ho il controllo totale del mio business e vedo tutto
 * concretamente.» Questa pagina è quella frase, resa una cosa che si
 * apre.
 *
 * Cosa mostra, in ordine di quanto conta: i soldi, poi quante persone
 * arrivano e quante si fermano lungo la strada, poi da dove vengono, poi
 * gli ultimi fatti in diretta.
 *
 * ⚠️ Si aggiorna da sola ogni 20 secondi. Non è una scelta estetica:
 * durante la distribuzione questa pagina resta aperta su un secondo
 * schermo, e ricaricarla a mano ogni volta è il motivo per cui i
 * cruscotti si smettono di guardare.
 *
 * ⚠️ Quando un numero non si legge si scrive che non si è letto, invece
 * di stampare zero. Uno zero inventato si legge come «oggi non è venuto
 * nessuno», ed è il modo più veloce per prendere una decisione sbagliata.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cruscotto | Rivolio",
  robots: { index: false, follow: false },
};

const euro = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

const ORA = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Rome",
});

/** I passi dell'imbuto, nell'ordine in cui li fa una persona. */
const IMBUTO = [
  { chiave: "visita", nome: "Arrivano sul sito" },
  { chiave: "check", nome: "Lanciano un'analisi" },
  { chiave: "muro", nome: "Vedono il muro" },
  { chiave: "sbloccato", nome: "Pagano l'analisi" },
  { chiave: "pratica", nome: "Aprono la pratica" },
  { chiave: "pagato", nome: "Pagano la pratica" },
] as const;

const COLORE: Record<string, string> = {
  pagato: "text-verde",
  sbloccato: "text-verde",
  guasto: "text-errore",
};

export default async function PaginaCruscotto() {
  /* ⚠️ Prima riga, sempre. `proxy.ts` chiede solo di essere collegati, e
     collegato lo è anche un cliente qualsiasi: senza questa riga gli
     incassi e le provenienze del traffico li vedeva chiunque avesse un
     account. */
  await soloAdmin();
  const c = await leggiCruscotto();
  const spento = c.ultimi === null;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      {/* 20 secondi: abbastanza spesso da sembrare in diretta, abbastanza
          raro da non pesare sul database durante un picco. */}
      <meta httpEquiv="refresh" content="20" />

      <a
        href="/admin"
        className="text-[13.5px] font-medium text-fumo transition-colors hover:text-inchiostro"
      >
        ← Pannello
      </a>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.03em]">Cruscotto</h1>
        <p className="text-[13px] text-fumo-2">
          Si aggiorna da solo ogni 20 secondi · {ORA.format(new Date())}
        </p>
      </div>

      {spento && (
        <div className="mt-6 rounded-2xl border border-sole bg-sole/20 p-5">
          <p className="font-medium text-inchiostro">Il registro non risponde.</p>
          <p className="mt-1 text-[14px] leading-relaxed text-fumo">
            O la tabella degli eventi non è ancora stata creata, o il database non
            è raggiungibile da qui. Non è un guasto del sito: il check continua a
            funzionare, semplicemente questi numeri non si vedono.
          </p>
        </div>
      )}

      {/* ── I SOLDI, per primi ────────────────────────────────────── */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[
          { titolo: "Incassato oggi", n: c.incassoOggi },
          { titolo: "Incassato in 7 giorni", n: c.incassoSettimana },
        ].map((x) => (
          <div key={x.titolo} className="rounded-2xl border border-bordo bg-white p-6">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fumo-2">
              {x.titolo}
            </p>
            <p className="mt-2 font-display text-[2.4rem] leading-none tracking-[-0.03em] text-verde">
              {x.n === null ? "non letto" : euro(x.n)}
            </p>
          </div>
        ))}
      </div>

      {/* ── L'IMBUTO: dove si ferma la gente ──────────────────────── */}
      <h2 className="mt-9 font-display text-[1.35rem] tracking-[-0.02em]">
        Il percorso, oggi e in 7 giorni
      </h2>
      <p className="mt-1 text-[13.5px] text-fumo">
        Ogni riga è un passo. Dove il numero crolla, è lì che perdi la gente.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-[14.5px]">
          <thead>
            <tr className="border-b border-bordo text-left text-[12.5px] uppercase tracking-[0.1em] text-fumo-2">
              <th className="py-2 font-medium">Passo</th>
              <th className="py-2 text-right font-medium">Oggi</th>
              <th className="py-2 text-right font-medium">7 giorni</th>
            </tr>
          </thead>
          <tbody>
            {IMBUTO.map((p) => (
              <tr key={p.chiave} className="border-b border-bordo/60">
                <td className="py-2.5 text-fumo">{p.nome}</td>
                <td className="py-2.5 text-right font-medium text-inchiostro">
                  {c.oggi === null ? "?" : (c.oggi[p.chiave] ?? 0)}
                </td>
                <td className="py-2.5 text-right text-fumo">
                  {c.settimana === null ? "?" : (c.settimana[p.chiave] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c.conversioneMuro !== null && (
        <p className="mt-3 text-[13.5px] text-fumo">
          Di chi vede il muro, paga il{" "}
          <span className="font-medium text-inchiostro">{c.conversioneMuro}%</span>.
        </p>
      )}

      {/* ── DA DOVE ARRIVANO ─────────────────────────────────────── */}
      <div className="mt-9 grid gap-6 sm:grid-cols-2">
        {[
          { titolo: "Da dove arrivano", righe: c.provenienze },
          { titolo: "Da che paese", righe: c.paesi },
        ].map((b) => (
          <div key={b.titolo}>
            <h2 className="font-display text-[1.2rem] tracking-[-0.02em]">{b.titolo}</h2>
            <div className="mt-3 space-y-1.5">
              {b.righe === null || b.righe.length === 0 ? (
                <p className="text-[13.5px] text-fumo-2">
                  {b.righe === null ? "Non letto." : "Ancora niente."}
                </p>
              ) : (
                b.righe.map((r) => (
                  <div key={r.nome} className="flex items-baseline justify-between text-[14px]">
                    <span className="text-fumo">{r.nome}</span>
                    <span className="font-medium text-inchiostro">{r.quanti}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── IN DIRETTA ───────────────────────────────────────────── */}
      <h2 className="mt-9 font-display text-[1.35rem] tracking-[-0.02em]">In diretta</h2>
      <div className="mt-4 divide-y divide-bordo/60 rounded-2xl border border-bordo bg-white">
        {c.ultimi === null || c.ultimi.length === 0 ? (
          <p className="p-5 text-[14px] text-fumo-2">
            {c.ultimi === null ? "Non letto." : "Ancora nessun fatto registrato."}
          </p>
        ) : (
          c.ultimi.map((r, i) => (
            <div key={`${r.quando}-${i}`} className="flex items-baseline gap-4 px-5 py-2.5">
              <span className="shrink-0 font-mono text-[12.5px] text-fumo-2">
                {ORA.format(new Date(r.quando))}
              </span>
              <span className={`flex-1 text-[14px] ${COLORE[r.tipo] ?? "text-fumo"}`}>
                {r.testo}
              </span>
              {r.euro !== null && (
                <span className="shrink-0 text-[14px] font-medium text-verde">{euro(r.euro)}</span>
              )}
            </div>
          ))
        )}
      </div>

      <p className="mt-7 text-[13px] leading-relaxed text-fumo-2">
        Qui non c&apos;è nessun indirizzo IP e nessuna impronta del browser: sono
        fatti, non persone. Il TIN sul telefono è{" "}
        <span className="font-medium text-inchiostro">
          {TELEGRAM_ATTIVO ? "acceso" : "spento (mancano le due variabili di Telegram)"}
        </span>
        .
      </p>
    </main>
  );
}
