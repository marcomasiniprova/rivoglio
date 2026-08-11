#!/bin/bash
# L'ATTACCO AL MURO: provo a fare un check gratis in tutti i modi.
# Ogni riga deve dire OK. Una sola KO e' un buco.
S=http://localhost:3210
J='Content-Type: application/json'
VOLO='{"volo":"ZZ250","data":"2026-03-12"}'
ko=0

prova() { # nome, atteso, ottenuto
  if [ "$2" = "$3" ]; then printf "  OK   %-58s (%s)\n" "$1" "$3"
  else printf "  KO   %-58s atteso %s, ottenuto %s\n" "$1" "$2" "$3"; ko=$((ko+1)); fi
}

echo "── LA PORTA PRINCIPALE ────────────────────────────────────────────"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica -H "$J" -d "$VOLO")
prova "il check senza ricevuta" 402 "$c"

echo "── LE TRE PORTE DI SERVIZIO ───────────────────────────────────────"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica/cancellato -H "$J" \
  -d '{"volo":"ZZ250","data":"2026-03-12","preavviso":"meno7","alternativa":"oltre4"}')
prova "volo cancellato, rotta diretta" 402 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica/dichiara -H "$J" \
  -d '{"volo":"ZZ250","data":"2026-03-12","caso":"negato","presenza":"si","volonta":"no"}')
prova "negato imbarco, rotta diretta" 402 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica/operativo -H "$J" \
  -d '{"volo":"ZZ250","data":"2026-03-12","vettore":"FR"}')
prova "codeshare, rotta diretta" 402 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/leggi-carta -H "$J" \
  -d '{"immagine":"iVBORw0KGgo=","tipo":"image/png"}')
prova "lettura carta d'imbarco (costa Mistral)" 402 "$c"

echo "── UNA VERIFICA INVENTATA APRE LE PORTE DI SERVIZIO? ──────────────"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica/cancellato -H "$J" \
  -d '{"volo":"ZZ250","data":"2026-03-12","verificaId":"00000000-0000-4000-8000-000000000000","preavviso":"meno7","alternativa":"oltre4"}')
prova "id di verifica inventato" 402 "$c"

echo "── LA RICERCA PER TRATTA REGALA L'ATTERRAGGIO? ────────────────────"
r=$(curl -sS -m 20 "$S/api/voli-tratta?da=BGY&a=ACE&data=2026-03-12")
if echo "$r" | grep -q '"arrivoEffettivoOra":"[0-9]'; then
  prova "orario di atterraggio nell'elenco" "assente" "PRESENTE"; else
  prova "orario di atterraggio nell'elenco" "assente" "assente"; fi
h=$(curl -sS -m 20 -D - -o /dev/null "$S/api/voli-tratta?da=BGY&a=ACE&data=2026-03-12" | tr -d '\r')
echo "$h" | grep -qi 's-maxage' && prova "la cache della rete e' accesa" "si" "si" || prova "la cache della rete e' accesa" "si" "NO"

echo "── LE RICEVUTE FALSE ──────────────────────────────────────────────"
for finta in "inventata" "eyJyIjoxfQ.xxxx" "..." "a.b.c"; do
  c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST $S/api/verifica -H "$J" \
    -H "Cookie: rivolio_check=$finta" -d "$VOLO")
  prova "ricevuta falsa: ${finta:0:16}" 402 "$c"
done

echo "── LA CASSA DI PROVA ──────────────────────────────────────────────"
c=$(curl -sS -o /dev/null -w '%{http_code}' "$S/cassa-prova")
prova "la pagina della cassa senza chiave" 404 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$S/api/check/prova")
prova "emettere una ricevuta senza chiave" 404 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' "$S/api/check/prova/chiave?s=sbagliata")
prova "prendere la chiave con la parola sbagliata" 404 "$c"
c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$S/api/check/prova" -H "Cookie: rivolio_prova=inventata")
prova "emettere una ricevuta con chiave falsa" 404 "$c"

echo "── E ADESSO CHI PAGA DAVVERO ──────────────────────────────────────"
rm -f /tmp/b.txt
curl -sS -c /tmp/b.txt -o /dev/null "$S/api/check/prova/chiave?s=RIVOLIO"
curl -sS -b /tmp/b.txt -c /tmp/b.txt -o /dev/null -X POST "$S/api/check/prova"
grep -q rivolio_check /tmp/b.txt && echo "  OK   la ricevuta e' arrivata nel cookie" || { echo "  KO   nessuna ricevuta"; ko=$((ko+1)); }
c=$(curl -sS -b /tmp/b.txt -c /tmp/b.txt -o /dev/null -w '%{http_code}' -X POST $S/api/verifica -H "$J" -d "$VOLO")
prova "il primo check, con la ricevuta" 200 "$c"
c=$(curl -sS -b /tmp/b.txt -o /dev/null -w '%{http_code}' -X POST $S/api/verifica -H "$J" -d "$VOLO")
prova "il secondo check, credito finito" 402 "$c"

echo
[ $ko -eq 0 ] && echo "NESSUN BUCO: $ko falliti" || echo "!!! $ko BUCHI TROVATI"
