import TestoRivelato from "./TestoRivelato";

/**
 * Dichiarazione a tutta pagina, con il testo che si accende parola per parola
 * mentre scorri. È l'unico punto del sito dove il testo è enorme: se lo usi
 * anche altrove smette di avere peso.
 */
export default function Manifesto() {
  return (
    <section className="px-5 py-28 sm:px-8 sm:py-40">
      <div className="mx-auto max-w-4xl">
        <TestoRivelato
          testo="Non ti serve un'altra app di viaggi. Ti serve qualcuno che guardi al posto tuo, tutti i giorni, e ti scriva solo quando conviene davvero."
          className="text-center font-display text-[clamp(1.7rem,4.6vw,3.1rem)] font-medium leading-[1.18] tracking-[-0.035em]"
        />
      </div>
    </section>
  );
}
