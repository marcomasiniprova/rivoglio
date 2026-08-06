# ATTENZIONE: questo NON e' uno script batch, nonostante l'estensione .cmd
# L'hook verify-gate.js legge questo file, prende la PRIMA riga non commentata
# e la passa a PowerShell come comando singolo. Le righe con # sono commenti.
# Quindi qui ci va UNA riga sola. La logica vera sta in .claude\verify.ps1
& '.\.claude\verify.ps1'
