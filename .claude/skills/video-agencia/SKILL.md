---
name: video-agencia
description: Fluxo completo da "agência de vídeo com IA" (método do artigo de @everestchris6) para produzir vídeos de motion graphics de nível estúdio em código — storyboard, componentes 3D em Three.js, footage de apoio via Replicate, crítico independente (gauntlet loop), trilha ElevenLabs e entrega em 2 aberturas × 2 formatos (9:16 e 16:9). Use para qualquer vídeo de cliente ou do escritório Fábio Pedrosa Advogados (Reels, anúncio, explicativo, vídeo de proposta, retainer mensal). Complementa as skills oficiais do HyperFrames (/hyperframes), que continuam sendo a referência técnica de composição.
---

# Agência de vídeo com IA — fluxo de produção

Motor: **HyperFrames** (HTML + GSAP → MP4, quadro a quadro). 3D: **Three.js**. Footage de apoio:
**Replicate** (imagem → clipe). Música: **ElevenLabs**. Qualidade: **gauntlet loop** (quem
constrói nunca julga o próprio trabalho).

Regras técnicas de composição: carregue `/hyperframes` e `/hyperframes-core` antes de escrever
HTML; `/hyperframes-animation` → `adapters/three.md` para 3D; `/hyperframes-audio` para mixagem.
Esta skill define **o processo e o padrão de qualidade**; as skills oficiais definem a sintaxe.

## 0. Entrada (pasta do cliente)

`clientes/<cliente>/` contém `brief.md`, `brand/`, `footage/` (aprovada), `refs/` e `videos/`.
Se `brief.md` estiver incompleto, pergunte **só o mínimo**: serviço, cliente final, CTA, área,
formatos. Nunca invente depoimento, avaliação, preço, economia, garantia ou resultado — use
placeholder `[[CLIENTE PREENCHE: ...]]` e avise.

Novo projeto: `tools/new-video.sh <cliente> <nome> portrait` (libs e fontes locais já copiadas).

## 1. Storyboard (antes de qualquer código)

Escreva `STORYBOARD.md` no projeto com uma tabela por plano:

| # | tempo | na tela | o que se move (principal + secundários) | segura | transição p/ próximo | fonte (footage real / 3D código / IA) |

Regras (padrões extraídos de 28 vídeos de estúdio):
- O objeto em primeiro plano **vira a transição** (título/logo avança na câmera e leva à cena seguinte).
- **Um objeto carrega a história** entre planos (um cartão, uma foto, um documento) — não slideshow.
- Sempre **um movimento principal** com movimentos menores sobrepostos.
- **Velocidade varia**: segura o suficiente para ler, sai rápido, desacelera na chegada.
- Cortes secos valem se **tamanho, direção e assunto** casam entre planos.
- Todo plano mostra **o que o negócio faz** (no tributário: inscrição → diagnóstico → modalidade → acordo/defesa → contato).
- Nenhum quadro vazio ou parado; cada plano já está indo para o próximo.

Mostre o storyboard ao usuário e ajuste antes de construir quando for vídeo novo de cliente.

## 2. Componentes que explicam (3D)

Cada peça 3D é construída, renderizada e checada **isoladamente** antes de entrar no vídeo
(sub-composição própria). Câmera com intenção (acelera/desacelera, nunca deriva constante).
Rótulos sem colisão com outros textos ou objetos. Render de teste a 60 fps:
`npx hyperframes render -c compositions/<peca>.html --fps 60 -o renders/<peca>.mp4`.
Se algo não fica claro em 3D, diga e proponha forma mais simples.

Exemplo de referência: `clientes/fabio-pedrosa-advogados/videos/exemplo-camadas-debito/`
(pilha do débito inscrito: principal, multa, juros e encargos se abrindo em camadas).

## 3. Footage de apoio (IA) — só onde o storyboard marcar

