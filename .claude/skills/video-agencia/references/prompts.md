# Prompts do fluxo (adaptados do artigo para PT-BR e para o escritório)

Substitua os `[colchetes]`. Todos mantêm a regra: nada de depoimento, avaliação, preço,
economia, garantia ou resultado inventado — placeholder e aviso.

## 1. Acesso a modelos de imagem/vídeo (uma vez por ambiente)
```
Configure acesso aos modelos de imagem e vídeo pelo Replicate.
- a chave está em REPLICATE_API_TOKEN
- use o modelo de imagem configurado (REPLICATE_IMAGE_MODEL) para stills e o de vídeo (REPLICATE_VIDEO_MODEL) para transformar imagem em clipe
- rode `node tools/replicate-gen.mjs check`, gere 1 imagem e 1 clipe de teste e me mostre
- salve toda geração com o prompt usado, para poder refazer
- se algum modelo não estiver disponível, me avise em vez de trocar por outro
```

## 2. Storyboard
```
Planeje um vídeo de 25 s para [cliente] (clientes/[cliente]/brief.md).
- o que faz: [serviço]; quem é o cliente final: [público]; ação no final: [CTA]
- footage e fatos: clientes/[cliente]/footage e brief.md
- escreva STORYBOARD.md plano a plano: o que está na tela, o que se move, quanto tempo segura e como chega ao próximo
- cada plano precisa mostrar algo útil para o cliente final, além de ser bonito
- marque quais planos usam footage real, quais usam 3D em código e quais usam imagem/clipe de IA
- sem quadros vazios ou parados; todo plano já está indo para o próximo
- 2 aberturas diferentes (hook A e hook B) para os primeiros 3 s
- não invente depoimentos, avaliações, preços, economia, garantias ou resultados; se um plano precisar, deixe placeholder para o cliente
```

## 3. Componente 3D
```
Construa um componente 3D do vídeo em Three.js, como sub-composição HyperFrames.
- o que precisa explicar: [ideia, ex.: a composição do débito inscrito em camadas]
- deve funcionar no HyperFrames (hf-seek, determinístico) e renderizar liso a 60 fps
- câmera com intenção, acelerando e desacelerando, nunca derivando em velocidade constante
- rotule o que o espectador precisa entender; nenhum texto sobrepõe ou atravessa outro texto/objeto
- renderize sozinho como clipe curto primeiro para eu checar antes de entrar no vídeo
- se algo não ficar claro em 3D, diga e sugira uma forma mais simples
```

## 4. Footage de apoio (IA)
```
Gere a footage de apoio do storyboard.
- stills com o modelo de imagem no Replicate; os que precisam de movimento viram clipe com o modelo de vídeo
- só nos planos que o storyboard marca como IA; o que mostra trabalho real usa footage real
- tudo claro e realista, coerente com um negócio real, nada escuro/"moody"
- padronize os clipes para 1080p e 60 fps com tools/conform-clip.sh
- revise cada clipe por coisas fisicamente erradas (estruturas desalinhadas, mãos, texto deformado) e regenere
- nunca gere trabalho concluído falso, cliente falso ou resultado falso
```

## 5. Crítico (gauntlet loop) — rodar em SUBAGENTE NOVO
```
Você está revisando um vídeo que você NÃO construiu. Seja honesto.
- vídeo renderizado: [caminho do mp4 + contact-sheet/quadros extraídos a 4 fps], brief: [brief.md], storyboard: [STORYBOARD.md], referências: [refs/]
- assista tudo (quadro a quadro pelas imagens) e liste todos os problemas, do maior para o menor
- procure: quadros vazios, planos que seguram demais, espaçamento irregular, texto que colide ou atravessa outro texto, saltos de 1 quadro no 3D, objetos 3D que "achatam", qualquer coisa fisicamente errada, texto cortado nas margens de segurança
- diga se música e efeitos combinam com o cliente final do negócio
- dê o tempo (segundos) de cada problema
- verifique compliance: promessa de resultado, números sem fonte, base legal incorreta
- não sugira mudanças que alterem o assunto do vídeo; aponte só o que o deixa pior que as referências
- responda em tabela: # | tempo | problema | gravidade (alta/média/baixa) | evidência
```

## 6. Música e som
```
Faça a música e o som do vídeo.
- o cliente final é [público]; a música deve soar certa para ele (calma e acolhedora para serviço profissional, nada de trilha de lançamento de tech)
- use tools/elevenlabs-music.mjs, com a trilha acompanhando as seções do storyboard e fechando junto com a marca no final
- poucos efeitos, limpos, só nos momentos que importam, sempre abaixo da música
- mix em volume calmo de web (~ -16 LUFS); nenhum efeito mais alto que a música
- entregue o vídeo com duas opções de trilha para eu escolher
```

## 7. Prospecção (compradores que já investem em marketing)
```
Encontre [tipo de negócio] e agências de marketing que atendem [tipo de negócio] em [área] que já investem em marketing.
- procure quem roda anúncios no Facebook/Google, posta vídeos de projetos ou mostra footage de obra/drone no site e redes
- procure agências que listam [tipo de negócio] como clientes
- para cada um: nome, site, onde estão os vídeos/anúncios, e o contato do dono/marketing se for público
- marque quem já tem muita footage própria (mais fáceis de fazer ótimos vídeos)
- se não der para confirmar que estão investindo em marketing, deixe de fora
```

## 8. Abordagem
```
Escreva uma mensagem curta para [negócio] oferecendo o serviço de vídeo.
- em uma linha: transformamos a footage que vocês já têm em vídeos de venda claros e novas versões de anúncio todo mês
- link da amostra: [link]
- ofereça fazer o primeiro vídeo de 25 s com a footage deles
- até 80 palavras, simpática e específica para o negócio
- não prometa mais serviços, mais leads nem resultado algum
- versão cartão-postal: título para a frente, uma linha para o verso e QR code para a amostra
```

## 9. Operação contínua (Hermes / orquestrador)
Ver `docs/hermes-agencia.md`.
