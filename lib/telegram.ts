/**
 * Telegram: il canale principale degli alert.
 *
 * Perché Telegram e non la notifica del browser: su iPhone un sito normale
 * NON può notificare. Servirebbe che l'utente aggiunga il sito alla schermata
 * Home, e quasi nessuno lo fa. Telegram è già un'app installata con i permessi
 * di notifica concessi, e su iPhone funziona come su Android.
 * (Verificato e scritto in DECISIONI.md.)
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const TELEGRAM_ATTIVO = Boolean(TOKEN);

export type EsitoTelegram = { ok: true } | { ok: false; motivo: string };

/**
 * Manda un messaggio. Non lancia mai: un alert che non parte su Telegram
 * deve poter ripiegare sull'email, non far esplodere il motore.
 *
 * Il testo usa HTML e non Markdown: in Markdown un apostrofo o un trattino
 * nel nome di una struttura ("Ca' d'Oro", "B&B Sant'Anna") rompe il messaggio
 * e Telegram lo rifiuta. Con l'HTML basta scappare tre caratteri.
 */
export async function mandaTelegram(chatId: string, html: string): Promise<EsitoTelegram> {
  if (!TELEGRAM_ATTIVO) return { ok: false, motivo: "TELEGRAM_BOT_TOKEN assente." };

  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        // l'anteprima del link ruberebbe metà messaggio con una foto a caso
        link_preview_options: { is_disabled: true },
      }),
    });

    if (!r.ok) {
      const corpo = await r.text().catch(() => "");
      return { ok: false, motivo: `Telegram ${r.status}: ${corpo.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: `Telegram irraggiungibile: ${String(e).slice(0, 120)}` };
  }
}

/** I tre caratteri che Telegram non perdona dentro il testo HTML. */
export function pulito(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const euro = (n: number) => `${Math.round(n).toLocaleString("it-IT")}€`;

/**
 * L'alert come lo legge l'utente su Telegram.
 *
 * Struttura decisa così e non a caso: il numero che gli interessa (il totale
 * a testa) sta nella PRIMA riga, perché nella notifica del telefono si vedono
 * solo le prime due. Il resto lo legge aprendo.
 */
export function messaggioAlert(o: {
  destinazione: string;
  struttura: string;
  notti: number;
  persone: number;
  alloggioPersona: number;
  autoPersona: number;
  totalePersona: number;
  soglia: number;
  km: number;
  ore: string;
  link: string;
  creditiRimasti: number;
}): string {
  const avanzo = o.soglia - o.totalePersona;
  return [
    `<b>${pulito(o.destinazione)} · ${euro(o.totalePersona)} a testa</b>`,
    `Sotto la tua soglia di ${euro(o.soglia)}. Ti restano ${euro(avanzo)}.`,
    ``,
    `${pulito(o.struttura)}`,
    `${o.notti} ${o.notti === 1 ? "notte" : "notti"} · in ${o.persone} · ${o.km} km, ${o.ore} di auto`,
    ``,
    `<b>Il conto, aperto</b>`,
    `Alloggio a testa   ${euro(o.alloggioPersona)}`,
    `Auto a testa       ${euro(o.autoPersona)}`,
    `<b>Totale a testa    ${euro(o.totalePersona)}</b>`,
    ``,
    `<a href="${o.link}">Vedi l'offerta</a>`,
    ``,
    `<i>L'auto è una stima nostra su ${o.km} km andata e ritorno. Il prezzo della struttura è quello al momento del controllo e può cambiare.</i>`,
    `<i>Ti restano ${o.creditiRimasti} ${o.creditiRimasti === 1 ? "credito" : "crediti"}.</i>`,
  ].join("\n");
}
