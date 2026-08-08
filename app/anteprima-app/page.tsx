import type { Metadata } from "next";

/**
 * L'ANTEPRIMA DELL'APP, dentro un telefono disegnato.
 *
 * Serve a Valerio (8/08): vedere l'app aggiornata scrivendo un indirizzo,
 * senza PowerShell. La build web dell'app vive in /public/app-anteprima
 * (la rigenera `npm run anteprima` dentro mobile/ a ogni giro) e questa
 * pagina la incornicia in un iPhone di CSS.
 *
 * Non è linkata da nessuna parte e non va sui motori: è un ferro di
 * lavoro, non una pagina del prodotto.
 */

export const metadata: Metadata = {
  title: "Anteprima app | Rivoglio",
  robots: { index: false, follow: false },
};

export default function PaginaAnteprimaApp() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0d1117] px-4 py-10">
      <div className="flex flex-col items-center gap-5">
        {/* -------------------------------------------------- il telefono */}
        <div
          className="relative rounded-[54px] bg-[#1c1f26] p-[10px]"
          style={{
            boxShadow:
              "0 0 0 2px rgba(255,255,255,.06), 0 30px 80px -20px rgba(0,0,0,.8), inset 0 0 4px rgba(255,255,255,.08)",
          }}
        >
          {/* i tasti laterali */}
          <span className="absolute -left-[2px] top-28 h-8 w-[3px] rounded-l bg-[#2a2e37]" />
          <span className="absolute -left-[2px] top-40 h-14 w-[3px] rounded-l bg-[#2a2e37]" />
          <span className="absolute -right-[2px] top-36 h-20 w-[3px] rounded-r bg-[#2a2e37]" />

          <div className="relative h-[760px] w-[360px] overflow-hidden rounded-[44px] bg-black">
            {/* la Dynamic Island */}
            <span className="absolute left-1/2 top-3 z-10 h-[26px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
            <iframe
              src="/app-anteprima"
              title="Rivoglio, anteprima dell'app"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>

        <p className="text-center text-[13px] leading-relaxed text-white/50">
          Anteprima web dell&apos;app Rivoglio. Si aggiorna a ogni push.
          <br />
          Fotocamera e notifiche si provano solo sul telefono vero.
        </p>
      </div>
    </main>
  );
}