```bash
node tools/replicate-gen.mjs check                                    # confirma modelos
node tools/replicate-gen.mjs image "<prompt>" --aspect 9:16 --out clientes/<c>/videos/<v>/assets/generated
node tools/replicate-gen.mjs video "<movimento>" --image <png> --duration 5 --out ...
tools/conform-clip.sh clip.mp4 clip_1080p60.mp4 1080 1920 60        # 720p/24 → 1080p/60
```
- Imagem e clipe gerados são **conceito**, nunca prova: nada de obra/cliente/resultado falso.
  Footage real do cliente é sempre a prova.
- Visual claro e realista (não "dark moody"), coerente com negócio real.
- Revise cada clipe por erros físicos (estruturas desalinhadas, mãos, texto deformado) e regenere.
- Todo arquivo gerado fica com sidecar `.json` do prompt (refazível com `replicate-gen.mjs redo`).
- Modelo indisponível → pare e avise; não troque de modelo por conta própria.

## 4. Montagem e QA técnico

`npx hyperframes check` (0 erros) → `npx hyperframes snapshot --frames 12` e **leia a
contact-sheet** com Read → corrija → `npx hyperframes render --fps 60 -q delivery`.
Métrica objetiva: `tools/frozen-metric.sh renders/<v>.mp4` (meta: < 10% congelado, fora
telas de leitura intencionais como o CTA final).

## 5. Gauntlet loop (crítico independente)

Gere as folhas para o crítico com `tools/review-sheets.sh renders/<v>.mp4 review/<versão>` (carimbo
de tempo por quadro; aborta se houver folhas duplicadas). Depois de cada render completo, dispare um **subagente novo** (Agent tool, sem histórico da
construção) com o prompt de `references/prompts.md` → "Crítico". Ele recebe: contact-sheets /
quadros extraídos (`ffmpeg -vf fps=4`), o brief, o storyboard e as referências. Corrija **o
maior problema**, renderize e repita. Pare quando as correções ficarem pequenas (tipicamente
4–6 rodadas). Registre cada rodada em `CRITICAS.md` (rodada, achados, o que mudou).

## 6. Áudio

Trilha pelo **cliente final**, não pelo "hype": serviço/advocacia → piano suave, violão limpo,
batida calma. `node tools/elevenlabs-music.mjs "<prompt>" --seconds <dur> --out assets/audio/trilha-a.mp3`
(gere **duas opções**). Sem ElevenLabs: trilha provisória com
`python3 tools/synth-bed.py --seconds <dur> --chord-len <s> --out trilha.wav` (troca de acorde alinhada aos cortes; marcar como provisória). SFX: poucos, limpos, só nos momentos-chave, sempre abaixo da música
(registry do HyperFrames / `/media-use`). Loudness final de Reels/Stories: −14 LUFS, pico −1 dBTP (loudnorm 2 passadas). Mix calmo de web (~ -16 LUFS):
`tools/mix-web.sh video.mp4 trilha.mp3 final.mp4` ou `/hyperframes-audio`.

## 7. Entrega (oferta padrão)

1 vídeo de ~25 s × **2 aberturas** (hooks A/B) × **2 formatos** (9:16 e 16:9) = 4 arquivos,
× 2 trilhas se pedido. Use variáveis/`--batch` do HyperFrames para as variantes.
Nomes: `<cliente>_<video>_hookA_9x16.mp4`. Envie ao usuário (SendUserFile) com as últimas notas
do crítico. **Nada vai ao cliente final sem aprovação do usuário.**

## Compliance jurídico (vídeos do escritório)

OAB — Provimento 205/2021: caráter informativo, sobriedade, sem promessa de resultado,
sem percentuais de desconto "garantidos", sem mercantilização. Base legal exata (ex.: Lei nº
13.988/2020; editais/portarias PGFN vigentes). Não inventar números; avisos curtos quando
tratar de benefícios ("condições dependem do edital/portaria vigente e da análise do caso").

## Alternativa leve

`motion/` tem um renderizador próprio (Playwright + ffmpeg, contrato `window.seek(t)`) para
peças simples 2D sem HyperFrames — ver a seção "Alternativa leve" no CLAUDE.md da raiz.
