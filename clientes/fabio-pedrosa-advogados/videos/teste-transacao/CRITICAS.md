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
