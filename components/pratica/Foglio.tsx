import { NOTA_TRASPARENZA } from "@/lib/lettera/genera";

/**
 * IL FOGLIO: il documento che il cliente ha comprato, che DEVE sembrare
 * un documento.
 *
 * Richiesta di Valerio (12/08): «il ricorso generato deve essere ultra
 * professionale, stesso stile dell'immagine 4» (una denuncia-querela:
 * carta bianca, carattere con le grazie, intestazione, oggetto in
 * evidenza, paragrafi numerati, firma in fondo).
 *
 * Aveva ragione, e il motivo non è estetico. Fino a ieri la lettera era
 * un blocco di testo dentro una card arrotondata: chi la apriva vedeva
 * una schermata, non un atto. E questa lettera finisce in mano
 * all'ufficio reclami di una compagnia aerea, che di lettere ne legge
 * mille al giorno: la differenza fra "un cliente arrabbiato" e "qualcuno
 * che sa cosa sta facendo" si gioca nei primi due secondi, prima che
 * abbiano letto una parola.
 *
 * ⚠️ IL TESTO NON SI TOCCA. Questo file è solo vestito: prende `corpo`
 * così com'è da `lib/lettera/genera.ts` e lo dispone. Le frasi sono
 * legate a norme e sentenze verificate una per una, e una libertà presa
 * qui per far tornare l'impaginazione sarebbe un errore di sostanza
 * travestito da grafica.
 *
 * ⚠️ E NON SI TRAVESTE DA ATTO GIUDIZIARIO (scelta di Valerio col popup).
 * Niente intestazione di tribunale, niente "Ill.mo Giudice", niente
 * numero di ruolo: quella roba, su un documento che scrive un privato,
 * non impressiona nessuno e ci porterebbe dritti dentro l'esercizio
 * abusivo della professione. La forza di questa lettera sta negli orari
 * certificati e nelle sentenze pubbliche, non nel sembrare un avvocato.
 * Per questo in fondo c'è scritto, su ogni foglio, che non costituisce
 * parere legale.
 */

/** Un blocco del documento, riconosciuto dalla forma del testo. */
export type Blocco =
  | { tipo: "saluto"; testo: string }
  | { tipo: "paragrafo"; testo: string }
  | { tipo: "elenco"; voci: string[] }
  | { tipo: "campi"; righe: { etichetta: string; valore: string }[] }
  | { tipo: "firma"; righe: string[] };

/**
 * Da testo semplice a documento.
 *
 * ⚠️ Nessuna intelligenza: si guarda com'è fatta la riga e basta. Un
 * trattino in testa è una voce d'elenco, "PAROLA:" è un campo da
 * compilare, l'ultimo blocco dopo i saluti è la firma. Se un domani il
 * testo cambia forma, il peggio che succede è che un paragrafo esce
 * come paragrafo invece che come elenco: il contenuto resta tutto,
 * sempre. È la ragione per cui qui non c'è un modello che indovina.
 */
