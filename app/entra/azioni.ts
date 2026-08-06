"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

export type Esito = { errore?: string; avviso?: string };

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Da dove sta arrivando la richiesta: serve per costruire il link di ritorno. */
async function origine() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocollo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocollo}://${host}`;
}

/**
 * Dove mandare l'utente dopo il login.
 *
 * Si accettano SOLO percorsi interni che iniziano con una barra singola.
 * Senza questo controllo un link tipo `/entra?poi=//sito-cattivo.it` ti
 * spedisce fuori dopo il login: è la falla chiamata "open redirect".
 */
function destinazioneSicura(poi: FormDataEntryValue | null): string {
  const p = typeof poi === "string" ? poi : "";
  if (p.startsWith("/") && !p.startsWith("//")) return p;
  return "/app";
}

function nonConfigurato(): Esito {
  return {
    errore:
      "L'accesso non è ancora collegato: manca il file .env.local con le chiavi di Supabase.",
  };
}

/**
 * Supabase risponde in inglese. All'utente italiano non si mostra
 * "Email address is invalid": si mostra una frase che gli dice cosa fare.
 * Quello che non riconosciamo diventa un messaggio generico, mai il testo
 * originale: non deve mai uscire inglese davanti a un utente.
 */
function inItaliano(messaggio: string): string {
  const m = messaggio.toLowerCase();

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

  console.error("[entra] messaggio Supabase non tradotto:", messaggio);
  return "Qualcosa non ha funzionato. Riprova fra un attimo.";
}

/** Accesso con email e password. */
export async function accedi(_precedente: Esito, dati: FormData): Promise<Esito> {
  if (!SUPABASE_CONFIGURATO) return nonConfigurato();

  const email = String(dati.get("email") ?? "").trim().toLowerCase();
  const password = String(dati.get("password") ?? "");
  if (!EMAIL_OK.test(email)) return { errore: "Controlla l'indirizzo email." };
  if (!password) return { errore: "Scrivi la password." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Messaggio volutamente generico: dire "questa email non esiste" regala a
    // chiunque la lista di chi è iscritto.
    return { errore: "Email o password non corrispondono." };
  }

  revalidatePath("/", "layout");
  redirect(destinazioneSicura(dati.get("poi")));
}

/** Registrazione. */
export async function registrati(_precedente: Esito, dati: FormData): Promise<Esito> {
  if (!SUPABASE_CONFIGURATO) return nonConfigurato();

  const email = String(dati.get("email") ?? "").trim().toLowerCase();
  const password = String(dati.get("password") ?? "");
  if (!EMAIL_OK.test(email)) return { errore: "Controlla l'indirizzo email." };
  if (password.length < 8) return { errore: "La password deve avere almeno 8 caratteri." };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origine()}/auth/conferma` },
  });

  if (error) return { errore: inItaliano(error.message) };

  // Sessione già attiva: nel pannello Supabase la conferma email è spenta.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(destinazioneSicura(dati.get("poi")));
  }

  return {
    avviso: `Ti ho mandato un'email a ${email}. Apri il link dentro e sei dentro. Controlla anche lo spam.`,
  };
}

/** Accesso senza password: arriva un link via email. */
export async function linkMagico(_precedente: Esito, dati: FormData): Promise<Esito> {
  if (!SUPABASE_CONFIGURATO) return nonConfigurato();

  const email = String(dati.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_OK.test(email)) return { errore: "Controlla l'indirizzo email." };

  const poi = destinazioneSicura(dati.get("poi"));
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await origine()}/auth/conferma?poi=${encodeURIComponent(poi)}`,
    },
  });

  if (error) return { errore: inItaliano(error.message) };

  return {
    avviso: `Link mandato a ${email}. Aprilo da questo dispositivo. Controlla anche lo spam.`,
  };
}

/** Uscita. */
export async function esci() {
  if (SUPABASE_CONFIGURATO) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
