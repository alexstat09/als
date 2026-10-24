#!/bin/bash
# crop-photo.sh ΦΩΤΟ [ΦΑΚΕΛΟΣ] [N=6] [ΣΤΡΟΦΗ=90|180|270]
#   Κόβει τη φωτογραφία του φυλλαδίου (iPhone JPG/HEIC) σε N οριζόντιες λωρίδες,
#   με μικρή επικάλυψη ώστε καμία γραμμή να μη μείνει κομμένη στη μέση.
#   Το μοντέλο διαβάζει ΜΙΑ φορά την καθεμία (Read), με τη σειρά.
#
#   ⚠️ iPhone: τα pixel είναι συχνά αποθηκευμένα ΠΛΑΓΙΑ με σημαία EXIF
#   (orientation 6/8/3). Το sips ΔΕΝ την εφαρμόζει μόνο του — αν κόψεις το RAW,
#   οι «λωρίδες» βγαίνουν κάθετες. Εδώ γυρίζει πρώτα σε όρθιο PNG (το PNG δεν
#   κουβαλάει EXIF, άρα κανένας viewer δεν το ξαναγυρίζει) και ΜΕΤΑ κόβει.
#   ⚠️ XXVI: pixel ΟΡΙΖΟΝΤΙΑ (5712×4284) ΧΩΡΙΣ EXIF — η σελίδα είναι όρθια, άρα τα pixel
#   είναι πλάγια. Χωρίς σημαία και με πλάτος > ύψος γυρίζει 90° (το σωστό στο XXVI)·
#   αν οι λωρίδες βγουν ανάποδα, δώσε 4ο όρισμα 270.
#   ⚠️ sips -c ΥΨΟΣ ΠΛΑΤΟΣ --cropOffset Y X  (πρώτα το ύψος, πρώτα το Y).
set -euo pipefail
IMG="${1:?χρήση: crop-photo.sh ΦΩΤΟ [ΦΑΚΕΛΟΣ] [N]}"
OUT="${2:-${TMPDIR:-/tmp}/latinika-photo}"
N="${3:-6}"
mkdir -p "$OUT"
num() { sips -g "$1" "$2" | awk -v k="$1" '$1==k":"{print $2}'; }
UP="$OUT/upright.png"
sips -s format png "$IMG" --out "$UP" >/dev/null
o="$(num orientation "$IMG" || true)"
case "$o" in
  3) sips -r 180 "$UP" >/dev/null ;;
  6) sips -r 90  "$UP" >/dev/null ;;
  8) sips -r 270 "$UP" >/dev/null ;;
  *) W0="$(num pixelWidth "$UP")"; H0="$(num pixelHeight "$UP")"
     if [ -n "${4:-}" ]; then sips -r "$4" "$UP" >/dev/null
     elif [ "$W0" -gt "$H0" ]; then sips -r 90 "$UP" >/dev/null; o="— · πλάγια pixel → 90° (ανάποδα; 4ο όρισμα 270)"; fi ;;
esac
W="$(num pixelWidth "$UP")"; H="$(num pixelHeight "$UP")"
STEP=$(( H / N )); OV=$(( STEP / 10 ))
echo "όρθια: ${W}×${H} (EXIF orientation: ${o:-—}) → $N λωρίδες ~$(( STEP + OV ))px, επικάλυψη ${OV}px"
for i in $(seq 0 $(( N - 1 ))); do
  Y=$(( i * STEP - (i > 0 ? OV : 0) ))
  [ "$Y" -lt 0 ] && Y=0
  HH=$(( STEP + (i > 0 ? OV : 0) + (i < N - 1 ? OV : 0) ))
  [ $(( Y + HH )) -gt "$H" ] && HH=$(( H - Y ))
  F="$OUT/strip-$(( i + 1 )).png"
  sips -c "$HH" "$W" --cropOffset "$Y" 0 "$UP" --out "$F" >/dev/null
  sips -Z 1600 "$F" >/dev/null          # μεγαλύτερο από αυτό το κόβει έτσι κι αλλιώς το μοντέλο
  echo "  $F   (y=$Y, h=$HH)"
done
rm -f "$UP"
