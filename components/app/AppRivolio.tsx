"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, FileText, Plane, Search, User } from "lucide-react";
import CheckRapido from "@/components/app/CheckRapido";
import { Button } from "@/components/ui/button";
import { salvaProfiloWeb, type EsitoApp } from "@/app/app/azioni";
import { COPY } from "@/lib/copy";

/**
 * LA WEB APP, con le stesse sezioni dell'app sul telefono: Controlla,
 * Le tue pratiche, Profilo. Un solo prodotto, due schermi (richiesta di
 * Valerio, 8/08: "quando loggo nella web app trovo solo una sezione,
 * risolvi"). Chi non è entrato usa il check e trova negli altri due
 * pannelli un invito, non un muro.
 *
 * Il contenuto arriva già pronto dal server (pratiche lette con la RLS,
 * profilo con la sessione): qui si sceglie solo quale pannello mostrare.
 */

const T = COPY.appWeb;

export type CardPratica = {
  id: string;
  /** Di chi è la palla: è la cosa che si legge per prima. */
  palla: "tua" | "loro" | "chiusa";
  /** Il passo attivo, in parole corte: «Replica». */
  passoNome: string;
  /** «3 di 5»: a che punto è, senza doverlo aprire. */
  passoIndice: number;
  passoTotale: number;
  statoNome: string;
  statoClassi: string;
  fascia: string | null;
  fasciaFonte: string;
  famiglia: boolean;
  titolo: string;
  prossimoPasso: string | null;
  apri: string;
};

type Props = {
  email: string | null;
  nickname: string | null;
  classificaOptin: boolean;
  pratiche: CardPratica[];
  erroreLettura: boolean;
};

type Pannello = "controlla" | "pratiche" | "profilo";

const PANNELLI: { chiave: Pannello; icona: typeof Search; nome: string }[] = [
  { chiave: "controlla", icona: Search, nome: T.tab.controlla },
  { chiave: "pratiche", icona: FileText, nome: T.tab.pratiche },
  { chiave: "profilo", icona: User, nome: T.tab.profilo },
];

