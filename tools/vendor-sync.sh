#!/usr/bin/env bash
# Copia GSAP, Three.js e fontes da marca (de node_modules) para assets/ de cada projeto HyperFrames.
# A CDN (jsdelivr) é bloqueada no container e libs locais deixam o render determinístico.
#   tools/vendor-sync.sh [pasta_do_projeto ...]   (sem argumentos: todos os projetos do repositório)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; NM="$ROOT/node_modules"
[ -d "$NM/three" ] || { echo "rode npm install primeiro"; exit 1; }
if [ $# -eq 0 ]; then mapfile -t projs < <(find "$ROOT/clientes" "$ROOT/videos" -name hyperframes.json -not -path "*/node_modules/*" -printf '%h\n' 2>/dev/null); else projs=("$@"); fi
for p in "${projs[@]}"; do
  mkdir -p "$p/assets/vendor" "$p/assets/fonts"
  cp "$NM/gsap/dist/gsap.min.js" "$NM/three/build/three.module.js" "$NM/three/build/three.core.js" "$p/assets/vendor/"
  rm -rf "$p/assets/vendor/three-addons"; cp -r "$NM/three/examples/jsm" "$p/assets/vendor/three-addons"
  for f in newsreader/files/newsreader-latin-{400,600}-{normal,italic} outfit/files/outfit-latin-{300,400,600}-normal inter/files/inter-latin-{400,600}-normal; do
    cp "$NM/@fontsource/$f.woff2" "$p/assets/fonts/"
  done
  echo "✓ vendor → ${p#$ROOT/}"
done
