# Equipe de agentes de vídeo — Instagram (Fábio Pedrosa Advogados)

> Meta: **5 Reels por semana** (~22/mês) · orçamento de **R$ 200 a R$ 400/mês** para geração
> (imagem, vídeo, voz e música) · aprovação humana obrigatória em 3 portões.

## 1. Resumo executivo

- **Equipe de 6 papéis**: o coordenador (sessão principal do Claude Code) + 5 subagentes
  em `.claude/agents/`. A montagem fica com o coordenador, porque precisa das skills do HyperFrames.
- **O custo cabe no orçamento porque o vídeo é feito em código.** HyperFrames e Three.js custam
  zero por vídeo. A IA paga (Replicate/ElevenLabs) só entra no vídeo "hero" de sexta e tem teto.
- **Escala com templates, não com prompts.** São 4 modelos de série reutilizáveis: cada vídeo novo
  é um JSON de conteúdo dentro de um template já aprovado. Sem isso, 5 vídeos/semana não fecham.
- **Nada sai sem o advogado.** São três portões: pauta, roteiro com parecer OAB e vídeo final.
  Juntos, tomam ~40 min por semana do Fábio se forem feitos em lote.
- **Mede-se em 30 dias** pela retenção dos 3 primeiros segundos, salvamentos/compartilhamentos e
  contatos no WhatsApp. A meta numérica sai da linha de base das 2 primeiras semanas, não de chute.

## 2. A equipe

| # | Agente | Modelo | Faz | Entrega | Por que existe (o que quebra sem ele) |
|---|---|---|---|---|---|
| 0 | **Coordenador** (sessão principal) | Opus | Orquestra, controla custo, monta e renderiza | `renders/final.mp4`, `custos.csv` | Sem dono, ninguém segura prazo e teto de gasto |
| 1 | `pauta-roteiro` | Opus | Pesquisa a base legal, cria gancho A/B e roteiro | `01-roteiro.json` | Sem ele: vídeo bonito sem fonte |
| 2 | `revisor-oab` | Opus | Portão de precisão jurídica e Provimento 205/2021 | `02-parecer-oab.md` | Sem ele: risco ético e erro técnico publicado |
| 3 | `diretor-storyboard` | Sonnet | Faz plano a plano, escolhe o template e escreve os prompts de IA com custo | `03-storyboard.json` | Sem ele: gasto de crédito em geração sem plano |
| 4 | `critico-qa` | Opus | Crítica independente após cada render (*gauntlet loop*) | `04-critica.md` | Quem constrói não enxerga os próprios erros |
| 5 | `legenda-distribuicao` | Haiku | Legenda, hashtags, texto alternativo e reaproveitamento | `05-legenda.md` | Tarefa repetitiva: modelo barato basta |

Os papéis do prompt original foram fundidos assim:
- **Pesquisa + Roteiro** viraram um agente só.
- **Storyboard + Prompt visual** viraram um agente só.
- **Edição/Montagem** ficou com o coordenador.

O que entrou a mais: o **revisor OAB**, que é obrigatório para escritório de advocacia.

## 3. Fluxo (da ideia ao post)

```
DOMINGO (lote)                        SEGUNDA (lote de produção)                 TER–SEX
pauta-roteiro ─► 5 temas ─► [G1 Fábio aprova pauta]
   │
   ▼
pauta-roteiro ─► 01-roteiro.json (×5) ─► revisor-oab ─► 02-parecer ─► [G2 Fábio aprova roteiros]
                                             │ REPROVADO → volta ao roteiro (máx. 2 voltas, depois Fábio decide)
   ▼
diretor-storyboard ─► 03-storyboard.json ─► coordenador monta (template) ─► check ─► render
   ▼
critico-qa (instância nova) ─► nota < 8 ou item alto? → corrige o MAIOR problema → render → critico-qa
   │ (máx. 4 rodadas; persistindo, escala ao Fábio com a lista)
   ▼
legenda-distribuicao ─► 05-legenda.md ─► revisor-oab (revisão rápida da legenda)
   ▼
[G3 Fábio aprova vídeo + legenda] ─► agendamento (Meta Business Suite ou n8n) ─► métricas
```

**Regras de retentativa**
- Render que falhou: corrige e tenta de novo, até 2 vezes. Persistindo, avisa e usa o template anterior.
- Geração de IA rejeitada pelo crítico: regenera uma vez. Na segunda falha, o plano volta para código.
- Teto de custo do vídeo atingido: o coordenador para e pede autorização. Não troca de modelo por conta própria.

