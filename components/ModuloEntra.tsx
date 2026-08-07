"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Mail, TriangleAlert } from "lucide-react";
import { accedi, linkMagico, registrati, type Esito } from "@/app/entra/azioni";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Modo = "accedi" | "registrati" | "magico";

const VUOTO: Esito = {};

const TITOLI: Record<Modo, { titolo: string; sotto: string; bottone: string }> = {
  accedi: {
    titolo: "Bentornato",
    sotto: "Entra e guarda a che punto sono le tue ricerche.",
    bottone: "Entra",
  },
  registrati: {
    titolo: "Crea il tuo account",
    sotto: "Ti regalo 3 destinazioni per provare. Nessuna carta, nessun abbonamento.",
    bottone: "Crea account e prendi 3 crediti",
  },
  magico: {
    titolo: "Entra senza password",
    sotto: "Ti mando un link via email. Lo apri e sei dentro.",
    bottone: "Mandami il link",
  },
};

/**
 * Gli errori che possono arrivare dal link nell'email.
 * Ognuno dice cosa è successo E cosa fare: "link non valido" da solo
 * lascia l'utente fermo davanti allo schermo.
 */
const ERRORI: Record<string, string> = {
  scaduto:
    "Quel link è già stato usato o è scaduto. Chiedine un altro qui sotto: ci mette un attimo.",
  link: "Quel link non ha funzionato. Riprova a entrare da qui, oppure fatti mandare un link nuovo.",
  configurazione:
    "L'accesso non è collegato: mancano le chiavi di Supabase. È un problema nostro, non tuo.",
};

export default function ModuloEntra({
  modoIniziale = "accedi",
  poi = "/app",
  errore: erroreArrivato,
}: {
  modoIniziale?: Modo;
  poi?: string;
  errore?: string | null;
}) {
  const [modo, setModo] = useState<Modo>(modoIniziale);
  const [erroreGoogle, setErroreGoogle] = useState<string | null>(null);

  /**
   * Accesso con Google. Il giro: Supabase costruisce l'indirizzo di Google,
   * l'utente acconsente lì, e torna su /auth/conferma con un codice che noi
   * scambiamo per una sessione (già gestito). Se il fornitore non è ancora
   * acceso nel pannello Supabase, si torna qui con un errore e lo diciamo
   * in italiano invece di lasciare una pagina morta.
   */
  async function conGoogle() {
    setErroreGoogle(null);
    try {
      const { error } = await supabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/conferma?poi=${encodeURIComponent(poi)}`,
        },
      });
      if (error) setErroreGoogle("Google non è ancora collegato. Entra con email e password.");
    } catch {
      setErroreGoogle("Google non è ancora collegato. Entra con email e password.");
    }
  }

  const [esitoAccedi, inviaAccedi, accediInCorso] = useActionState(accedi, VUOTO);
  const [esitoRegistra, inviaRegistra, registraInCorso] = useActionState(registrati, VUOTO);
  const [esitoMagico, inviaMagico, magicoInCorso] = useActionState(linkMagico, VUOTO);

  const azione =
    modo === "accedi" ? inviaAccedi : modo === "registrati" ? inviaRegistra : inviaMagico;
  const esito =
    modo === "accedi" ? esitoAccedi : modo === "registrati" ? esitoRegistra : esitoMagico;
  const inCorso =
    modo === "accedi" ? accediInCorso : modo === "registrati" ? registraInCorso : magicoInCorso;

  const t = TITOLI[modo];
  const errore =
    esito.errore ?? (erroreArrivato ? (ERRORI[erroreArrivato] ?? ERRORI.link) : undefined);

  return (
    <div className="w-full max-w-[420px]">
      {/* Le due linguette. Il link magico sta sotto: è la via secondaria. */}
      <div
        role="tablist"
        aria-label="Modo di accesso"
        className="mb-8 inline-flex rounded-pillola border border-bordo bg-white p-1"
      >
        {(["accedi", "registrati"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            className="relative rounded-pillola px-5 py-2 text-sm font-medium transition-colors"
          >
            {modo === m && (
              <motion.span
                layoutId="linguetta"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-pillola bg-inchiostro"
              />
            )}
            <span className={`relative z-10 ${modo === m ? "text-white" : "text-fumo"}`}>
              {m === "accedi" ? "Ho già un account" : "Sono nuovo"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={modo}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.04em]">{t.titolo}</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{t.sotto}</p>

          <form action={azione} className="mt-8 flex flex-col gap-4">
            <input type="hidden" name="poi" value={poi} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="tu@esempio.it"
              />
            </div>

            {modo !== "magico" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={modo === "accedi" ? "current-password" : "new-password"}
                  required
                  minLength={modo === "registrati" ? 8 : undefined}
                  placeholder={modo === "registrati" ? "almeno 8 caratteri" : "••••••••"}
                />
              </div>
            )}

            <Button type="submit" size="lg" disabled={inCorso} className="mt-2 w-full">
              {inCorso ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Un attimo
                </>
              ) : (
                t.bottone
              )}
            </Button>
          </form>

          {modo !== "magico" && (
            <>
              {/* ---- oppure ---- */}
              <div className="mt-6 flex items-center gap-4" aria-hidden="true">
                <span className="h-px flex-1 bg-bordo" />
                <span className="text-xs uppercase tracking-[0.14em] text-fumo-2">oppure</span>
                <span className="h-px flex-1 bg-bordo" />
              </div>

              {/* Il bottone di Google, con la G ufficiale a quattro colori.
                  Le regole di Google: fondo bianco, bordo neutro, la G mai
                  ridisegnata coi colori del marchio ospitante. */}
              <button
                type="button"
                onClick={conGoogle}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-bottone border border-bordo bg-white text-[15px] font-medium text-inchiostro transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(5,46,31,.35)] active:translate-y-0"
              >
                <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continua con Google
              </button>

              {erroreGoogle && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {erroreGoogle}
                </p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Messaggi. Uno alla volta, sotto al bottone, dove si guarda dopo aver premuto. */}
      <AnimatePresence>
        {errore && (
          <motion.p
            key="errore"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errore}
          </motion.p>
        )}
        {esito.avviso && (
          <motion.p
            key="avviso"
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-2 rounded-2xl bg-menta-tenue px-4 py-3 text-sm text-verde-notte"
          >
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {esito.avviso}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-7 border-t border-bordo pt-6">
        <button
          type="button"
          onClick={() => setModo(modo === "magico" ? "accedi" : "magico")}
          className="inline-flex items-center gap-2 text-sm text-fumo transition-colors hover:text-verde"
        >
          <Mail className="size-4" aria-hidden="true" />
          {modo === "magico" ? "Torna alla password" : "Entra senza password, con un link via email"}
        </button>
      </div>
    </div>
  );
}
