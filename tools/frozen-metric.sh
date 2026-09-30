#!/usr/bin/env bash
# Mede quanto do vídeo está "congelado" (quase nada se move), métrica do gauntlet loop.
#   tools/frozen-metric.sh video.mp4 [limiar_ruido=0.003] [duracao_min=0.4]
# Saída: trechos congelados (início–fim) e % do total. Meta sugerida: < 10% e nenhum trecho > 1,2 s
# fora de telas de leitura intencionais (ex.: CTA final).
set -euo pipefail
in="$1"; N="${2:-0.003}"; D="${3:-0.4}"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
ffmpeg -hide_banner -i "$in" -vf "freezedetect=n=${N}:d=${D}" -map 0:v:0 -f null - 2>&1 \
 | grep -oE "freeze_(start|end): [0-9.]+" | awk -v dur="$dur" '
   /start/ {s=$2} /end/ {e=$2; t+=e-s; printf "  congelado %6.2fs → %6.2fs  (%.2fs)\n", s, e, e-s; s=""}
   END { if (s!="") { t+=dur-s; printf "  congelado %6.2fs → fim      (%.2fs)\n", s, dur-s }
         printf "Total congelado: %.2fs de %.2fs = %.1f%%\n", t, dur, 100*t/dur }'
