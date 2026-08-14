/**
 * Il cookie che porta l'id dell'ultima verifica, così l'indirizzo del
 * risultato può restare pulito (`/verifica` invece di `/verifica/<uuid>`).
 * Lo scrive /api/verifica su un check riuscito, lo legge app/verifica/page.tsx.
 *
 * Sta in un file suo, e non dentro la pagina, perché lo condividono una rotta
 * (server puro) e un componente di pagina (che tira dentro tutto il verdetto):
 * un nome solo, in un posto solo, senza far viaggiare l'uno nel bundle
 * dell'altro.
 */
export const COOKIE_ULTIMA_VERIFICA = "rivolio-ultima-verifica";

/** Quanto resta valido: un'ora, come la ripresa dopo la cassa. */
export const ULTIMA_VERIFICA_VALE_S = 60 * 60;
