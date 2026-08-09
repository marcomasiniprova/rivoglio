/**
 * Un percorso interno sicuro dove rimandare l'utente dopo il login.
 *
 * Il parametro `poi` (dove tornare dopo essere entrati) arriva dall'URL,
 * quindi è scritto da chi manda il link, non da noi. Va trattato come
 * ostile. Due pericoli, non uno:
 *
 *  1. OPEN REDIRECT — `poi=//sito-cattivo.it` o `poi=/\sito-cattivo.it`
 *     (il browser normalizza il backslash in barra, quindi diventa `//`)
 *     ti sbatte fuori dopo il login, su un sito che imita il nostro.
 *  2. XSS — su una pagina il `poi` finisce dentro uno <script> come
 *     stringa (auth/conferma). Un `poi` con dentro `</script>` chiude il
 *     tag ed esegue codice. Per questo qui NON basta "inizia con /": si
 *     accettano solo i caratteri che un percorso interno vero contiene.
 *
 * Regola: barra iniziale singola, poi solo lettere, cifre, `/ _ . -`.
 * Niente `//`, niente `\`, niente `< > : "` o spazi. Tutto il resto → /app.
 * I nostri `poi` veri sono `/app`, `/pratica/<id>` e simili: ci stanno
 * dentro tutti. Il giorno che servisse un `?` nel percorso, si allarga qui,
 * in un punto solo.
 */
const PERCORSO_OK = /^\/[A-Za-z0-9/_.-]*$/;

export function percorsoInterno(grezzo: unknown, difetto = "/app"): string {
  if (typeof grezzo !== "string") return difetto;
  const p = grezzo.trim();
  if (!PERCORSO_OK.test(p)) return difetto;
  if (p.startsWith("//")) return difetto;
  return p;
}
