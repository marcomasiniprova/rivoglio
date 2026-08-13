import type { Passo } from "@/lib/pratiche/passi";

/**
 * DOVE SEI, IN UNA RIGA.
 *
 * Serve a rispondere alla domanda che uno si fa aprendo la pagina: a che
 * punto sono, e cosa devo fare adesso. Prima la risposta c'era, ma sparsa
 * in cinque riquadri che potevano essere accesi tutti insieme.
 *
 * 🔴 LA PRIMA VERSIONE FACEVA SCORRERE LA PAGINA DI LATO, a tutte e tre
 * le larghezze. Era una fila di sette tappe col nome scritto accanto:
 * larga circa mille punti, dentro una colonna che ne ha 768. Il
 * contenitore aveva `overflow-x-auto`, che in teoria avrebbe dovuto
 * tenersi il traboccamento; ma dentro un `flex flex-col` un figlio non
 * si stringe sotto la larghezza del proprio contenuto (`min-width: auto`),
 * quindi cresceva lui e con lui la pagina. Trovato guardando le
 * schermate, non da una prova: il tipo di difetto che la regola 4-bis del
 * progetto dice di cercare a più larghezze, e che infatti c'era a tutte.
 *
 * ⚠️ LA CURA NON È STATA `min-w-0`, ed è il punto. Con quello la barra
 * smetteva di allargare la pagina ma restava una fila da far scorrere col
 * dito: sette tappe con l'etichetta non ci stanno su un telefono, e una
 * cosa che si vede a metà sembra rotta. Adesso le tappe sono SEGMENTI
 * senza nome, e il nome ce l'ha solo quella attiva, scritto sopra. Non
 * può traboccare per costruzione, a nessuna larghezza e con qualunque
 * numero di tappe: i segmenti si dividono lo spazio che c'è.
 */
export default function BarraPassi({ passi }: { passi: Passo[] }) {
  const indice = passi.findIndex((p) => p.stato === "adesso");
  const attivo = passi[indice];
  if (!attivo) return null;

  return (
    <nav aria-label="I passi della pratica">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="numeri text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fumo-2">
          Passo {indice + 1} di {passi.length}
        </span>
        <span className="text-[0.95rem] font-semibold text-inchiostro">{attivo.nome}</span>
      </p>
      <ol className="mt-2 flex gap-1.5">
        {passi.map((p) => (
          <li
            key={p.chiave}
            /* Ogni segmento si prende la sua fetta di quello che c'è:
               niente larghezza fissa, niente traboccamento possibile. */
            className={`h-1.5 flex-1 rounded-full ${
              p.stato === "fatto"
                ? "bg-verde/45"
                : p.stato === "adesso"
                  ? "bg-verde"
                  : "bg-bordo"
            }`}
          >
            {/* Il nome resta leggibile da chi usa uno screen reader: la
                barra sullo schermo è un riassunto, non una scorciatoia
                per chi non vede. */}
            <span className="sr-only">
              {p.nome}
              {p.stato === "fatto" ? " (fatto)" : p.stato === "adesso" ? " (sei qui)" : ""}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
