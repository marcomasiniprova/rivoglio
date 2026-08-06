import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

/**
 * Il telefono dell'hero: mostra un alert vero, non un mockup vuoto.
 * Tutti i numeri vengono da lib/esempio.ts — non scriverli qui a mano.
 */
export default function TelefonoAlert() {
  const righe = [
    {
      voce: "Alloggio",
      valore: euro(ESEMPIO.alloggioPersona),
      nota: `${ESEMPIO.notti} notti, camera doppia`,
    },
    {
      voce: "Auto (stima)",
      valore: euro(CONTO.autoPersona),
      nota: `benzina + pedaggi, in ${ESEMPIO.persone}`,
    },
  ];

  return (
    <div className="relative mx-auto w-[300px] rounded-[2.9rem] bg-[#111] p-[10px] shadow-[0_50px_100px_-30px_rgba(5,46,31,.5)]">
      <div className="absolute left-1/2 top-[18px] z-10 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-[#111]" />

      <div className="relative overflow-hidden rounded-[2.35rem] bg-white">
        <div className="flex items-center justify-between px-6 pb-1 pt-4 text-[11px] font-semibold">
          <span>9:41</span>
          <span className="tracking-[.18em] text-fumo-2">▮▮▮ ᯤ ▮</span>
        </div>

        <div className="px-4 pb-6 pt-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-verde text-[10px] font-bold text-white">
              V
            </span>
            <span className="text-[12px] font-medium text-fumo">Viaggio Anche Io</span>
            <span className="ml-auto text-[11px] text-fumo-2">ora</span>
          </div>

          <div className="rounded-[1.5rem] border border-bordo bg-nebbia p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-[27px] font-medium leading-none">
                  {ESEMPIO.destinazione}
                </p>
                <p className="mt-1.5 text-[12.5px] text-fumo">
                  {ESEMPIO.notti} notti · {ESEMPIO.date}
                </p>
              </div>
              <span className="rounded-pillola bg-menta-tenue px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-verde-scuro">
                {ESEMPIO.tipo}
              </span>
            </div>

            <dl className="mt-4 space-y-2">
              {righe.map((r) => (
                <div key={r.voce} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[13px] text-fumo">
                    {r.voce}
                    <span className="block text-[10.5px] text-fumo-2">{r.nota}</span>
                  </dt>
                  <dd className="text-[14px] font-semibold tabular-nums">{r.valore}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 border-t border-dashed border-bordo pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium">Totale a persona</span>
                <span className="font-display text-[28px] font-medium leading-none tabular-nums text-verde">
                  {euro(CONTO.totalePersona)}
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-verde">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" fill="var(--color-menta)" />
                  <path
                    d="m5 8.2 2 2 4-4.2"
                    fill="none"
                    stroke="var(--color-verde-notte)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                sotto la tua soglia di {euro(ESEMPIO.soglia)}
              </p>
            </div>

            <p className="mt-3 text-[11.5px] text-fumo">
              {ESEMPIO.durata} da {ESEMPIO.partenza} · {ESEMPIO.kmAndata} km · in auto
            </p>

            <div className="mt-4 flex gap-2">
              <span className="flex-1 rounded-pillola bg-verde py-2.5 text-center text-[12.5px] font-semibold text-white">
                Prenota
              </span>
              <span className="rounded-pillola border border-bordo bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-fumo">
                Vedi il conto
              </span>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-fumo-2">Ti resta 1 credito su 3</p>
        </div>
      </div>
    </div>
  );
}
