# Agenti di progetto

Assistenti specializzati per MicroStay Alert. Un agente serve quando un lavoro
è lungo, ripetitivo e produce molto rumore: l'agente lo fa in una sua finestra
di contesto e torna solo con la conclusione.

Formato: un file `.md` per agente, con frontmatter:

```
---
name: nome-agente
description: Usa quando <situazione>.
tools: Read, Grep, Glob, WebSearch
model: sonnet
---

Istruzioni per l'agente.
```

Candidati per questo progetto (da creare quando servono davvero, non prima):
- `verifica-offerta` — controlla che un deal sia reale e prenotabile
- `ricerca-mercato` — cerca dati/fonti su turismo Italia e li riporta con link
