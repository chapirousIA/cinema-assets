# Storyboard — "Transação Tributária" (teste de capacidades)

- Formato: 9:16, 1080×1920, 60 fps, 25 s · Público: dono de MPE / PF com débito federal inscrito
- CTA: "Agende uma análise" · Tom: sóbrio, informativo (OAB, Provimento 205/2021)
- Objeto condutor: **a Certidão de Dívida Ativa (CDA)** — aparece no gancho, vira a pilha 3D, percorre o método e vira o cartão da marca.

| # | tempo | na tela | movimento principal (+ secundários) | segura | transição | fonte |
|---|---|---|---|---|---|---|
| 1 | 0,0–3,5 | Kicker "Passivo tributário federal" + "Débito inscrito em *dívida ativa* da União?" ; pilha de CDAs caindo | palavras sobem em stagger (+ CDAs caem girando, ondas de fundo) | 1,2 s | CDA principal avança contra a câmera e "atravessa" a tela | código (HTML/CSS) |
| 2 | 3,5–10,4 | Pilha 3D: principal, multa, juros, encargos + rótulos; depois "desconto possível" × "não é reduzido" | pilha se monta e abre em camadas (+ câmera aproxima e desacelera; rótulos entram) ; 7,2 s: camadas de acréscimos encolhem, principal fica | 2 s | câmera recua e a pilha some no fundo | 3D Three.js |
| 3 | 10,4–15,6 | Teto legal PF/ME/EPP: anel "até 70%" + grade de 145 parcelas "até 145 meses" + notas legais | contadores numéricos (+ anel desenha, 145 pontos preenchem em onda) | 1,5 s | blocos saem rápido para cima | código (SVG/GSAP) |
| 4 | 15,6–21,0 | "Como trabalhamos": linha vertical com 3 etapas | mini-CDA desce pela linha desenhando-a (+ nós acendem, textos entram) | 1 s | mini-CDA vai ao centro e cresce | código |
| 5 | 21,0–25,0 | CDA gira e revela a marca; botão "Agende uma análise"; aviso | flip 3D do cartão (+ botão entra com mola, aviso em fade) | 2,4 s | fim | código |

## Base legal (conferir antes de publicar)
- Lei nº 13.988/2020, art. 11, I — descontos em multas, juros e encargos de créditos irrecuperáveis ou de difícil recuperação.
- Art. 11, §2º, I — vedada a redução do principal.
- Art. 11, §3º (red. Lei nº 14.375/2022) — PF, ME e EPP: redução máxima de até 70% e prazo de até 145 meses, respeitado o art. 195, §11, da CF (contribuições sociais: até 60 meses).

## Áudio
- Trilha: **provisória sintetizada** (piano elétrico suave + pad + batida leve, ~69 bpm, acorde de repouso em 21 s com a marca). Substituir por ElevenLabs quando a rede for liberada.
- SFX (biblioteca HyperFrames, abaixo da música): whoosh 3,3 s · click 7,2 s · ping 13,4 s · whoosh-short 15,5 s · chime 21,6 s.
