#!/usr/bin/env bash
# Padroniza um clipe gerado por IA para casar com o resto do vídeo:
# upscale (lanczos) + interpolação de movimento para 60 fps, sem áudio, H.264 yuv420p.
#   tools/conform-clip.sh entrada.mp4 [saida.mp4] [largura=1080] [altura=1920] [fps=60]
# Obs.: interpolação (minterpolate) pode gerar artefatos em cortes/movimentos rápidos — confira os quadros.
set -euo pipefail
in="$1"; out="${2:-${1%.*}_conform.mp4}"; W="${3:-1080}"; H="${4:-1920}"; FPS="${5:-60}"
ffmpeg -y -loglevel error -i "$in" -an \
  -vf "scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -movflags +faststart "$out"
echo "✓ $out ($(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$out"))"
