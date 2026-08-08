/**
 * LE NOTIFICHE PUSH: il testo e la spedizione.
 *
 * Regola dettata da Valerio l'8/08, e vale sopra ogni altra cosa:
 * **la notifica NON deve essere tecnica.** "FR4001" lo capisce un pilota;
 * una persona riconosce il suo volo dalla TRATTA e dall'ora. Quindi si
 * scrive "Bergamo → Lanzarote", mai il codice, e si parla di ore, mai di
 * articoli di legge.
 *
 * E non si promette niente: "un volo così rientra nella fascia da 250€"
 * è un fatto sul Regolamento, "hai diritto a 250€" sarebbe una promessa
 * che non possiamo mantenere (le cause escludenti si valutano dopo).
 *
 * Spedizione: API push di Expo (https://exp.host/--/api/v2/push/send),
 * che accetta fino a 100 messaggi per chiamata. Non serve nessuna chiave
 * per i token di Expo. Non lancia mai: una push mancata non deve far
 * cadere il giro del cron.
 */

const API_EXPO = "https://exp.host/--/api/v2/push/send";

/** Un token Expo valido ha sempre questa forma. */
export function tokenValido(token: string | null | undefined): boolean {
  if (!token) return false;
  return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token.trim());
}

export type Messaggio = {
  token: string;
  titolo: string;
  corpo: string;
  /** Dati che l'app ritrova quando la notifica viene toccata. */
  dati?: Record<string, string>;
};

/**
 * "3h15" non si legge a colpo d'occhio. "3 ore e 15 minuti" sì.
 * Sotto l'ora si dicono solo i minuti.
 */
export function ritardoInParole(minuti: number): string {
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  if (ore === 0) return `${resto} minuti`;
  const parteOre = ore === 1 ? "un'ora" : `${ore} ore`;
  if (resto === 0) return parteOre;
  return `${parteOre} e ${resto} minuti`;
}

/**
 * Il testo dell'avviso. Torna null quando non c'è niente da dire: un
 * caso incerto o senza compensazione non merita di far vibrare un
 * telefono. Silenzio è meglio di rumore.
 */
export function testoAvviso(v: {
  da: string | null;
  a: string | null;
  voloIata: string;
  esito: string;
  importo?: number | null;
  ritardoMinuti?: number | null;
}): { titolo: string; corpo: string } | null {
  if (v.esito !== "idoneo" || !v.importo) return null;

  /* La tratta è il modo in cui uno riconosce il suo volo. Se per qualche
     motivo mancasse, si ripiega sul codice: meglio un codice che niente,
     ma è l'ultima spiaggia. */
  const tratta = v.da && v.a ? `${v.da} → ${v.a}` : v.voloIata;

  const ritardo =
    typeof v.ritardoMinuti === "number" && v.ritardoMinuti > 0
      ? `Arrivato con ${ritardoInParole(v.ritardoMinuti)} di ritardo. `
      : "";

  return {
    titolo: tratta,
    corpo: `${ritardo}Un volo così rientra nella fascia da ${v.importo}€ a passeggero. Apri Rivoglio per vedere il dato.`,
  };
}

/** Quanti messaggi accetta Expo in una sola chiamata. */
const LOTTO = 100;

/**
 * Manda i messaggi. Torna quanti ne ha accettati Expo.
 * Non lancia mai: se la rete cade, il giro successivo riprova (l'avviso
 * si segna solo dopo che è partito).
 */
export async function mandaPush(messaggi: Messaggio[]): Promise<{ accettati: number }> {
  if (messaggi.length === 0) return { accettati: 0 };

  let accettati = 0;
  for (let i = 0; i < messaggi.length; i += LOTTO) {
    const lotto = messaggi.slice(i, i + LOTTO).map((m) => ({
      to: m.token,
      title: m.titolo,
      body: m.corpo,
      sound: "default",
      priority: "high",
      ...(m.dati ? { data: m.dati } : {}),
    }));

    try {
      const risposta = await fetch(API_EXPO, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(lotto),
        signal: AbortSignal.timeout(6_000),
      });
      if (!risposta.ok) {
        console.warn(`[push] Expo ha risposto ${risposta.status}`);
        continue;
      }
      const corpo = (await risposta.json()) as {
        data?: Array<{ status?: string; message?: string }>;
      };
      for (const esito of corpo.data ?? []) {
        if (esito.status === "ok") accettati++;
        else console.warn("[push] messaggio rifiutato:", esito.message);
      }
    } catch (e) {
      console.warn("[push] invio fallito:", e);
    }
  }

  return { accettati };
}
