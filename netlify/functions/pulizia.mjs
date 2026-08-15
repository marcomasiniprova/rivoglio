/**
 * LA SVEGLIA DELLA PULIZIA.
 *
 * Una volta a settimana bussa alla rotta che cancella i dati vecchi
 * (`/api/motore/pulizia`). La logica sta nel sito; qui c'è solo l'orologio,
 * come per le altre sveglie (avvisa, scioperi, segui).
 *
 * MOTORE_SEGRETO: la rotta non si apre senza. Se manca su Netlify la chiamata
 * torna 401 e si legge nel registro di Netlify.
 */
const pulizia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[pulizia] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/pulizia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[pulizia] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default pulizia;

// Domenica alle 4:10 UTC: nessuno in giro, e lontano dagli altri lavori notturni.
export const config = { schedule: "10 4 * * 0" };
