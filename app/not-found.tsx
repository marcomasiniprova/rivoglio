import Link from "next/link";
import Logo from "@/components/Logo";

/**
 * QUANDO UN INDIRIZZO NON ESISTE.
 *
 * 🔴 Trovato dall'audit del 14/08: le pagine che chiamano notFound() (un
 * articolo del Tabellone sparito, un aeroporto con la sigla sbagliata, una
 * data sciopero inesistente) mostravano il 404 grezzo di Next, in inglese e
 * senza marchio. Sono proprio le pagine pensate per il traffico e la
 * condivisione: un link morto di un video finiva su una pagina nuda, e la
 * persona se ne andava invece di fare un check.
 *
 * Adesso c'è la cornice del marchio, una frase italiana e la strada per il
 * prodotto: chi arriva qui per sbaglio finisce comunque sul check.
 */
export default function NonTrovata() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-nebbia px-6 text-center">
      <Logo />
      <div className="max-w-md">
        <p className="font-display text-[1.7rem] leading-tight tracking-[-0.03em] text-inchiostro">
          Questa pagina non c&apos;è.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">
          O è stata spostata, o il link è vecchio. Ma il tuo volo puoi controllarlo subito, è
          gratis.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#controllo"
            className="rounded-bottone bg-verde px-5 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-verde-scuro"
          >
            Controlla un volo
          </Link>
          <Link
            href="/"
            className="rounded-bottone border border-bordo bg-white px-5 py-3 text-[14.5px] font-medium text-inchiostro transition-colors hover:border-verde/40"
          >
            Vai alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
