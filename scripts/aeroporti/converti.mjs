/**
 * DA OURAIRPORTS AL NOSTRO ARCHIVIO DEGLI SCALI.
 *
 * Perché cambiamo fonte. L'archivio di prima veniva da OpenFlights, che
 * ha smesso di aggiornarsi nel 2017: Berlino Brandeburgo, aperto nel
 * 2020, semplicemente non c'era, e un Milano → Berlino con quattro ore
 * di ritardo usciva "non riconosciamo l'aeroporto di partenza". Ogni
 * scalo nuovo del mondo era una vendita persa, e la lista si allunga da
 * sola ogni anno.
 *
 * OurAirports è pubblico, di dominio pubblico, e si aggiorna tutti i
 * giorni. Da lì prendiamo solo gli scali con una sigla IATA: sono quelli
 * che possono comparire su un biglietto.
 *
 * DUE PRUDENZE, e sono il motivo per cui questo file è lungo:
 *
 * 1. IL NOME DEL PAESE NON SI TOCCA DOVE ESISTE GIÀ. Il motore e la
 *    lettera confrontano stringhe come "Czech Republic": lo standard
 *    oggi scrive "Czechia", e cambiarla in silenzio spegnerebbe pezzi di
 *    codice senza un errore. Quindi per gli scali che già conosciamo si
 *    tiene il nome vecchio, e si aggiunge il CODICE ISO, che è quello su
 *    cui il motore lavora da qui in avanti.
 * 2. IL FUSO ORARIO SI EREDITA. OurAirports non ha quella colonna: dove
 *    c'era, resta; dove non c'era, resta vuota come prima.
 *
 * Le funzioni qui dentro sono pure e senza rete: le prova
 * `prove/aeroporti-archivio.spec.ts` su un pezzo di CSV vero.
 */

import { isoDaNome, nomeDaIso } from "./paesi.mjs";

/**
 * Un CSV vero, non uno split sulle virgole: nei nomi degli aeroporti ci
 * sono virgolette e virgole ("Bergamo, Orio al Serio"), e uno split
 * ingenuo sposterebbe tutte le colonne di una riga.
 */
export function leggiCsv(testo) {
  const righe = [];
  let campo = "";
  let riga = [];
  let dentroVirgolette = false;

  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (dentroVirgolette) {
      if (c === '"') {
        if (testo[i + 1] === '"') {
          campo += '"';
          i++;
        } else dentroVirgolette = false;
      } else campo += c;
      continue;
    }
    if (c === '"') dentroVirgolette = true;
    else if (c === ",") {
      riga.push(campo);
      campo = "";
    } else if (c === "\n") {
      riga.push(campo);
      righe.push(riga);
      riga = [];
      campo = "";
    } else if (c !== "\r") campo += c;
  }
  if (campo !== "" || riga.length) {
    riga.push(campo);
    righe.push(riga);
  }
  if (!righe.length) return [];

  const intestazioni = righe[0].map((h) => h.trim());
  return righe.slice(1).map((r) => {
    const o = {};
    intestazioni.forEach((h, i) => (o[h] = r[i] ?? ""));
    return o;
  });
}

/**
 * I tipi di scalo che teniamo. Fuori: eliporti, idroscali, palloni,
 * piste chiuse. Un biglietto non ci porta mai, e ognuno di questi
 * gonfierebbe il file che finisce dentro ogni pagina del sito.
 */
const TIPI_BUONI = new Set(["large_airport", "medium_airport", "small_airport"]);

/** Quanto conta uno scalo: 2 grande, 1 medio, 0 piccolo. Decide chi esce
 *  per primo quando si cerca una città con più aeroporti. Senza, chi
 *  scrive "Parigi" può ritrovarsi Le Bourget prima di Charles de Gaulle
 *  (successo il 10/08, dopo il primo giro dell'autopilot). */
const PESO = { large_airport: 2, medium_airport: 1, small_airport: 0 };

/**
 * La città, ripulita dalla specifica amministrativa fra parentesi.
 * OurAirports scrive "Paris (Roissy-en-France, Val-d'Oise)": all'utente
 * si mostra una città, non un indirizzo catastale, e il confronto con i
 * nomi italiani deve continuare a funzionare.
 */
function cittaPulita(grezza) {
  const senzaParentesi = grezza.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return senzaParentesi || grezza.trim();
}

/**
 * Da OurAirports al nostro formato.
 * `vecchio` è l'archivio attuale: serve a ereditare nome del paese e
 * fuso orario, non a decidere chi entra.
 */
