/**
 * IL BANCO DI PROVA: passa una lista di voli VERI dentro il motore e
 * stampa il verdetto di ognuno.
 *
 * A cosa serve: il piano lo chiede prima di tutto il resto. Trenta casi
 * veri controllati a mano dicono in un pomeriggio quello che nessuna stima
 * sul traffico aereo può dire: quanti voli risultano davvero idonei, dove
 * il dato manca, e se il motore sbaglia.
 *
 * Perché è uno script e non una prova automatica: le prove girano offline
 * e non devono spendere chiamate a pagamento. Questo invece chiama
 * l'archivio VERO, quindi si lancia a mano quando serve.
 *
 * Uso (dalla cartella del progetto):
 *   npm run banco
 *   npm run banco -- --file prove/casi-reali.json
 *   npm run banco -- --voli "FR4001:2026-08-06,U23508:2026-07-15"
 *   npm run banco -- --pausa 2000     (millisecondi fra una chiamata e l'altra)
 *
 * Senza AERODATABOX_API_KEY parte il fornitore dimostrativo e i verdetti
 * NON valgono: lo script lo dice a schermo invece di far finta di niente.
 *
 * Il database non serve: se Supabase non è raggiungibile il verdetto esce
 * lo stesso, semplicemente non viene archiviato.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Legge le chiavi dai file .env locali senza dipendenze esterne. */
