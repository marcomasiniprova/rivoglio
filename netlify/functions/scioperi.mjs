/**
 * LA SVEGLIA DEGLI SCIOPERI.
 *
 * Come quella delle notifiche: qui c'è solo l'orologio, il lavoro sta
 * dentro il sito (`/api/motore/scioperi`). Così la logica resta in un
 * posto solo e si può lanciare anche a mano dal browser.
 *
 * Orario: 4:20 UTC, cioè poco prima dell'alba in Italia. È un momento in
 * cui nessuno sta usando il sito, e soprattutto è PRIMA della sveglia
 * delle notifiche (6:00): se oggi è stato proclamato uno sciopero, il
 * motore lo sa già quando gira sui voli di ieri.
 *
 * Il minuto 20 e non 00 di proposito: alle 4 in punto partono i cron di
 * mezzo mondo e le API pubbliche rispondono peggio.
 *
 * Se il giro fallisce, è la rotta a mandare l'email di allarme: qui si
 * scrive solo nel registro.
 */
const sveglia = async () => {
  const casa = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!casa) {
    console.error("[scioperi] manca l'indirizzo del sito (URL): giro saltato.");
    return new Response("URL assente", { status: 500 });
  }

  const risposta = await fetch(`${casa}/api/motore/scioperi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MOTORE_SEGRETO ? { "x-motore-segreto": process.env.MOTORE_SEGRETO } : {}),
    },
  });

  const corpo = await risposta.text();
  console.log(`[scioperi] ${risposta.status}: ${corpo}`);
  return new Response(corpo, { status: risposta.status });
};

export default sveglia;

export const config = { schedule: "20 4 * * *" };
