# cinema-assets

Duas funções:
1. **CDN pública** de imagens de referência do pipeline de vídeo IA (`frames/`, `refs/`) — não renomear nem apagar arquivos existentes (URLs em uso).
2. **Estúdio de motion graphics** em `motion/`: vídeos escritos como código (HTML/CSS/SVG/GSAP) e renderizados quadro a quadro com Playwright + ffmpeg.

Para qualquer pedido de vídeo/animação, siga a skill `.claude/skills/motion-graphics/SKILL.md`.

## Comandos
- `npm run new-scene -- <nome> [9x16|16x9|1x1|4x5] [s]` — cria cena a partir do molde
- `npm run sheet -- motion/scenes/<nome>.html` — grade de 12 quadros para QA (abrir com Read)
- `npm run draft -- motion/scenes/<nome>.html` — MP4 de prévia rápida
- `npm run render -- motion/scenes/<nome>.html [--audio x.mp3]` — MP4 final em `motion/out/`
- `npm run preview` — servidor local (`?play` / `?t=2.5`)

## Estrutura
- `motion/lib/scene.js` — contrato `defineScene` / `window.seek(t)` + easing/rng determinísticos
- `motion/lib/brand.css` — tokens de marca e fontes locais (@fontsource)
- `motion/scripts/render.mjs` — renderizador (workers paralelos, captura CDP, ffmpeg-static)
- `motion/scenes/` — cenas (versionadas); `motion/out/` — saídas (ignoradas pelo git)

Ambiente: Playwright 1.56.1 fixado para casar com o Chromium pré-instalado em `/opt/pw-browsers`
(não rodar `playwright install`); ffmpeg vem do pacote `ffmpeg-static`. O hook SessionStart roda `npm install`.
