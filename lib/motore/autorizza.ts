/**
 * Chi può chiamare le rotte del motore (`/api/motore/*`).
 *
 * In produzione serve il segreto nell'intestazione `x-motore-segreto`
 * (variabile `MOTORE_SEGRETO` su Netlify). In sviluppo, senza segreto
 * impostato, si passa: serve a provare in locale.
 *
 * Sta in un file suo perché lo usano le rotte VIVE del motore Rivolio
 * (avvisi push, coda incerti, scioperi, riepilogo, pulizia, follow-up).
 * Prima viveva in `lib/motore/esegui.ts` insieme al vecchio motore delle
 * offerte di viaggio, che è stato tolto: questo resta, quello no.
 */
export function chiamataAutorizzata(req: { headers: { get(n: string): string | null } }) {
  const segreto = process.env.MOTORE_SEGRETO;
  if (!segreto) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-motore-segreto") === segreto;
}
