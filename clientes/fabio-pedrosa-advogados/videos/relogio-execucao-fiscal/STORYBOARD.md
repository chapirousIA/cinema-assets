# Storyboard — "O relógio da execução fiscal" (prescrição intercorrente)

- Entregas: **2 aberturas (A/B) × 2 formatos (9:16 `index.html`, 16:9 `landscape.html`)**, 25 s, 60 fps
- Público: MPE / PF com execução fiscal federal antiga · CTA: "Envie o nº do processo para análise"
- Objeto condutor: **os autos da execução** (capa do processo) — parado na estante → vira o marcador que anda na linha do tempo → gira e revela a marca.
- Variável `hook`: `A` = "Sua execução fiscal está parada há anos?" · `B` = "Uma dívida com a União pode acabar sem ser paga."

| # | tempo | na tela | movimento principal (+ secundários) | transição | fonte |
|---|---|---|---|---|---|
| 1 | 0–3,5 | Abertura A/B + capa dos autos "Último andamento: há 6 anos", poeira | palavras sobem em stagger (+ câmera aproxima dos autos, poeira flutua) | autos encolhem e pousam no início da linha do tempo | HTML/CSS |
| 2 | 3,5–14 | "O relógio da execução fiscal": ampulheta 3D + contador de anos + linha do tempo | ampulheta escoa 1 ano (art. 40) → **vira** em 7 s → escoa +5 anos (§4º) (+ autos andam na linha, legenda troca a cada marco) | ampulheta vazia, legenda "pode reconhecer a prescrição" | Three.js + GSAP |
| 3 | 14–20,5 | "Atenção: o relógio pode reiniciar" — citação/penhora efetiva (Tema 566) | marcador laranja cai na linha, autos voltam ao início, ampulheta **vira de novo** e recomeça (+ contador volta a 0) | autos vão ao centro | Three.js + GSAP |
| 4 | 20,5–25 | Autos giram → marca, "Envie o nº do processo para análise", OAB, aviso | flip 3D do cartão (+ CTA com mola, brilho) | fim | HTML/CSS |

## Base legal (exibida na tela)
- LEF (Lei nº 6.830/1980), art. 40, *caput*, §§ 2º e 4º — suspensão por 1 ano, arquivamento, prescrição intercorrente decretável de ofício após ouvir a Fazenda.
- STJ, Súmula 314.
- STJ, Tema 566 (REsp 1.340.553/RS, 1ª Seção, Rel. Min. Mauro Campbell Marques, j. 12/09/2018, DJe 16/10/2018) — início automático da suspensão; citação ou constrição efetivas interrompem.
- CTN, art. 156, V (prescrição extingue o crédito) — implícito na abertura B.

## Compliance
"pode" em todas as afirmações sobre prescrição; ressalva do Tema 566 com destaque; sem "grátis", sem promessa; aviso final + OAB/CE nº (placeholder).

## Áudio
Trilha provisória sintetizada (Dm9 → … → Fmaj9 no repouso em 21 s; trocas a cada 3,5 s alinhadas aos cortes). SFX: whoosh 3,4 · click 7,0 (giro) · ping 12,4 · click 14,0 (giro) · chime 21,1.
