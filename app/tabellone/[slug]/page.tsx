import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArticolo, { PillolaTag } from "@/components/tabellone/CardArticolo";
import Copertina from "@/components/tabellone/Copertina";
import Corpo, { ancora } from "@/components/tabellone/Corpo";
import SezioneNewsletter from "@/components/tabellone/SezioneNewsletter";
import { listinoCorrente } from "@/lib/prezzi-server";
import {
  ARTICOLI_SLUG,
  FIRMA,
  NOME_BLOG,
  RADICE,
  correlati,
  dataInItaliano,
  perSlug,
} from "@/lib/tabellone/indice";
import { datiArticolo, datiBriciole, datiDomande, scriptDati } from "@/lib/tabellone/seo";
import { TAG } from "@/lib/tabellone/tipi";

/**
 * LA PAGINA DI UN ARTICOLO.
 *
 * Colonna di lettura stretta (misura di riga da rivista, non da monitor)
 * e a fianco, su schermo largo, l'indice che segue il testo. Sotto: le
 * fonti, gli articoli del cluster, la newsletter.
 *
 * Il prezzo che compare nei box viene dal cookie della variante: chi vede
 * 24,90 sulla landing legge 24,90 anche qui dentro.
 */

export function generateStaticParams() {
  return ARTICOLI_SLUG.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = perSlug(slug);
  if (!a) return {};
  return {
    title: `${a.titoloSeo} | ${NOME_BLOG}`,
    description: a.descrizione,
    alternates: { canonical: `${RADICE}/${a.slug}` },
    openGraph: {
      title: a.titoloSeo,
      description: a.descrizione,
      type: "article",
      locale: "it_IT",
      publishedTime: a.data,
      modifiedTime: a.aggiornato ?? a.data,
    },
  };
}

export default async function PaginaArticolo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = perSlug(slug);
  if (!a) notFound();

  const { listino } = await listinoCorrente();
  const vicini = correlati(a);
  const sezioni = a.corpo.filter((b) => b.tipo === "h2");
  const domande = a.corpo.find((b) => b.tipo === "faq");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptDati(datiArticolo(a))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={scriptDati(
          datiBriciole([
            { nome: "Rivolio", percorso: "/" },
            { nome: NOME_BLOG, percorso: RADICE },
            { nome: a.titolo, percorso: `${RADICE}/${a.slug}` },
          ]),
        )}
      />
      {domande && domande.tipo === "faq" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={scriptDati(datiDomande(domande.voci))}
        />
      )}

      <article>
        {/* la testa */}
        <header className="px-5 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-[760px]">
            <nav aria-label="Percorso" className="text-[14px] text-verde-notte/50">
              <Link href={RADICE} className="font-medium hover:text-verde-scuro">
                {NOME_BLOG}
              </Link>
              <span className="px-2">/</span>
              <Link
                href={`${RADICE}/argomento/${a.tag[0]}`}
                className="font-medium hover:text-verde-scuro"
              >
                {TAG[a.tag[0]]}
              </Link>
            </nav>

            <h1 className="mt-5 font-display text-[clamp(2.1rem,5.2vw,3.35rem)] font-bold leading-[1.05] tracking-[-0.04em] text-verde-notte">
              {a.titolo}
            </h1>

            <p className="mt-5 text-[19px] leading-relaxed text-verde-notte/70">
              {a.descrizione}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-verde-notte/12 pt-5 text-[14.5px] text-verde-notte/60">
              <span className="font-semibold text-verde-scuro">{FIRMA}</span>
              <span aria-hidden="true">•</span>
              <time dateTime={a.data}>{dataInItaliano(a.data)}</time>
              {a.aggiornato && a.aggiornato !== a.data && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>aggiornato il {dataInItaliano(a.aggiornato)}</span>
                </>
              )}
              <span aria-hidden="true">•</span>
              <span>{a.minuti} min di lettura</span>
            </div>
          </div>
        </header>

        {/* la copertina */}
        <div className="px-5 pt-9 sm:px-8">
          <div className="mx-auto max-w-[960px]">
            <Copertina
              chiave={a.copertina}
              foto={a.foto}
              alt={a.titolo}
              proporzioni="aspect-[16/9]"
              priorita
              dimensioni="(max-width: 960px) 100vw, 960px"
            />
          </div>
        </div>

        {/* il corpo, con l'indice a fianco */}
        <div className="px-5 pb-4 pt-12 sm:px-8">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[minmax(0,760px)_240px]">
            <div className="min-w-0">
              <Corpo blocchi={a.corpo} listino={listino} />

              {/* le fonti: ogni numero dell'articolo torna a una di queste */}
              {a.fonti.length > 0 && (
                <section className="mt-14 rounded-[16px] border border-verde-notte/12 bg-white/70 p-6 sm:p-7">
                  <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-verde-notte">
                    Da dove vengono i numeri
                  </h2>
                  <ol className="mt-4 flex flex-col gap-2.5">
                    {a.fonti.map((f, i) => (
                      <li key={f.url} className="flex gap-3 text-[14.5px] leading-relaxed">
                        <span className="numeri shrink-0 font-semibold text-verde-notte/40">
                          {i + 1}.
                        </span>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-verde-scuro underline decoration-verde/40 underline-offset-[3px] hover:decoration-verde"
                        >
                          {f.titolo}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <div className="mt-8 flex flex-wrap gap-2">
                {a.tag.map((t) => (
                  <Link key={t} href={`${RADICE}/argomento/${t}`}>
                    <PillolaTag testo={TAG[t]} />
                  </Link>
                ))}
              </div>
            </div>

            {/* l'indice: sta fermo mentre il testo scorre */}
            {sezioni.length > 2 && (
              <aside className="hidden lg:block">
                <nav
                  aria-label="In questa pagina"
                  className="sticky top-[100px] border-l border-verde-notte/12 pl-5"
                >
                  <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-verde-notte/45">
                    In questa pagina
                  </p>
                  <ol className="mt-3.5 flex flex-col gap-2.5">
                    {sezioni.map((s) =>
                      s.tipo === "h2" ? (
                        <li key={s.testo}>
                          <a
                            href={`#${ancora(s.testo)}`}
                            className="block text-[14px] leading-snug text-verde-notte/65 transition-colors hover:text-verde-scuro"
                          >
                            {s.testo}
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ol>
                </nav>
              </aside>
            )}
          </div>
        </div>
      </article>

      {/* il cluster: da un articolo si arriva sempre a un altro */}
      {vicini.length > 0 && (
        <section className="px-5 pb-6 pt-16 sm:px-8">
          <div className="mx-auto max-w-[1216px] border-t border-verde-notte/12 pt-12">
            <h2 className="font-display text-[23px] font-semibold tracking-[-0.03em] text-verde-notte">
              Da leggere dopo
            </h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {vicini.map((v) => (
                <CardArticolo key={v.slug} articolo={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SezioneNewsletter />
    </>
  );
}