**Onde ficam as coisas**

| Item | Local |
|---|---|
| Bíblia de estilo (cores, fontes, zonas seguras) | `marca/tokens.json` + seção "Bíblia" do `diretor-storyboard` |
| Assinatura, OAB, CTA, aviso legal | `marca/assinatura.json` |
| Templates de série | `clientes/fabio-pedrosa-advogados/templates/<serie>/` (a construir — dia 2) |
| Cada vídeo | `clientes/fabio-pedrosa-advogados/videos/AAAA-MM-DD-slug/` com `01`–`05`, `index.html`, `renders/` |
| Pauta semanal | `clientes/fabio-pedrosa-advogados/pauta/AAAA-Wnn.md` |
| Custos | `clientes/fabio-pedrosa-advogados/custos.csv` (`data,id,servico,item,valor_usd,valor_brl,obs`) |
| Biblioteca de prompts | `.claude/skills/video-agencia/references/prompts.md` |

## 4. Calendário editorial (5/semana)

| Dia | Série | Template | Pilar | Geração paga |
|---|---|---|---|---|
| Seg | **Mito ou verdade?** | cartão que vira | Transação / dívida ativa | Não |
| Ter | **Passo a passo** | linha do tempo | Como funciona (adesão, defesa, revisão) | Não |
| Qua | **Relógio do processo** | relógio (já existe) | Execução fiscal: prazos e prescrição | Não |
| Qui | **Reforma em 30 s** | antes × depois | EC 132/2023 e LC 214/2025, por partes | Não |
| Sex | **Hero da semana** | 3D + IA | Tema de maior interesse da semana | Sim (até o teto) |

Na sexta, a variante B do gancho pode ir como **Teste de Reels** (Trial Reels), que mostra o vídeo
primeiro a quem não segue a conta. Assim os dois ganchos são comparados sem poluir o feed.

## 5. Orçamento

O cálculo usa ~22 vídeos/mês (5 × 52 ÷ 12 ≈ 21,7).

| Cenário | Mensal | Por vídeo (média) | Estratégia |
|---|---|---|---|
| Mínimo | R$ 200 | ≈ R$ 9 | 18 vídeos a custo zero (código + trilha sintetizada) e 4 heros com ~R$ 40–45 de IA cada |
| Máximo | R$ 400 | ≈ R$ 18 | Plano mensal de música/voz e 4 heros com ~R$ 60–70 de IA cada |

**Divisão sugerida do orçamento**

| Fatia | Destino |
|---|---|
| 40–50% | Replicate (imagem e vídeo dos heros), pré-pago e **com limite de gasto no painel** |
| 25–35% | ElevenLabs (música dos heros; voz só se o Fábio não gravar) |
| 20% | Reserva para regeneração e testes |

- Preços em dólar mudam. Confirme no painel de cada serviço na contratação e lance tudo em `custos.csv` com a cotação do dia.
- **Não incluídos** no valor acima: assinatura do Claude, hospedagem do n8n e (opcional) armazenamento com URL pública.
- **Recomendação de alto impacto e custo zero:** o Fábio grava a locução no celular em 2 dos 5 vídeos. A voz do advogado dá mais autoridade que TTS e não gasta crédito.

## 6. Portões humanos (Fábio)

| Portão | Quando | O que aprova | Tempo |
|---|---|---|---|
| G1 | Domingo | 5 temas + ganchos | ~5 min |
| G2 | Segunda | 5 roteiros + pareceres OAB (antes de qualquer gasto) | ~15 min |
| G3 | Ao longo da semana | Cada MP4 + legenda antes de agendar | ~4 min/vídeo |

## 7. Plano de implantação em 7 dias

| Dia | Entrega | Quem |
|---|---|---|
| 1 | Preencher `marca/assinatura.json` (OAB, WhatsApp, site). Criar o repositório privado `fp-estudio-video`. Liberar `api.replicate.com` e `api.elevenlabs.io` na rede do ambiente e definir as chaves como variáveis | Fábio |
| 2 | Construir os 4 templates de série, com variáveis e checados pelo crítico | Claude |
| 3 | Banco com 30 temas e base legal (`pauta-roteiro`) e parecer (`revisor-oab`). G1 | Claude → Fábio |
| 4 | Lote da semana 1: 5 roteiros. G2 | Claude → Fábio |
| 5 | Montagem + crítico dos 5. G3 | Claude → Fábio |
| 6 | Agendamento no Meta Business Suite + planilha de métricas | Fábio/Claude |
| 7 | n8n (fluxos A e B abaixo) + retrospectiva: o que travou, tempo gasto e custo real | Claude |

