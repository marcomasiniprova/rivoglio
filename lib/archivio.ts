import { promises as fs } from "node:fs";
import path from "node:path";

export type Iscritto = {
  email: string;
  comune: string | null;
  creatoIl: string;
};

/**
 * Dove finiscono gli iscritti.
 *
 * ⚠️ OGGI: un file locale. Funziona in sviluppo e basta.
 * Su Netlify il filesystem delle funzioni NON è persistente: quello che scrivi
 * qui sparisce. Quindi PRIMA di mettere online il sito va sostituita
 * l'implementazione con Supabase (giorno 3 del piano in SPEC.md).
 *
 * La firma resta questa: cambia solo il corpo. Il resto dell'app non se ne accorge.
 */
const FILE = path.join(process.cwd(), ".dati", "iscritti.jsonl");

export async function salvaIscritto(i: Iscritto): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(i) + "\n", "utf8");
}

export async function contaIscritti(): Promise<number> {
  try {
    const testo = await fs.readFile(FILE, "utf8");
    return testo.split("\n").filter((r) => r.trim()).length;
  } catch {
    return 0;
  }
}
