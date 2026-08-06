/**
 * Le colonne di luce che respirano dietro l'hero.
 *
 * Perché così e non con una libreria: sono 26 div con una `animation` CSS.
 * Il browser le muove sulla scheda grafica e non ridisegna mai la pagina.
 * Una libreria di particelle o un canvas farebbero la stessa cosa
 * consumando batteria sul telefono, che è dove la gente ci arriva.
 *
 * I tempi non sono casuali ma nemmeno uguali: se respirassero tutte
 * insieme sembrerebbe un equalizzatore. Sfalsate leggermente, sembra aria.
 */
const QUANTE = 26;

export default function SfondoColonne() {
  return (
    <div className="colonne" aria-hidden="true">
      {Array.from({ length: QUANTE }, (_, i) => {
        // il centro respira più ampio e più lento: dà profondità
        const distanzaDalCentro = Math.abs(i - (QUANTE - 1) / 2) / ((QUANTE - 1) / 2);
        return (
          <span
            key={i}
            className="colonna"
            style={
              {
                "--ritardo": `${(i % 7) * 0.42 + distanzaDalCentro * 0.5}s`,
                "--durata": `${6.2 + (i % 5) * 0.55}s`,
                opacity: 1 - distanzaDalCentro * 0.45,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
