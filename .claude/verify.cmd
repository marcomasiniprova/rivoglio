@echo off
REM ============================================================
REM  verify.cmd - il cancello. Se questo non passa, non e' "fatto".
REM  Uso:  .claude\verify.cmd
REM  Exit 0 = ok. Qualsiasi altro numero = rotto.
REM ============================================================
setlocal
cd /d "%~dp0.."
set FAIL=0

echo.
echo [1/4] File di contesto presenti...
for %%F in (CLAUDE.md STATO.md SPEC.md DECISIONI.md) do (
  if not exist "%%F" ( echo    MANCA: %%F & set FAIL=1 ) else ( echo    ok: %%F )
)

echo.
echo [2/4] Nessun segreto committato...
if exist ".env.local" (
  git ls-files --error-unmatch ".env.local" >nul 2>&1
  if not errorlevel 1 ( echo    ERRORE: .env.local e' tracciato da git & set FAIL=1 ) else ( echo    ok: .env.local ignorato )
) else ( echo    ok: nessun .env.local )

echo.
echo [3/4] Build / test dell'app...
if exist "package.json" (
  call npm run verify
  if errorlevel 1 ( echo    ERRORE: npm run verify fallito & set FAIL=1 )
) else ( echo    saltato: nessun package.json ancora - fase spec )

echo.
echo [4/4] SPEC.md compilata...
findstr /C:"NON ANCORA COMPILATA" SPEC.md >nul 2>&1
if not errorlevel 1 ( echo    ATTENZIONE: SPEC.md e' ancora uno stub ) else ( echo    ok: SPEC.md compilata )

echo.
if "%FAIL%"=="1" ( echo ===== VERIFY FALLITO ===== & exit /b 1 )
echo ===== VERIFY OK =====
exit /b 0
