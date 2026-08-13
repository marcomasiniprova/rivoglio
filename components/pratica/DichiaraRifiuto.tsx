"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, FileText } from "lucide-react";
import LeggiRisposta from "./LeggiRisposta";

/**
 * "LA COMPAGNIA MI HA RISPOSTO NO."
 *
 * Perché sta qui e non in un'email. Il no arriva quando arriva: dopo dieci
 * giorni o dopo tre mesi, e noi non possiamo saperlo. Se aspettassimo il
 * calendario, chi si becca un rifiuto scritto la settimana dopo l'invio
 * resterebbe fermo a guardare per un mese e mezzo.
 *
 * ⚠️ QUI C'ERA SCRITTO che la scelta a lista è chiusa perché «un campo di
 * testo libero sarebbe più comodo da scrivere e inutile da usare». Non è
 * più vero dal 13/08: adesso il testo libero (o lo screenshot) lo legge
 * un modello, che riconosce il motivo da solo ed estrae i fatti che la
 * compagnia dichiara. Quindi si parte da lì, che è meno lavoro per la
 * persona e produce una replica migliore.
 *
 * La lista resta, un clic sotto, e serve a due casi veri: chi la risposta
 * non ce l'ha sottomano (una telefonata, un'email su un altro telefono) e
 * chi ha davanti un modello che non ha capito. Un prodotto con una strada
 * sola è un prodotto che si ferma.
 *
 * Il testo della replica NON sta qui dentro: sta sul server. Nel browser
 * gira solo l'etichetta.
 */

type Motivo = {
  motivo: string;
  etichetta: string;
  aiuto: string;
  peso: "debole" | "dipende" | "solido";
};

