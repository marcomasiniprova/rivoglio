# ============================================================
#  verify.ps1 - il cancello. Se non passa, non e' "fatto".
#  Lanciato dall'hook verify-gate.js tramite .claude\verify.cmd
#  A mano:  powershell -NoProfile -ExecutionPolicy Bypass -File .claude\verify.ps1
#  Exit 0 = ok. Exit 1 = rotto.
#
#  DUE VELOCITA'
#  - senza argomenti  = VELOCE (tipi + lint). Gira a ogni fine turno.
#  - con -Completo    = TUTTO (tipi + lint + build + test Playwright).
#    Si lancia prima di dire "fatto" e prima di un commit o di un deploy.
#  Misurato il 6/8/2026 su questo progetto:
#    solo testo modificato ->  1,3 s
#    codice modificato     -> 15,3 s
#    -Completo             -> 68,7 s
#  Far girare il completo a OGNI turno costava 77 secondi a risposta: il
#  cancello diventava il collo di bottiglia invece della rete di sicurezza.
# ============================================================
param([switch]$Completo)
Set-Location (Join-Path $PSScriptRoot '..')
$fail = @()

Write-Host ""
Write-Host "[1/4] File di contesto presenti..."
foreach ($f in 'CLAUDE.md','STATO.md','SPEC.md','DECISIONI.md') {
  if (Test-Path $f) { Write-Host "   ok: $f" }
  else { Write-Host "   MANCA: $f"; $fail += "manca $f" }
}

Write-Host ""
Write-Host "[2/4] Nessun segreto committato..."
$tracciati = @(git ls-files) 2>$null
# I file di esempio (.env.example, .env.sample, .env.template) DEVONO stare in
# git: sono modelli vuoti, non segreti. Senza questa esclusione il cancello
# restava rosso per sempre su .env.example, bloccando ogni turno a vuoto.
$segreti = $tracciati | Where-Object {
  ($_ -match '(^|/)\.env($|\.)' -or $_ -match '\.(pem|key)$') -and
  ($_ -notmatch '\.(example|sample|template|dist)$')
}
if ($segreti) {
  foreach ($s in $segreti) { Write-Host "   ERRORE: segreto tracciato da git -> $s" }
  $fail += "segreti tracciati"
} else {
  Write-Host "   ok: nessun file di segreti tracciato"
}

Write-Host ""
Write-Host ("[3/4] Controlli sul codice (" + $(if ($Completo) { "COMPLETO" } else { "veloce" }) + ")...")
if (Test-Path 'package.json') {
  $pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json
  # In modo veloce salto i controlli sul codice se il codice non e' stato
  # toccato: se ho modificato solo STATO.md non ha senso far girare tsc.
  # In modo completo si controlla sempre tutto, senza scorciatoie.
  $saltaCodice = $false
  if (-not $Completo) {
    $modificati = @(git status --porcelain) | ForEach-Object { ($_ -replace '^..\s+', '') -replace '^.*-> ', '' }
    $codice = @($modificati | Where-Object { $_ -match '\.(ts|tsx|js|jsx|mjs|cjs|css|json)$' })
    if ($modificati.Count -gt 0 -and $codice.Count -eq 0) {
      $saltaCodice = $true
      Write-Host "   saltato: nessun file di codice modificato (solo testo/documenti)"
    }
  }
  if ($pkg.scripts -and -not $saltaCodice) {
    $passi = if ($Completo) { @('tipi','lint','build','prove') } else { @('tipi','lint') }
    foreach ($passo in $passi) {
      if (-not $pkg.scripts.$passo) { Write-Host "   saltato: nessuno script '$passo'"; continue }
      npm run $passo
      if ($LASTEXITCODE -ne 0) { Write-Host "   ERRORE: 'npm run $passo' fallito"; $fail += "npm run $passo" }
      else { Write-Host "   ok: $passo" }
    }
  } elseif (-not $saltaCodice) {
    Write-Host "   ERRORE: package.json senza script"; $fail += "script mancanti"
  }
} else {
  Write-Host "   saltato: nessun package.json ancora (fase spec)"
}

Write-Host ""
Write-Host "[4/4] SPEC.md compilata..."
if (Select-String -Path 'SPEC.md' -SimpleMatch 'NON ANCORA COMPILATA' -Quiet) {
  Write-Host "   nota: SPEC.md e' ancora uno stub (atteso in fase 0)"
} else {
  Write-Host "   ok: SPEC.md compilata"
}

Write-Host ""
if ($fail.Count -gt 0) {
  Write-Host "===== VERIFY FALLITO ====="
  foreach ($m in $fail) { Write-Host "  - $m" }
  exit 1
}
Write-Host "===== VERIFY OK ====="
exit 0