export function inBlocchi(corpo: string): Blocco[] {
  /* La nota di trasparenza vive in fondo, nel piede: qui si stacca
     perché nel documento non è un paragrafo, è la riga a piè di pagina. */
  /* ⚠️ Prima si tagliava su una riga di tre trattini, che il generatore
     metteva prima della nota. Quella riga però finiva anche nell'EMAIL
     che l'utente manda alla compagnia, ed è uno dei segni che Valerio ha
     riconosciuto come "roba scritta da una macchina" (12/08). Adesso il
     testo non ha più separatori e il taglio avviene sulla nota stessa,
     che è una costante nostra: una sola verità, e quello che si copia è
     identico a quello che si stampa. */
  const senzaNota = corpo.split(NOTA_TRASPARENZA)[0].trimEnd();
  const pezzi = senzaNota.split(/\n{2,}/);
  const blocchi: Blocco[] = [];
  let saluto = false;

  for (let i = 0; i < pezzi.length; i++) {
    const pezzo = pezzi[i].trim();
    if (!pezzo) continue;

    if (!saluto && /^Spett\.le|^Alla cortese|^Egregi/i.test(pezzo)) {
      blocchi.push({ tipo: "saluto", testo: pezzo.replace(/,\s*$/, "") });
      saluto = true;
      continue;
    }

    const righe = pezzo.split("\n").map((r) => r.trim()).filter(Boolean);

    /* Il blocco della firma: viene dopo "Distinti saluti," ed è fatto di
       righe corte, una sotto l'altra. Va tenuto unito e spaziato, se no
       il nome e la data si attaccano al paragrafo di sopra. */
    if (i === pezzi.length - 1 && blocchi.some((b) => b.tipo === "paragrafo" && /saluti/i.test(b.testo))) {
      blocchi.push({ tipo: "firma", righe });
      continue;
    }

    if (righe.length > 1 && righe.every((r) => r.startsWith("- "))) {
      blocchi.push({ tipo: "elenco", voci: righe.map((r) => r.slice(2)) });
      continue;
    }

    /* Un paragrafo può avere una riga di apertura e poi delle voci
       d'elenco attaccate (i fatti del volo): si spezza in due blocchi,
       se no i trattini restano dentro un blocco giustificato e vanno a
       capo dove capita. */
    const primoTrattino = righe.findIndex((r) => r.startsWith("- "));
    if (primoTrattino > 0 && righe.slice(primoTrattino).every((r) => r.startsWith("- "))) {
      blocchi.push({ tipo: "paragrafo", testo: righe.slice(0, primoTrattino).join(" ") });
      blocchi.push({
        tipo: "elenco",
        voci: righe.slice(primoTrattino).map((r) => r.slice(2).replace(/;$/, "").replace(/\.$/, "")),
      });
      continue;
    }

    /* "IBAN: [da compilare]" e simili: due colonne, non una frase.
       🔴 Prima si pretendeva che TUTTE le righe del blocco fossero
       campi, e le coordinate del bonifico non lo sono: la prima riga è
       una frase ("Il pagamento può essere effettuato con bonifico su
       queste coordinate:") e i campi vengono dopo. Risultato, visto
       nella prima schermata: «... queste coordinate: IBAN: [da
       compilare] Intestato a: [da compilare]» tutto di fila dentro un
       paragrafo giustificato, cioè la riga più importante del documento
       (dove finiscono i soldi) scritta come una nota di passaggio.
       Adesso si stacca l'apertura dai campi, come già si fa coi
       trattini. */
    const campo = (r: string) => /^([A-Za-zÀ-ú' ]{2,30}):\s*(.+)$/.exec(r);
    const primoCampo = righe.findIndex((r) => campo(r) !== null);
    if (primoCampo >= 0 && righe.length - primoCampo >= 2 && righe.slice(primoCampo).every((r) => campo(r) !== null)) {
      if (primoCampo > 0) {
        blocchi.push({ tipo: "paragrafo", testo: righe.slice(0, primoCampo).join(" ") });
      }
      blocchi.push({
        tipo: "campi",
        righe: righe.slice(primoCampo).map((r) => {
          const m = campo(r) as RegExpExecArray;
          return { etichetta: m[1], valore: m[2] };
        }),
      });
      continue;
    }

    blocchi.push({ tipo: "paragrafo", testo: righe.join(" ") });
  }

  return blocchi;
}

/**
 * Il numero accanto a ogni paragrafo, calcolato una volta sola.
 *
 * `null` dove il numero non va: elenchi, campi, firma, saluto, e le
 * formule di chiusura ("Distinti saluti", "In allegato"). Numerare una
 * formula di cortesia farebbe ridere chi legge, ed è esattamente la
 * faccia che questo documento non deve fare.
 */
function numerazione(blocchi: Blocco[]): (number | null)[] {
  let n = 0;
  return blocchi.map((b) => {
    if (b.tipo !== "paragrafo") return null;
    if (/^(distinti saluti|cordiali saluti|in allegato)/i.test(b.testo)) return null;
    n += 1;
    return n;
  });
}

export default function Foglio({
  id,
  oggetto,
  corpo,
  /** "Reclamo", "Sollecito", "Segnalazione": la fascia in cima al foglio. */
  atto,
  /** Il riferimento breve: volo e data. Fa da numero di protocollo. */
  riferimento,
  /** Il bottone di copia, montato dalla pagina: qui dentro non c'è stato. */
  azione,
}: {
  id: string;
  oggetto: string;
  corpo: string;
  atto: string;
  riferimento?: string | null;
  azione?: React.ReactNode;
}) {
  const blocchi = inBlocchi(corpo);
  /* I paragrafi si numerano, le liste e la firma no: il numero serve a
     citare un passaggio ("al punto 3 chiedete..."), e su un elenco di
     nomi non vuol dire niente.
     ⚠️ I numeri si calcolano PRIMA di disegnare, non contando dentro la
     lista: un contatore che cresce mentre React disegna è la cosa che il
     compilatore di React vieta, e con ragione. Al secondo disegno
     ripartirebbe da dove era rimasto. */
  const numeri = numerazione(blocchi);

  return (
    <section
      id={id}
      className="foglio overflow-hidden rounded-[6px] border border-bordo bg-white shadow-[0_1px_2px_rgba(5,46,31,.05),0_12px_32px_-16px_rgba(5,46,31,.18)]"
    >
      {/* La fascia in cima: dice che cos'è questo foglio prima ancora che
          si legga l'oggetto. Sparisce in stampa, dove al suo posto resta
          il titolo in nero: una fascia verde piena su carta è inchiostro
          buttato e sulle stampanti in bianco e nero diventa grigio. */}
      <div className="foglio-fascia flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-bordo bg-verde-notte px-7 py-3.5 sm:px-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-menta">{atto}</p>
        {riferimento && (
          <p className="numeri text-[0.72rem] tracking-[0.06em] text-white/60">{riferimento}</p>
        )}
      </div>

      <div className="foglio-corpo px-7 py-8 sm:px-10 sm:py-11">
        {/* L'oggetto, staccato dal resto come su una raccomandata. */}
        <div className="border-b border-bordo pb-5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-fumo-2">
            Oggetto
          </p>
          <p className="foglio-testo mt-1.5 text-[0.98rem] font-semibold leading-snug text-inchiostro">
            {oggetto}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4">
          {blocchi.map((b, i) => {
            if (b.tipo === "saluto") {
              return (
                <p
                  key={i}
                  className="foglio-testo text-[1rem] font-semibold leading-snug text-inchiostro"
                >
                  {b.testo},
                </p>
              );
            }

            if (b.tipo === "elenco") {
              return (
                <ul key={i} className="foglio-testo ml-1 flex flex-col gap-1.5">
                  {b.voci.map((v) => (
                    <li key={v} className="flex gap-3 text-[0.95rem] leading-[1.7] text-inchiostro">
                      <span
                        aria-hidden="true"
                        className="mt-[0.72em] size-[3px] shrink-0 rounded-full bg-inchiostro/45"
                      />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            if (b.tipo === "campi") {
              return (
                <dl
                  key={i}
                  className="foglio-testo my-1 rounded-[4px] border border-dashed border-bordo bg-nebbia/60 px-4 py-3"
                >
                  {b.righe.map((r) => (
                    <div key={r.etichetta} className="flex flex-wrap gap-x-2 text-[0.93rem] leading-[1.9]">
                      <dt className="font-semibold text-inchiostro">{r.etichetta}:</dt>
                      <dd className="text-fumo">{r.valore}</dd>
                    </div>
                  ))}
                </dl>
              );
            }

            if (b.tipo === "firma") {
              return (
                <div key={i} className="foglio-testo mt-6 flex flex-col gap-0.5 border-t border-bordo pt-5">
                  {b.righe.map((r, k) => (
                    <p
                      key={r}
                      className={
                        k === 0
                          ? "text-[0.97rem] font-semibold leading-relaxed text-inchiostro"
                          : "text-[0.9rem] leading-relaxed text-fumo"
                      }
                    >
                      {r}
                    </p>
                  ))}
                </div>
              );
            }

            /* Un paragrafo vero: numerato, giustificato, con le grazie. */
            return (
              /* ⚠️ GIUSTIFICATO SOLO DA 640 IN SU. Su una colonna larga
                 come uno schermo di telefono il testo giustificato apre
                 fiumi bianchi in mezzo alle righe: si vedeva benissimo
                 nella prima schermata a 390, dove certe righe avevano tre
                 spazi fra una parola e l'altra. La sillabazione aiuta ma
                 non basta: sotto una certa larghezza si allinea a
                 sinistra e si legge meglio. */
              <p
                key={i}
                className="foglio-testo text-[0.95rem] leading-[1.75] text-inchiostro sm:text-justify"
                style={{ hyphens: "auto" }}
              >
                {numeri[i] !== null && (
                  <span className="numeri mr-2 font-semibold text-verde-scuro">{numeri[i]}.</span>
                )}
                {b.testo}
              </p>
            );
          })}
        </div>
      </div>

      {/* Il piede: la nota che ci tiene fuori dalla professione forense e
          dice chi ha preparato il foglio. Su OGNI foglio, sempre: una
          prova lo controlla. */}
      <div className="foglio-piede border-t border-bordo bg-nebbia/70 px-7 py-4 sm:px-10">
        {/* ⚠️ `text-fumo`, non `fumo-2`: nella prima schermata questa riga
            era così chiara da sembrare un acquerello, e non è una nota
            decorativa: è la frase che ci tiene fuori dall'esercizio
            abusivo della professione forense. Deve leggersi. */}
        <p className="text-[0.74rem] leading-relaxed text-fumo">
          {NOTA_TRASPARENZA} Documento predisposto con Rivolio. Rivolio non è un intermediario e
          non riceve la compensazione: la invii tu e la incassi tu.
        </p>
      </div>

      {azione && <div className="no-stampa border-t border-bordo px-7 py-4 sm:px-10">{azione}</div>}
    </section>
  );
}
