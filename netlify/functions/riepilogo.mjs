/**
 * LA SVEGLIA DEL RIEPILOGO DELLA SERA.
 *
 * Come le altre sveglie: qui c'è solo l'orologio, il lavoro sta dentro
 * il sito (`/api/motore/riepilogo`). Così la logica è una sola e si può
 * lanciare anche a mano.
 *
 * 🔴 L'ORARIO ERA SBAGLIATO PER META' ANNO, e non lo avrebbe segnalato
 * niente. Qui c'era scritto `0 19 * * *` con la nota «cioè le 21 in
 * Italia»: vero da fine marzo a fine ottobre. Da quando si torna all'ora
 * solare quello stesso momento sono le **20:00**, e il riepilogo della
 * sera sarebbe arrivato un'ora prima per tutto l'inverno. Non è un
 * errore per nessuno tranne che per chi lo aspetta, quindi nessun
 * allarme sarebbe suonato mai. Trovato il 12/08 cercando i conti
 * sbagliati sul tempo, su richiesta di Valerio.
 *
 * Il cron di Netlify conosce solo l'UTC. Quindi la sveglia suona a
 * ENTRAMBE le ore candidate (18 e 19 UTC) e la funzione si spegne da
 * sola se in Italia non sono le 21: il messaggio parte una volta e
 * sempre alla stessa ora, estate e inverno.
 *
 * MOTORE_SEGRETO: senza, la rotta risponde 401 e qui si legge nel
 * registro di Netlify.
 */

/** Che ore sono in Italia adesso, ora legale compresa. */
const oraItaliana = () =>
  Number(
    new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Rome",
    }).format(new Date()),
  );

/** L'ora in cui Valerio vuole il riepilogo. Una sola, dichiarata. */
const ORA_DEL_RIEPILOGO = 21;

const sveglia = async () => {
  const ora = oraItaliana();
  if (ora !== ORA_DEL_RIEPILOGO) {
    console.log(`[riepilogo] in Italia sono le ${ora}, non le ${ORA_DEL_RIEPILOGO}: salto.`);
    return new Response("non è l'ora", { status: 200 });
  }

  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[riepilogo] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/riepilogo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[riepilogo] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

/* Due sveglie, un solo messaggio: 18 UTC sono le 21 in ora solare, 19
   UTC sono le 21 in ora legale. Quella che casca nell'ora sbagliata si
   spegne da sola sopra. */
export const config = { schedule: "0 18,19 * * *" };
