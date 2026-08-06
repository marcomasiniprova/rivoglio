/**
 * I badge App Store e Google Play.
 *
 * ⚠️ SONO INERTI, E DEVONO RESTARLO finché l'app non è davvero negli store.
 * Non sono link e non hanno `href`: sono `<span>`. Due badge cliccabili che
 * non portano a nessuna app sono una promessa non mantenuta, e in Italia
 * l'AGCM la tratta come pratica commerciale ingannevole.
 *
 * Stanno solo nel footer, per scelta di Valerio: lì si leggono come
 * "arriveranno", nella hero si leggerebbero come "ci sono già".
 *
 * Disegnati a mano, non scaricati: i badge ufficiali di Apple e Google
 * hanno regole d'uso precise su misure e margini, e un PNG preso a caso
 * dal web è quasi sempre la versione sbagliata.
 */

function Mela() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.2ZM14.2 6.3c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2Z"
      />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      {/* il triangolo del Play, nei suoi quattro colori */}
      <path fill="#00D2FF" d="M3.6 2.3 13.9 12 3.6 21.7A1.7 1.7 0 0 1 3 20.4V3.6c0-.5.2-1 .6-1.3Z" />
      <path fill="#FFCE00" d="m17.6 8.3 2.9 2.2c.7.5.7 1.5 0 2l-2.9 2.2L14.9 12l2.7-3.7Z" />
      <path fill="#00F076" d="M3.6 2.3 17.6 8.3 14.9 12 3.6 2.3Z" />
      <path fill="#FF3A44" d="M3.6 21.7 14.9 12l2.7 2.7-14 7Z" />
    </svg>
  );
}

function Badge({
  Icona,
  sopra,
  sotto,
}: {
  Icona: () => React.ReactElement;
  sopra: string;
  sotto: string;
}) {
  return (
    <span
      className="inline-flex select-none items-center gap-2.5 rounded-[10px] border border-white/14 bg-white/6 px-4 py-2.5 text-white"
      title="Non è ancora negli store: per ora si aggiunge alla schermata Home"
    >
      <Icona />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] text-white/55">{sopra}</span>
        <span className="mt-0.5 text-[15px] font-medium tracking-[-0.01em]">{sotto}</span>
      </span>
    </span>
  );
}

export default function BadgeStore() {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Badge Icona={Mela} sopra="Presto su" sotto="App Store" />
      <Badge Icona={Play} sopra="Presto su" sotto="Google Play" />
    </div>
  );
}
