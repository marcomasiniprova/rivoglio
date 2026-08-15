/**
 * LA SVEGLIA DELLA CODA DEGLI INCERTI.
 *
 * Una volta al giorno bussa alla rotta che ricontrolla i check usciti
 * "incerto" a cui l'utente ha lasciato l'email (`/api/motore/coda`). La
 * logica sta nel sito; qui c'è solo l'orologio, come per le altre sveglie.
 *
 * MOTORE_SEGRETO: la rotta non si apre senza. Se manca su Netlify la
 * chiamata torna 401 e si legge nel registro di Netlify.
 */
const coda = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[coda] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/coda`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[coda] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default coda;

// Ogni giorno alle 8:30 UTC: il dato dei voli freschi consolida entro un
// giorno, e l'orario è lontano dalle altre sveglie (nessuna collisione).
export const config = { schedule: "30 8 * * *" };
