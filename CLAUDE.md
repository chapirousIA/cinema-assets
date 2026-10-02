# cinema-assets

Três funções:
1. **CDN pública** de imagens de referência do pipeline de vídeo IA (`frames/`, `refs/`) — não renomear nem apagar arquivos existentes (URLs em uso).
2. **Agência de vídeo com IA** (`clientes/`, `tools/`): vídeos de nível estúdio escritos em código com **HyperFrames** (HTML + GSAP → MP4), **Three.js** (3D), footage de apoio via **Replicate**, trilha via **ElevenLabs** e crítico independente (gauntlet loop).
3. **Alternativa leve** (`motion/`): renderizador próprio Playwright + ffmpeg para peças 2D simples.

## Para qualquer pedido de vídeo
Siga a skill **`video-agencia`** (`.claude/skills/video-agencia/SKILL.md`) — processo, padrão de qualidade e compliance OAB.
Produção recorrente (5 Reels/semana): equipe de agentes em `.claude/agents/` (`pauta-roteiro`, `revisor-oab`, `diretor-storyboard`, `critico-qa`, `legenda-distribuicao`) — fluxo, portões humanos e orçamento em `docs/equipe-agentes-instagram.md`.
Sintaxe de composição: skills oficiais `/hyperframes`, `/hyperframes-core`, `/hyperframes-animation` (plugin `hyperframes@hyperframes`).

Outros kits instalados:
- **Remotion** (vídeo em React): skills `remotion-*` em `.claude/skills` (`npx skills add remotion-dev/skills`, lock em `skills-lock.json`).
- **Claude Animation** (2D com aparência desenhada, sem navegador): plugin `claude-animation@claude-animation-skill`.
- Repositórios de referência (não versionados): `repos/` — PDoomVideo, ClaudeAnimationBase, claude-animation-skill, hyperframes, Battle-of-Austerlitz-Film, awesome-ai-motion, awesome-opus-5-5-videos.

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
- Hook SessionStart instala ffmpeg (apt), deps npm, Chrome headless do HyperFrames e reinstala os plugins declarados em `.claude/settings.json` (escopo de usuário some ao reciclar o container).
- CLI `hyperframes` fixado em 0.8.107, mesma versão do plugin.
- Playwright 1.56.1 fixado para o Chromium de `/opt/pw-browsers` (não rodar `playwright install`).
- Replicate/ElevenLabs/Telegram exigem liberar os domínios na política de rede do ambiente e chaves como variáveis de ambiente.