export default function AppRivolio({
  email,
  nickname,
  classificaOptin,
  pratiche,
  erroreLettura,
}: Props) {
  /* Chi ha pratiche aperte arriva per seguirle: si parte da lì.
     Chi non ne ha (o non è entrato) parte dal check. */
  const [pannello, setPannello] = useState<Pannello>(
    email && pratiche.length > 0 ? "pratiche" : "controlla",
  );
  const [salvataggio, salva, inCorso] = useActionState<EsitoApp, FormData>(salvaProfiloWeb, {});

  const C = COPY.pratica.elenco;
  const O = COPY.appWeb.ospite;
  const P = COPY.appWeb.profilo;

  /* Il profilo era «troppo vuoto» (Valerio, 14/08): oltre all'email e al
     nome, adesso dice a colpo d'occhio come stanno le tue pratiche, con
     gli stessi dati che la scheda «Le tue pratiche» ha già in mano. */
  const toccaTe = pratiche.filter((p) => p.palla === "tua").length;
  const inAttesa = pratiche.filter((p) => p.palla === "loro").length;
  const chiuse = pratiche.filter((p) => p.palla === "chiusa").length;
  const iniziali = (nickname || email || "?").trim().slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-7">
      {/* ------------------------------------------------ le linguette
          🔴 SU IPHONE SE LA BARRA USCIVA DALLO SCHERMO: "Controlla · Le
          tue pratiche · Profilo" con le icone misura 379 punti, e lo
          schermo ne ha 375. Quattro punti bastano a far scorrere di lato
          TUTTA la pagina, ed è il difetto che si legge come «la vista si
          storta, esce dallo schermo» (Valerio, 12/08).
          ⚠️ La barra non si accorcia togliendo parole: i nomi delle
          sezioni servono. Si stringe quello che si può stringere sul
          telefono (il vuoto ai lati dei bottoni) e si lascia identica da
          640 punti in su, dove lo spazio c'è. Se anche così un domani
          non entrasse, `overflow-x-auto` fa scorrere la barra da sola
          invece della pagina intera: il danno resta dentro la barra. */}
      <nav
        aria-label="Sezioni della web app"
        className="-mx-1 flex max-w-full gap-1 self-start overflow-x-auto rounded-pillola border border-bordo bg-white p-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible"
      >
        {PANNELLI.map(({ chiave, icona: Icona, nome }) => {
          const attivo = pannello === chiave;
          return (
            <button
              key={chiave}
              type="button"
              onClick={() => setPannello(chiave)}
              aria-current={attivo ? "page" : undefined}
              /* 🔴 LA TERZA LINGUETTA ERA TAGLIATA SU OGNI TELEFONO fino a
                414 punti: tre pillole con icona, testo e margini non ci
                stavano, e "Profilo" restava mezzo fuori. La barra
                scorreva, ma una linguetta che si vede a metà non sembra
                una cosa da far scorrere: sembra rotta.
                Adesso sotto i 480 punti le tre si dividono lo spazio in
                parti uguali e il testo si stringe: nessuna scorre e
                nessuna esce. Trovato dall'ispezione del 12/08. */
              className={`inline-flex min-h-11 flex-1 shrink items-center justify-center gap-1.5 whitespace-nowrap rounded-pillola px-2 py-2 text-[13px] font-medium transition-colors sm:min-h-0 sm:flex-none sm:px-4 sm:text-sm ${
                attivo ? "bg-menta-tenue text-verde-notte" : "text-fumo hover:text-inchiostro"
              }`}
            >
              <Icona className="size-4" aria-hidden="true" />
              {nome}
            </button>
          );
        })}
      </nav>

      {/* ------------------------------------------------ controlla */}
      {pannello === "controlla" && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em] sm:text-[2.5rem]">
              {COPY.appOspite.titolo}
            </h1>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
              {COPY.appOspite.testo}
            </p>
          </div>
          <CheckRapido />
          {!email && (
            <p className="text-sm leading-relaxed text-fumo">
              {COPY.appOspite.nota}{" "}
              <Link href="/entra?poi=/app" className="font-medium text-verde hover:text-verde-scuro">
                {COPY.appOspite.entra}
              </Link>
            </p>
          )}
        </div>
      )}

      {/* ------------------------------------------------ pratiche */}
      {pannello === "pratiche" &&
        (!email ? (
          <Invito titolo={O.pratiche.titolo} testo={O.pratiche.testo} azione={O.pratiche.azione} />
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em] sm:text-[2.5rem]">
                {C.titolo}
              </h1>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
                {C.sottotitolo}
              </p>
            </div>

            {erroreLettura ? (
              <div className="rounded-3xl border border-bordo bg-white px-6 py-10 text-center">
                <p className="text-[0.95rem] leading-relaxed text-fumo">{C.errore}</p>
              </div>
            ) : pratiche.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-bordo bg-white/60 px-6 py-12 text-center">
                <Plane className="mx-auto size-6 text-fumo-2" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl tracking-[-0.03em]">{C.vuoto.titolo}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fumo">
                  {C.vuoto.testo}
                </p>
                <button
                  type="button"
                  onClick={() => setPannello("controlla")}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
                >
                  {C.vuoto.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <section className="flex flex-col gap-4">
                {pratiche.map((p, indice) => (
                  <Link
                    key={p.id}
                    href={`/pratica/${p.id}`}
                    style={{ "--n": indice } as React.CSSProperties}
                    /* 🔴 TRE PRATICHE ERANO TRE RETTANGOLI IDENTICI
                       (Valerio, 13/08). Adesso la card porta il segno di
                       chi ha la palla: una fascia colorata a sinistra,
                       che si vede da tre metri e prima ancora di leggere
                       una parola. Il bordo pieno resta solo su quella
                       dove tocca a te. */
                    className={`pratica-entra group block rounded-3xl border bg-white px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(5,46,31,0.35)] ${
                      p.palla === "tua"
                        ? "border-sole/60 border-l-4 border-l-sole hover:border-sole"
                        : p.palla === "chiusa"
                          ? "border-bordo border-l-4 border-l-verde hover:border-verde/40"
                          : "border-bordo border-l-4 border-l-bordo hover:border-verde/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-pillola px-3 py-1 text-xs font-medium ${p.statoClassi}`}
                      >
                        {/* Prima diceva lo stato tecnico ("Sollecito"),
                            che è una parola nostra. Adesso dice cosa
                            cambia per lui. */}
                        {p.palla === "tua"
                          ? T.pratiche.tocca
                          : p.palla === "loro"
                            ? T.pratiche.aspetta
                            : p.statoNome}
                      </span>
                      <span className="numeri inline-flex items-center rounded-pillola border border-bordo px-3 py-1 text-xs text-fumo">
                        {p.passoNome} · {p.passoIndice}/{p.passoTotale}
                      </span>
                      {p.fascia && (
                        <span
                          className="numeri inline-flex items-center rounded-pillola border border-bordo px-3 py-1 text-xs font-medium text-inchiostro"
                          title={p.fasciaFonte}
                        >
                          {p.fascia}
                        </span>
                      )}
                      {p.famiglia && (
                        <span className="inline-flex items-center rounded-pillola border border-bordo px-3 py-1 text-xs text-fumo">
                          {C.famiglia}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 font-display text-xl tracking-[-0.03em]">{p.titolo}</p>

                    {p.prossimoPasso && (
                      <p className="mt-2 text-sm leading-relaxed text-fumo">
                        <span className="font-medium text-inchiostro">
                          {C.prossimoPassoEtichetta}:
                        </span>{" "}
                        {p.prossimoPasso}
                      </p>
                    )}

                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-verde transition-colors group-hover:text-verde-scuro">
                      <FileText className="size-4" aria-hidden="true" />
                      {p.apri}
                      <ArrowRight
                        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </section>
            )}
          </div>
        ))}

      {/* ------------------------------------------------ profilo */}
      {pannello === "profilo" &&
        (!email ? (
          <Invito titolo={O.profilo.titolo} testo={O.profilo.testo} azione={O.profilo.azione} />
        ) : (
          <div className="flex flex-col gap-6">
            {/* chi sei: la faccia dell'account, non solo l'indirizzo */}
            <div className="flex items-center gap-4 rounded-3xl border border-bordo bg-white p-6 sm:p-8">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-full bg-verde font-display text-xl text-white"
              >
                {iniziali}
              </span>
              <span className="min-w-0">
                {nickname && (
                  <span className="block font-display text-xl tracking-[-0.02em]">{nickname}</span>
                )}
                <span className="block truncate text-sm text-fumo">{email}</span>
              </span>
            </div>

            {/* le tue pratiche a colpo d'occhio */}
            <div className="rounded-3xl border border-bordo bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl tracking-[-0.03em]">Le tue pratiche</h2>
                {pratiche.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPannello("pratiche")}
                    className="text-sm font-medium text-verde transition-colors hover:text-verde-scuro"
                  >
                    Vedi tutte →
                  </button>
                )}
              </div>
              {pratiche.length === 0 ? (
                <p className="mt-2 text-sm leading-relaxed text-fumo">
                  Non ne hai ancora nessuna. Il primo controllo è nella scheda «Controlla», qui
                  sopra.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { n: toccaTe, testo: "Tocca a te" },
                    { n: inAttesa, testo: "In attesa" },
                    { n: chiuse, testo: "Chiuse" },
                  ].map((s) => (
                    <div
                      key={s.testo}
                      className="rounded-2xl border border-bordo bg-nebbia px-3 py-4 text-center"
                    >
                      <span className="block font-display text-2xl tracking-[-0.02em] text-inchiostro">
                        {s.n}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-fumo">{s.testo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              action={salva}
              className="rounded-3xl border border-bordo bg-white p-6 sm:p-8"
            >
              <h2 className="flex items-center gap-2 font-display text-xl tracking-[-0.03em]">
                <Award className="size-4 text-verde" aria-hidden="true" />
                {P.dati.titolo}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-fumo">{P.dati.sottotitolo}</p>

              <label className="mt-5 block text-sm font-medium" htmlFor="nickname">
                {P.dati.nickname}
              </label>
              <input
                id="nickname"
                name="nickname"
                defaultValue={nickname ?? ""}
                placeholder={P.dati.nicknameSegnaposto}
                className="mt-1.5 w-full max-w-sm rounded-xl border border-bordo bg-white px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-verde"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-fumo-2">{P.dati.nicknameAiuto}</p>

              <label className="mt-5 flex max-w-xl items-start gap-3">
                <input
                  type="checkbox"
                  name="classifica"
                  defaultChecked={classificaOptin}
                  className="mt-1 size-4 accent-verde"
                />
                <span>
                  <span className="block text-sm font-medium">{P.dati.classifica}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-fumo">
                    {P.dati.classificaTesto}
                  </span>
                </span>
              </label>
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-fumo-2">
                Il tuo nome resta salvato da subito. La classifica vera e propria si accende quando
                ci sono abbastanza vincite da mostrare: da quel giorno ci sei già dentro, senza
                rifare niente.
              </p>

              {salvataggio.errore && (
                <p role="alert" className="mt-4 text-sm font-medium text-[#C2410C]">
                  {salvataggio.errore}
                </p>
              )}
              {salvataggio.ok && (
                <p className="mt-4 text-sm font-medium text-verde-scuro">{P.dati.salvato}</p>
              )}

              <Button type="submit" className="mt-5" disabled={inCorso}>
                {P.dati.salva}
              </Button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/privacy" className="text-fumo transition-colors hover:text-inchiostro">
                {P.voci.privacy}
              </Link>
              <Link href="/condizioni" className="text-fumo transition-colors hover:text-inchiostro">
                {P.voci.condizioni}
              </Link>
              <a
                href="mailto:team@rivolio.it"
                className="text-fumo transition-colors hover:text-inchiostro"
              >
                {P.voci.supporto}
              </a>
            </div>

            <p className="text-xs leading-relaxed text-fumo-2">{P.piede}</p>
          </div>
        ))}
    </div>
  );
}

function Invito({ titolo, testo, azione }: { titolo: string; testo: string; azione: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-bordo bg-white/60 px-6 py-12 text-center">
      <h2 className="font-display text-xl tracking-[-0.03em]">{titolo}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fumo">{testo}</p>
      <Link
        href="/entra?poi=/app"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-verde hover:text-verde-scuro"
      >
        {azione}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
