import type { Punto } from "./viaggio";

/**
 * Destinazioni italiane curate a mano, con coordinate reali.
 *
 * NON sono offerte: sono POSTI. Non hanno prezzo, perché un prezzo senza una
 * struttura vera dietro sarebbe un numero inventato (regola CLAUDE.md #2).
 * Il costruttore le usa per dire "qui ci arrivi con X, ti restano Y per dormire".
 *
 * `isola: true` = non raggiungibile in auto dalla penisola senza traghetto.
 * Il costruttore le esclude e lo dice, invece di proporre viaggi impossibili.
 */
export type Tipo = "mare" | "monte" | "citta" | "terme";

export type Destinazione = Punto & {
  nome: string;
  regione: string;
  tipo: Tipo;
  cosa: string;
  isola?: boolean;
};

export const DESTINAZIONI: Destinazione[] = [
  // --- MARE ---
  { nome: "Camogli", regione: "Liguria", tipo: "mare", lat: 44.348, lng: 9.155, cosa: "Borgo di pescatori con le case alte e colorate, spiaggia di sassi e focaccia al formaggio a Recco, a due passi." },
  { nome: "Monterosso al Mare", regione: "Liguria", tipo: "mare", lat: 44.146, lng: 9.654, cosa: "L'unica delle Cinque Terre con una spiaggia vera. Sentiero verso Vernazza per chi vuole camminare." },
  { nome: "Portofino", regione: "Liguria", tipo: "mare", lat: 44.303, lng: 9.21, cosa: "Il porticciolo più fotografato d'Italia. Si dorme meglio (e si spende meno) a Santa Margherita, a 5 km." },
  { nome: "Rimini", regione: "Emilia-Romagna", tipo: "mare", lat: 44.06, lng: 12.565, cosa: "Spiaggia attrezzata a perdita d'occhio e il borgo San Giuliano dietro il porto, che quasi nessuno visita." },
  { nome: "Sperlonga", regione: "Lazio", tipo: "mare", lat: 41.259, lng: 13.437, cosa: "Centro storico bianco a picco sul mare, fra Roma e Napoli. Grotta di Tiberio a piedi dalla spiaggia." },
  { nome: "Sorrento", regione: "Campania", tipo: "mare", lat: 40.626, lng: 14.375, cosa: "Terrazza sul golfo di Napoli, base comoda per Positano e Pompei senza pagare i prezzi di Positano." },
  { nome: "Gallipoli", regione: "Puglia", tipo: "mare", lat: 40.055, lng: 17.992, cosa: "Città vecchia su un'isola collegata da un ponte, mare Ionio trasparente e cucina di pesce onesta." },
  { nome: "Tropea", regione: "Calabria", tipo: "mare", lat: 38.677, lng: 15.898, cosa: "Il paese sta su una rupe, la spiaggia sotto. Cipolla rossa e granite, e acqua che sembra caraibica." },
  { nome: "Vieste", regione: "Puglia", tipo: "mare", lat: 41.882, lng: 16.176, cosa: "Sul promontorio del Gargano, con i faraglioni e la Foresta Umbra a mezz'ora nell'entroterra." },
  { nome: "Numana", regione: "Marche", tipo: "mare", lat: 43.512, lng: 13.622, cosa: "Riviera del Conero: falesie bianche sull'Adriatico e spiagge raggiungibili solo a piedi o in barca." },

  // --- MONTAGNA ---
  { nome: "Ortisei", regione: "Trentino-Alto Adige", tipo: "monte", lat: 46.575, lng: 11.672, cosa: "Val Gardena. Funivia all'Alpe di Siusi, il pascolo d'alta quota più grande d'Europa." },
  { nome: "Bormio", regione: "Lombardia", tipo: "monte", lat: 46.468, lng: 10.372, cosa: "Montagna e terme naturali nello stesso posto. Stelvio a mezz'ora se ti piacciono i tornanti." },
  { nome: "Cortina d'Ampezzo", regione: "Veneto", tipo: "monte", lat: 46.537, lng: 12.135, cosa: "Dolomiti da cartolina. Lago di Sorapis in giornata, se hai gambe e scarpe giuste." },
  { nome: "Limone Piemonte", regione: "Piemonte", tipo: "monte", lat: 44.201, lng: 7.577, cosa: "Alpi Marittime a un'ora e mezza dal mare ligure. Poco affollato anche in alta stagione." },
  { nome: "Abetone", regione: "Toscana", tipo: "monte", lat: 44.145, lng: 10.665, cosa: "Appennino tosco-emiliano, boschi di faggi e sentieri facili. La montagna più vicina a chi sta al centro." },
  { nome: "Castelluccio di Norcia", regione: "Umbria", tipo: "monte", lat: 42.83, lng: 13.208, cosa: "Il Pian Grande sotto i Sibillini. A fine giugno la fioritura delle lenticchie colora tutta la piana." },
  { nome: "Andalo", regione: "Trentino-Alto Adige", tipo: "monte", lat: 46.166, lng: 11.005, cosa: "Altopiano della Paganella, molto attrezzato per chi va con i bambini piccoli." },
  { nome: "Sappada", regione: "Friuli-Venezia Giulia", tipo: "monte", lat: 46.568, lng: 12.682, cosa: "Borgo di case in legno alle sorgenti del Piave, lontano dalle rotte affollate." },

  // --- CITTÀ ---
  { nome: "Bologna", regione: "Emilia-Romagna", tipo: "citta", lat: 44.494, lng: 11.343, cosa: "Quaranta chilometri di portici, il mercato di Mezzo e le migliori tagliatelle che assaggerai." },
  { nome: "Verona", regione: "Veneto", tipo: "citta", lat: 45.438, lng: 10.993, cosa: "Arena romana ancora in uso, centro compatto da girare a piedi e il Garda a mezz'ora." },
  { nome: "Mantova", regione: "Lombardia", tipo: "citta", lat: 45.157, lng: 10.792, cosa: "Circondata da tre laghi. Palazzo Te e la Camera degli Sposi valgono da soli il viaggio." },
  { nome: "Ferrara", regione: "Emilia-Romagna", tipo: "citta", lat: 44.836, lng: 11.619, cosa: "Città rinascimentale piatta e piena di biciclette, con le mura percorribili tutt'intorno." },
  { nome: "Urbino", regione: "Marche", tipo: "citta", lat: 43.726, lng: 12.636, cosa: "Borgo ducale su due colli, Palazzo Ducale con la Flagellazione di Piero della Francesca." },
  { nome: "Siena", regione: "Toscana", tipo: "citta", lat: 43.318, lng: 11.331, cosa: "Piazza del Campo, Duomo a strisce e le crete senesi appena fuori città." },
  { nome: "Lecce", regione: "Puglia", tipo: "citta", lat: 40.352, lng: 18.174, cosa: "Barocco in pietra dorata, aperitivi in piazza e i due mari a mezz'ora da entrambe le parti." },
  { nome: "Matera", regione: "Basilicata", tipo: "citta", lat: 40.667, lng: 16.604, cosa: "I Sassi scavati nella roccia. Da vedere di sera, quando si accendono una a una." },
  { nome: "Trieste", regione: "Friuli-Venezia Giulia", tipo: "citta", lat: 45.649, lng: 13.777, cosa: "Piazza Unità aperta sul mare, caffè storici e un'aria che non sembra italiana." },
  { nome: "Bergamo Alta", regione: "Lombardia", tipo: "citta", lat: 45.703, lng: 9.663, cosa: "Città murata in cima, si sale in funicolare. Vista sulla pianura fino a Milano nelle giornate limpide." },
  { nome: "Ravenna", regione: "Emilia-Romagna", tipo: "citta", lat: 44.418, lng: 12.203, cosa: "Otto monumenti Unesco di mosaici bizantini, e la pineta con il mare a dieci minuti." },
  { nome: "Ascoli Piceno", regione: "Marche", tipo: "citta", lat: 42.854, lng: 13.575, cosa: "Piazza del Popolo tutta in travertino. Olive ascolane dove le hanno inventate." },

  // --- TERME ---
  { nome: "Saturnia", regione: "Toscana", tipo: "terme", lat: 42.663, lng: 11.508, cosa: "Cascate del Mulino: vasche naturali di acqua sulfurea a 37 gradi, gratis e aperte sempre." },
  { nome: "Bagno Vignoni", regione: "Toscana", tipo: "terme", lat: 43.029, lng: 11.618, cosa: "La piazza del paese è una vasca termale cinquecentesca. In Val d'Orcia, fra Siena e il Monte Amiata." },
  { nome: "Abano Terme", regione: "Veneto", tipo: "terme", lat: 45.359, lng: 11.79, cosa: "Il distretto termale più grande d'Europa, ai piedi dei Colli Euganei. Padova a venti minuti." },
  { nome: "Montecatini Terme", regione: "Toscana", tipo: "terme", lat: 43.882, lng: 10.774, cosa: "Stabilimenti liberty e la funicolare per Montecatini Alto. Firenze e Lucca in giornata." },
  { nome: "Bagni San Filippo", regione: "Toscana", tipo: "terme", lat: 42.929, lng: 11.699, cosa: "La Balena Bianca: una colata calcarea bianca nel bosco con pozze calde sotto. Ingresso libero." },
  { nome: "Pré-Saint-Didier", regione: "Valle d'Aosta", tipo: "terme", lat: 45.762, lng: 6.983, cosa: "Vasche all'aperto con il Monte Bianco davanti. Terme e montagna nello stesso weekend." },

  // --- ISOLE: raggiungibili solo col traghetto, il costruttore le esclude ---
  { nome: "Taormina", regione: "Sicilia", tipo: "mare", lat: 37.853, lng: 15.286, cosa: "Teatro greco con l'Etna sullo sfondo.", isola: true },
  { nome: "Cefalù", regione: "Sicilia", tipo: "mare", lat: 38.039, lng: 14.023, cosa: "Duomo normanno e spiaggia nel centro storico.", isola: true },
  { nome: "Alghero", regione: "Sardegna", tipo: "mare", lat: 40.559, lng: 8.319, cosa: "Bastioni sul mare e grotte di Nettuno.", isola: true },
];
