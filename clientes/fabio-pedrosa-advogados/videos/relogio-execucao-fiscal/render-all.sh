#!/usr/bin/env bash
# Renderiza 2 aberturas × 2 formatos, normaliza áudio (−14 LUFS, −1 dBTP) e mede quadros congelados.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders
norm() {  # loudnorm em 2 passadas, vídeo copiado
  local in="$1" out="$2" J
  J=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -y -loglevel error -i "$in" -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
}
for fmt in 9x16 16x9; do
  dir=.; [ "$fmt" = 16x9 ] && dir=16x9
  for hook in A B; do
    raw="$PWD/renders/raw_${fmt}_${hook}.mp4"; out="$PWD/renders/fp_relogio-execucao-fiscal_hook${hook}_${fmt}.mp4"
    (cd "$dir" && npx hyperframes render --fps 60 -q delivery --variables "{\"hook\":\"$hook\"}" -o "$raw" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "MB ·|rror" | tail -1)
    norm "$raw" "$out" && rm -f "$raw"
    echo "✓ $(basename "$out") | $(../../../../tools/frozen-metric.sh "$out" | tail -1)"
  done
done