function caricaEnv(): void {
  for (const nome of [".env.development.local", ".env.local", ".env"]) {
    const percorso = path.join(RADICE, nome);
    if (!existsSync(percorso)) continue;
    let testo = "";
    try {
      const grezzo = readFileSync(percorso);
      // il file UTF-16 storico: byte a zero alternati, salta senza rompere
      testo = grezzo.includes(0) ? grezzo.toString("utf16le") : grezzo.toString("utf8");
    } catch {
      continue;
    }
    for (const riga of testo.split(/\r?\n/)) {
      const m = riga.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}
caricaEnv();

type Caso = { volo: string; data: string; nota?: string };

function argomenti() {
  const a = process.argv.slice(2);
  const preso = (nome: string) => {
    const i = a.indexOf(`--${nome}`);
    return i >= 0 ? a[i + 1] : undefined;
  };
  return {
    file: preso("file") ?? "prove/casi-reali.json",
    voli: preso("voli"),
    pausa: Number(preso("pausa") ?? 1200),
  };
}

function leggiCasi(opz: ReturnType<typeof argomenti>): Caso[] {
  if (opz.voli) {
    return opz.voli.split(",").map((pezzo) => {
      const [volo, data] = pezzo.split(":");
      return { volo: (volo ?? "").trim(), data: (data ?? "").trim() };
    });
  }
  const percorso = path.join(RADICE, opz.file);
  if (!existsSync(percorso)) {
    console.error(`Non trovo la lista dei casi in ${opz.file}.`);
    console.error(`Creala, oppure passa i voli a mano:`);
    console.error(`  npm run banco -- --voli "FR4001:2026-08-06,U23508:2026-07-15"`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(percorso, "utf8")) as Caso[];
}

const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Incolonna il testo senza dipendenze: le tabelle storte non si leggono. */
function riempi(testo: string, quanto: number) {
  const t = testo.length > quanto ? testo.slice(0, quanto - 1) + "…" : testo;
  return t + " ".repeat(Math.max(0, quanto - t.length));
}

const ETICHETTA: Record<string, string> = {
  idoneo: "IDONEO",
  incerto: "incerto",
  non_idoneo: "no",
};

async function main() {
  /* Il motore si carica QUI, dopo caricaEnv(): i suoi moduli leggono
     process.env quando vengono importati, e senza chiavi sceglierebbero
     il fornitore dimostrativo. */
  const { verificaVolo } = await import("../lib/voli/verifica");
  const { formattaMinuti } = await import("../lib/regole/eu261");

  const opz = argomenti();
  const casi = leggiCasi(opz);

  const conChiave = Boolean(process.env.AERODATABOX_API_KEY);
  console.log("");
  console.log(`BANCO DI PROVA — ${casi.length} casi`);
  console.log(
    conChiave
      ? "Archivio: AeroDataBox (dati veri)."
      : "⚠️  NESSUNA CHIAVE AERODATABOX: parte il fornitore dimostrativo e i verdetti NON valgono.",
  );
  console.log(`Pausa fra le chiamate: ${opz.pausa} ms. Ci vorranno circa ${Math.ceil((casi.length * opz.pausa) / 1000)} secondi.`);
  console.log("");
  console.log(
    riempi("VOLO", 9) + riempi("DATA", 12) + riempi("TRATTA", 30) +
    riempi("RITARDO", 14) + riempi("VERDETTO", 9) + "IMPORTO",
  );
  console.log("-".repeat(82));

  const esiti: Record<string, unknown>[] = [];
  const conto = { idoneo: 0, incerto: 0, non_idoneo: 0, errore: 0 };

  for (const caso of casi) {
    let riga: Record<string, unknown>;
    try {
      const r = await verificaVolo(caso.volo, caso.data);
      if (!r.ok) {
        conto.errore += 1;
        riga = { ...caso, esito: "errore", motivo: r.errore };
        console.log(
          riempi(caso.volo, 9) + riempi(caso.data, 12) +
          riempi("—", 30) + riempi("—", 14) + riempi("errore", 9) + r.errore.slice(0, 40),
        );
      } else {
        const { verdetto, fatto, demo } = r;
        conto[verdetto.esito] += 1;
        const ritardo =
          "ritardoMinuti" in verdetto && verdetto.ritardoMinuti !== null
            ? formattaMinuti(verdetto.ritardoMinuti)
            : "—";
        const tratta = `${fatto.partenzaCitta ?? fatto.partenzaIata ?? "?"} → ${fatto.arrivoCitta ?? fatto.arrivoIata ?? "?"}`;
        const importo = verdetto.esito === "idoneo" ? `${verdetto.importo}€` : "";
        riga = {
          ...caso,
          esito: verdetto.esito,
          ritardoMinuti: "ritardoMinuti" in verdetto ? verdetto.ritardoMinuti : null,
          importo: verdetto.esito === "idoneo" ? verdetto.importo : null,
          tratta,
          km: fatto.kmOrtodromica,
          vettore: fatto.vettoreOperativo,
          arrivoPrevisto: fatto.arrivoPrevistoUtc,
          arrivoEffettivo: fatto.arrivoEffettivoUtc,
          stato: fatto.stato,
          demo,
          motivo: verdetto.motivo,
        };
        console.log(
          riempi(caso.volo, 9) + riempi(caso.data, 12) + riempi(tratta, 30) +
          riempi(ritardo, 14) + riempi(ETICHETTA[verdetto.esito] ?? verdetto.esito, 9) + importo,
        );
      }
    } catch (e) {
      conto.errore += 1;
      riga = { ...caso, esito: "errore", motivo: String(e) };
      console.log(riempi(caso.volo, 9) + riempi(caso.data, 12) + "guasto: " + String(e).slice(0, 40));
    }
    esiti.push(riga);
    await attesa(opz.pausa);
  }

  const totale = casi.length;
  const perCento = (n: number) => `${Math.round((n / totale) * 1000) / 10}%`;

  console.log("");
  console.log("RIEPILOGO");
  console.log(`  idonei .......... ${conto.idoneo} su ${totale}  (${perCento(conto.idoneo)})`);
  console.log(`  incerti ......... ${conto.incerto} su ${totale}  (${perCento(conto.incerto)})`);
  console.log(`  non idonei ...... ${conto.non_idoneo} su ${totale}  (${perCento(conto.non_idoneo)})`);
  if (conto.errore) console.log(`  errori .......... ${conto.errore} su ${totale}`);
  console.log("");
  const incassoPotenziale = esiti
    .filter((e) => e.esito === "idoneo")
    .reduce((s, e) => s + (Number(e.importo) || 0), 0);
  console.log(`  Compensazione trovata in tutto: ${incassoPotenziale}€ (un passeggero per volo)`);
  console.log("");

  const cartella = path.join(RADICE, "prove");
  if (!existsSync(cartella)) mkdirSync(cartella, { recursive: true });
  const dove = path.join(cartella, "casi-reali-esiti.json");
  writeFileSync(dove, JSON.stringify(esiti, null, 2), "utf8");
  console.log(`Esiti completi salvati in prove/casi-reali-esiti.json`);
  if (!conChiave) {
    console.log("");
    console.log("⚠️  Ricorda: senza chiave questi numeri sono finti. Rilancia con la chiave vera.");
  }
}

main().catch((e) => {
  console.error("Il banco si è fermato:", e);
  process.exit(1);
});