export function daOurAirports(righe, vecchio = {}) {
  const archivio = {};
  const nuovi = [];

  for (const r of righe) {
    const iata = (r.iata_code ?? "").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(iata)) continue;
    if (!TIPI_BUONI.has((r.type ?? "").trim())) continue;

    const lat = Number.parseFloat(r.latitude_deg);
    const lon = Number.parseFloat(r.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    const iso = (r.iso_country ?? "").trim().toUpperCase();
    const precedente = vecchio[iata];

    /* Il nome del paese: quello di prima se lo scalo c'era già (vedi
       prudenza 1 in cima), altrimenti quello standard del codice. */
    const paese = precedente?.paese ?? nomeDaIso(iso) ?? iso ?? "";

    /* LA CITTÀ DI PRIMA VINCE, ed è la prudenza che vale più di tutte.
       OurAirports scrive il COMUNE amministrativo, che spesso non è la
       città che una persona cerca: Malpensa sta a "Ferno", Charles de
       Gaulle a "Roissy-en-France". Chi scrive "milano" si vedrebbe
       rispondere "Ferno" e penserebbe di aver sbagliato (successo il
       10/08, al primo giro dell'autopilot). Per gli scali che avevamo
       già la città resta quella verificata; per i nuovi si prende
       quella della fonte, ripulita. */
    const citta =
      precedente?.citta ||
      cittaPulita((r.municipality ?? "").trim() || (r.name ?? "").trim());

    archivio[iata] = {
      icao: (r.icao_code ?? r.gps_code ?? "").trim().toUpperCase() || null,
      nome: (r.name ?? "").trim(),
      citta,
      paese,
      iso: /^[A-Z]{2}$/.test(iso) ? iso : (isoDaNome(paese) ?? null),
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      tz: precedente?.tz ?? null,
      peso: PESO[(r.type ?? "").trim()] ?? 0,
    };

    if (!precedente) nuovi.push(iata);
  }

  /* GLI SCALI CHE SPARISCONO NON SI CANCELLANO. Un aeroporto chiuso
     l'anno scorso sta ancora sui biglietti dell'anno scorso, e noi
     lavoriamo sul passato: buttarlo significherebbe non saper più dire
     dov'era. Restano dentro con quello che ne sapevamo. */
  const spariti = [];
  for (const [iata, riga] of Object.entries(vecchio)) {
    if (archivio[iata]) continue;
    archivio[iata] = {
      ...riga,
      iso: riga.iso ?? isoDaNome(riga.paese) ?? null,
      peso: riga.peso ?? 0,
    };
    spariti.push(iata);
  }

  return { archivio, nuovi, spariti };
}

/**
 * IL CONTROLLO CHE IMPEDISCE DI PUBBLICARE UN ARCHIVIO ROTTO.
 *
 * Questo file gira dentro il motore: se un giorno il download va a metà,
 * o la fonte cambia le colonne, il risultato non è un errore rumoroso ma
 * un archivio quasi vuoto, e ogni check del sito comincerebbe a dire
 * "non riconosciamo l'aeroporto". Meglio non aggiornare che aggiornare
 * male: qui si controlla prima di scrivere.
 */
export function controlla(archivio, vecchio) {
  const motivi = [];
  const quanti = Object.keys(archivio).length;
  const prima = Object.keys(vecchio).length;

  if (quanti < 5000) motivi.push(`solo ${quanti} scali: la fonte sembra tagliata`);
  if (prima && quanti < prima) motivi.push(`si passerebbe da ${prima} a ${quanti} scali`);

  /* Gli scali che devono esserci sempre: se manca uno di questi, non è
     un aggiornamento, è un file sbagliato. Sono i nostri otto
     dell'Osservatorio più i grandi hub che compaiono nelle prove. */
  const OBBLIGATORI = ["FCO", "MXP", "LIN", "BGY", "VCE", "NAP", "CTA", "BLQ", "BER", "CDG", "JFK"];
  const mancanti = OBBLIGATORI.filter((i) => !archivio[i]);
  if (mancanti.length) motivi.push(`mancano scali che devono esserci: ${mancanti.join(", ")}`);

  const senzaPaese = Object.values(archivio).filter((a) => !a.paese).length;
  if (senzaPaese > quanti * 0.02) motivi.push(`${senzaPaese} scali senza paese`);

  const senzaCoordinate = Object.values(archivio).filter(
    (a) => !Number.isFinite(a.lat) || !Number.isFinite(a.lon),
  ).length;
  if (senzaCoordinate) motivi.push(`${senzaCoordinate} scali senza coordinate`);

  /* L'Italia ha una quarantina di scali con sigla IATA: se ne restassero
     due, il file è arrivato monco proprio dove ci serve di più. */
  const italiani = Object.values(archivio).filter((a) => a.iso === "IT").length;
  if (italiani < 30) motivi.push(`solo ${italiani} scali italiani`);

  return { ok: motivi.length === 0, motivi, quanti, prima };
}

/**
 * Il file su disco: una riga per scalo. Non è vezzo, è per il diff:
 * tutto su una riga sola renderebbe illeggibile ogni aggiornamento
 * settimanale, e un aggiornamento che non si può leggere non si può
 * controllare.
 */
export function serializza(archivio) {
  const chiavi = Object.keys(archivio).sort();
  const righe = chiavi.map((k) => `${JSON.stringify(k)}:${JSON.stringify(archivio[k])}`);
  return `{\n${righe.join(",\n")}\n}\n`;
}
