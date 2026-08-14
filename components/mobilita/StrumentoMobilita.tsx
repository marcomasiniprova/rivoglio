"use client";

import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SITUAZIONI,
  generaLetteraMobilita,
  type DatiMobilita,
  type SituazioneMobilita,
} from "@/lib/lettera/mobilita";

/**
 * LO STRUMENTO DEL REGOLAMENTO 1107/2006.
 *
 * Aperto a tutti, senza account e senza pagamento (scelta di Valerio,
 * 14/08): scegli cosa ti è successo, scrivi due righe, e la lettera si
 * compone da sé, con l'articolo giusto già dentro. La si copia o si apre
 * nell'email. Il verdetto qui non c'è: non è un caso da vendere, è un
 * diritto da far valere, e il documento lo scrive la stessa mano che ha
 * viaggiato.
 *
 * Tutto vive nel browser: nessun dato parte da qui, niente da salvare.
 */

const ORDINE: SituazioneMobilita[] = ["assistenza", "imbarco", "attrezzatura"];

/** "2026-08-06" → "6 agosto 2026". Vuoto resta vuoto. */
function dataEstesa(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function Campo({
  id,
  etichetta,
  valore,
  cambia,
  segnaposto,
  tipo = "text",
}: {
  id: string;
  etichetta: string;
  valore: string;
  cambia: (v: string) => void;
  segnaposto?: string;
  tipo?: "text" | "date";
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[14px] font-semibold text-inchiostro">
        {etichetta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valore}
        onChange={(e) => cambia(e.target.value)}
        placeholder={segnaposto}
        /* 16px sul telefono: sotto quella misura iOS zooma la pagina da solo. */
        className="mt-1.5 h-12 w-full rounded-xl border border-bordo bg-white px-4 text-[16px] outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/10 sm:text-[15px]"
      />
    </div>
  );
}

export default function StrumentoMobilita() {
  const [situazione, setSituazione] = useState<SituazioneMobilita | null>(null);
  const [nome, setNome] = useState("");
  const [volo, setVolo] = useState("");
  const [dataIso, setDataIso] = useState("");
  const [compagnia, setCompagnia] = useState("");
  const [aeroporto, setAeroporto] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [ausilio, setAusilio] = useState("");
  const [iban, setIban] = useState("");
  const [lettera, setLettera] = useState<{ oggetto: string; corpo: string } | null>(null);
  const [copiato, setCopiato] = useState<string | null>(null);
  const [ripiego, setRipiego] = useState(false);

  const pronto =
    situazione !== null &&
    nome.trim().length > 1 &&
    dataIso.trim() !== "" &&
    aeroporto.trim().length > 1 &&
    descrizione.trim().length > 5;

  function componi() {
    if (!situazione || !pronto) return;
    const dati: DatiMobilita = {
      nome,
      volo,
      data: dataEstesa(dataIso),
      compagnia,
      aeroporto,
      descrizione,
      ausilio: situazione === "attrezzatura" ? ausilio : undefined,
      iban: situazione === "attrezzatura" ? iban : undefined,
    };
    setLettera(generaLetteraMobilita(situazione, dati));
    setRipiego(false);
  }

  async function copia(testo: string, conferma: string) {
    try {
      await navigator.clipboard.writeText(testo);
      setCopiato(conferma);
    } catch {
      setCopiato("Non riesco a copiare: seleziona il testo qui sotto");
    }
    setTimeout(() => setCopiato(null), 2400);
  }

  return (
    <div className="not-prose rounded-2xl border border-bordo bg-white p-5 shadow-[0_18px_50px_-30px_rgba(5,46,31,.4)] sm:p-6">
      {/* 1. la situazione */}
      <p className="text-[15px] font-semibold text-inchiostro">Cosa ti è successo?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {ORDINE.map((chiave) => {
          const attiva = situazione === chiave;
          return (
            <button
              key={chiave}
              type="button"
              onClick={() => {
                setSituazione(chiave);
                setLettera(null);
              }}
              aria-pressed={attiva}
              className={`rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-all duration-200 ${
                attiva
                  ? "border-verde bg-menta-tenue text-inchiostro"
                  : "border-bordo bg-nebbia text-fumo hover:border-verde/50"
              }`}
            >
              {SITUAZIONI[chiave].scheda}
            </button>
          );
        })}
      </div>

      {situazione && (
        <div className="mt-5 border-t border-bordo/70 pt-5">
          <p className="text-[14px] font-semibold text-inchiostro">{SITUAZIONI[situazione].titolo}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-fumo">{SITUAZIONI[situazione].spiega}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo id="m-nome" etichetta="Il tuo nome e cognome" valore={nome} cambia={setNome} segnaposto="Mario Rossi" />
            <Campo id="m-data" etichetta="Data del volo" valore={dataIso} cambia={setDataIso} tipo="date" />
            <Campo id="m-volo" etichetta="Numero del volo (se lo sai)" valore={volo} cambia={setVolo} segnaposto="es. AZ1234" />
            <Campo id="m-compagnia" etichetta="Compagnia aerea" valore={compagnia} cambia={setCompagnia} segnaposto="es. ITA Airways" />
            <div className="sm:col-span-2">
              <Campo id="m-aeroporto" etichetta="Aeroporto dove è successo" valore={aeroporto} cambia={setAeroporto} segnaposto="es. Roma Fiumicino" />
            </div>
            {situazione === "attrezzatura" && (
              <>
                <Campo id="m-ausilio" etichetta="Quale ausilio" valore={ausilio} cambia={setAusilio} segnaposto="es. sedia a rotelle elettrica" />
                <Campo id="m-iban" etichetta="IBAN per il risarcimento (se vuoi)" valore={iban} cambia={setIban} segnaposto="IT..." />
              </>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="m-descrizione" className="text-[14px] font-semibold text-inchiostro">
              Racconta cosa è successo, con parole tue
            </label>
            <textarea
              id="m-descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={4}
              placeholder="Es. Avevo chiesto l'assistenza al check-in, ma nessuno è venuto a prendermi e ho perso l'imbarco."
              className="mt-1.5 w-full rounded-xl border border-bordo bg-white px-4 py-3 text-[16px] leading-relaxed outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/10 sm:text-[15px]"
            />
          </div>

          <div className="mt-4">
            <Button type="button" size="lg" disabled={!pronto} onClick={componi} className="w-full sm:w-auto">
              Prepara la lettera
            </Button>
            {!pronto && (
              <p className="mt-2 text-[12.5px] text-fumo-2">
                Servono almeno il tuo nome, la data, l&apos;aeroporto e due righe su cosa è successo.
              </p>
            )}
          </div>
        </div>
      )}

      {lettera && situazione && (
        <div className="mt-6 border-t border-bordo/70 pt-6">
          <div className="rounded-xl bg-menta-tenue px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-verde-notte">A chi mandarla</p>
            <p className="mt-1 text-[14px] leading-relaxed text-inchiostro/85">{SITUAZIONI[situazione].aChi}</p>
          </div>

          <div className="mt-4 rounded-xl border border-bordo bg-nebbia p-4">
            <p className="text-[13px] font-semibold text-fumo">Oggetto</p>
            <p className="mt-1 text-[14.5px] text-inchiostro">{lettera.oggetto}</p>
            <p className="mt-4 whitespace-pre-wrap text-[14.5px] leading-relaxed text-inchiostro/90">
              {lettera.corpo}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a
                href={`mailto:?subject=${encodeURIComponent(lettera.oggetto)}&body=${encodeURIComponent(lettera.corpo)}`}
                onClick={() => setTimeout(() => setRipiego(true), 4000)}
              >
                <Mail className="size-5 shrink-0" aria-hidden="true" />
                Apri l&apos;email già scritta
              </a>
            </Button>
            <Button type="button" variant="contorno" onClick={() => void copia(lettera.corpo, "Testo copiato.")}>
              <Copy className="size-4" aria-hidden="true" />
              Copia il testo
            </Button>
          </div>
          {copiato && (
            <p role="status" className="mt-2 text-sm text-verde">
              {copiato}
            </p>
          )}
          {ripiego && (
            <p className="mt-3 rounded-xl bg-sole/15 px-4 py-3 text-sm leading-relaxed">
              Non si è aperto niente? Vuol dire che su questo dispositivo non c&apos;è un&apos;app di posta
              collegata. Premi <strong>Copia il testo</strong>, apri la tua email come fai di solito e
              incollalo. L&apos;indirizzo del destinatario lo aggiungi tu.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
