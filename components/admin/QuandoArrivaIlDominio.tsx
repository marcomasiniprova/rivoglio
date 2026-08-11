import { Check } from "lucide-react";

/**
 * IL PROMEMORIA DEL TRASLOCO (richiesta di Valerio, 11/08: «adesso stiamo
 * configurando molte cose con netlify.app pero' io oggi prendo quello
 * .it, quindi ricordami di fare un giro»).
 *
 * ⚠️ STA QUI E NON IN UN FILE, ed è una regola sua di ieri: «non lo
 * leggero' mai, dammi il sunto in chat». Un promemoria che vive dentro la
 * pagina delle impostazioni lo si trova nel momento in cui serve, cioè
 * mentre si sta configurando; un file nel repository invece si scrive
 * una volta e non si riapre.
 *
 * ⚠️ E SI SPUNTA DA SOLO. Le voci che il server può verificare (una
 * variabile che c'è, un indirizzo che è cambiato) si segnano fatte senza
 * che nessuno debba ricordarsene: una lista che non sa cosa è già stato
 * fatto invecchia in due giorni e poi non la guarda più nessuno.
 */

type Passo = {
  cosa: string;
  /** Il dettaglio pratico: dove si clicca, cosa si incolla. */
  come: string;
  /** Se il server sa dire da solo che è fatto, qui c'è la risposta. */
  fatto?: boolean;
  /** La trappola, quando ce n'è una che fa perdere il pomeriggio. */
  attenzione?: string;
};

function passi(): Passo[] {
  const sito = process.env.NEXT_PUBLIC_SITO ?? process.env.URL ?? "";
  /* "Il dominio è arrivato" si riconosce da una cosa sola: l'indirizzo
     del sito non finisce più per netlify.app. */
  const suDominioProprio = Boolean(sito) && !/netlify\.app/i.test(sito);

  return [
    {
      cosa: "Punta il dominio a Netlify",
      come: "Su Netlify: Domain management → Add a domain → rivolio.it. Netlify ti dà i suoi server DNS; li incolli su IONOS al posto di quelli suoi. Poi aspetti che diventi verde.",
      fatto: suDominioProprio,
      attenzione:
        "Il certificato di sicurezza (il lucchetto) Netlify lo fa da solo, ma solo DOPO che il dominio è verde. Se apri il sito prima, il browser urla: non è rotto, è presto.",
    },
    {
      cosa: "Il vecchio indirizzo rimanda al nuovo",
      come: "Su Netlify, in Domain management, rivolio.it va messo come dominio PRINCIPALE. Da quel momento chi apre rivolio.netlify.app finisce su rivolio.it da solo.",
      attenzione:
        "Senza questo, per Google diventano due siti identici e il valore si divide fra i due. È il modo più sciocco di farsi penalizzare.",
    },
    {
      cosa: "Resend: verifica il dominio",
      come: "resend.com/domains → Add Domain → scrivi send.rivolio.it (un sottodominio, non il dominio nudo) → region eu-west-1. Poi incolli i tre record su IONOS.",
      attenzione:
        "IONOS aggiunge il dominio da sé: nel campo Nome incolli solo la parte a sinistra. E il record DKIM va su resend._domainkey.send, non sulla radice.",
    },
    {
      cosa: "RESEND_MITTENTE su Netlify",
      come: 'Valerio di Rivolio <valerio@send.rivolio.it>',
      fatto: Boolean(process.env.RESEND_MITTENTE),
      attenzione:
        "SOLO dopo che Resend ha messo il verde su tutti e tre i record. Se la metti prima, le email si fermano del tutto invece di partire meglio.",
    },
    {
      cosa: "Il gancio email di Supabase",
      come: "Authentication → Auth Hooks → Send Email hook → HTTPS → https://rivolio.it/api/posta-auth. Copi il secret e lo metti su Netlify come RESEND_HOOK_SECRET.",
      fatto: Boolean(process.env.RESEND_HOOK_SECRET),
      attenzione:
        "Senza, le email di accesso partono 2 all'ora e basta: è il tetto del servizio interno di Supabase. È il passo che rende vero l'\"entra senza password\".",
    },
    {
      cosa: "Supabase: gli indirizzi di ritorno",
      come: "Authentication → URL Configuration. Site URL: https://rivolio.it. E in Redirect URLs aggiungi https://rivolio.it/**",
      attenzione:
        "Se lo salti, chi clicca il link di accesso torna sul vecchio indirizzo o riceve un errore. È il guasto più silenzioso del trasloco.",
    },
    {
      cosa: "Riesporta l'app",
      come: "Dentro la cartella mobile: npm run anteprima, poi push. L'app scrive l'indirizzo del sito dentro di sé quando viene costruita.",
      attenzione:
        "Finché non la riesporti, l'invito agli amici e i link del profilo puntano al vecchio indirizzo.",
    },
    {
      cosa: "Netlify: togli NEXT_PUBLIC_SITO",
      come: "Se c'è, cancellala. Senza, il sito legge l'indirizzo che Netlify gli dà da solo, e quello resta giusto per sempre.",
      fatto: !process.env.NEXT_PUBLIC_SITO,
      attenzione:
        "È già successo: quella variabile è rimasta al nome vecchio per giorni e il sito dichiarava a Google un indirizzo che non esisteva più.",
    },
    {
      cosa: "Il giro di controllo",
      come: "Apri rivolio.it, fai un check vero, iscriviti all'Osservatorio con la tua email, e guarda che il TIN su Telegram arrivi.",
      attenzione:
        "Il pezzo che si rompe più spesso dopo un trasloco sono le email: partono dal sito nuovo ma con la configurazione vecchia.",
    },
  ];
}

export default function QuandoArrivaIlDominio() {
  const elenco = passi();
  const fatti = elenco.filter((p) => p.fatto).length;
  const verificabili = elenco.filter((p) => p.fatto !== undefined).length;

  return (
    <section className="mt-8 rounded-2xl border border-bordo bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[1.3rem] tracking-[-0.02em]">
          Quando arriva il dominio
        </h2>
        <p className="text-[12.5px] text-fumo-2">
          {fatti} di {verificabili} controllabili da qui
        </p>
      </div>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-fumo">
        Il sito oggi vive su un indirizzo di Netlify. Il giorno che <code>rivolio.it</code>{" "}
        è tuo, queste nove cose vanno fatte in quest&apos;ordine. Le prime tre si tengono
        per mano: senza la prima, le altre non si possono nemmeno cominciare.
      </p>

      <ol className="mt-5 space-y-3">
        {elenco.map((p, i) => (
          <li
            key={p.cosa}
            className={`rounded-[12px] border p-4 ${
              p.fatto ? "border-verde/25 bg-menta-tenue/40" : "border-bordo bg-nebbia"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  p.fatto ? "bg-verde text-white" : "bg-white text-fumo ring-1 ring-bordo"
                }`}
                aria-hidden="true"
              >
                {p.fatto ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-inchiostro">{p.cosa}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-fumo">{p.come}</p>
                {p.attenzione && (
                  <p className="mt-2 text-[13px] leading-relaxed text-fumo-2">
                    <span className="font-medium text-inchiostro">Attenzione:</span>{" "}
                    {p.attenzione}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
