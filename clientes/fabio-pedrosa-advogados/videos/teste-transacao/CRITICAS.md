# Gauntlet loop — histórico de rodadas

## Rodada 0 — QA próprio (antes do primeiro render)
- `check`: 6 erros (texto miniatura sobreposto nas CDAs decorativas) + contraste do terracota → CDAs decorativas sem texto, terracota de texto #cf8a5f.
- Contact-sheet: rótulos encostando nas camadas 3D; ponto solto na grade de 145 (12×12+1 → faixa 29×5); cena 4 vazia no início; mini-CDA sobre "Estratégia" → corrigidos.

## Rodada 1 — crítico independente sobre v1 (39,4% congelado · −22,5 LUFS)
| Achado (gravidade) | Correção na v2 |
|---|---|
| Assunto nunca nomeado (alta) | Kicker do gancho: "Transação Tributária · Lei nº 13.988/2020" |
| 39% congelado / ritmo de slideshow (alta) | Flutuação das camadas 3D, onda na faixa de parcelas, pulso no nó 3, aproximação da CDA no gancho, brilho e respiração no CTA |
| Transições por fade em fundo vazio (alta) | CDA "deita" e vira a camada principal 3D; anel nasce grande sobre a pilha; faixa de parcelas escorre para a linha do método; mini-CDA termina no tamanho/posição exatos do cartão final; cenas sobrepostas |
| Tipografia secundária ilegível no celular (alta) | Notas 25→31 px, rótulos 36→40, subtítulos 24→28, selos 17→21, etapas 30→33, "até" em serif itálico 92 px |
| Sem inscrição OAB na placa (alta, CED art. 44) | "OAB/CE nº [PREENCHER]" — placeholder até o número real ser informado |
| Camadas 3D semitransparentes se interpenetrando (média) | Materiais opacos; entrada por queda sem fade |
| Cartão da marca navy sobre navy (média) | Verso creme com marca em navy |
| CDAs do gancho invadindo a margem inferior (baixa) | Pilha subiu 140 px |
| "70% do total" vs "principal não é reduzido" pode confundir (baixa) | Legenda: "de redução máxima do total, aplicada só sobre multa, juros e encargos"; nota cita "(red. Lei nº 14.375/2022)" |
| Áudio −22,5 LUFS (média) | Loudnorm 2 passadas → −14,0 LUFS, pico −1,0 dBFS |

Resultado v2: **7,2% congelado** · −14,0 LUFS · `check` sem erros.

## Rodada 2 — crítico independente sobre v2 (nota 6/10)
Obs.: as folhas da v2 saíram duplicadas (bug do `-update 1` no ffmpeg) — criado `tools/review-sheets.sh` com carimbo de tempo e checagem de duplicatas.

| Achado (gravidade) | Correção na v3 |
|---|---|
| Texto secundário pequeno para celular (alta) | Notas 34 px, subtítulos 32, selos 26 ("REDUTÍVEL"/"IRREDUTÍVEL"), etapas 52/37 |
| Transição do gancho "anda para trás" e salto de 1 quadro em 2,817 s (alta) | CDA avança contra a câmera (escala 6,5×) e corta no creme da laje "principal": câmera 3D começa colada nela e recua; sem rotationX (fim do salto) |
| 1º quadro vazio (média) | Kicker e CDAs já visíveis em t=0 |
| Metade inferior vazia na cena 4 (média) | Etapas distribuídas até ~1400 px; linha até 1470 px |
| Dissoluções em dupla exposição em 10,3 e 15,5 s (média) | Pilha sai subindo (direcional) antes do anel entrar; anel cresce de baixo; dados saem para cima |
| Seguras 8,4–15 s e camadas que "só escurecem" (média) | Acréscimos encolhem 42% (largura) e 55% (altura) em 1,6 s; rotação do anel e respiração dos números |
| Contador exibe "60" (baixa) | Meses contam de 100→145 |
| Pontos da grade embolam (baixa) | Pulso 1,45→1,22 |
| Mini-CDA tapa nós (baixa) | Linha movida para x=240; mini-CDA corre à esquerda |
| Sem sombra de contato no 3D (baixa) | Sombra radial sob a pilha |
| Vazio 20,3–21 s e cartão "fantasma" duplo | Mini-CDA chega ao centro em 20,4 s e é trocada no mesmo quadro pelo cartão final (mesmo tamanho/posição) |

Resultado v3: 5,5% congelado fora da placa final (12,5% contando a placa de CTA) · −14,0 LUFS · `check` sem erros.

## Rodada 3 — crítico independente sobre v3 (nota 7/10; sem saltos de 1 quadro)
| Achado (gravidade) | Correção na v4/v5 |
|---|---|
| Rótulos colados na borda direita, sob os ícones do Reels (alta) | Layout espelhado: rótulos à esquerda (alinhados à direita), pilha 3D à direita |
| Saída da cena 2: pilha atravessa o título, rótulos descolados (alta) | Título sai antes (9,5 s); rótulos sobem e somem junto; sombra apaga com a pilha |
| ~0,2 s de creme chapado e título sobre o close (média) | Recuo da câmera em ease-out (revela a laje de imediato); título da cena só em 4,25 s |
| Nó 03 aceso antes da hora (média) | Bug: `fromTo` renderizava os pulsos no início → `immediateRender: false` |
| Quadro vazio em 15,3–15,7 e "fade para nada" (média) | Saída da cena 3 mais cedo (ease suave) + cena 4 entra em 15,08 s enquanto a faixa de parcelas escorre para a linha |
| Gancho ~2 s parado (média) | Título com leve zoom + deriva das CDAs |
| Ponto parado 15,5–16,2 s (métrica v4) | Linha e mini-CDA começam em 15,55 s |

Resultado v5: **8,1% congelado fora da placa de CTA** · −14,0 LUFS / −1,0 dBFS · `check` sem erros.
