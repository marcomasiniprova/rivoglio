/**
 * LA SVEGLIA DELLE NOTIFICHE.
 *
 * Netlify fa partire questa funzione ogni mattina; lei non fa il lavoro,
 * bussa alla rotta che lo fa (`/api/motore/avvisa`). Così la logica resta
 * una sola, dentro il sito, e qui c'è solo l'orologio.
 *
 * Orario: 6:00 UTC, cioè le 8 in Italia d'estate e le 7 d'inverno. È
 * "la mattina dopo" chiesta da Valerio: l'orario certificato di atterraggio
 * arriva con qualche ora di ritardo, avvisare prima significa dare verdetti
 * su dati non consolidati.
 *
 * MOTORE_SEGRETO: la rotta non si apre senza. Se la variabile non c'è su
 * Netlify, la chiamata torna 401 e qui si legge nel registro.
 */
const sveglia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[sveglia] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/avvisa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[sveglia] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

export const config = { schedule: "0 6 * * *" };
