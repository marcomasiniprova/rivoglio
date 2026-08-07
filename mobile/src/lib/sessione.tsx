/**
 * La sessione dell'app: chi sei e se il caricamento iniziale è finito.
 *
 * Con EXPO_PUBLIC_DEMO=1 l'accesso funziona senza rete: entra un utente
 * dimostrativo, così il flusso completo si prova anche in sandbox.
 *
 * Supabase risponde in inglese: qui i suoi messaggi diventano le stesse
 * frasi italiane di app/entra/azioni.ts del sito. Mai inglese verso l'utente.
 */
import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { DEMO } from "./dati";
import { supabase } from "./supabase";

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ERRORE_GENERICO = "Qualcosa non ha funzionato. Riprova fra un attimo.";
const ERRORE_RETE = "Non riesco a collegarmi. Controlla la connessione e riprova.";

function inItaliano(messaggio: string): string {
  const m = messaggio.toLowerCase();

  // Il telefono può essere offline: questo caso sul sito non esiste, qui sì.
  if (m.includes("fetch") || m.includes("network") || m.includes("connection")) {
    return ERRORE_RETE;
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "Quell'indirizzo non viene accettato. Usa un'email vera che leggi davvero.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Con questa email esiste già un account. Entra dalla linguetta accanto.";
  }
  if (m.includes("password") && m.includes("least")) {
    return "La password è troppo corta: almeno 8 caratteri.";
  }
  if (m.includes("weak") || m.includes("pwned")) {
    return "Quella password è troppo comune. Cambiane qualche pezzo.";
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Troppi tentativi di fila. Aspetta un minuto e riprova.";
  }
  if (m.includes("signups not allowed") || m.includes("disabled")) {
    return "Le registrazioni sono chiuse in questo momento.";
  }

  console.error("[sessione] messaggio Supabase non tradotto:", messaggio);
  return ERRORE_GENERICO;
}

type Sessione = { utente: User | null; pronto: boolean };

const Contesto = createContext<Sessione>({ utente: null, pronto: false });

/** Stesso id e stessa email del profilo dimostrativo di dati.ts. */
const UTENTE_DEMO: User = {
  id: "demo",
  email: "demo@rivoglio.it",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

let utenteDemo: User | null = null;
let avvisaProvider: ((u: User | null) => void) | null = null;

function entraDemo(): void {
  utenteDemo = UTENTE_DEMO;
  avvisaProvider?.(UTENTE_DEMO);
}

export function ProviderSessione({ children }: { children: ReactNode }): JSX.Element {
  // In demo lo stato di partenza è già noto: niente attese, pronto subito.
  const [utente, setUtente] = useState<User | null>(DEMO ? utenteDemo : null);
  const [pronto, setPronto] = useState(DEMO);

  useEffect(() => {
    if (DEMO) {
      avvisaProvider = setUtente;
      return () => {
        avvisaProvider = null;
      };
    }

    let montato = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (montato) setUtente(data.session?.user ?? null);
      })
      .catch((e) => console.error("[sessione] sessione non letta:", e))
      .finally(() => {
        // Pronto anche se la lettura fallisce: l'app non deve restare sullo splash.
        if (montato) setPronto(true);
      });

    const { data: ascolto } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      if (montato) setUtente(sessione?.user ?? null);
    });

    return () => {
      montato = false;
      ascolto.subscription.unsubscribe();
    };
  }, []);

  return <Contesto.Provider value={{ utente, pronto }}>{children}</Contesto.Provider>;
}

export function useSessione(): Sessione {
  return useContext(Contesto);
}

export async function registrati(email: string, password: string): Promise<{ errore?: string }> {
  const pulita = email.trim().toLowerCase();
  if (!EMAIL_OK.test(pulita)) return { errore: "Controlla l'indirizzo email." };
  if (password.length < 8) return { errore: "La password deve avere almeno 8 caratteri." };

  if (DEMO) {
    entraDemo();
    return {};
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email: pulita, password });
    if (error) return { errore: inItaliano(error.message) };
    // Nel pannello Supabase la conferma email è spenta: la sessione parte
    // subito. Se un giorno venisse riaccesa, si dice cosa fare invece di
    // fallire in silenzio.
    if (!data.session) {
      return { errore: `Ti ho mandato un'email a ${pulita}. Apri il link dentro, poi entra da qui.` };
    }
    return {};
  } catch (e) {
    return { errore: inItaliano(e instanceof Error ? e.message : String(e)) };
  }
}

export async function accedi(email: string, password: string): Promise<{ errore?: string }> {
  const pulita = email.trim().toLowerCase();
  if (!EMAIL_OK.test(pulita)) return { errore: "Controlla l'indirizzo email." };
  if (!password) return { errore: "Scrivi la password." };

  if (DEMO) {
    entraDemo();
    return {};
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email: pulita, password });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("fetch") || m.includes("network") || m.includes("connection")) {
        return { errore: ERRORE_RETE };
      }
      // Messaggio volutamente generico: dire "questa email non esiste" regala
      // a chiunque la lista di chi è iscritto.
      return { errore: "Email o password non corrispondono." };
    }
    return {};
  } catch (e) {
    return { errore: inItaliano(e instanceof Error ? e.message : String(e)) };
  }
}

export async function esci(): Promise<void> {
  if (DEMO) {
    utenteDemo = null;
    avvisaProvider?.(null);
    return;
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[sessione] uscita non pulita:", error.message);
  } catch (e) {
    console.error("[sessione] uscita non pulita:", e);
  }
}
