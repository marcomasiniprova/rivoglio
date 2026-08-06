import { Anima } from "./Anima";

/**
 * Sezione recensioni. Non ci sono clienti, quindi non ci sono recensioni.
 * QUANDO ARRIVANO LE PRIME VERE: sostituisci questo blocco con le loro
 * parole, nome e città. Non prima.
 */
export default function Testimonial() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <Anima className="mx-auto max-w-[820px]">
        <div className="rounded-[2rem] border-2 border-dashed border-bordo bg-white px-6 py-14 text-center sm:px-14">
          <span className="inline-block rounded-pillola bg-menta-tenue px-3.5 py-1.5 text-[12.5px] font-medium text-verde-scuro">
            Trasparenza
          </span>

          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.8rem)]">
            Qui non trovi recensioni.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Il servizio è appena nato e non ha ancora clienti. Le prime parole che leggerai
            in questo spazio saranno di persone vere, con nome e città.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-[16.5px] leading-relaxed text-inchiostro">
            Puoi essere tu il primo.
          </p>

          <a
            href="#iscriviti"
            className="group mt-8 inline-flex items-center gap-2 rounded-pillola bg-inchiostro px-7 py-4 text-[15.5px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-notte hover:shadow-lg"
          >
            Provalo per primo, gratis
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </Anima>
    </section>
  );
}
