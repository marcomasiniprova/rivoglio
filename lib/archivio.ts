import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { CHIAVE_PUBBLICA, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./supabase/chiavi";

export type Iscritto = {
  email: string;
  comune: string | null;
  creatoIl: string;
};

/**
 * Dove finiscono gli iscritti alla lista d'attesa.
 *
 * STRADA VERA: tabella `iscritti` su Supabase.
 * VIA DI SCORTA: un file locale, e SOLO in sviluppo.
 *
 * Prima c'era solo il file. Su Netlify il filesystem delle funzioni NON è
 * persistente: ogni email raccolta sarebbe sparita senza un errore, e te ne
 * saresti accorto dopo il lancio, contando gli iscritti che non c'erano.
 * Per questo in produzione senza configurazione qui si alza un'eccezione:
 * meglio un errore visibile che una lista che si svuota di nascosto.
 *
 * Il client Supabase è senza sessione, ed è voluto: chi si iscrive dalla
 * landing NON è collegato. A permettere la scrittura è la policy `insert` su
 * `iscritti`; policy di lettura non ce ne sono, quindi la lista non la può
 * rileggere nessuno dal browser, nemmeno con la chiave pubblica in mano.
 */
const FILE = path.join(process.cwd(), ".dati", "iscritti.jsonl");
const IN_PRODUZIONE = process.env.NODE_ENV === "production";

function client() {
  return createClient(URL_SUPABASE, CHIAVE_PUBBLICA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function salvaIscritto(i: Iscritto): Promise<void> {
  if (!SUPABASE_CONFIGURATO) {
    if (IN_PRODUZIONE) {
      throw new Error(
        "Supabase non configurato in produzione: mi rifiuto di raccogliere email su un file che sparisce.",
      );
    }
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.appendFile(FILE, JSON.stringify(i) + "\n", "utf8");
    return;
  }

  const { error } = await client()
    .from("iscritti")
    .insert({ email: i.email, comune: i.comune, creato_il: i.creatoIl });

  // 23505 = quell'email c'è già. Non è un errore: è uno che ci riprova.
  if (error && error.code !== "23505") {
    throw new Error(`Supabase: ${error.message}`);
  }
}

export async function contaIscritti(): Promise<number> {
  if (!SUPABASE_CONFIGURATO) {
    try {
      const testo = await fs.readFile(FILE, "utf8");
      return testo.split("\n").filter((r) => r.trim()).length;
    } catch {
      return 0;
    }
  }

  const { count, error } = await client()
    .from("iscritti")
    .select("id", { count: "exact", head: true });

  // Senza policy di lettura (ed è giusto che non ci sia) qui torna 0.
  if (error) return 0;
  return count ?? 0;
}
