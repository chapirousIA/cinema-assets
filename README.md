# cinema-assets
Public CDN for AI video pipeline reference images (Pipeline C — modules/video-cinematico/)

## Estúdio de vídeo com IA

Vídeos escritos em código e renderizados quadro a quadro: **HyperFrames** (HTML + GSAP → MP4), **Three.js** (3D),
**Replicate** (imagens/clipes de apoio), **ElevenLabs** (trilha) e revisão por crítico independente.

```bash
npm install                                   # o hook de sessão já faz isso na web
tools/new-video.sh <cliente> <video> portrait # cria clientes/<cliente>/videos/<video>
cd clientes/<cliente>/videos/<video>
npx hyperframes check && npx hyperframes snapshot --frames 12
npx hyperframes render --fps 60 -q delivery
```

Processo completo: `.claude/skills/video-agencia/SKILL.md` · operação contínua: `docs/hermes-agencia.md`.
Alternativa 2D leve: `motion/` (`npm run motion:render -- motion/scenes/<cena>.html`).
