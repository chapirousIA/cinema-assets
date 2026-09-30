#!/usr/bin/env bash
# Cria um projeto HyperFrames dentro da pasta do cliente, já com libs e fontes locais.
#   tools/new-video.sh <cliente> <nome-do-video> [portrait|landscape|square]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
c="$1"; n="$2"; res="${3:-portrait}"
[ -d "$ROOT/clientes/$c" ] || { cp -r "$ROOT/clientes/_modelo" "$ROOT/clientes/$c"; echo "✓ cliente novo: clientes/$c (preencha brief.md)"; }
mkdir -p "$ROOT/clientes/$c/videos"; cd "$ROOT/clientes/$c/videos"
HYPERFRAMES_SKIP_SKILLS=1 npx --no-install hyperframes init "$n" --non-interactive --resolution "$res" >/dev/null
# troca a GSAP da CDN pela cópia local
sed -i 's#<script src="https://cdn.jsdelivr.net/npm/gsap@[^"]*"></script>#<script src="assets/vendor/gsap.min.js"></script>#' "$n/index.html"
"$ROOT/tools/vendor-sync.sh" "$PWD/$n" >/dev/null
echo "✓ clientes/$c/videos/$n  →  cd até lá e siga a skill /video-agencia"
