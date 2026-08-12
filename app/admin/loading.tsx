/**
 * COSA SI VEDE MENTRE IL PANNELLO LEGGE I NUMERI.
 *
 * 🔴 Prima non c'era niente, e non era un dettaglio estetico: fra il clic
 * su una sezione e la comparsa dei dati il browser restava fermo sulla
 * sezione PRECEDENTE, senza nessun segno che stesse succedendo qualcosa.
 * Valerio, 12/08: «è la cosa più lenta che abbia mai usato sul mio PC».
 * Una parte di quella lentezza erano i giri di database (chiusi), ma una
 * parte era questa: il lavoro c'era, non si vedeva.
 *
 * Non è una rotellina che gira: è la FORMA della pagina che sta
 * arrivando, così l'occhio si posiziona già dove compariranno i numeri
 * invece di ricominciare da capo quando arrivano.
 *
 * ⚠️ Vale per ogni sezione sotto /admin che non ne abbia una sua: in Next
 * il confine più vicino vince, e questo è il più vicino per tutte.
 */
export default function CaricamentoAdmin() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Sto leggendo i dati…</span>

      {/* Le quattro caselle dei numeri in cima */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[14px] border border-bordo bg-white p-4">
            <div className="h-3 w-2/3 rounded bg-nebbia" />
            <div className="mt-3 h-7 w-1/2 rounded bg-nebbia" />
            <div className="mt-3 h-2.5 w-full rounded bg-nebbia/70" />
          </div>
        ))}
      </div>

      {/* Il riquadro grande sotto */}
      <div className="rounded-[14px] border border-bordo bg-white p-5">
        <div className="h-4 w-40 rounded bg-nebbia" />
        <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-nebbia/70" />
        <div className="mt-5 flex flex-col gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full rounded bg-nebbia/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
