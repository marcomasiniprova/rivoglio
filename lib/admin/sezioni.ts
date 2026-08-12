/**
 * LE SEZIONI DEL RETROBOTTEGA, scritte una volta sola.
 *
 * Le legge la barra laterale (per l'elenco) e la testata (per il titolo
 * della pagina aperta). Se vivessero in due posti, il giorno che se ne
 * aggiunge una compare nel menu ma la testata resta senza nome: è il
 * genere di sfasatura che non si nota mai finché non la vede un altro.
 *
 * ⚠️ Qui NON ci sono le icone, e non è una dimenticanza: le icone sono
 * componenti React e questo file lo legge anche il server, che non può
 * passarle al browser. La barra laterale le aggancia per chiave.
 */

export type ChiaveSezione =
  | "mappa"
  | "panoramica"
  | "verdetti"
  | "pratiche"
  | "traffico"
  | "registro"
  | "iscritti"
  | "prodotto"
  | "impostazioni";

export type Sezione = {
  chiave: ChiaveSezione;
  href: string;
  /** Il nome nel menu: una parola, come nei gestionali veri. */
  nome: string;
  /** La riga sotto il titolo: dice a cosa serve questa schermata. */
  sotto: string;
};

export const SEZIONI: Sezione[] = [
  {
    /* La mappa sta PER PRIMA perche' risponde alla domanda che viene
       prima di tutte: come funziona questo posto. I numeri vengono dopo,
       e senza la mappa non si sa nemmeno cosa stanno misurando. */
    chiave: "mappa",
    href: "/admin/mappa",
    nome: "La mappa",
    sotto: "Tutto Rivolio in una schermata: il prodotto, i canali, dove entrano i soldi.",
  },
  {
    chiave: "panoramica",
    href: "/admin",
    nome: "Panoramica",
    sotto: "I soldi, il percorso delle persone e come sta andando la settimana.",
  },
  {
    chiave: "verdetti",
    href: "/admin/verdetti",
    nome: "Verdetti",
    sotto: "Gli idonei che aspettano la tua conferma: finché non la dai, nessuno paga.",
  },
  {
    chiave: "pratiche",
    href: "/admin/pratiche",
    nome: "Pratiche",
    sotto: "Chi ha pagato, a che punto è, e cosa deve succedere adesso.",
  },
  {
    chiave: "traffico",
    href: "/admin/traffico",
    nome: "Traffico",
    sotto: "Da dove arrivano le persone e da che paese. Serve a non distribuire alla cieca.",
  },
  {
    chiave: "registro",
    href: "/admin/registro",
    nome: "Registro",
    sotto: "Tutti i fatti in diretta, dal più recente. Si filtra per tipo.",
  },
  {
    chiave: "iscritti",
    href: "/admin/iscritti",
    nome: "Iscritti",
    sotto: "L'Osservatorio: chi si è iscritto, chi ha confermato, chi se ne è andato.",
  },
  {
    /* ⚠️ Sta QUI dentro e non fra le voci di servizio in fondo alla
       barra. Prima "Vedi il sito" e "La web app" erano due link staccati
       e l'app non c'era proprio: tre cose che il cliente vede, sparse in
       due posti e una mancante. Adesso c'è un posto solo, e il giorno
       che nasce una quarta superficie si sa dove metterla. */
    chiave: "prodotto",
    href: "/admin/prodotto",
    nome: "Prodotto",
    sotto: "Le tre cose che vede il cliente: il sito, la web app e l'app. Aprile e guardale.",
  },
  {
    chiave: "impostazioni",
    href: "/admin/impostazioni",
    nome: "Impostazioni",
    sotto: "Cosa c'è su Netlify, spiegato, e cosa succede se manca.",
  },
];

/**
 * La sezione aperta adesso.
 *
 * ⚠️ Si prende la corrispondenza PIÙ LUNGA. Con un banale "inizia per",
 * `/admin` (che è il prefisso di tutti) vincerebbe sempre e la voce
 * attiva resterebbe Panoramica su ogni pagina.
 */
export function sezioneDi(percorso: string): Sezione {
  let scelta = SEZIONI[0];
  for (const s of SEZIONI) {
    const dentro = percorso === s.href || percorso.startsWith(s.href + "/");
    if (dentro && s.href.length >= scelta.href.length) scelta = s;
  }
  return scelta;
}
