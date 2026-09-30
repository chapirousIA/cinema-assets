---
name: motion-graphics
description: Cria vídeos de motion graphics (MP4) escrevendo a animação como código HTML/CSS/SVG/GSAP e renderizando quadro a quadro com Playwright + ffmpeg. Use quando pedirem vídeo, reels, story, anúncio animado, vinheta, abertura, explainer, tipografia animada, showreel ou "motion" para o escritório Fábio Pedrosa Advogados.
---

# Motion graphics: HTML → quadros → MP4

O vídeo **não é gerado por IA de vídeo**: você escreve uma cena em código capaz de desenhar
qualquer instante `t` e o renderizador captura cada quadro e codifica com ffmpeg. Tudo é
determinístico, reprodutível e editável.

## Fluxo obrigatório

1. **Briefing mínimo** (pergunte só o que faltar): objetivo/CTA, formato (9x16 Reels/Stories,
   4x5 feed, 1x1, 16x9 YouTube/LinkedIn), duração (6–15 s para social), texto aprovado.
2. **Roteiro em tabela** antes de codar: `tempo | cena | texto na tela | movimento`.
   Máx. ~7 palavras por tela; cada tela visível ≥ 1,5 s depois de terminar a entrada.
3. **Criar cena**: `npm run new-scene -- <nome> 9x16 10` → `motion/scenes/<nome>.html`.
   Use `motion/scenes/exemplo-transacao.html` como referência de qualidade.
4. **QA visual antes do render** (sempre):
   `npm run sheet -- motion/scenes/<nome>.html` → abra `motion/out/<nome>_sheet.png` com Read.
   Para instantes específicos: `npm run render -- motion/scenes/<nome>.html --stills 0.5,2,4.2`.
   Corrija sobreposição, texto cortado, contraste, áreas vazias, margens de segurança.
5. **Prévia rápida** (opcional): `npm run draft -- motion/scenes/<nome>.html`.
6. **Render final**: `npm run render -- motion/scenes/<nome>.html [--audio trilha.mp3]`
   → `motion/out/<nome>.mp4` (H.264, yuv420p, faststart; 30 fps).
   Extraia 1–2 quadros do MP4 para conferir (ffmpeg em `node_modules/ffmpeg-static/ffmpeg`).
7. Entregue com `SendUserFile` e a legenda sugerida para post (sem promessa de resultado).

## Contrato da cena (o renderizador depende disso)

```js
import { gsap } from '/node_modules/gsap/index.js';
import { defineScene, prog, ease, lerp, rng } from '/motion/lib/scene.js';
const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });
// ... tweens posicionados em tempo absoluto: tl.from(el, {...}, 1.2)
defineScene({ width: 1080, height: 1920, fps: 30, timeline: tl, render: (t) => { /* canvas/SVG */ } });
```

- `window.seek(t)` precisa produzir **exatamente** o mesmo quadro sempre.
  **Proibido**: `Date.now()`, `performance.now()`, `setTimeout`, `requestAnimationFrame`
  dirigindo animação, CSS `animation`/`transition`, `Math.random()` (use `rng(seed)`),
  vídeos `<video>` tocando sozinhos.
- Animação via timeline GSAP pausada (posições absolutas em segundos) e/ou `render(t)`.
- Sem CDN externo: fontes e libs vêm de `/node_modules` (servidor local). Imagens do
  repositório por caminho absoluto (`/refs/...`). Se carregar assets assíncronos, exponha
  `window.__ready = Promise`.
- Prévia no navegador: `npm run preview` → `/motion/scenes/<nome>.html?play` ou `?t=3.2`.

## Direção de arte (identidade do escritório)

Tokens em `motion/lib/brand.css`: navy `#0F2C3C`, terracota `#B97047`, laranja `#E8631C`
(CTA/destaque, com parcimônia), creme `#F3ECE4`. Tipografia: **Newsreader** (títulos,
itálico terracota para ênfase) + **Outfit** (apoio, kickers em caixa-alta espaçada).
Estética high-ticket: muito respiro, 1 ideia por tela, linhas finas, ondas sutis (símbolo).

Princípios de movimento que separam motion "profissional" de slide animado:
- Easing sempre (`expo.out`/`power3.out` para entradas, `power2.in` para saídas). Nunca linear em UI.
- **Stagger** em palavras/itens (0,06–0,12 s); entradas de 0,6–1,1 s; saídas mais curtas que entradas.
- Fundo vivo e discreto (parallax, ondas, grão) para nunca haver quadro estático.
- Transições com intenção (máscara, wipe, deslocamento contínuo), não só fade.
- Hierarquia: kicker → título → apoio → CTA. Contraste mínimo AA para texto.
- Margens de segurança 9x16: nada essencial nos 250 px de cima e 350 px de baixo (UI do app).

## Compliance (OAB — Provimento 205/2021)

Conteúdo informativo, sóbrio, sem promessa de resultado, sem percentuais de desconto
"garantidos", sem captação mercantilista ou comparação com colegas. Cite base legal
correta (ex.: Lei nº 13.988/2020; editais/portarias PGFN) e **não invente números**.
Inclua aviso curto quando falar de benefícios ("condições dependem de edital/portaria
vigente e análise do caso").

## Referência de desempenho (container 4 vCPU)

11,2 s em 1080×1920: `render` ≈ 55 s, `draft` ≈ 21 s, `sheet` ≈ 10 s.
Opções: `--fps 60`, `--scale 2` (saída em resolução dobrada, ex.: 4K), `--from/--to`, `--crf`, `--workers`, `--preset`.
