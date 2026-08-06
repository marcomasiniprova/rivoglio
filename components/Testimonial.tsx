/**
 * Sezione recensioni. Non ci sono clienti, quindi NON ci sono recensioni.
 * Inventarle sarebbe la cosa più stupida possibile: vendiamo fiducia.
 * Questa sezione dice la verità e la usa come argomento.
 *
 * QUANDO ARRIVANO LE PRIME RECENSIONI VERE: sostituisci questo blocco
 * con le loro parole, nome e città. Non prima.
 */
export default function Testimonial() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[820px] rounded-[2rem] border-2 border-dashed border-bordo bg-white px-6 py-14 text-center sm:px-14">
        <span className="inline-block rounded-pillola bg-menta-tenue px-3.5 py-1.5 text-[12.5px] font-medium text-verde-scuro">
          Onestà
        </span>

        <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.8rem)]">
          Qui non trovi recensioni.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
          Perché non ho ancora clienti. Potevo mettere tre facce sorridenti prese da un
          sito di foto e inventarmi i nomi — lo fanno quasi tutti. Ma se ti mento sulla
          prima cosa che leggi, perché dovresti credermi sul prezzo di una vacanza?
        </p>

        <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-inchiostro">
          Quando i primi useranno il servizio, qui ci saranno le loro parole vere.{" "}
          <span className="text-verde">Puoi essere uno di quelli.</span>
        </p>

        <a
          href="#iscriviti"
          className="group mt-8 inline-flex items-center gap-2 rounded-pillola bg-inchiostro px-7 py-4 text-[15.5px] font-medium text-white transition-all hover:bg-verde-notte"
        >
          Provalo per primo, gratis
          <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </div>
    </section>
  );
}
