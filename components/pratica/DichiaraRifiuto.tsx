"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
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
  nuovoGiro = false,
  nudo = false,
}: {
  praticaId: string;
  /**
   * `nudo`: reso DENTRO il box unico «Come è andata con la compagnia?»
   * (EsitoCompagnia), quindi senza la sua cornice e senza il suo titolo,
   * che li mette il box che lo contiene. Parte già aperto sul flusso, così
   * non ripete il bottone «Mi hanno risposto no» che l'utente ha già premuto.
   */
  nudo?: boolean;
  /** Il motivo già registrato, se il cliente ha già risposto una volta. */
  giaDichiarato?: string | null;
  /**
   * Vero quando la replica del giro precedente è già stata mandata e si
   * aspetta una risposta nuova. In quel caso il riquadro torna a essere
   * il modulo («hanno risposto di nuovo?»), non il resoconto del no
   * vecchio: quel giro è chiuso.
   */
  nuovoGiro?: boolean;
  /**
   * Come si legge quel motivo, in italiano. Arriva dal server bell'e
   * pronto: se lo chiedessimo all'elenco, il riquadro chiuso resterebbe
   * senza testo finché qualcuno non lo apre, cioè sempre.
   */
  etichettaScelta?: string | null;
}) {
  /* Nudo (dentro il box unico) parte già aperto sul flusso: il bottone
     «Mi hanno risposto no» l'ha già premuto il box che lo contiene. Ma se
     un no è già registrato, NON si apre: si mostra il riepilogo (stato
     "fatto"), non si riparte da capo. */
  const [aperto, setAperto] = useState(nudo && !(!nuovoGiro && Boolean(giaDichiarato)));
  /* Si parte SEMPRE dalla lettura: incollare la risposta è meno lavoro
     che leggersi otto voci e scegliere, e produce una replica migliore.
     La lista resta un clic sotto, e diventa la strada principale se il
     modello non ce la fa. */
  const [lista, setLista] = useState(false);
  /* Vero se siamo finiti sulla lista DOPO aver caricato una risposta che
     il modello non ha classificato: in quel caso «non hanno risposto» non
     è un'opzione, la risposta c'è. Lo stesso paletto vive anche sul
     server (Valerio, 14/08). */
  const [rispostaCaricata, setRispostaCaricata] = useState(false);
  const [motivi, setMotivi] = useState<Motivo[]>([]);
  const [scelto, setScelto] = useState<string | null>(nuovoGiro ? null : (giaDichiarato ?? null));
  const [invio, setInvio] = useState(false);
  /* Su un giro nuovo il riquadro riparte da capo: il no vecchio è già
     stato chiuso con la sua replica, e mostrarne il resoconto farebbe
     credere che non sia successo niente. */
  const [fatto, setFatto] = useState(!nuovoGiro && Boolean(giaDichiarato));
  const [errore, setErrore] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!aperto || motivi.length) return;
    fetch("/api/pratiche/rifiuto")
      .then((r) => r.json())
      .then((d) => setMotivi(d?.motivi ?? []))
      .catch(() => setErrore("Non riesco a caricare l'elenco. Riprova."));
  }, [aperto, motivi.length]);

  /**
   * 🔴 SCEGLIERE IL MOTIVO ADESSO SALVA SUBITO, e prima serviva un
   * secondo bottone.
   *
   * Valerio, 13/08: «ho cliccato per maltempo come motivo del no e mi è
   * apparsa la stessa identica schermata di prima, non è successo niente
   * di visibile». Non era un guasto: la scelta si limitava a colorare il
   * riquadro, e per salvarla bisognava premere «Preparami la risposta»,
   * che con otto motivi in elenco sta sotto il bordo dello schermo. Chi
   * clicca un'opzione e vede il riquadro accendersi pensa, ragionevolmente,
   * di aver finito.
   * Un gesto, un effetto. E l'effetto si vede: la pagina si rifà col
   * motivo nuovo scritto e la replica riscritta.
   */
  async function manda(motivoScelto?: string) {
    const motivo = motivoScelto ?? scelto;
    if (!motivo || invio) return;
    setScelto(motivo);
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch("/api/pratiche/rifiuto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praticaId, motivo }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : "Non ci sono riuscito. Riprova.");
        return;
      }
      /* 🔴 PRIMA QUI C'ERA `window.location.reload()`, e Valerio l'ha
         vissuto come «le cose si resettano e ritorni indietro» (16/08): un
         reload vero sbianca lo schermo, salta in cima e scarta tutto lo
         stato. Adesso si chiude il modulo e si rinfresca SOLO la parte del
         server (`router.refresh`): niente lampo bianco, niente salto. La
         replica la scrive il server e la si apre col bottone in cima. */
      setFatto(true);
      setAperto(false);
      setLista(false);
      router.refresh();
    } catch {
      setErrore("Non ci sono riuscito. Riprova tra poco.");
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
      /* 🔴 QUI C'ERA UN SECONDO «La replica è pronta.», e lo dice già il
         riquadro «dove siamo» in cima alla pagina. Valerio, 13/08:
         «perché dire due volte la replica è pronta? se lo dice già il box
         dove siamo, perché metterne un altro che conferma?».
         Adesso questo riquadro dice l'unica cosa che l'altro non può
         dire: SU QUALE no è stata scritta, e come cambiarlo. */
      <section className={nudo ? "" : "rounded-2xl border border-bordo bg-white px-6 py-4"}>
        {/* 🔴 IL FALSO CLAIM (Valerio, 16/08: «io ho dato una email
            completamente diversa, questa frase non rispecchia il no della
            compagnia che ho dato, è fissa o inventata»).
            Aveva ragione: qui c'era «Il no che hai registrato: "..."», e
            fra le virgolette non c'erano le SUE parole ma l'etichetta della
            CATEGORIA in cui abbiamo inquadrato la risposta. Presentata così
            sembrava una citazione della compagnia, e se l'abbiamo inquadrata
            male sembra inventata. Adesso si dice quello che è: la NOSTRA
            lettura, correggibile col bottone qui sotto. */}
        <p className="flex items-start gap-2 text-[0.95rem] leading-relaxed text-fumo">
          <Check className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
          <span>
            {etichettaScelta
              ? `Ho inquadrato la loro risposta come: «${etichettaScelta}», e la replica risponde a quel punto. Se ho preso il verso sbagliato, cambialo qui sotto.`
              : "La replica risponde al motivo che hai registrato. Se non è quello giusto, cambialo qui sotto."}
          </span>
        </p>
        {/* 🔴 QUI C'ERA UN SECONDO BOTTONE «Leggi la replica», e portava
            allo STESSO indirizzo di «Apri la replica» che sta in cima
            alla pagina. Valerio, 13/08: «è tutto pieno di bottoni, apri
            replica o leggi replica, che cazzo cambia!!!!». Non cambiava
            niente: erano lo stesso link scritto due volte, e due bottoni
            identici a mezza pagina di distanza fanno pensare che facciano
            cose diverse. Il gesto sta in cima, dove c'è «il prossimo
            passo»: qui resta solo la spiegazione. */}
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
    <section className={nudo ? "" : "rounded-2xl border border-bordo bg-white px-6 py-5"}>
      {/* Nudo: titolo e intro li mette il box unico che ci contiene. */}
      {!nudo && (
        <>
          <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
            <AlertTriangle className="size-4 shrink-0 text-sole" aria-hidden="true" />
            La compagnia ti ha risposto no?
          </h2>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
            Succede alla maggior parte dei reclami validi, e quasi sempre è un no che non regge.
            Incolla qui quello che ti hanno scritto, o fotografalo: lo leggo io e ti preparo la
            risposta sui loro stessi fatti, senza aspettare.
          </p>
        </>
      )}

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
              /* La risposta l'ha caricata: «non hanno risposto» sparisce
                 dalla lista, se no si torna alla contraddizione di prima. */
              setRispostaCaricata(true);
              if (messaggio) setErrore(messaggio);
            }}
          />
          <button
            type="button"
            onClick={() => {
              setLista(true);
              setRispostaCaricata(false);
              setErrore("");
            }}
            className="mt-3 block text-sm text-verde underline decoration-bordo underline-offset-4 hover:text-verde-scuro"
          >
            Non ho la loro risposta sottomano: scelgo dall&apos;elenco
          </button>
        </>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-2">
            {motivi
              .filter((m) => !(rispostaCaricata && m.motivo === "silenzio"))
              .map((m) => {
              const attivo = scelto === m.motivo;
              return (
                <button
                  key={m.motivo}
                  type="button"
                  onClick={() => void manda(m.motivo)}
                  disabled={invio}
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

          <p className="mt-4 text-sm leading-relaxed text-fumo-2">
            {invio
              ? "Sto riscrivendo la replica."
              : "Tocca il motivo: preparo la risposta subito. È incluso nel prezzo che hai già pagato."}
          </p>
        </>
      )}
    </section>
  );
}
