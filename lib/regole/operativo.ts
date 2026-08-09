/**
 * CHI C'ERA SULL'AEREO? Il secondo tempo del check quando il numero di
 * volo è venduto in codeshare.
 *
 * Il codeshare è questo: compri un volo "Air France 1234" e sull'aereo
 * c'è scritto un altro nome, perché quel volo lo fa un'altra compagnia
 * per conto della prima. Il Regolamento è chiaro (art. 2, lett. b): il
 * reclamo va a chi ha OPERATO, non a chi ha venduto. Se il reclamo parte
 * verso la compagnia sbagliata, la risposta è un rifiuto formale e il
 * cliente ha buttato i suoi soldi.
 *
 * Quando il fornitore non sa dire chi ha operato, prima il caso si
 * fermava e finiva lì. Ma quella risposta ce l'ha l'utente sotto gli
 * occhi: è scritta sulla carta d'imbarco e c'era scritta sull'aereo.
 * Quindi si chiede, invece di fermarsi.
 *
 * Il motore resta lo stesso e resta deterministico: qui non si decide
 * niente, si riempie un campo che mancava e si richiama `valuta()`.
 */
import { compagniaPerVettore, COMPAGNIE } from "@/lib/lettera/compagnie";
import { valuta, type FattoVolo, type Verdetto } from "./eu261";
import { VETTORI } from "./vettori";

export type VettoreScelto = { iata: string; nome: string; paese: string | null };

/**
 * Tutte le compagnie che sappiamo riconoscere: quelle con la scheda
 * completa (canale reclami verificato) più quelle di cui conosciamo
 * nome e paese. Serve a far SCEGLIERE, non a far scrivere: chiedere
 * "qual è il codice IATA del vettore operativo" a una persona normale
 * è chiederle di andarsene.
 */
export function elencoVettori(): VettoreScelto[] {
  const per = new Map<string, VettoreScelto>();
  for (const [iata, v] of Object.entries(VETTORI)) {
    per.set(iata, { iata, nome: v.nome, paese: v.paese });
  }
  /* Le compagnie con la scheda completa vincono: hanno il nome legale e
     il paese verificati a mano. */
  for (const c of COMPAGNIE) {
    per.set(c.iata, { iata: c.iata, nome: c.nome, paese: c.paese });
  }
  return [...per.values()].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
}

/** Minuscolo e senza accenti: "Aerolíneas" si cerca anche come "aerolineas". */
function piatto(testo: string): string {
  return testo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * La ricerca per il campo: due lettere bastano, e il codice IATA scritto
 * a mano vince su tutto (chi lo sa, lo scrive).
 */
export function cercaVettore(testo: string, quanti = 8): VettoreScelto[] {
  const q = piatto(testo);
  if (q.length < 2) return [];
  const tutti = elencoVettori();

  const esatto = tutti.find((v) => v.iata.toLowerCase() === q);
  const inizia = tutti.filter((v) => piatto(v.nome).startsWith(q));
  const contiene = tutti.filter(
    (v) => !piatto(v.nome).startsWith(q) && piatto(v.nome).includes(q),
  );

  const risultato: VettoreScelto[] = [];
  for (const v of [...(esatto ? [esatto] : []), ...inizia, ...contiene]) {
    if (!risultato.some((r) => r.iata === v.iata)) risultato.push(v);
    if (risultato.length >= quanti) break;
  }
  return risultato;
}

/** La compagnia scelta esiste davvero fra quelle che conosciamo? */
export function vettoreValido(iata: unknown): VettoreScelto | null {
  if (typeof iata !== "string") return null;
  const codice = iata.trim().toUpperCase();
  if (!/^[A-Z0-9]{2}$/.test(codice)) return null;
  return elencoVettori().find((v) => v.iata === codice) ?? null;
}

/**
 * Il verdetto con il vettore operativo dichiarato dall'utente.
 *
 * `null` se la compagnia non è fra quelle che conosciamo: meglio non
 * rispondere che rispondere su un codice inventato.
 */
export function valutaOperativo(fatto: FattoVolo, iataScelto: unknown): Verdetto | null {
  const scelto = vettoreValido(iataScelto);
  if (!scelto) return null;

  /* Il campo che mancava, e SOLO quello. Il resto del fatto non si
     tocca: gli orari restano quelli certificati dal fornitore, la
     distanza pure. L'utente aggiunge un'informazione, non ne corregge
     una. */
  return valuta({
    ...fatto,
    vettoreOperativo: scelto.iata,
    vettoreDaDeterminare: false,
    /* Se la compagnia ha la scheda completa il paese è verificato a mano;
       se no viene dalla tabella breve. `valuta` se lo ricava da solo, ma
       passarlo qui evita un secondo giro sulle stesse tabelle. */
    vettoreUE: undefined,
  });
}

/** La compagnia scelta ha una scheda reclami completa? Serve alla lettera. */
export function haCanaleReclami(iata: string): boolean {
  return Boolean(compagniaPerVettore(iata));
}
