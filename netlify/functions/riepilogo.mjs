/**
 * LA SVEGLIA DEL RIEPILOGO DELLA SERA.
 *
 * Come le altre sveglie: qui c'è solo l'orologio, il lavoro sta dentro
 * il sito (`/api/motore/riepilogo`). Così la logica è una sola e si può
 * lanciare anche a mano.
 *
 * Orario: 19:00 UTC, cioè le 21 in Italia d'estate e le 20 d'inverno.
 * È l'ora in cui la giornata è finita davvero: un riepilogo alle 18
 * taglierebbe fuori le ore in cui la gente guarda i video.
 *
 * MOTORE_SEGRETO: senza, la rotta risponde 401 e qui si legge nel
 * registro di Netlify.
 */
const sveglia = async () => {
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

export const config = { schedule: "0 19 * * *" };
