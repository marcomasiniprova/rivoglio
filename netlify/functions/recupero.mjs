/**
 * LA SVEGLIA DEL RECUPERO.
 *
 * Come le altre: qui c'è solo l'orologio, il lavoro sta dentro il sito
 * (`/api/motore/recupero`). Una volta al giorno.
 *
 * Orario: 5:40 UTC. Lontano dagli altri cron (scioperi 4:20, notifiche
 * 6:00) e in un momento morto per il sito. Il minuto 40 e non 00 perché
 * alle ore tonde partono i cron di mezzo mondo.
 *
 * ⚠️ Se `RECUPERO_ATTIVO` è spento su Netlify, il giro gira ma non manda
 * niente (0 email): è la scelta di Valerio, si accende con la cassa.
 */
const sveglia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[recupero] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/recupero`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[recupero] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

export const config = { schedule: "40 5 * * *" };
