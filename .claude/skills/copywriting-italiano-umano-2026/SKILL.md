---
name: copywriting-italiano-umano-2026
description: Copywriting professionale in italiano, umano al 100%, mai robotico/AI-sounding — persuasione (Cialdini), leggibilità misurabile (Indice Gulpease), tono naturale italiano, zero jargon, zero pattern da "scritto con ChatGPT". Usa SEMPRE questa skill quando l'utente chiede di scrivere o riscrivere testi per un sito, landing page, email, annuncio, post — qualsiasi copy destinato a essere letto da persone italiane — anche se non usa la parola "copywriting" ma chiede di "sistemare i testi", "riscrivere la homepage", "rendere più convincente" un testo. Skill indipendente e separata da qualsiasi altra skill di copywriting nel sistema — non consultare altre skill con nome simile.
---

# Copywriting Italiano Umano 2026

Skill di copywriting persuasivo in italiano, verificata con fonti 2026 (Cialdini/Pre-Suasion, Indice Gulpease, Il Post su come si riconosce un testo scritto dall'AI, classici del direct response: Ogilvy, Schwartz, Sugarman, Halbert). Obiettivo: testi che un vero copywriter professionista italiano da 10.000€ firmerebbe — non testi che "si leggono bene", testi che **vendono restando umani**.

**Ambito**: SOLO il copy — le parole che l'utente legge. Non tocca layout, codice, struttura tecnica, SEO tecnica (per quello vedi la skill `visibility-full-stack-2026`, se presente nel progetto).

---

## 🛑 STEP 0 — Obbligatorio prima di scrivere anche una sola parola

Non iniziare mai a scrivere copy senza esserti fatto (e senza aver chiesto all'utente, se non è ovvio dal contesto) queste domande. Un copy scritto senza queste risposte è generico per definizione, indipendentemente da quanto sia "ben scritto".

1. **Chi è il lettore medio?** Età indicativa, che lavoro fa, quanto è esperto dell'argomento — non il "target" da slide di marketing, la persona vera.
2. **In che stato mentale/emotivo arriva su questa pagina?** Arrabbiato per un disservizio? Curioso e rilassato? Confuso e in cerca di aiuto? Scettico perché ha già provato altre soluzioni? Questo cambia tutto il tono.
3. **Dove e come legge questo testo?** Da mobile mentre cammina/aspetta (frasi corte, scannerizzabile) o da desktop con calma (può reggere più profondità)?
4. **Cosa deve fare subito dopo aver letto?** Un'unica azione chiara — se non sai rispondere a questo, il copy non ha un obiettivo e quindi non può funzionare.
5. **Cosa già sa e cosa non sa?** Non spiegare cose ovvie al lettore esperto, non dare per scontato cose che il lettore alle prime armi non conosce ancora.
6. **Cosa teme e cosa desidera davvero?** Non la versione razionale ("voglio risparmiare tempo") ma quella vera sotto ("ho paura di aver buttato via i miei diritti/i miei soldi").

Se il progetto ha già un brief o delle memorie su target/ICP, usa quelle invece di richiedere da capo — ma le 6 domande vanno comunque risolte esplicitamente, non saltate.

**Tono di default quando non specificato**: se l'utente non indica una preferenza di tono, calibra "via di mezzo" — caldo ma non sdolcinato, diretto ma non aggressivo — e lascia che le risposte alle 6 domande sopra affinino il tono verso il caso specifico (un messaggio di errore durante un pagamento avrà un tono più rassicurante di un post social di lancio, pur restando nello stesso brand).

**Su form, flussi e interfacce**: applica sempre anche `references/05-microcopy.md`, non solo i file sul copy lungo — bottoni, messaggi di errore e conferme sono spesso il punto dove un utente abbandona, e hanno regole diverse dal testo di una pagina.

---

## 🗺 Mappa dei layer

| File | Cosa contiene | Quando leggerlo |
|---|---|---|
| `references/01-psicologia-persuasione.md` | I 7 principi di Cialdini applicati al copy, AIDA/PAS, tecnica "voice of customer", i classici del direct response | Sempre, prima di scrivere la struttura del testo |
| `references/02-lingua-italiana-leggibilita.md` | Indice Gulpease (formula calcolabile), scelta tu/lei, lunghezza frasi/parole, jargon da evitare | Sempre, durante la scrittura e nella revisione finale |
| `references/03-suono-umano-non-ai.md` | Pattern esatti che tradiscono un testo scritto dall'AI in italiano, e cosa fare invece | Sempre, come ultimo filtro prima di consegnare |
| `references/04-processo-e-checklist.md` | Processo di scrittura passo-passo, checklist di autoverifica finale, esempio prima/dopo | Come guida operativa e controllo qualità finale |
| `references/05-microcopy.md` | Bottoni, messaggi di errore, stati vuoti, conferme, notifiche — regole diverse dal copy lungo | Sempre quando si lavora su UI/form/flussi, non solo su pagine testuali |

---

## 🔧 Workflow per Claude Code

1. **Rispondi alle 6 domande dello Step 0** per il progetto specifico (chiedi all'utente se non è chiaro dal contesto — una sola volta, non ad ogni pagina).
2. **Leggi `01-psicologia-persuasione.md`** e scegli la struttura persuasiva giusta per quel tipo di pagina (landing page, email, annuncio...).
3. **Scrivi la prima bozza.**
4. **Passa la bozza attraverso `02-lingua-italiana-leggibilita.md`**: calcola mentalmente/con la formula l'Indice Gulpease, accorcia frasi/parole troppo lunghe, sistema tu/lei.
5. **Passa la bozza attraverso `03-suono-umano-non-ai.md`**: elimina ogni pattern da "scritto con ChatGPT" — questo passaggio non è opzionale, è il motivo per cui questa skill esiste.
6. **[CONTROLLO MECCANICO OBBLIGATORIO, non un giudizio stilistico]** Prima di consegnare qualsiasi testo, cerca letteralmente il carattere — (trattino lungo) nel testo finale, carattere per carattere, come farebbe un linter. Se lo trovi anche una sola volta, riscrivi quella frase. Non fidarti della sensazione di "credo di non averlo usato": va verificato, non presunto. Questo vale per ogni consegna, senza eccezioni, anche per un singolo messaggio di errore di tre parole.
7. **Rileggi tutto il testo una volta come farebbe il lettore**, non come chi l'ha scritto: è coerente? È logico? Una frase contraddice quella prima? Il messaggio centrale si capisce dopo una lettura veloce?
8. **Se il task include bottoni/form/messaggi di sistema**, applica anche `05-microcopy.md` — sono regole diverse, non un "copy corto".
9. **Consegna solo il copy**, non toccare altro codice/struttura a meno che non sia esplicitamente richiesto.

Non serve chiedere conferma per ogni micro-scelta stilistica — questa skill ti dà l'autorità per decidere tu, come farebbe un copywriter professionista assunto per il lavoro. Chiedi conferma solo se manca un'informazione fattuale sul prodotto (prezzo, funzionalità, dati) che non puoi inventare.

---

## 🔄 Nota sulla freschezza

I pattern che "tradiscono" un testo AI cambiano ogni volta che i modelli vengono aggiornati (es. l'uso del trattino lungo era un segnale fortissimo nel 2024-2025, i modelli più recenti lo stanno correggendo su richiesta). Se sono passati mesi dall'ultimo aggiornamento di questa skill, vale la pena verificare se ci sono nuovi pattern riconoscibili prima di un progetto importante.
