import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import {
  controllaFormato,
  normalizza,
  refusoDominio,
  usaEGetta,
} from "../lib/email/indirizzo";

/**
 * LE EMAIL FINTE, TEMPORANEE E SCRITTE MALE.
 *
 * 🔴 Valerio, 13/08: «viene creato l'account anche con email inesistenti,
 * false, scritte male e temporanee». Queste prove tengono chiuso quel
 * buco, e soprattutto tengono ferme le DUE cose che si contraddicono:
 * essere severi con gli indirizzi morti E non buttare fuori nessuno che
 * ha scritto un indirizzo vero.
 *
 * La seconda metà è quella che di solito si dimentica, ed è quella che
 * costa: un controllo troppo zelante non lo scopre nessuno, perché chi
 * viene bloccato per sbaglio non scrive per lamentarsi, se ne va.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("La forma dell'indirizzo", () => {
  test("gli indirizzi veri passano tutti", () => {
    const buoni = [
      "valerio@artecai.it",
      "trec.tun@gmail.com",
      "mario.rossi+voli@libero.it",
      "m@poste.it",
      "nome_cognome@studio-legale.co.uk",
      "a.b.c@sub.dominio.example.com",
      "utente123@virgilio.it",
    ];
    for (const b of buoni) {
      const e = controllaFormato(b);
      expect(e.ok, `${b} doveva passare`).toBe(true);
    }
  });

  test("quello che non è un indirizzo non passa", () => {
    const cattivi = [
      "",
      "pippo",
      "pippo@",
      "@gmail.com",
      "pippo@gmail", // manca il suffisso: è il refuso più comune di tutti
      "pippo@@gmail.com",
      "pippo gmail.com",
      "pippo@gmail..com",
      ".pippo@gmail.com",
      "pippo.@gmail.com",
      "pippo@-gmail.com",
      "pippo@gmail.c0m", // suffisso con un numero dentro
      "pippo@gmail.c", // suffisso di una lettera
    ];
    for (const c of cattivi) {
      const e = controllaFormato(c);
      expect(e.ok, `${c} NON doveva passare`).toBe(false);
    }
  });

  test("il rumore dell'incolla si toglie invece di far fallire", () => {
    // Chi incolla dalla posta si porta dietro spazi, maiuscole e parentesi.
    expect(normalizza("  Mario.Rossi@Gmail.com ")).toBe("mario.rossi@gmail.com");
    expect(normalizza("<mario@gmail.com>")).toBe("mario@gmail.com");
    expect(normalizza("mailto:mario@gmail.com")).toBe("mario@gmail.com");
    expect(normalizza("mario@gmail.com.")).toBe("mario@gmail.com");
    const e = controllaFormato("  MARIO@GMAIL.COM ");
    expect(e.ok && e.email).toBe("mario@gmail.com");
  });
});

test.describe("Le caselle temporanee", () => {
  test("i servizi usa e getta più diffusi sono chiusi fuori", () => {
    for (const d of ["mailinator.com", "yopmail.com", "temp-mail.org", "10minutemail.com"]) {
      expect(usaEGetta(d), d).toBe(true);
    }
    const e = controllaFormato("prova@mailinator.com");
    expect(e.ok).toBe(false);
    expect(!e.ok && e.motivo).toBe("usa_e_getta");
  });

  test("il sottodominio non è una scappatoia", () => {
    // I servizi grossi ne regalano a manciate proprio per aggirare le liste.
    expect(usaEGetta("inbox.mailinator.com")).toBe(true);
    expect(usaEGetta("qualsiasi.cosa.yopmail.com")).toBe(true);
  });

  test("un dominio vero che contiene una parola sospetta NON è temporaneo", () => {
    // "tempmail.com" è nella lista, "tempmailitalia.it" è un altro dominio.
    expect(usaEGetta("tempmailitalia.it")).toBe(false);
    expect(usaEGetta("gmail.com")).toBe(false);
    expect(usaEGetta("libero.it")).toBe(false);
  });
});

test.describe("I refusi dei domini famosi", () => {
  test("una lettera sbagliata viene riconosciuta e corretta", () => {
    expect(refusoDominio("gmial.com")).toBe("gmail.com");
    expect(refusoDominio("gmai.com")).toBe("gmail.com");
    expect(refusoDominio("hotmial.com")).toBe("hotmail.com");
    expect(refusoDominio("libbero.it")).toBe("libero.it");
  });

  test("il suggerimento arriva già montato, pronto da premere", () => {
    const e = controllaFormato("trec.tun@gmial.com");
    expect(e.ok).toBe(false);
    expect(!e.ok && e.motivo).toBe("refuso");
    expect(!e.ok && e.suggerimento).toBe("trec.tun@gmail.com");
  });

  test("chi insiste passa: si propone, non si impone", () => {
    // Domini legittimi che assomigliano ai famosi esistono davvero.
    const e = controllaFormato("trec.tun@gmial.com", { insisto: true });
    expect(e.ok).toBe(true);
  });

  test("i domini famosi scritti bene non vengono 'corretti'", () => {
    for (const d of ["gmail.com", "libero.it", "outlook.it", "icloud.com", "proton.me"]) {
      expect(refusoDominio(d), d).toBe(null);
    }
  });

  test("un dominio aziendale qualsiasi non viene toccato", () => {
    // Il pericolo vero: 'correggere' l'indirizzo di lavoro di un cliente.
    for (const d of ["artecai.it", "studio-rossi.it", "azienda.example.com"]) {
      expect(refusoDominio(d), d).toBe(null);
    }
  });
});

test.describe("Il controllo è uno solo per tutto il sito", () => {
  test("nessuno usa più la vecchia regex permissiva", () => {
    /* Era copiata in cinque punti. Il rischio non è la copia in sé: è
       che qualcuno domani ne aggiunga una sesta e il buco rientri dalla
       finestra proprio nel punto nuovo. */
    const sorgenti = [
      "app/api/verifica/email/route.ts",
      "app/api/iscriviti/route.ts",
      "app/entra/azioni.ts",
      "components/verifica/Risultato.tsx",
    ];
    for (const f of sorgenti) {
      const testo = leggi(f);
      const righe = testo
        .split("\n")
        .filter((r) => r.includes("[^\\s@]+@") && !r.trim().startsWith("*"));
      expect(righe, `${f} usa ancora il controllo permissivo`).toEqual([]);
    }
  });

  test("dove nasce l'account il cancello c'è", () => {
    // Ultima rete: qui l'utente auth viene creato davvero.
    const testo = leggi("lib/pratiche/pratiche.ts");
    expect(testo).toContain("controllaFormato");
    const i = testo.indexOf("controllaFormato(email");
    const j = testo.indexOf("auth.admin.createUser");
    expect(i, "il controllo deve stare PRIMA della creazione").toBeGreaterThan(0);
    expect(i).toBeLessThan(j);
  });

  test("il modulo del DNS sta fuori dal file che usa il browser", () => {
    /* `node:dns` dentro indirizzo.ts finirebbe nel bundle del client e
       romperebbe la build: la separazione è strutturale, non estetica. */
    expect(leggi("lib/email/indirizzo.ts")).not.toContain("node:dns");
    expect(leggi("lib/email/dominio.ts")).toContain("node:dns");
  });
});
