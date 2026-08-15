import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import StrumentoMobilita from "@/components/mobilita/StrumentoMobilita";

export const metadata: Metadata = {
  title: "Voli e disabilità: i tuoi diritti (Reg. 1107/2006) | Rivolio",
  description:
    "Assistenza negata, imbarco rifiutato, carrozzina rotta in volo: cosa ti spetta e la lettera di reclamo pronta, gratis. Regolamento CE 1107/2006, senza vendita.",
};

/**
 * IL REGOLAMENTO 1107/2006, SPIEGATO E CON LA LETTERA PRONTA (scelta di
 * Valerio, 14/08: pagina dedicata aperta, gratis, per reputazione).
 *
 * Non è una pratica che vendiamo: chi vola con una disabilità o a mobilità
 * ridotta ha diritti che quasi nessuno conosce, e questa pagina glieli dice
 * e gli mette in mano la lettera. Serve anche a noi: è il tipo di pagina che
 * porta persone al sito e costruisce fiducia, senza promettere niente.
 *
 * ⚠️ NON uso PaginaLegale per lo strumento: la classe `.legale` stira i
 * paragrafi (`.legale p` vince sulle utility per specificità) e sfascerebbe
 * la tipografia della card. La prosa sì, sta in blocchi `.legale`; lo
 * strumento vive fuori, con le sue classi.
 *
 * ⚠️ I CONTATTI ENAC (pax.disabili@enac.gov.it, la pagina reclami) e
 * ConciliaWeb vengono dai risultati di ricerca sui domini ufficiali: da
 * questo ambiente enac.gov.it e autorita-trasporti.it sono bloccati dal
 * proxy, quindi vanno riletti dal PC di Valerio prima di darli per certi.
 * È segnato in STATO.
 *
 * Fonti (ricerca web del 14/08):
 * - Reg. (CE) 1107/2006, artt. 3-4 (no rifiuto e deroghe), 7 e all. I-II
 *   (assistenza), 12 (attrezzatura), 14-15 (ente e reclamo);
 * - ENAC, ente nazionale di controllo per l'Italia;
 * - Convenzione di Montreal per il tetto sul risarcimento dell'attrezzatura.
 */
