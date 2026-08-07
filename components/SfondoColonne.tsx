/**
 * Le colonne di luce dietro l'hero: la tenda a fisarmonica.
 *
 * Perché così e non con una libreria: sono 26 div con una `animation` CSS.
 * Il browser le muove sulla scheda grafica e non ridisegna mai la pagina.
 *
 * Rifatte l'8/08 su direzione di Valerio: niente respiri casuali. UN'onda
 * sola, calma, che viaggia da sinistra a destra come una tenda mossa
 * dall'aria: la fase cresce con l'indice (ritardo negativo, così l'onda
 * è già in viaggio quando la pagina si apre), la durata è una per tutte.
 */
const QUANTE = 26;
const PASSO_FASE = 0.35; // secondi fra una colonna e la vicina: onda lenta

export default function SfondoColonne() {
  return (
    <div className="colonne" aria-hidden="true">
      {/* la lama di luce che attraversa le colonne ogni 11 secondi */}
      <span className="faro" />
      {Array.from({ length: QUANTE }, (_, i) => (
        <span
          key={i}
          className="colonna"
          style={{ "--fase": `${-i * PASSO_FASE}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
