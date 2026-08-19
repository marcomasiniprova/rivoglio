import { Avviso, Kpi, oNonLetto } from "@/components/admin/Pezzi";
import { soloAdmin } from "@/lib/admin/guardia";
import { leggiPassaparola } from "@/lib/eventi/passaparola";

/**
 * IL PASSAPAROLA (TIENITELI, scelta di Valerio 19/08).
 *
 * Su un prodotto una-tantum la crescita non è il riacquisto, è il
 * passaparola. Qui i numeri che dicono se gira: quanti invitano un amico,
 * quanti amici arrivano davvero, e quante recensioni.
 *
 * ⚠️ Ricavi, LTV e la riattivazione via email NON sono qui: senza una
 * cassa che incassa sarebbero zeri inventati. Lo diciamo chiaro invece di
 * riempire la schermata di finti numeri.
 */
export const dynamic = "force-dynamic";

const GIORNI = 30;

export default async function PaginaPassaparola() {
  /* Prima riga, sempre. Vedi lib/admin/guardia.ts. */
  await soloAdmin();

  const d = await leggiPassaparola(GIORNI);

  const recTot = d.recensioni ? d.recensioni.totali : null;
  const recAppr = d.recensioni ? d.recensioni.approvate : null;

  /* Il coefficiente VERO (clienti nuovi per cliente) vuole la cassa. Quello
     che si misura adesso è più modesto ma reale: quanti inviti diventano
     una visita nuova. Solo con un denominatore vero, mai una divisione per
     zero travestita da percentuale. */
  const tasso =
    d.invitiCondivisi !== null && d.amiciArrivati !== null && d.invitiCondivisi > 0
      ? Math.round((d.amiciArrivati / d.invitiCondivisi) * 100)
      : null;

  const registroMuto = d.invitiCondivisi === null && d.amiciArrivati === null;

  return (
    <div className="flex flex-col gap-5">
      {registroMuto && (
        <Avviso titolo="Il registro non ha risposto.">
          Gli inviti e gli arrivi vengono dal registro degli eventi: finché non si
          apre, qui si legge «non letto» invece di uno zero che non è vero.
        </Avviso>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi
          etichetta={`Inviti mandati · ${GIORNI}g`}
          valore={oNonLetto(d.invitiCondivisi)}
          nota="Quante volte è stato premuto «invita un amico» dal momento d'oro."
        />
        <Kpi
          etichetta={`Amici arrivati · ${GIORNI}g`}
          valore={oNonLetto(d.amiciArrivati)}
          nota="Visite arrivate dal link dell'invito. È il numero che conta."
          forte
        />
        <Kpi etichetta="Recensioni" valore={oNonLetto(recTot)} nota="In tutto, da sempre." />
        <Kpi
          etichetta="Recensioni approvate"
          valore={oNonLetto(recAppr)}
          nota="Quelle che compaiono in landing."
        />
      </div>

      {/* Il coefficiente misurabile adesso: inviti che diventano un arrivo. */}
      <div className="rounded-[14px] border border-bordo bg-white p-4 sm:p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-fumo-2">
          Il passaparola funziona?
        </p>
        {tasso !== null ? (
          <p className="mt-2 text-[15px] leading-relaxed text-inchiostro">
            Ogni 100 inviti mandati, <strong className="text-verde-scuro">{tasso}</strong>{" "}
            hanno portato un amico sul sito. È la conversione da invito a visita nuova.
          </p>
        ) : (
          <p className="mt-2 text-[14px] leading-relaxed text-fumo">
            Ancora niente da misurare: appena qualcuno invita e un amico arriva, qui compare
            la conversione. A oggi è zero, ed è normale.
          </p>
        )}
      </div>

      {/* Cosa aspetta la cassa, detto chiaro invece di mostrare zeri finti. */}
      <div className="rounded-[14px] border border-dashed border-bordo bg-nebbia/60 p-4 sm:p-5">
        <p className="text-[13.5px] font-medium text-fumo">Con la cassa si accendono:</p>
        <ul className="mt-2.5 flex flex-col gap-2 text-[13.5px] leading-relaxed text-fumo-2">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-fumo">Ricavi e LTV</strong>: quanto vale nel tempo un
              cliente. Senza incassi sarebbero zeri inventati.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-fumo">La riattivazione</strong>: i due recuperi via email
              (chi controlla e non compra, e il no non replicato) partono con RECUPERO_ATTIVO.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-fumo">Il coefficiente vero</strong>: clienti nuovi per
              cliente, non solo visite. Serve sapere chi paga.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
