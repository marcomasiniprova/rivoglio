#!/bin/bash
# ────────────────────────────────────────────────────────────────────────
# RIALLINEA main a origin/main ALL'AVVIO DI OGNI SESSIONE (solo sul remoto).
#
# Perché esiste: nell'ambiente remoto (Claude Code sul web) il contenitore,
# quando si riavvia a metà sessione, riparte da una copia VECCHIA del repo.
# Il main locale resta fermo a un commit di giorni prima, mentre su GitHub
# c'è il lavoro vero: da lì i "file modificati" che non lo sono e il push
# rifiutato "non fast-forward". I commit non si perdono (sono su GitHub): è
# il locale a restare indietro. Questo hook riporta il locale all'ultimo
# main di GitHub, all'avvio, prima che l'agente cominci a lavorare.
#
# ⚠️ SOLO SUL REMOTO. Sul computer di Valerio non deve MAI resettare il suo
# main da solo: lì il bug non c'è e il reset sarebbe pericoloso.
#
# ⚠️ NON BUTTA VIA NIENTE. Riallinea solo se: c'è un remote; il lavoro è
# pulito; e il main locale è un ANTENATO di origin/main (sei indietro, non
# diverso). In ogni altro caso non tocca niente e lo dice.
# ────────────────────────────────────────────────────────────────────────
set -u

# Solo nell'ambiente remoto: sul locale non si tocca il git di nessuno.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
[ -z "$(git remote 2>/dev/null)" ] && exit 0

git fetch origin main --quiet 2>/dev/null || exit 0

local_ref=$(git rev-parse main 2>/dev/null) || exit 0
remote_ref=$(git rev-parse origin/main 2>/dev/null) || exit 0

# Già allineati: niente da fare.
[ "$local_ref" = "$remote_ref" ] && exit 0

# Lavoro non salvato: non rischio, avviso e basta.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[session-start] main è indietro rispetto a GitHub, ma ci sono modifiche non salvate: non tocco niente."
  exit 0
fi

# Solo se il locale è un antenato del remoto (indietro, non diverso).
if git merge-base --is-ancestor "$local_ref" "$remote_ref" 2>/dev/null; then
  git checkout main --quiet 2>/dev/null
  git reset --hard origin/main --quiet
  echo "[session-start] main riallineato a origin/main (${remote_ref:0:7})."
else
  echo "[session-start] ATTENZIONE: main locale è DIVERSO da origin/main (commit non spinti?). Non tocco niente."
fi
exit 0