export default function DichiaraRifiuto({
  praticaId,
  giaDichiarato,
  etichettaScelta,
}: {
  praticaId: string;
  /** Il motivo già registrato, se il cliente ha già risposto una volta. */
  giaDichiarato?: string | null;
  /**
   * Come si legge quel motivo, in italiano. Arriva dal server bell'e
   * pronto: se lo chiedessimo all'elenco, il riquadro chiuso resterebbe
   * senza testo finché qualcuno non lo apre, cioè sempre.
   */
  etichettaScelta?: string | null;
}) {
  const [aperto, setAperto] = useState(false);
  /* Si parte SEMPRE dalla lettura: incollare la risposta è meno lavoro
     che leggersi otto voci e scegliere, e produce una replica migliore.
     La lista resta un clic sotto, e diventa la strada principale se il
     modello non ce la fa. */
  const [lista, setLista] = useState(false);
  const [motivi, setMotivi] = useState<Motivo[]>([]);
  const [scelto, setScelto] = useState<string | null>(giaDichiarato ?? null);
  const [invio, setInvio] = useState(false);
  const [fatto, setFatto] = useState(Boolean(giaDichiarato));
  const [errore, setErrore] = useState("");

  useEffect(() => {
    if (!aperto || motivi.length) return;
    fetch("/api/pratiche/rifiuto")
      .then((r) => r.json())
      .then((d) => setMotivi(d?.motivi ?? []))
      .catch(() => setErrore("Non riesco a caricare l'elenco. Riprova."));
  }, [aperto, motivi.length]);

  async function manda() {
    if (!scelto || invio) return;
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch("/api/pratiche/rifiuto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praticaId, motivo: scelto }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : "Qualcosa non ha funzionato.");
        return;
      }
      setFatto(true);
      /* La pagina si rifà: la lettera del secondo colpo la scrive il
         server, e da qui non si può indovinare cosa dirà. */
      window.location.reload();
    } catch {
      setErrore("Qualcosa non ha funzionato. Riprova tra poco.");
    } finally {
      setInvio(false);
    }
  }

  if (fatto && !aperto) {
    /* 🔴 QUI FINIVA IL PERCORSO, e non doveva.
       Valerio, 13/08: «ho cliccato per maltempo e mi appare la stessa
       pagina, non ci ho capito nulla, la contro-risposta? perché non è
       successo niente? cosa significa "il loro no è registrato"?».
       Il difetto era doppio. Primo: questo riquadro raccontava un fatto
       nostro («è registrato») invece di dare l'azione sua. Secondo: la
       replica c'era davvero, ma il bottone per aprirla in quel momento
       era GRIGIO, perché il muro dei documenti restava su anche dopo che
       la lettera era partita (chiuso in lib/pratiche/passi.ts).
       Adesso qui dentro c'è il bottone che porta al foglio, e dice quale
       no ha in pancia: si legge da solo che qualcosa è cambiato. */
    return (
      <section className="rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-5">
        <p className="flex items-center gap-2 text-[0.95rem] font-medium text-verde-notte">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          La replica è pronta.
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-verde-notte/80">
          {etichettaScelta
            ? `L'abbiamo scritta sul no che ti hanno dato («${etichettaScelta}»), punto per punto. Non è un testo generico: cita le sentenze che smontano proprio quella risposta.`
            : "L'abbiamo scritta sul motivo che ti hanno dato, punto per punto. Non è un testo generico: cita le sentenze che smontano proprio quella risposta."}
        </p>
        <a
          href={`/pratica/${praticaId}/lettera`}
          className="riflesso mt-4 inline-flex h-11 items-center gap-2 rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
        >
          <FileText className="size-4" aria-hidden="true" />
          Leggi la replica
        </a>
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="mt-3 block text-sm text-verde underline decoration-bordo underline-offset-4 hover:text-verde-scuro"
        >
          Ho sbagliato motivo, lo cambio
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
        <AlertTriangle className="size-4 shrink-0 text-sole" aria-hidden="true" />
        La compagnia ti ha risposto no?
      </h2>
      <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
        Succede alla maggior parte dei reclami validi, e quasi sempre è un no che non regge.
        Incolla qui quello che ti hanno scritto, o fotografalo: lo leggo io e ti preparo la
        risposta sui loro stessi fatti, senza aspettare.
      </p>

      {!aperto ? (
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="riflesso mt-4 h-11 rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
        >
          Mi hanno risposto no
        </button>
      ) : !lista ? (
        <>
          <LeggiRisposta
            praticaId={praticaId}
            onFallita={(messaggio) => {
              setLista(true);
              if (messaggio) setErrore(messaggio);
            }}
          />
          <button
            type="button"
            onClick={() => {
              setLista(true);
              setErrore("");
            }}
            className="mt-4 block text-sm text-verde underline decoration-bordo underline-offset-4 hover:text-verde-scuro"
          >
            Non ho la loro risposta sottomano: scelgo dall&apos;elenco
          </button>
        </>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-2">
            {motivi.map((m) => {
              const attivo = scelto === m.motivo;
              return (
                <button
                  key={m.motivo}
                  type="button"
                  onClick={() => setScelto(m.motivo)}
                  aria-pressed={attivo}
                  className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    attivo
                      ? "border-verde bg-menta-tenue"
                      : "border-bordo bg-white hover:border-verde/50 hover:bg-nebbia"
                  }`}
                >
                  <span className="block text-[0.95rem] font-medium text-inchiostro">
                    {m.etichetta}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-fumo">{m.aiuto}</span>
                </button>
              );
            })}
            {motivi.length === 0 && !errore && (
              <p className="text-sm text-fumo">Un attimo.</p>
            )}
          </div>

          {errore && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {errore}
            </p>
          )}

          <button
            type="button"
            onClick={() => void manda()}
            disabled={!scelto || invio}
            className="riflesso mt-4 h-11 rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
          >
            {invio ? "Un attimo." : "Preparami la risposta"}
          </button>
          <p className="mt-3 text-sm leading-relaxed text-fumo-2">
            È incluso nel prezzo che hai già pagato. Non ti chiediamo altro.
          </p>
        </>
      )}
    </section>
  );
}
