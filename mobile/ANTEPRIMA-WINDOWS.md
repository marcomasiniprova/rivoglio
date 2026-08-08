# Vedere l'app di Rivoglio dal PC Windows

Guida passo passo per Valerio, riscritta l'8/08 dopo il primo tentativo.
Tutto quello che serve è gratuito.

## Due cose da sapere prima di iniziare

**Il progetto sul tuo PC non c'è.** Lavoriamo su una repository in cloud:
il codice vive su GitHub, non sul tuo disco. Il primo passo è quindi
scaricarlo. È questo il pezzo che mancava.

**Nel terminale si incollano solo i riquadri di codice**, una riga alla
volta. I titoli di questa guida non sono comandi. E mai lavorare dentro
`C:\WINDOWS\system32`: è la cartella di sistema, Windows la protegge ed è
da lì che arrivano gli errori `EPERM` e `package.json does not exist`.

Il terminale da usare è **PowerShell**: tasto Windows, scrivi
`powershell`, Invio.

---

## FASE 1 — Portare il progetto sul PC (una volta sola)

### Passo 1.1 — Installa Git

```powershell
winget install --id Git.Git -e --source winget
```

Quando finisce, **chiudi PowerShell e riaprilo** (serve perché Windows si
accorga del comando nuovo).

### Passo 1.2 — Scarica il progetto

```powershell
cd $HOME
```

```powershell
git clone -b claude/saas-app-repo-analysis-ghehqa https://github.com/marcomasiniprova/viaggioancheio.git rivoglio
```

`$HOME` è la tua cartella utente: non devi scrivere il tuo nome, ci pensa
Windows. Alla fine avrai il progetto in `C:\Users\valer\rivoglio`.

> **Perché non dentro Documenti:** quella cartella di solito è
> sincronizzata da OneDrive, e Git non riesce a crearci dentro la
> cartella di lavoro (`could not create work tree dir`). La cartella
> utente non ha questo problema.

Se compare una finestra di GitHub che chiede l'accesso, entra col tuo
account: la repository è privata e serve il permesso.

> **Senza Git, se preferisci:** apri nel browser
> <https://github.com/marcomasiniprova/viaggioancheio/archive/refs/heads/claude/saas-app-repo-analysis-ghehqa.zip>,
> estrai lo ZIP in Documenti e rinomina la cartella estratta in
> `rivoglio`. Funziona uguale, ma per aggiornare dovrai riscaricare
> ogni volta.

---

## FASE 2 — L'anteprima veloce nel browser (2 minuti)

Serve a vedere schermate, testi e colori. Node.js ce l'hai già installato.

```powershell
cd $HOME\rivoglio\mobile
```

```powershell
npm install
```

(la prima volta ci mette qualche minuto: sta scaricando le librerie)

```powershell
npx expo start --web
```

Si apre il browser con l'app dentro. Per fermarla: `Ctrl + C` nel
terminale.

---

## FASE 3 — L'emulatore Android, l'anteprima vera (30-40 minuti la prima volta)

Un telefono Android completo dentro il PC, con i gesti veri e il
ricaricamento automatico a ogni modifica. È così che si sviluppa.

### 3.1 Installa Android Studio

Scaricalo da <https://developer.android.com/studio> (gratuito, circa 1 GB)
e installalo lasciando le spunte come sono. Alla prima apertura scarica da
solo i componenti di base: lascialo finire.

### 3.2 Controlla i pezzi che servono

In Android Studio: **More Actions** (o il menu ☰) → **SDK Manager**.

- Scheda **SDK Platforms**: spunta l'ultima versione di Android.
- Scheda **SDK Tools**: spunta **Android SDK Build-Tools**,
  **Android Emulator** e **Android SDK Platform-Tools**.
- **Apply**, e aspetta il download.

### 3.3 Crea il telefono finto

**More Actions** → **Virtual Device Manager** → **Create Device** →
**Pixel 7** → **Next** → scarica l'immagine di sistema proposta →
**Finish**. Premi ▶ e aspetta: dopo un minuto vedi un telefono Android
sullo schermo. **Lascialo acceso.**

### 3.4 Avvia l'app

```powershell
cd $HOME\rivoglio\mobile
```

```powershell
npx expo start
```

Quando compare il codice QR, premi il tasto **`a`** (sta per Android). Da
qui fa tutto lui: installa nell'emulatore la versione giusta di Expo Go
per il nostro SDK 57, apre l'app e la collega al PC.

Scorciatoie mentre gira: `r` ricarica, `m` apre il menu di sviluppo,
`Ctrl + C` chiude.

---

## Quando lavoriamo in cloud e vuoi le modifiche nuove

Due righe, ogni volta che ti dico che ho pushato:

```powershell
cd $HOME\rivoglio
```

```powershell
git pull
```

Poi torna in `mobile` e rilancia. Se `git pull` si lamenta di modifiche
locali, vuol dire che hai toccato dei file sul PC: dimmelo e lo
sistemiamo insieme.

---

## Se qualcosa non va

- **`git` non riconosciuto**: non hai chiuso e riaperto PowerShell dopo
  l'installazione. Fallo e riprova.
- **`npm error EPERM` o `package.json does not exist`**: sei nella
  cartella sbagliata (probabilmente `system32`). Rifai il `cd` della
  Fase 2 e guarda che il prompt mostri `...\rivoglio\mobile>`.
- **Premi `a` e dice che non trova dispositivi**: l'emulatore non è
  acceso. Accendilo, aspetta la schermata principale di Android, ripremi.
- **L'emulatore è lentissimo**: attiva la virtualizzazione nel BIOS
  (Intel VT-x o AMD-V). Se non te la senti, resta alla Fase 2.

## E sull'iPhone?

Sul telefono vero no: da maggio 2026 l'Expo Go dell'App Store è fermo
all'SDK 54 e noi siamo al 57. Servirebbe TestFlight, che richiede
l'account Apple Developer (99 dollari l'anno): si fa quando l'app è
pronta da far provare fuori, non adesso. Il simulatore iPhone esiste solo
su Mac. Per lo sviluppo di tutti i giorni l'emulatore Android basta.