export default function PaginaMobilitaRidotta() {
  return (
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Torna alla home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-display text-[2rem] leading-[1.05] tracking-[-0.04em] sm:text-[2.4rem]">
          Voli e disabilità: i tuoi diritti
        </h1>
        <p className="numeri mt-3 text-[13.5px] text-fumo-2">
          Guida gratuita, verificata il 14 agosto 2026. Qui non si vende niente.
        </p>

        <div className="legale mt-8">
          <p>
            Se voli con una disabilità o hai una mobilità ridotta (anche solo per l&apos;età, una
            gamba ingessata o una condizione temporanea), il{" "}
            <strong>Regolamento europeo CE 1107/2006</strong> ti dà diritti precisi, e vale su tutti
            i voli che partono da o arrivano in un aeroporto dell&apos;Unione. Quasi nessuno li
            conosce, e le compagnie ci contano. Qui sotto trovi cosa ti spetta e una lettera di
            reclamo già pronta: gratis, senza account, e Rivolio non ci guadagna niente.
          </p>

          <h2>Non possono lasciarti a terra per la tua disabilità</h2>
          <p>
            Una compagnia, un&apos;agenzia o un tour operator <strong>non può</strong> rifiutarti la
            prenotazione o l&apos;imbarco a causa della disabilità o della mobilità ridotta (art. 3).
            Il rifiuto è ammesso solo in due casi: per veri motivi di sicurezza previsti dalla legge,
            o quando le dimensioni dell&apos;aereo o dei suoi portelloni rendono l&apos;imbarco
            fisicamente impossibile (art. 4). E anche allora devono dirti il motivo{" "}
            <strong>per iscritto entro cinque giorni</strong> e offrirti il rimborso o un altro volo.
          </p>

          <h2>L&apos;assistenza è gratuita, dal banco al posto</h2>
          <p>
            Ti spetta l&apos;accompagnamento gratuito lungo tutto il percorso: dall&apos;arrivo in
            aeroporto al check-in, ai controlli, fino al posto a bordo, e allo stesso modo allo sbarco
            fino al ritiro bagagli (art. 7, allegati I e II). In aeroporto questa assistenza è
            a carico del <strong>gestore dell&apos;aeroporto</strong>; per l&apos;imbarco, lo sbarco e
            i servizi a bordo è a carico della <strong>compagnia aerea</strong>.
          </p>
          <p>
            Un accorgimento che conta: per avere l&apos;assistenza garantita su misura, va richiesta{" "}
            <strong>almeno 48 ore prima</strong> della partenza, alla compagnia, all&apos;agenzia o al
            tour operator. Senza preavviso te la danno lo stesso, ma con i mezzi disponibili al
            momento.
          </p>

          <h2>Se ti rompono o ti perdono la carrozzina</h2>
          <p>
            La sedia a rotelle e gli altri ausili per la mobilità non sono un bagaglio qualsiasi:
            sono le tue gambe. Se te li perdono o te li danneggiano durante il volo o la gestione in
            aeroporto, ti spetta il <strong>risarcimento</strong> (art. 12). Il risarcimento segue
            le regole della Convenzione di Montreal, che oggi fissa un tetto per passeggero (attorno
            ai <strong>1.519 diritti speciali di prelievo</strong>, circa 1.900€ come stima, il cambio
            varia ogni giorno). Per un ausilio che vale di più, alla consegna puoi fare una
            dichiarazione speciale di valore. In ogni caso: apri subito il <strong>PIR</strong>
            all&apos;ufficio bagagli prima di uscire, fotografa il danno e conserva le ricevute.
          </p>

          <h2>La lettera di reclamo, già pronta</h2>
          <p>
            Scegli cosa ti è successo, scrivi due righe con parole tue, e qui sotto la lettera si
            compone da sola, con l&apos;articolo giusto già dentro. La copi o la apri nell&apos;email.
            Niente parte da questa pagina: resta tutto sul tuo telefono.
          </p>
        </div>

        <div className="mt-6">
          <StrumentoMobilita />
        </div>

        <div className="legale mt-10">
          <h2>Se non rispondono: il reclamo all&apos;ente</h2>
          <p>
            Prima si scrive alla compagnia o al gestore dell&apos;aeroporto. Se non rispondono in un
            tempo ragionevole o la risposta non ti soddisfa, puoi rivolgerti all&apos;ente nazionale
            di controllo, che in Italia è l&apos;<strong>ENAC</strong> (artt. 14 e 15). ENAC accerta
            la violazione e può sanzionare la compagnia o l&apos;aeroporto. L&apos;indirizzo dedicato
            ai passeggeri con disabilità è <span className="numeri">pax.disabili@enac.gov.it</span>;
            i recapiti aggiornati stanno sulla{" "}
            <a
              href="https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri-mobilita-ridotta-prm/reclami/recapiti-utili/"
              target="_blank"
              rel="noopener noreferrer"
            >
              pagina reclami dell&apos;ENAC
            </a>
            . In alternativa puoi tentare la conciliazione, gratis, sulla piattaforma ConciliaWeb
            dell&apos;Autorità di regolazione dei trasporti.
          </p>

          <h2>E se il volo era anche in ritardo o cancellato?</h2>
          <p>
            Quella è un&apos;altra legge, il Regolamento CE 261/2004, e lì la compensazione va da 250€
            a 600€ a passeggero. È il lavoro che Rivolio fa da sé:{" "}
            <Link href="/#controllo">controlla il tuo volo</Link>, il verdetto arriva in trenta
            secondi. I due diritti non si escludono: puoi avere sia il risarcimento dell&apos;ausilio
            sia la compensazione per il ritardo.
          </p>

          <h2>Da dove vengono queste regole</h2>
          <p>
            Regolamento (CE) n. 1107/2006 del Parlamento europeo e del Consiglio, del 5 luglio 2006,
            sui diritti delle persone con disabilità e delle persone a mobilità ridotta nel trasporto
            aereo: articoli 3 e 4 (rifiuto e deroghe), 7 e allegati I e II (assistenza), 12
            (attrezzatura), 14 e 15 (ente nazionale e reclamo). Per il risarcimento dell&apos;ausilio
            vale la Convenzione di Montreal del 1999. In Italia l&apos;ente designato è l&apos;ENAC.
            Questa pagina non costituisce parere legale.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
