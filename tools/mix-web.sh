#!/usr/bin/env bash
# Mixagem calma para web: música + (opcional) efeitos sempre abaixo da música, normalizado a -16 LUFS.
#   tools/mix-web.sh video.mp4 musica.mp3 saida.mp4 [sfx.wav] [ganho_musica_db=-3] [ganho_sfx_db=-12]
set -euo pipefail
v="$1"; m="$2"; out="$3"; sfx="${4:-}"; gm="${5:--3}"; gs="${6:--12}"
if [ -n "$sfx" ]; then
  f="[1:a]volume=${gm}dB[m];[2:a]volume=${gs}dB[s];[m][s]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]"
  ffmpeg -y -loglevel error -i "$v" -i "$m" -i "$sfx" -filter_complex "$f" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$out"
else
  ffmpeg -y -loglevel error -i "$v" -i "$m" -filter_complex "[1:a]volume=${gm}dB,loudnorm=I=-16:TP=-1.5:LRA=11[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$out"
fi
echo "✓ $out"
