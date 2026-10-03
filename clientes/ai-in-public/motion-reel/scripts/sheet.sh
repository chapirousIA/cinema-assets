#!/bin/sh
# contact sheet with frame numbers: sh scripts/sheet.sh out/sheet.jpg
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
ARGS=""; i=0; F=""
for f in out/stills/f*.jpg; do n=$(basename $f .jpg); ARGS="$ARGS -i $f"; F="$F[$i]scale=640:360,drawtext=fontfile=$FONT:text='$n':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v$i];"; i=$((i+1)); done
L=""; j=0; while [ $j -lt $i ]; do L="$L[v$j]"; j=$((j+1)); done
COLS=3; ROWS=$(( (i + COLS - 1) / COLS ))
ffmpeg -y -loglevel error $ARGS -filter_complex "${F}${L}xstack=inputs=$i:grid=${COLS}x${ROWS}:fill=black" -frames:v 1 "$1"
