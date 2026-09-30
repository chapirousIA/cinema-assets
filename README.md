# cinema-assets
Public CDN for AI video pipeline reference images (Pipeline C — modules/video-cinematico/)

## Motion graphics (`motion/`)

Vídeos escritos como código e renderizados de forma determinística (HTML → Playwright → ffmpeg).

```bash
npm install
npm run new-scene -- minha-cena 9x16 10
npm run sheet  -- motion/scenes/minha-cena.html   # QA visual
npm run render -- motion/scenes/minha-cena.html   # motion/out/minha-cena.mp4
```

Detalhes e boas práticas: `.claude/skills/motion-graphics/SKILL.md`.
