import Logo from "./Logo";
import MenuMobile from "./MenuMobile";
import { COPY } from "@/lib/copy";
import { apreAParte } from "@/lib/link";

/**
 * Barra a pillola fluttuante, come Zentivo. Voci e CTA vengono da COPY.nav.
 * La CTA porta al form del check (#controllo): è l'unica azione del sito,
 * quindi è l'unico bottone pieno della barra.
 */
export default function Nav() {
  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      {/* ⚠️ LE VOCI SONO CENTRATE SULLA PAGINA, non "in mezzo a quello
          che avanza" (richiesta di Valerio, 12/08: allineale col titolo
          della hero). Con `justify-between` il gruppo si posava dove
          capitava, cioè spostato verso destra perché il marchio a
          sinistra è più stretto dei due bottoni a destra: appena sotto,
          il titolo della hero è centrato davvero, e i due assi non
          combaciavano di una trentina di punti.

          🔴 IL PRIMO TENTATIVO ERA `absolute left-1/2`, ED È DURATO
          MEZZ'ORA: a 1440 il centro combaciava, ma un elemento assoluto
          esce dal flusso, quindi il browser smette di garantire che non
          si sovrapponga a niente, e su schermi più stretti "Il
          Tabellone" finiva sotto il bottone "Entra" (visto da Valerio,
          12/08). Il centraggio si era spostato: il problema pure.

          Adesso è una griglia a TRE COLONNE, `1fr auto 1fr`: le due
          colonne laterali sono uguali per definizione, quindi la colonna
          di mezzo cade esattamente a metà della barra, e siccome è
          disposizione vera e non posizionamento, la sovrapposizione non
          può avvenire: se lo spazio manca, le colonne si stringono.
          Sotto la soglia le voci non ci sono e la griglia diventa due
          colonne, marchio e bottoni, come prima.

          🔴 E ANCHE COSÌ SI SOVRAPPONEVA, a poco più di mille punti
          (Valerio, 13/08, terza volta che lo segnala: «smettila di
          stortare la navbar»). Due cause insieme, e nessuna delle due
          era il centraggio:
          1. le voci comparivano già a 1024, dove lo spazio che avanza
             dopo marchio e bottoni non basta a contenerle;
          2. le colonne avevano `min-width: auto`, che è il valore
             predefinito di una griglia: vuol dire "non stringerti sotto
             il tuo contenuto". Quando la colonna di mezzo cresce oltre
             il posto disponibile, non spinge le altre: le invade.
          Le voci partivano da 1280, e lì stava il difetto: un portatile
          Windows normale, con lo zoom di sistema al 125-150%, a zoom del
          browser 100% ha una larghezza CSS appena SOTTO i 1280, quindi i
          link sparivano e la barra sembrava vuota (Valerio, 15/08, con lo
          screenshot). Adesso partono da 1024, dove un PC vero ci sta
          sempre, e per starci a 1024 senza sovrapporsi le spaziature e il
          corpo si stringono un filo sotto i 1280, e "Entra" nella fascia
          1024-1280 diventa un bottone compatto. Misurato a 1024, 1152,
          1280, 1440: le tre colonne restano separate a ogni larghezza. */}
      <header className="mx-auto grid h-[60px] max-w-[1200px] grid-cols-[auto_1fr] items-center gap-3 rounded-pillola lg:gap-4 xl:gap-6 border border-white/60 bg-white/60 px-2 shadow-[0_8px_28px_-14px_rgba(5,46,31,.28)] backdrop-blur-xl sm:h-[68px] lg:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0 pl-1 sm:pl-4">
          <Logo />
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-4 lg:flex xl:gap-6">
          {COPY.nav.voci.map((v) => (
            <a
              key={v.ancora}
              href={v.ancora}
              {...apreAParte(v.ancora)}
              className="whitespace-nowrap text-[14px] text-fumo transition-colors hover:text-inchiostro xl:text-[15px]"
            >
              {v.testo}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {/* la porta della web app: dall'8/08 è di nuovo linkata dal sito.
              Pillola di vetro, non testo nudo: ogni bottone è un bottone.
              ⚠️ Sotto i 1024 "Entra" vive nel menu (MenuMobile), non nella
              barra: così sul telefono restano logo + azione + menu, senza
              affollare, e "Entra" resta comunque raggiungibile ovunque. */}
          <a
            /* Dritto al login (scelta di Valerio, 9/08): prima portava alla web
               app, dove c'era un ALTRO "Entra". Chi vuole entrare, entra. */
            href="/entra"
            className="vetro-bottone hidden items-center rounded-bottone px-3 py-2.5 text-[13px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 lg:inline-flex xl:px-5 xl:py-3 xl:text-[14.5px]"
          >
            {COPY.nav.entra}
          </a>
          <a
            href="#controllo"
            className="riflesso group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-bottone bg-verde px-4 py-2.5 text-[13.5px] font-medium text-white shadow-[0_10px_24px_-10px_rgba(6,122,70,.7),0_1px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro sm:px-5 sm:py-3 sm:text-[14.5px]"
          >
            {/* Sotto i 360 punti il testo pieno non ci sta e spinge la
                pagina fuori schermo: a 320 (l'SE di prima generazione e
                lo zoom di iOS) il sito scorreva di lato di 26px. Lì il
                bottone dice solo "Controlla": sopra, resta per esteso. */}
            <span className="max-[359px]:hidden">{COPY.nav.cta}</span>
            <span className="hidden max-[359px]:inline">{COPY.nav.ctaCorta}</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          {/* Il menu del telefono e del tablet: sotto i 1024 raccoglie le
              voci che in linea non ci sono e "Entra". Sopra i 1024 sparisce. */}
          <MenuMobile />
        </div>
      </header>
    </div>
  );
}