Comece com **1 vídeo de 30 s** passando por todo o fluxo antes de produzir o lote.

## 8. Automação n8n (fase 2)

**Planilha "Fila Reels"** (Google Sheets)
- Colunas: `id`, `data_publicacao`, `serie`, `pilar`, `gancho`, `status` (rascunho | roteiro_aprovado | pronto | aprovado | publicado | ajustar), `url_mp4`, `legenda`, `custo_brl`, `media_id`, `views`, `alcance`, `salvos`, `compart`, `tempo_medio_s`, `cliques_whatsapp`, `leads`.

**Fluxo A — Aprovação final e publicação**
1. Gatilho: *Google Sheets Trigger* (linha atualizada, `status = pronto`).
2. *Telegram → Send Video* com `{{$json.url_mp4}}`, legenda e botões *Aprovar* e *Ajustar*.
3. *Wait (On Webhook Call)*: espera o clique.
4. Se *Ajustar*: grava `status = ajustar` e o comentário.
5. Se *Aprovar*: *Wait until* `{{$json.data_publicacao}}`.
6. Publica pela API do Instagram com três *HTTP Request*:
   - `POST /{ig-user-id}/media` com `media_type=REELS`, `video_url`, `caption` e `share_to_feed=true`;
   - consulta `GET /{creation_id}?fields=status_code` até `FINISHED`;
   - `POST /{ig-user-id}/media_publish`.
7. Grava `media_id` e `status = publicado`.

Requisitos do fluxo A: conta Profissional ligada a uma Página do Facebook, token do app Meta e o MP4 em URL pública. Até lá, use o agendamento manual do Meta Business Suite (gratuito).

**Fluxo B — Métricas**
1. *Cron* diário às 7h.
2. Para cada `media_id` com menos de 30 dias: `GET /{media_id}/insights` com as métricas de Reels (alcance, visualizações, salvamentos, compartilhamentos, tempo médio de visualização).
3. Atualiza a planilha.
4. Na segunda-feira, envia um resumo no Telegram.

Os nomes das métricas mudam entre versões da Graph API: confira na versão em uso.

**Fluxo C — Leads**: o link da bio leva ao WhatsApp com UTM por série (`?text=Vim+pelo+Reels+<serie>`). No CRM, a origem do lead é a série.

## 9. Indicadores (30 dias)

| Indicador | Fonte | Uso |
|---|---|---|
| Retenção 3 s / tempo médio | Insights | Qualidade do gancho e do ritmo |
| Salvamentos + compartilhamentos por alcance | Insights | Utilidade real do conteúdo |
| Visitas ao perfil e cliques no link | Insights | Interesse |
| Conversas no WhatsApp por série | UTM/CRM | Geração de leads |
| Custo real por vídeo e horas do Fábio | `custos.csv` | Viabilidade |

Retorno sobre o investimento = (honorários dos contratos originados pelos Reels − custo total do mês) ÷ custo total do mês.

## 10. Erros comuns e como evitar

1. **Gerar antes de aprovar.** O G2 vem antes de qualquer crédito gasto.
2. **Vídeo novo do zero todo dia.** Use os templates. Sem eles, 5 vídeos/semana não fecham.
3. **Número de edital desatualizado.** Fonte com data de verificação, e o `revisor-oab` reabre a fonte.
4. **Jurisprudência "de memória".** Só entra com identificação completa conferida.
5. **Texto na área dos botões do Reels.** Respeite as zonas seguras (250 px no topo, 420 px na base).
6. **Crítico contaminado.** Sempre uma instância nova, sem o histórico da construção.
7. **IA mostrando pessoa, cliente ou documento "real".** Proibido: IA é só conceito.
8. **Medir por curtidas.** Meça salvamentos, compartilhamentos e conversas.

## 11. Próximos passos

1. Fábio: preencher OAB e WhatsApp, criar o repositório privado e liberar domínios e chaves (dia 1).
2. Claude: construir os 4 templates (dia 2). É a peça que viabiliza a cadência.
3. Depois de 4 semanas, decidir com dados: manter 5/semana, trocar uma série de baixo desempenho ou subir o orçamento do hero.
