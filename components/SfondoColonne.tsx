/**
 * Le colonne di luce dietro l'hero, come nel riferimento scelto da
 * Valerio (8/08, immagine del suo altro progetto): barre verticali che
 * scendono dall'alto con ALTEZZE DIVERSE, e un'onda che le accende UNA
 * ALLA VOLTA da sinistra a destra, in loop.
 *
 * Perché così e non con una libreria: sono 26 div con una `animation`
 * CSS. Il browser le muove sulla scheda grafica e non ridisegna mai la
 * pagina. L'impulso di ogni colonna dura una frazione del ciclo totale
 * (vedi `onda-colonna` in globals.css): così in ogni istante brilla una
 * colonna sola, con un filo di sovrapposizione con la vicina perché
 * l'onda resti armoniosa e non robotica.
 */
const QUANTE = 26;
const PASSO_FASE = 0.32; // secondi fra una colonna e la vicina
const CICLO = QUANTE * PASSO_FASE; // il giro completo dell'onda (8.32s)

/* Le altezze, fisse e deterministiche (niente random: il server e il
   client devono disegnare la stessa cosa). Un profilo mosso, come nel
   riferimento: 13 valori ripetuti due volte. In % del contenitore. */
const ALTEZZE = [72, 46, 60, 38, 66, 50, 58, 42, 70, 48, 62, 40, 55];

export default function SfondoColonne() {
  return (
    <div className="colonne" aria-hidden="true">
      {Array.from({ length: QUANTE }, (_, i) => (
        <span
          key={i}
          className="colonna"
          style={
            {
              // ritardo negativo: l'onda è già in viaggio quando la pagina apre
              "--fase": `${i * PASSO_FASE - CICLO}s`,
              "--altezza": `${ALTEZZE[i % ALTEZZE.length]}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
