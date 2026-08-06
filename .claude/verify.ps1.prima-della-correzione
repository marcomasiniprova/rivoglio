# ============================================================
#  verify.ps1 - il cancello. Se non passa, non e' "fatto".
#  Lanciato dall'hook verify-gate.js tramite .claude\verify.cmd
#  A mano:  powershell -NoProfile -ExecutionPolicy Bypass -File .claude\verify.ps1
#  Exit 0 = ok. Exit 1 = rotto.
# ============================================================
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
$segreti = $tracciati | Where-Object { $_ -match '(^|/)\.env($|\.)' -or $_ -match '\.(pem|key)$' }
if ($segreti) {
  foreach ($s in $segreti) { Write-Host "   ERRORE: segreto tracciato da git -> $s" }
  $fail += "segreti tracciati"
} else {
  Write-Host "   ok: nessun file di segreti tracciato"
}

Write-Host ""
Write-Host "[3/4] Build e test dell'app..."
if (Test-Path 'package.json') {
  $pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json
  if ($pkg.scripts -and $pkg.scripts.verify) {
    npm run verify
    if ($LASTEXITCODE -ne 0) { Write-Host "   ERRORE: 'npm run verify' fallito"; $fail += "npm run verify" }
    else { Write-Host "   ok: npm run verify passato" }
  } else {
    Write-Host "   ERRORE: package.json senza script 'verify'"; $fail += "script verify mancante"
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
