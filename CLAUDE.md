# cinema-assets

Três funções:
1. **CDN pública** de imagens de referência do pipeline de vídeo IA (`frames/`, `refs/`) — não renomear nem apagar arquivos existentes (URLs em uso).
2. **Agência de vídeo com IA** (`clientes/`, `tools/`): vídeos de nível estúdio escritos em código com **HyperFrames** (HTML + GSAP → MP4), **Three.js** (3D), footage de apoio via **Replicate**, trilha via **ElevenLabs** e crítico independente (gauntlet loop).
3. **Alternativa leve** (`motion/`): renderizador próprio Playwright + ffmpeg para peças 2D simples.

## Para qualquer pedido de vídeo
Siga a skill **`video-agencia`** (`.claude/skills/video-agencia/SKILL.md`) — processo, padrão de qualidade e compliance OAB.
Sintaxe de composição: skills oficiais `/hyperframes`, `/hyperframes-core`, `/hyperframes-animation` (instaladas em `~/.claude/skills` pelo hook).

## Estrutura
- `clientes/<cliente>/` — `brief.md`, `brand/`, `footage/` (mídia pesada fora do git), `refs/`, `videos/<projeto-hyperframes>/`
- `clientes/_modelo/` — molde de cliente novo
- `clientes/fabio-pedrosa-advogados/videos/exemplo-camadas-debito/` — exemplo 3D validado (9:16, 60 fps)
- `tools/` — `new-video.sh`, `vendor-sync.sh`, `replicate-gen.mjs`, `conform-clip.sh`, `frozen-metric.sh`, `elevenlabs-music.mjs`, `mix-web.sh`
- `docs/hermes-agencia.md` — operação contínua (Hermes no Telegram ou n8n com aprovação)

## Comandos
- `tools/new-video.sh <cliente> <nome> [portrait|landscape|square]` — novo projeto com libs/fontes locais
- No projeto: `npx hyperframes check` · `npx hyperframes snapshot --frames 12` (ler contact-sheet) · `npx hyperframes render --fps 60 -q delivery`
- `tools/frozen-metric.sh <mp4>` — % de quadros congelados
- `node tools/replicate-gen.mjs check|image|video|redo` — requer `REPLICATE_API_TOKEN`
- `node tools/elevenlabs-music.mjs "<prompt>" --seconds N --out x.mp3` — requer `ELEVENLABS_API_KEY`

## Alternativa leve (`motion/`)
`npm run motion:new -- <nome> 9x16 10` · `npm run motion:sheet -- motion/scenes/<nome>.html` · `npm run motion:render -- motion/scenes/<nome>.html`
Contrato: `defineScene()` / `window.seek(t)` em `motion/lib/scene.js`; marca em `motion/lib/brand.css`.

## Ambiente (container web)
- CDNs (jsdelivr etc.) são bloqueadas: use sempre as cópias locais em `assets/vendor` e `assets/fonts` (`tools/vendor-sync.sh`).
- Hook SessionStart instala ffmpeg (apt), deps npm, Chrome headless do HyperFrames e as skills oficiais.
- Playwright 1.56.1 fixado para o Chromium de `/opt/pw-browsers` (não rodar `playwright install`).
- Replicate/ElevenLabs/Telegram exigem liberar os domínios na política de rede do ambiente e chaves como variáveis de ambiente.
