# Operação contínua da agência (Hermes ou n8n)

O artigo usa o **Hermes** (agente implantado uma vez, operado pelo Telegram) para rodar o fluxo
de cada cliente sozinho. Ele **não roda dentro deste repositório**: é um serviço à parte.
Este repositório é a "fábrica" que ele aciona (`clientes/`, `tools/`, skill `video-agencia`).

## Opção A — Hermes (como no artigo)
1. Abra o Claude com a documentação oficial do Hermes, um token de bot do Telegram
   (criado no @BotFather) e peça para implantar no Railway.
2. Configure como variáveis do serviço (nunca no chat): `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`,
   `REPLICATE_API_TOKEN`, `ELEVENLABS_API_KEY`, `GITHUB_TOKEN` (acesso a este repositório).
3. Cole as instruções abaixo como processo do agente.

```
Você opera minha agência de vídeo. Processo:
- use Claude Opus 5.5 para construir, planejar e escrever
- uma pasta por cliente em clientes/<cliente>/ (footage, brand, brief.md com fatos e CTA, vídeos anteriores) no repositório cinema-assets
- quando chegar footage nova ou oferta nova na pasta de um cliente: escreva o storyboard, construa as peças 3D, gere a footage de apoio necessária e renderize o vídeo completo, seguindo .claude/skills/video-agencia/SKILL.md
- entregue o render a um crítico novo que não viu a construção, corrija os maiores problemas e repita até as correções ficarem pequenas
- faça música e som adequados ao cliente final do cliente
- exporte todas as versões e formatos do plano do cliente (2 hooks × 9:16 e 16:9)
- me mande o rascunho final no Telegram com as últimas notas do crítico. Nunca envie nada ao cliente sem minha aprovação
- no dia 1º de cada mês, produza o pacote do mês de cada cliente de retainer a partir do que houver de novo na pasta
- nunca invente depoimentos, resultados, preços ou economia. Se o vídeo precisar, deixe placeholder e me avise
```

## Opção B — n8n (orquestração com aprovação humana)

| Nó | Tipo | Configuração-chave |
|---|---|---|
| 1. Gatilho footage | Google Drive Trigger | Pasta `Agência/<cliente>/footage`, evento *File Created* |
| 2. Gatilho mensal | Schedule Trigger | Cron `0 8 1 * *` (dia 1º, 8h) → lista clientes com `plano=retainer` |
| 3. Normalizar | Set | `cliente`, `arquivo_url`, `tipo` (`footage`/`mensal`), `formatos` = `["9x16","16x9"]`, `hooks` = 2 |
| 4. Disparar produção | HTTP Request | Abre sessão do Claude Code (ou webhook do Hermes) com o prompt: *"Siga a skill video-agencia para o cliente {{cliente}} com a nova footage {{arquivo_url}}"* |
| 5. Aguardar | Wait (webhook resume) | A sessão chama o `resumeUrl` ao terminar, com `{mp4_urls, notas_critico}` |
| 6. Aprovação | Telegram → *Send and Wait for Response* | Envia os MP4 + notas; botões **Aprovar** / **Ajustar** |
| 7a. Aprovado | Google Drive + Gmail/WhatsApp | Move para `entregues/`; envia ao cliente; registra no CRM (`status=entregue`, `data`, `versao`) |
| 7b. Ajustar | HTTP Request | Reabre a produção com o texto do ajuste como feedback |
| 8. Follow-up | Wait 7 dias → Telegram | "O cliente {{cliente}} publicou o vídeo? Qual hook performou melhor?" |

Variáveis de credencial no n8n: `TELEGRAM_BOT_TOKEN`, Google OAuth, token da API usada no nó 4.
