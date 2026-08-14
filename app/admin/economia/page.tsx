import { Scheda } from "@/components/admin/Grafici";
import { Avviso, Kpi, euro, oNonLetto } from "@/components/admin/Pezzi";
import { soloAdmin } from "@/lib/admin/guardia";
import { leggiCruscotto } from "@/lib/eventi/lettura";
import { SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import {
  FISSI_MENSILI,
  PREZZO_PRATICA,
  TASSO_RIMBORSO_GARANZIA,
  checkPerPaganti,
  contoPratica,
  costoCheck,
  fissiMensiliTotale,
  scenario,
} from "@/lib/admin/economia";

/**
 * ECONOMIA: quanto si fa e quanto costa, dal check alla compensazione
 * (richiesta di Valerio, 14/08). La whiteboard dei conti, sui dati veri.
 *
 * ⚠️ I conti valgono col pagamento ATTIVO. Oggi Polar ha detto no, quindi
 * l'incasso vero è ancora zero: questa pagina serve a sapere DOVE si va, non
 * a dire che ci siamo già. I numeri con la stella sono stime dichiarate, non
 * dati veri (regola 2 del progetto): il tasso di rimborso della garanzia non
 * esiste finché non si chiude una pratica.
 */
export const dynamic = "force-dynamic";

/** Volume di riferimento per i tre scenari: un giorno di buon traffico. */
const CHECK_RIFERIMENTO = 10_000;
const CONVERSIONI = [0.01, 0.02, 0.03];
const TASSI_GARANZIA = [0, 0.15, 0.3, 0.5];
const PAGANTI_TARGET = 1000;

const pct = (n: number) => `${Math.round(n * 100)}%`;
const num = (n: number) => Math.round(n).toLocaleString("it-IT");

export default async function PaginaEconomia() {
  await soloAdmin();

  const c = SERVIZIO_ATTIVO ? await leggiCruscotto(8).catch(() => null) : null;
  const checkOggi = c?.oggi?.check ?? null;
  const pagatiOggi = c?.oggi?.pagato ?? null;

  const conto = contoPratica();
  const fissi = fissiMensiliTotale();

  // Il netto vero di oggi, se abbiamo i conteggi (mai un numero inventato).
  const nettoOggi =
    checkOggi !== null && pagatiOggi !== null
      ? pagatiOggi * conto.netto - checkOggi * costoCheck()
      : null;

  const scenari = CONVERSIONI.map((v) => scenario(CHECK_RIFERIMENTO, v));

  return (
    <div className="flex flex-col gap-5">
      <Avviso titolo="Questi conti valgono col pagamento attivo.">
        Oggi Polar ha detto no, quindi l&apos;incasso vero è ancora zero: questa pagina
        dice <strong>dove si va</strong>, non che ci siamo. I numeri con la{" "}
        <span className="numeri">*</span> sono stime dichiarate (regola: mai un numero
        inventato). Si cambiano da <code>lib/admin/economia.ts</code>.
      </Avviso>

      {/* ── I NUMERI CHIAVE ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi
          forte
          etichetta="Netto per pratica"
          valore={euro(conto.netto)}
          nota={`Su ${euro(PREZZO_PRATICA)}, dopo Polar e garanzia al ${pct(TASSO_RIMBORSO_GARANZIA)}*`}
        />
        <Kpi
          etichetta="Costo di un check"
          valore={`${(costoCheck() * 100).toFixed(2)} cent`}
          nota="Dati volo + la quota che usa l'OCR. La cache lo abbassa ancora."
        />
        <Kpi
          etichetta="Costi fissi al mese"
          valore={euro(fissi)}
          nota="Supabase, Netlify, Resend, AeroDataBox: una briciola contro gli incassi."
        />
        <Kpi
          etichetta="Netto vero oggi"
          valore={oNonLetto(nettoOggi, euro)}
          nota={
            nettoOggi === null
              ? "Servono i conteggi del cruscotto."
              : `Da ${oNonLetto(checkOggi, num)} check e ${oNonLetto(pagatiOggi, num)} pratiche`
          }
        />
      </div>

      {/* ── DOVE VA UNA PRATICA DA 14,90 ───────────────────────────── */}
      <Scheda
        titolo="Dove finiscono i 14,90 di una pratica"
        sotto="Ogni riga è un pezzo che se ne va. Quello che resta è il netto."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[14px]">
            <tbody className="divide-y divide-bordo/70">
              <Riga v="Incasso" n={conto.ricavo} forte />
              <Riga v="Commissione di chi incassa (Polar, 5% + 0,50)" n={-conto.polar} />
              <Riga v={`Garanzia, rimborso atteso al ${pct(TASSO_RIMBORSO_GARANZIA)}*`} n={-conto.garanzia} />
              <Riga v="Lettura carta (OCR) + email di follow-up" n={-(conto.ocr + conto.email)} />
              <Riga v="Resta in tasca" n={conto.netto} forte verde />
            </tbody>
          </table>
        </div>
        <p className="mt-3 border-t border-bordo pt-3 text-[12.5px] leading-relaxed text-fumo">
          I due costi che contano sono la <strong>commissione</strong> e la{" "}
          <strong>garanzia</strong>. I dati volo, l&apos;OCR e le email messi insieme non
          arrivano a un centesimo. La profittabilità non dipende dai costi tecnici: dipende
          da quanta gente arriva e da quanti reclami vanno a buon fine.
        </p>
      </Scheda>

      {/* ── TRE SCENARI ────────────────────────────────────────────── */}
      <Scheda
        titolo={`Tre scenari, a ${num(CHECK_RIFERIMENTO)} check al giorno`}
        sotto="Cambia solo quanti, di chi fa il check, poi paga la pratica. Il resto è uguale."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="text-left text-[12.5px] uppercase tracking-wide text-fumo-2">
                <th className="pb-2 font-medium">&nbsp;</th>
                {scenari.map((s) => (
                  <th key={s.conversione} className="pb-2 text-right font-medium">
                    {pct(s.conversione)} paga
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo/70">
              <RigaScenari etichetta="Pratiche pagate al giorno" valori={scenari.map((s) => num(s.paganti))} />
              <RigaScenari etichetta="Incasso al giorno" valori={scenari.map((s) => euro(s.ricavo))} />
              <RigaScenari
                etichetta="Costi al giorno (check + pratiche)"
                valori={scenari.map((s) => euro(s.costoDeiCheck + s.costiPratiche))}
              />
              <RigaScenari etichetta="Netto al giorno" valori={scenari.map((s) => euro(s.nettoGiorno))} forte />
              <RigaScenari
                etichetta="Netto al mese (meno i fissi)"
                valori={scenari.map((s) => euro(s.nettoGiorno * 30 - fissi))}
                forte
                verde
              />
            </tbody>
          </table>
        </div>
      </Scheda>

      {/* ── IL TRAGUARDO ───────────────────────────────────────────── */}
      <Scheda
        titolo={`Il tuo traguardo: ${num(PAGANTI_TARGET)} pratiche pagate al giorno`}
        sotto="Quanti check servono per arrivarci, e cosa resta, a ogni tasso di conversione."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="text-left text-[12.5px] uppercase tracking-wide text-fumo-2">
                <th className="pb-2 font-medium">Se paga il...</th>
                <th className="pb-2 text-right font-medium">Check al giorno</th>
                <th className="pb-2 text-right font-medium">Netto al giorno</th>
                <th className="pb-2 text-right font-medium">Netto al mese</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo/70">
              {CONVERSIONI.map((v) => {
                const check = checkPerPaganti(PAGANTI_TARGET, v);
                const s = scenario(check, v);
                return (
                  <tr key={v}>
                    <td className="py-2 text-fumo">{pct(v)}</td>
                    <td className="numeri py-2 text-right text-inchiostro">{num(check)}</td>
                    <td className="numeri py-2 text-right font-medium text-inchiostro">{euro(s.nettoGiorno)}</td>
                    <td className="numeri py-2 text-right font-medium text-verde">
                      {euro(s.nettoGiorno * 30 - fissi)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 border-t border-bordo pt-3 text-[12.5px] leading-relaxed text-fumo">
          A 1000 pratiche al giorno il collo di bottiglia non sono i soldi: è il{" "}
          <strong>traffico</strong>. Servono decine di migliaia di check al giorno, cioè un
          canale che porta gente di continuo.
        </p>
      </Scheda>

      {/* ── QUANTO PESA LA GARANZIA ────────────────────────────────── */}
      <Scheda
        titolo="Quanto pesa la garanzia"
        sotto="Non sappiamo ancora quanti reclami falliscono. Ecco il netto per pratica a diversi tassi."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[14px]">
            <thead>
              <tr className="text-left text-[12.5px] uppercase tracking-wide text-fumo-2">
                <th className="pb-2 font-medium">Reclami che falliscono</th>
                <th className="pb-2 text-right font-medium">Netto per pratica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo/70">
              {TASSI_GARANZIA.map((t) => (
                <tr key={t}>
                  <td className="py-2 text-fumo">
                    {pct(t)} {t === TASSO_RIMBORSO_GARANZIA ? "(stima di oggi)" : ""}
                  </td>
                  <td className="numeri py-2 text-right font-medium text-inchiostro">
                    {euro(contoPratica(PREZZO_PRATICA, t).netto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Scheda>

      {/* ── I PREZZI VERI, CON LE FONTI ────────────────────────────── */}
      <Scheda
        titolo="I costi, con la loro fonte"
        sotto="Trasparenza, come per i numeri che mostriamo all'utente. Le stime sono marcate."
      >
        <ul className="flex flex-col gap-2 text-[13.5px] text-fumo">
          {Object.values(FISSI_MENSILI).map((f) => (
            <li key={f.nota} className="flex items-baseline justify-between gap-3 border-b border-bordo/60 pb-2">
              <span>{f.nota}</span>
              <span className="numeri shrink-0 font-medium text-inchiostro">{euro(f.euro)}/mese</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-3 pt-1">
            <span>Polar per pratica: 5% + 0,50 € (fonte: PAGAMENTI.md)</span>
            <span className="numeri shrink-0 font-medium text-inchiostro">{euro(conto.polar)}</span>
          </li>
          <li className="text-[12.5px] text-fumo-2">
            <span className="numeri">*</span> Garanzia al {pct(TASSO_RIMBORSO_GARANZIA)}: stima
            prudente, nessuna pratica ancora chiusa. OCR ~1 $/1000 pagine e AeroDataBox
            0,00025 $/richiesta sono stime di listino.
          </li>
        </ul>
      </Scheda>
    </div>
  );
}

/* ── righine ─────────────────────────────────────────────────────── */

function Riga({ v, n, forte, verde }: { v: string; n: number; forte?: boolean; verde?: boolean }) {
  return (
    <tr>
      <td className={`py-2 pr-3 ${forte ? "font-medium text-inchiostro" : "text-fumo"}`}>{v}</td>
      <td
        className={`numeri py-2 text-right ${forte ? "font-semibold" : ""} ${
          verde ? "text-verde" : n < 0 ? "text-fumo" : "text-inchiostro"
        }`}
      >
        {n < 0 ? `−${euro(-n)}` : euro(n)}
      </td>
    </tr>
  );
}

function RigaScenari({
  etichetta,
  valori,
  forte,
  verde,
}: {
  etichetta: string;
  valori: string[];
  forte?: boolean;
  verde?: boolean;
}) {
  return (
    <tr>
      <td className={`py-2 pr-3 ${forte ? "font-medium text-inchiostro" : "text-fumo"}`}>{etichetta}</td>
      {valori.map((v, i) => (
        <td
          key={i}
          className={`numeri py-2 text-right ${forte ? "font-semibold" : ""} ${
            verde ? "text-verde" : "text-inchiostro"
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}
