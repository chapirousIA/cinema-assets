#!/usr/bin/env bash
# Folhas de revisão para o crítico: N quadros/s, blocos de 5 s (10×2), com carimbo de tempo em cada quadro.
#   tools/review-sheets.sh video.mp4 pasta_saida [fps=4]
set -euo pipefail
in="$1"; out="$2"; fps="${3:-4}"
mkdir -p "$out"; rm -f "$out"/sheet_*.png
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
font=$(fc-match -f '%{file}' sans 2>/dev/null || true)
txt=""; [ -n "$font" ] && txt=",drawtext=fontfile=${font}:text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6"
for start in $(seq 0 5 "${dur%.*}"); do
  ffmpeg -loglevel error -y -ss "$start" -t 5 -i "$in" \
    -vf "fps=${fps},scale=270:-1,setpts=PTS+${start}/TB${txt},tile=10x2:padding=4:color=black" \
    -frames:v 1 "$out/sheet_$(printf %02d "$start")s.png"
done
md5sum "$out"/sheet_*.png | awk '{print $1}' | sort | uniq -d | grep -q . && { echo "ERRO: folhas duplicadas"; exit 1; }
ls "$out"/sheet_*.png
