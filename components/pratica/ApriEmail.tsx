"use client";

import { useState } from "react";
import { Copy, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModoInvio } from "@/lib/lettera/compagnie";

/**
 * IL BOTTONE CHE PORTA LA LETTERA A DESTINAZIONE.
 *
 * Richiesta di Valerio, 12/08: «il pulsante con email precompilata, che
 * l'utente clicca e gli si apre l'email pronta da inviare». E poi, il
 * giorno dopo, il difetto vero: «il destinatario non c'è perché? Il
 * destinatario dobbiamo sempre averlo, dobbiamo sempre fornirlo».
 *
 * Aveva ragione, e la causa non era una dimenticanza: Ryanair, easyJet e
 * Wizz Air **un'email per i reclami non la pubblicano**. Obbligano al
 * modulo sul loro sito, e nelle condizioni scrivono che processano solo
 * il reclamo mandato dal passeggero. Il vecchio bottone su quelle
 * compagnie apriva un'email col campo "A:" vuoto, che è il modo più
 * elegante di non consegnare niente.
 *
 * Adesso il bottone ha due forme, e in tutte e due porta a qualcosa:
 * - **email**: `mailto:` con destinatario, oggetto e corpo già dentro.
 *   Si preme Invia e basta.
 * - **modulo**: copia la lettera negli appunti E apre il modulo
 *   ufficiale. L'utente arriva sul modulo col testo già in mano: resta
 *   da incollarlo nel campo del messaggio.
 *
 * ⚠️ Perché la copia parte PRIMA di aprire il modulo, e non dopo: il
 * browser concede gli appunti solo dentro il gesto dell'utente. Copiare
 * dopo aver aperto la scheda nuova significa chiedere gli appunti a una
 * pagina che ha appena perso il fuoco, e su Safari non funziona.
 *
 * ⚠️ Restano due cose che l'email non garantisce, ed è il motivo per cui
 * "Copia il testo" non sparisce mai:
 * 1. `mailto:` ha un tetto di lunghezza che cambia da telefono a
 *    telefono: qualche client taglia i testi lunghi.
 * 2. Su un computer senza un programma di posta collegato non succede
 *    niente. Dopo qualche secondo si mostra la via d'uscita, invece di
 *    lasciare la persona a guardare lo schermo.
 */
export default function ApriEmail({
  modo,
  oggetto,
  corpo,
}: {
  modo: ModoInvio;
  oggetto: string;
  corpo: string;
}) {
  const [copiato, setCopiato] = useState(false);
  const [mostraRipiego, setMostraRipiego] = useState(false);
  const [andatoAlModulo, setAndatoAlModulo] = useState(false);

  async function copia(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(corpo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2400);
      return true;
    } catch {
      /* Clipboard negata (succede fuori da https): si mostra il testo
         così si seleziona a mano, invece di far finta di aver copiato. */
      setMostraRipiego(true);
      return false;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {modo.tipo === "modulo" ? (
        <Button
          type="button"
          size="lg"
          className="h-auto w-full whitespace-normal py-4 text-center text-[16px]"
          onClick={() => {
            void copia();
            setAndatoAlModulo(true);
            window.open(modo.url, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink className="size-5 shrink-0" aria-hidden="true" />
          Copia il reclamo e apri il modulo di {modo.nome}
        </Button>
      ) : (
        <Button
          asChild
          size="lg"
          className="h-auto w-full whitespace-normal py-4 text-center text-[16px]"
        >
          <a
            href={`mailto:${modo.tipo === "email" ? modo.a : ""}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`}
            onClick={() => setTimeout(() => setMostraRipiego(true), 4000)}
          >
            <Mail className="size-5 shrink-0" aria-hidden="true" />
            Apri l&apos;email già scritta
          </a>
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="contorno" onClick={() => void copia()}>
          <Copy className="size-4" aria-hidden="true" />
          {copiato ? "Copiato." : "Copia il testo"}
        </Button>
        <p className="text-[13px] leading-relaxed text-fumo-2">
          {modo.tipo === "email"
            ? `Va a ${modo.a}.`
            : modo.tipo === "modulo"
              ? `${modo.nome} lavora solo i reclami mandati dal suo modulo.`
              : "L'indirizzo lo trovi qui sotto."}
        </p>
      </div>

      {/* Compare dopo aver aperto il modulo: senza, l'utente arriva su una
          pagina della compagnia e non sa che la lettera è già negli
          appunti. È l'unica istruzione che serve, e arriva nel momento
          in cui serve. */}
      {andatoAlModulo && modo.tipo === "modulo" && (
        <p className="rounded-xl bg-menta-tenue px-4 py-3 text-sm leading-relaxed text-verde-notte">
          Il reclamo è negli appunti. Sul modulo di {modo.nome} cerca il campo del messaggio (di
          solito si chiama <em>Additional information</em> o <em>Descrizione</em>) e incolla.
          Non si è aperto niente? Il browser ha bloccato la finestra:{" "}
          <a
            href={modo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-verde underline underline-offset-2"
          >
            apri il modulo da qui
          </a>
          .
        </p>
      )}

      {modo.tipo !== "ignoto" && modo.pec && (
        <p className="text-[13px] leading-relaxed text-fumo-2">
          Se hai una PEC, la loro è <span className="numeri">{modo.pec}</span>: fa data certa. Da
          una casella normale non passa.
        </p>
      )}

      {mostraRipiego && (
        <p className="rounded-xl bg-sole/15 px-4 py-3 text-sm leading-relaxed">
          Non si è aperto niente? Vuol dire che su questo dispositivo non c&apos;è un&apos;app di
          posta collegata. Premi <strong>Copia il testo</strong>, apri la tua email come fai di
          solito e incollalo.
        </p>
      )}
    </div>
  );
}
