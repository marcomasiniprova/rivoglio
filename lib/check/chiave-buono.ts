/**
 * Dove il browser tiene DI RISERVA il buono analisi gratis guadagnato con
 * una recensione. Se il cookie firmato non arriva al server (Brave, cookie
 * ripuliti, salto fra schede), il check rimanda l'id da qui e il buono vale
 * lo stesso: la validità la decide sempre il registro nel database.
 *
 * Sta in un file suo, client-safe (nessun import di server), perché lo
 * leggono due componenti del browser (LasciaRecensione lo scrive,
 * SchedaCheck lo rimanda e lo cancella quando è speso): una chiave scritta
 * a mano in due punti diventa due chiavi diverse al primo refuso.
 */
export const CHIAVE_BUONO_LOCALE = "rivolio-buono";
