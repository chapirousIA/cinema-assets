#!/bin/bash
# Prepara o pipeline de motion graphics em sessões do Claude Code na web.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
# npm install (e não ci) para aproveitar o cache do container entre sessões.
npm install --no-audit --no-fund --loglevel=error
# Playwright 1.56.1 usa o Chromium pré-instalado em /opt/pw-browsers (não baixar navegador).
