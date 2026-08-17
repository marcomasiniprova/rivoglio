/**
 * LA SVEGLIA DI INDEXNOW.
 *
 * Ogni notte bussa alla rotta che manda gli indirizzi del sito a Bing
 * (`/api/motore/indexnow`). Così le pagine nuove o cambiate entrano nella
 * coda di Bing entro un giorno, e da lì possono comparire nelle risposte di
 * ChatGPT (che dall'indice di Bing prende circa l'87% delle citazioni).
 *
 * Come le altre funzioni: qui c'è solo l'orologio, la logica sta nella
 * rotta, dentro il sito. Il segreto (MOTORE_SEGRETO) chiude la rotta a chi
 * non è Netlify.
 *
 * Orario: 3:20 UTC, di notte, lontano dagli altri cron (le notifiche alle
 * 6, la coda alle 8:30) per non accavallare i giri.
 */
const sveglia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[indexnow] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/indexnow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[indexnow] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

export const config = { schedule: "20 3 * * *" };
