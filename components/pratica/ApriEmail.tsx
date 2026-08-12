"use client";

import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * IL BOTTONE CHE APRE L'EMAIL GIÀ SCRITTA.
 *
 * Richiesta di Valerio, 12/08: «il pulsante che ti avevo detto, facile da
 * cliccare, con email precompilata e tutto a posto, che l'utente clicca e
 * gli si apre l'email pronta da inviare, non c'è minimamente». Aveva
 * ragione: sul sito c'erano solo "copia il testo" e "stampa". Copiare e
 * incollare sono due gesti che su un telefono si sbagliano, e ogni gesto
 * in più fra la persona e l'invio è gente che non manda niente.
 *
 * Come funziona: `mailto:` con destinatario, oggetto e corpo già dentro.
 * Il telefono apre l'app di posta con tutto scritto; resta da premere
 * "Invia". Ed è giusto che parta dalla SUA casella: le compagnie lavorano
 * i reclami mandati dal passeggero, ed è lo stesso motivo per cui la
 * compensazione gli arriva intera.
 *
 * ⚠️ TRE COSE DA SAPERE, e sono il motivo per cui accanto resta "Copia":
 * 1. Se della compagnia non abbiamo un indirizzo email (molte accettano
 *    solo il modulo sul loro sito), il destinatario resta vuoto: si apre
 *    lo stesso e lo si incolla. Meglio un campo vuoto di un indirizzo
 *    inventato che rimbalza.
 * 2. `mailto:` ha un tetto di lunghezza che cambia da telefono a
 *    telefono. Se il testo è lungo, qualche client lo taglia: per questo
 *    il bottone di copia sta lì accanto e non nascosto in fondo.
 * 3. Su un computer senza un programma di posta configurato non succede
 *    niente. Dopo qualche secondo si mostra la via d'uscita invece di
 *    lasciare la persona a guardare lo schermo.
 */
export default function ApriEmail({
  destinatario,
  oggetto,
  corpo,
  etichetta,
  nota,
}: {
  destinatario: string | null;
  oggetto: string;
  corpo: string;
  etichetta: string;
  nota: string;
}) {
  const [copiato, setCopiato] = useState(false);
  const [mostraRipiego, setMostraRipiego] = useState(false);

  const link = `mailto:${destinatario ?? ""}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;

  async function copia() {
    try {
      await navigator.clipboard.writeText(corpo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2400);
    } catch {
      /* Clipboard negata (succede fuori da https): si mostra il testo
         così si seleziona a mano, invece di far finta di aver copiato. */
      setMostraRipiego(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        asChild
        size="lg"
        className="h-auto w-full whitespace-normal py-4 text-center text-[16px]"
      >
        <a href={link} onClick={() => setTimeout(() => setMostraRipiego(true), 4000)}>
          <Mail className="size-5 shrink-0" aria-hidden="true" />
          {etichetta}
        </a>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="contorno" onClick={() => void copia()}>
          <Copy className="size-4" aria-hidden="true" />
          {copiato ? "Copiato." : "Copia il testo"}
        </Button>
        <p className="text-[13px] leading-relaxed text-fumo-2">{nota}</p>
      </div>

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
