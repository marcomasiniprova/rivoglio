"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * «HO INVIATO IL RECLAMO».
 *
 * 🔴 QUESTO BOTTONE NON FUNZIONAVA (Valerio, 12/08: «non funziona per un
 * cazzo»). Il gestore del clic viveva dentro un `<script>` scritto a mano
 * e iniettato dalla pagina, che è un Server Component. Funzionava il
 * giorno in cui è stato scritto e ha smesso senza che nessuno lo
 * toccasse: React 19 sposta e deduplica gli script che trova nell'albero,
 * e uno script inserito così **non viene rieseguito** quando si arriva
 * alla pagina navigando dentro il sito, che è come ci si arriva sempre
 * (dal verdetto, dalla cassa, dall'elenco pratiche). Il bottone c'era, era
 * bello, e non era attaccato a niente.
 *
 * ⚠️ LA LEZIONE, che vale oltre questo file: un pezzo interattivo si
 * scrive come componente, non come stringa di JavaScript dentro una
 * pagina. Una stringa non ha tipi, non ha errori a compilazione, non la
 * controlla nessuno strumento, e quando smette di funzionare non se ne
 * accorge nessuno finché non lo prova una persona.
 *
 * Questo bottone fa una cosa sola e la dice: il giorno che lo premi
 * partono i tempi del sollecito, quindi si preme DOPO aver spedito
 * davvero.
 */
export default function HoInviato({
  praticaId,
  etichetta,
  inCorso: testoInCorso,
  fatta,
  errore: testoErrore,
}: {
  praticaId: string;
  etichetta: string;
  inCorso: string;
  fatta: string;
  errore: string;
}) {
  const router = useRouter();
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto">("fermo");
  const [errore, setErrore] = useState<string | null>(null);

  async function conferma() {
    if (stato !== "fermo") return;
    setStato("invio");
    setErrore(null);
    try {
      const r = await fetch("/api/pratiche/conferma-invio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pratica_id: praticaId }),
      });
      const corpo = (await r.json().catch(() => null)) as { errore?: string } | null;
      if (!r.ok) throw new Error(corpo?.errore ?? testoErrore);
      setStato("fatto");
      /* Lo stato nuovo e la riga in cronologia li scrive il server: si
         ricarica invece di indovinarli qui. */
      router.refresh();
    } catch (e) {
      setStato("fermo");
      setErrore(e instanceof Error ? e.message : testoErrore);
    }
  }

  return (
    <>
      <Button type="button" variant="contorno" onClick={() => void conferma()} disabled={stato !== "fermo"}>
        <Send className="size-4" aria-hidden="true" />
        {stato === "invio" ? testoInCorso : stato === "fatto" ? fatta : etichetta}
      </Button>
      {errore && (
        <p
          role="alert"
          className="mt-2 w-full rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed text-inchiostro"
        >
          {errore}
        </p>
      )}
    </>
  );
}
