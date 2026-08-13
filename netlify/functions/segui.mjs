/**
 * LA SVEGLIA DEI PROMEMORIA (scelta di Valerio col popup, 13/08).
 *
 * 🔴 QUESTO FILE NON ESISTEVA, ED È IL BUCO PIÙ CARO CHE AVEVAMO.
 * La rotta che manda il sollecito al giorno 42, la segnalazione all'ente
 * al 56 e la domanda «com'è andata?» al 90 c'era da settimane, funzionava
 * e aveva le sue prove. Ma NESSUNO LA CHIAMAVA: girava soltanto quando
 * Valerio premeva il bottone nel pannello. Con dieci pratiche è un
 * fastidio; con mille è la differenza fra un prodotto che mantiene le sue
 * promesse e uno che le manca tutte in silenzio, perché ogni giorno
 * saltato è un sollecito in ritardo per tutti quelli che quel giorno lo
 * aspettavano. E il cliente non se ne accorge: sa solo che non è
 * arrivato niente.
 *
 * Orario: 7:00 UTC, cioè le 9 in Italia d'estate e le 8 d'inverno. Un'ora
 * dopo la sveglia delle notifiche, per non far partire due giri insieme
 * sulle stesse funzioni.
 *
 * ⚠️ SALTARE UN GIORNO NON PERDE NIENTE, e va detto perché è quello che
 * rende sicuro accendere questa sveglia. Il calendario è calcolato sulla
 * data di invio di ogni pratica, non su «ieri»: se la sveglia non suona
 * per due giorni, al terzo giro parte tutto quello che era dovuto. E
 * nessuna email parte due volte, perché prima di mandarla si guarda se
 * l'evento è già scritto nella cronologia di quella pratica.
 *
 * ⚠️ IL GIRO SI FERMA DA SOLO DOPO 8 SECONDI. Le funzioni di Netlify
 * muoiono a 10, e una pratica lasciata a metà è peggio di una non
 * toccata. Le pratiche si esaminano dalla più vecchia, quindi chi
 * aspetta da più tempo passa per primo e il giorno dopo si riprende da
 * lì. Con molte pratiche aperte serviranno più giri: è già in ARRETRATI.
 *
 * MOTORE_SEGRETO: la rotta non si apre senza. Se la variabile non c'è su
 * Netlify la chiamata torna 401 e si legge qui nel registro.
 */
const sveglia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[promemoria] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/segui`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[promemoria] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

export const config = { schedule: "0 7 * * *" };
