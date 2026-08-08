# Vedere l'app di Rivoglio dal PC Windows

Guida passo passo, scritta l'8/08 per Valerio. Tutto quello che serve è
gratuito. Alla fine avrai un telefono Android finto (un "emulatore") che
gira dentro Windows, con dentro l'app di Rivoglio che si ricarica da sola
a ogni modifica: è così che lavorano gli sviluppatori veri.

## Regola zero: cosa si incolla nel terminale

Nel terminale si incollano **solo le righe dentro i riquadri di codice**,
una alla volta. I titoli e le frasi di questa guida non sono comandi: se
incolli "L'onda delle colonne" PowerShell risponde con un errore, ed è
normale, non è rotto niente.

Il terminale da usare è **PowerShell**: premi il tasto Windows, scrivi
`powershell`, premi Invio.

---

## Strada A: l'anteprima veloce (2 minuti, nessuna installazione)

Serve a vedere le schermate e i testi, non i gesti nativi. Va bene per
controllare copy e colori.

```powershell
cd C:\percorso\della\cartella\rivoglio\mobile
npm install
npx expo start --web
```

Si apre il browser con l'app dentro. Per fermarla: `Ctrl + C` nel
terminale.

> Al posto di `C:\percorso\della\cartella\rivoglio` metti la cartella dove
> hai il progetto. Trucco: apri la cartella in Esplora File, clicca sulla
> barra dell'indirizzo, copia, e incolla qui.

---

## Strada B: l'emulatore Android (quella vera, 30-40 minuti la prima volta)

Questa è l'anteprima seria: un telefono Android completo dentro il PC.

### 1. Installa Android Studio

Scaricalo da <https://developer.android.com/studio> (gratuito, circa 1 GB)
e installalo lasciando tutte le spunte come sono. Alla prima apertura
scarica da solo i componenti di base: lascialo finire.

### 2. Controlla i pezzi che servono

In Android Studio: **More Actions** (o il menu ☰) → **SDK Manager**.

- Scheda **SDK Platforms**: spunta l'ultima versione di Android
  (per esempio Android 15) e anche **Show Package Details** →
  **Android SDK Platform** e **Sources**.
- Scheda **SDK Tools**: spunta **Android SDK Build-Tools**,
  **Android Emulator** e **Android SDK Platform-Tools**.
- Premi **Apply** e aspetta il download.

### 3. Crea il telefono finto

**More Actions** → **Virtual Device Manager** → **Create Device** →
scegli **Pixel 7** (o qualunque Pixel) → **Next** → scarica l'immagine di
sistema proposta → **Finish**. Poi premi il tasto ▶ per accenderlo: dopo
un minuto vedi un telefono Android sullo schermo. **Lascialo acceso.**

### 4. Avvia l'app di Rivoglio

Torna in PowerShell:

```powershell
cd C:\percorso\della\cartella\rivoglio\mobile
npm install
npx expo start
```

Quando compare il codice QR e la scritta con le scorciatoie, premi il
tasto **`a`** (sta per Android). Da qui in poi fa tutto lui: installa
nell'emulatore la versione giusta di Expo Go per il nostro SDK 57, apre
l'app e la collega al PC. Ogni volta che tocchiamo il codice, la schermata
si aggiorna da sola.

Scorciatoie utili mentre gira: `r` ricarica l'app, `m` apre il menu di
sviluppo, `Ctrl + C` chiude tutto.

### 5. Le volte successive

Solo due comandi: accendi l'emulatore dal Virtual Device Manager, poi
`npx expo start` e il tasto `a`. Niente installazioni.

---

## Se qualcosa non va

- **`npx` o `npm` non riconosciuto**: manca Node.js. Installalo da
  <https://nodejs.org> (versione LTS), chiudi e riapri PowerShell.
- **Premi `a` e dice che non trova nessun dispositivo**: l'emulatore non
  è acceso, o si è acceso dopo. Accendilo, aspetta che mostri la
  schermata principale di Android, poi ripremi `a`.
- **Il telefono finto è lentissimo**: attiva la virtualizzazione nel BIOS
  (di solito si chiama Intel VT-x o AMD-V). Se non te la senti, resta
  sulla Strada A.

## E sull'iPhone?

Sul telefono vero, no: da maggio 2026 l'Expo Go dell'App Store è fermo
all'SDK 54 e noi siamo al 57. Per vedere l'app su un iPhone vero serve
TestFlight, che richiede l'account Apple Developer (99 dollari l'anno):
si fa quando l'app è pronta da provare fuori, non adesso. Il simulatore
iPhone invece esiste solo su Mac. Per lo sviluppo di tutti i giorni
l'emulatore Android della Strada B basta e avanza.
