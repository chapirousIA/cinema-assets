#!/bin/bash
# Prepara o estúdio de vídeo (HyperFrames + Three.js + ferramentas) em sessões do Claude Code na web.
set -uo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
log() { echo "[session-start] $*"; }

# 1. ffmpeg/ffprobe no PATH (exigidos pelo HyperFrames)
if ! command -v ffprobe >/dev/null; then
  log "instalando ffmpeg"
  (apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg) >/dev/null 2>&1 || log "AVISO: falha ao instalar ffmpeg"
fi

# 2. dependências npm (hyperframes, three, gsap, playwright, replicate, fontes)
npm install --no-audit --no-fund --loglevel=error || log "AVISO: npm install falhou"

# 3. Chrome headless do HyperFrames + telemetria off
npx --no-install hyperframes telemetry disable >/dev/null 2>&1 || true
npx --no-install hyperframes browser ensure >/dev/null 2>&1 || log "AVISO: hyperframes browser ensure falhou"

# 4. plugins (escopo do usuário some quando o container é reciclado; declarados em .claude/settings.json)
#    hyperframes@hyperframes (skills oficiais HyperFrames/GSAP) e claude-animation@claude-animation-skill
if command -v claude >/dev/null; then
  installed="$(claude plugin list 2>/dev/null)"
  for spec in "heygen-com/hyperframes hyperframes@hyperframes" "buildwithhanif/claude-animation-skill claude-animation@claude-animation-skill"; do
    set -- $spec
    if ! grep -q "$2" <<<"$installed"; then
      claude plugin marketplace add "$1" >/dev/null 2>&1; claude plugin install "$2" >/dev/null 2>&1 || log "AVISO: falha ao instalar plugin $2"
    fi
  done
fi
# skills do Remotion ficam versionadas em .claude/skills (npx skills add remotion-dev/skills; lock em skills-lock.json)

# 5. libs e fontes locais em cada projeto de vídeo (ignoradas pelo git)
tools/vendor-sync.sh >/dev/null 2>&1 || log "AVISO: vendor-sync falhou"
log "estúdio de vídeo pronto"
exit 0
