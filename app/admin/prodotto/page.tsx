import type { Metadata } from "next";
import { ExternalLink, Globe, Monitor, Smartphone } from "lucide-react";
import { soloAdmin } from "@/lib/admin/guardia";

/**
 * PRODOTTO: le tre cose che vede il cliente, in un posto solo
 * (richiesta di Valerio, 11/08: «cosi ho app e web app sotto mano,
 * avro' tutto il business sotto mano»).
 *
 * ⚠️ PERCHÉ UNA SEZIONE E NON TRE LINK IN FONDO ALLA BARRA. Prima in
 * fondo alla barra c'erano "Vedi il sito" e "La web app", e l'app non
 * compariva da nessuna parte: tre superfici che il cliente vede, sparse
 * in due posti e una mancante. Un posto solo vuol dire anche che il
 * giorno che nasce la quarta si sa dove metterla.
 *
 * ⚠️ SI APRONO IN UNA SCHEDA NUOVA, e non dentro il pannello. Incastrare
 * l'app dentro questa pagina la farebbe caricare per intero ogni volta
 * che apri il pannello, anche quando non la guardi: il pannello lo apri
 * ogni mattina, l'app la guardi una volta a settimana.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prodotto | Rivolio",
  robots: { index: false, follow: false },
};

type Superficie = {
  nome: string;
  href: string;
  icona: typeof Globe;
  /** Cos'è, in una riga. */
  cosa: string;
  /** A chi serve e quando: è la parte che fa capire perché esiste. */
  quando: string;
  /** Cosa guardare quando la apri: se no si guarda e non si sa cosa cercare. */
  guarda: string;
};

const SUPERFICI: Superficie[] = [
  {
    nome: "Il sito",
    href: "/",
    icona: Globe,
    cosa: "La pagina pubblica, quella che si apre da un video o da Google.",
    quando: "È il primo posto dove arriva chiunque. Se qui non si capisce, il resto non lo vede nessuno.",
    guarda: "Il check funziona? Il prezzo è quello giusto? La pagina si apre veloce sul telefono?",
  },
  {
    nome: "La web app",
    href: "/app",
    icona: Monitor,
    cosa: "L'area dove si controlla un volo e si seguono le pratiche, dal browser.",
    quando:
      "Ci arriva chi ha pagato, dal link nell'email. Non serve scaricare niente: funziona anche dal computer dell'ufficio.",
    guarda: "Entrando col tuo account: le tue pratiche ci sono? La lettera si apre?",
  },
  {
    nome: "L'app",
    href: "/anteprima-app",
    icona: Smartphone,
    cosa: "Tutte e 34 le schermate del telefono, su un tavolo che si trascina e si ingrandisce.",
    quando:
      "È l'app che un giorno starà negli store. Oggi serve a te: per vederla tutta insieme senza installare niente.",
    guarda: "Trascina il tavolo col mouse, ingrandisci con la rotellina. Ogni riquadro è l'app vera e risponde al tocco.",
  },
];

export default async function PaginaProdotto() {
  await soloAdmin();

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-[14.5px] leading-relaxed text-fumo">
        Queste tre sono tutto quello che un cliente può vedere di Rivolio. Si aprono
        in una scheda nuova, così il pannello resta dov&apos;è.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {SUPERFICI.map((s) => {
          const Icona = s.icona;
          return (
            <div
              key={s.href}
              className="flex flex-col rounded-2xl border border-bordo bg-white p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-menta-tenue">
                <Icona className="size-5 text-verde-scuro" aria-hidden="true" />
              </div>

              <h2 className="mt-4 font-display text-[1.3rem] tracking-[-0.02em]">{s.nome}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fumo">{s.cosa}</p>

              <p className="mt-3 text-[13.5px] leading-relaxed text-fumo-2">{s.quando}</p>

              <div className="mt-4 rounded-[12px] bg-nebbia px-4 py-3">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-fumo-2">
                  Cosa guardare
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-fumo">{s.guarda}</p>
              </div>

              {/* `mt-auto` tiene i tre bottoni allineati anche quando le
                  schede hanno testi di lunghezza diversa: tre bottoni a
                  altezze diverse fanno sembrare la griglia storta. */}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="riflesso mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-verde-notte px-4 py-3 pt-3 text-[14px] font-semibold text-white transition-colors hover:bg-verde-scuro"
              >
                Apri {s.nome.toLowerCase()}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-[13px] leading-relaxed text-fumo-2">
        Nota: il sito e la web app sono quelli veri, quelli che vedono i clienti adesso.
        L&apos;app invece è un&apos;anteprima: gira nel browser e non è ancora negli store.
      </p>
    </div>
  );
}
