#!/usr/bin/env python3
"""Gera index.html (9:16) e 16x9/index.html (16:9, subprojeto com assets/ compartilhado) a partir do mesmo modelo.
A animação está em assets/film.js; aqui só mudam layout e tamanhos.  Rodar: python3 build.py"""
import json
from string import Template

LAYOUTS = {
    "index.html": dict(
        res="portrait", W=1080, H=1920,
        hgX=700, hgY=790, camDist=17.5,
        x0=96, yrPx=130, lineY=1262,
        travW=140, travH=90,
        autosL=260, autosT=960, autosW=560, autosH=360,
        flipCX=540, flipCY=800, flipW=640, flipH=410, ctaW=720, rewTop=545, rewLeft=96,
        css="""
  .k { left: 96px; } #k1 { top: 330px; } #k2 { top: 300px; }
  .h1 { left: 96px; right: 96px; top: 390px; font-size: 104px; }
  .h2 { left: 96px; right: 96px; top: 345px; font-size: 80px; }
  #counter { left: 96px; top: 620px; }
  .cap { left: 96px; right: 130px; top: 1410px; }
  .cta { top: 1105px; } #n4 { left: 110px; right: 130px; top: 1290px; }
""",
    ),
    "16x9/index.html": dict(
        res="landscape", W=1920, H=1080,
        hgX=1460, hgY=430, camDist=10.2,
        x0=140, yrPx=270, lineY=940,
        travW=140, travH=90,
        autosL=1180, autosT=330, autosW=560, autosH=360,
        flipCX=960, flipCY=400, flipW=640, flipH=410, ctaW=720, rewTop=245, rewLeft=140,
        css="""
  .k { left: 140px; } #k1 { top: 300px; } #k2 { top: 110px; }
  .h1 { left: 140px; width: 940px; top: 355px; font-size: 92px; }
  .h2 { left: 140px; width: 1060px; top: 150px; font-size: 76px; }
  #counter { left: 140px; top: 300px; }
  .cap { left: 140px; width: 980px; top: 585px; }
  .cap .p { font-size: 42px; }
  .cta { top: 680px; } #n4 { left: 360px; right: 360px; top: 820px; }
""",
    ),
}

TEMPLATE = Template(r"""<!doctype html>
<html lang="pt-BR" data-resolution="$res"
  data-composition-variables='[{"id":"hook","type":"enum","label":"Abertura","default":"A","options":[{"value":"A","label":"A — execução parada há anos"},{"value":"B","label":"B — dívida pode ser extinta pela prescrição"}]}]'>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=$W, height=$H" />
<script src="assets/vendor/gsap.min.js"></script>
<style>
  @font-face { font-family: "Newsreader"; src: url("assets/fonts/newsreader-latin-400-normal.woff2") format("woff2"); font-weight: 400; font-style: normal; }
  @font-face { font-family: "Newsreader"; src: url("assets/fonts/newsreader-latin-400-italic.woff2") format("woff2"); font-weight: 400; font-style: italic; }
  @font-face { font-family: "Outfit"; src: url("assets/fonts/outfit-latin-300-normal.woff2") format("woff2"); font-weight: 300; }
  @font-face { font-family: "Outfit"; src: url("assets/fonts/outfit-latin-400-normal.woff2") format("woff2"); font-weight: 400; }
  @font-face { font-family: "Outfit"; src: url("assets/fonts/outfit-latin-600-normal.woff2") format("woff2"); font-weight: 600; }
  :root { --navy: #0f2c3c; --deep: #081a24; --terra: #b97047; --terra-t: #cf8a5f; --laranja: #e8631c; --creme: #f3ece4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: var(--navy); }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Outfit", sans-serif; color: var(--creme); }
  .bg { position: absolute; inset: 0; background: radial-gradient(110% 80% at 60% 42%, #174a66 0%, var(--navy) 52%, var(--deep) 100%); }
  svg.waves { position: absolute; inset: 0; width: 100%; height: 100%; }
  #dust { position: absolute; inset: 0; }
  #dust i { position: absolute; left: 0; top: 0; border-radius: 50%; background: #f3e2c8; }
  #three-wrap { position: absolute; inset: 0; opacity: 0; }
  #three-layer { width: 100%; height: 100%; display: block; }
  .layer { position: absolute; inset: 0; }
  .k { position: absolute; font-weight: 600; font-size: 30px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--laranja); }
  .h1, .h2 { position: absolute; font-family: "Newsreader", serif; line-height: 1.03; letter-spacing: -0.02em; }
  .h1 em, .h2 em { font-style: italic; color: var(--terra-t); }
  .w { display: inline-block; }

  /* autos (objeto condutor) */
  .autos { position: absolute; background: var(--creme); color: var(--navy); border-radius: 6px; box-shadow: 0 30px 60px rgba(0,0,0,.4); overflow: hidden; }
  .autos::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 18px; background: var(--terra); }
  .big { padding: 34px 38px 30px 56px; }
  .big .t { font-weight: 600; font-size: 26px; letter-spacing: .16em; }
  .big .s { font-size: 19px; opacity: .7; margin-top: 10px; letter-spacing: .02em; }
  .big .ln { height: 11px; border-radius: 6px; background: rgba(15,44,60,.13); margin-top: 16px; }
  .stamp { padding: 8px 16px; border: 4px solid var(--terra); color: var(--terra); font-weight: 600; font-size: 26px; letter-spacing: .14em; transform: rotate(-12deg); border-radius: 4px; }
  #stampw { position: absolute; right: 30px; top: 175px; transform: rotate(-12deg); }
  .last { position: absolute; left: 56px; bottom: 26px; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 24px; color: #b8501a; }
  .mini { width: ${travW}px; height: ${travH}px; }
  .mini .ln { height: 6px; border-radius: 3px; background: rgba(15,44,60,.18); margin: 0 0 7px 22px; }
  .flipfront::before { width: 82px; }
  .flipfront .ln { height: 27px; border-radius: 14px; background: rgba(15,44,60,.18); margin: 0 0 32px 100px; }
  .flipfront .ft { margin: 36px 0 34px 100px; font-weight: 600; font-size: 36px; letter-spacing: .16em; color: var(--navy); }

  /* relógio */
  #counter { position: absolute; }
  #counter .num { font-family: "Newsreader", serif; font-size: 190px; line-height: .9; letter-spacing: -0.03em; }
  #counter .unit { font-family: "Newsreader", serif; font-style: italic; font-size: 64px; color: var(--terra-t); margin-left: 10px; }
  #counter .lbl { position: absolute; left: 0; top: 196px; width: 300px; line-height: 1.3; font-weight: 600; font-size: 26px; letter-spacing: .16em; text-transform: uppercase; color: var(--laranja); }
  #track { position: absolute; left: ${x0}px; top: ${lineY}px; width: ${trackW}px; height: 4px; margin-top: -2px; background: linear-gradient(90deg, var(--laranja), var(--terra)); border-radius: 2px; }
  .ms { position: absolute; top: ${lineY}px; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; background: var(--navy); border: 4px solid var(--laranja); }
  .tlab { position: absolute; top: ${labY}px; transform: translateX(-50%); white-space: nowrap; font-weight: 600; font-size: 26px; color: var(--creme); }
  .tlab.end { transform: translateX(-100%); } .tlab.start { transform: none; }
  .pill { position: absolute; top: ${pillY}px; white-space: nowrap; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 24px; letter-spacing: .06em; text-transform: uppercase; }
  #presc { right: ${presRight}px; background: var(--laranja); color: #fff; }
  #rew { top: ${rewTop}px; left: ${rewLeft}px; background: #fff; color: var(--navy); }
  #mark { position: absolute; left: ${markX}px; top: ${markTop}px; width: 0; }
  #mark .pin { position: absolute; left: -4px; top: 0; width: 8px; height: 46px; background: #fff; border-radius: 4px; }
  #mark .pin::after { content: ""; position: absolute; left: -11px; top: -11px; width: 30px; height: 30px; border-radius: 50%; background: var(--laranja); border: 4px solid #fff; }
  #mark .pill { top: ${markPillTop}px; left: 0; transform: translateX(-50%); background: #fff; color: var(--navy); }
  #ghost { position: absolute; left: ${markX}px; top: ${lineY}px; width: ${ghostW}px; height: 10px; margin-top: -5px; background: repeating-linear-gradient(90deg, rgba(8,26,36,.92) 0 14px, rgba(8,26,36,.6) 14px 22px); }
  .cap { position: absolute; }
  .cap .p { font-weight: 300; font-size: 44px; line-height: 1.22; }
  .cap .p b { font-weight: 600; color: #fff; }
  .cap .c { margin-top: 14px; font-weight: 600; font-size: 30px; color: #eaa274; letter-spacing: .02em; }

  /* marca */
  #flip { position: absolute; left: ${flipL}px; top: ${flipT}px; width: ${flipW}px; height: ${flipH}px; transform-style: preserve-3d; }
  #flip .face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 8px; }
  #flip .back { transform: rotateY(180deg); background: var(--creme); box-shadow: 0 30px 70px rgba(0,0,0,.4); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .brand { font-family: "Newsreader", serif; font-size: 82px; color: var(--navy); margin-top: 18px; }
  .brand-sub { font-weight: 600; font-size: 24px; letter-spacing: .34em; color: #9a5a35; margin-top: 16px; }
  .oab { font-weight: 400; font-size: 24px; letter-spacing: .08em; color: var(--navy); opacity: .8; margin-top: 14px; }
  .cta { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
  .cta div { position: relative; overflow: hidden; padding: 30px 52px; background: var(--laranja); color: #fff; font-weight: 600; font-size: 40px; border-radius: 4px; }
  #shine { position: absolute; top: 0; bottom: 0; left: 0; width: 120px; background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent); }
  #n4 { position: absolute; text-align: center; font-weight: 400; font-size: 32px; line-height: 1.38; }
$css
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="25" data-width="$W" data-height="$H">
  <div class="bg"></div>
  <svg class="waves" preserveAspectRatio="none"></svg>
  <div id="dust" aria-hidden="true"></div>
  <div id="three-wrap"><canvas id="three-layer"></canvas></div>

  <!-- CENA 1: abertura A/B -->
  <div class="layer" id="s1">
    <div class="k" id="k1">Execução fiscal federal</div>
    <div class="h1" id="hookA"><span class="w">Sua</span> <span class="w">execução</span> <span class="w">fiscal</span> <span class="w">está</span> <em class="w">parada</em> <em class="w">há</em> <em class="w">anos?</em></div>
    <div class="h1" id="hookB"><span class="w">Uma</span> <span class="w">dívida</span> <span class="w">com</span> <span class="w">a</span> <span class="w">União</span> <span class="w">pode</span> <span class="w">ser</span> <em class="w">extinta</em> <em class="w">pela</em> <em class="w">prescrição.</em></div>
    <div class="autos big" id="autos" data-layout-allow-overlap style="left: ${autosL}px; top: ${autosT}px; width: ${autosW}px; height: ${autosH}px">
      <div class="t" data-layout-allow-overlap>EXECUÇÃO FISCAL</div>
      <div class="s" data-layout-allow-overlap>Exequente: União (Fazenda Nacional)</div>
      <div class="s" data-layout-allow-overlap>Proc. nº 0000000-00.0000.4.05.0000</div>
      <div class="ln" style="width: 44%; margin-top: 26px"></div><div class="ln" style="width: 36%"></div><div class="ln" style="width: 40%"></div>
      <div id="stampw"><div class="stamp" id="stamp" data-layout-allow-overlap>ARQUIVADO</div></div>
      <div class="last" id="last" data-layout-allow-overlap>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#b8501a" stroke-width="3"><circle cx="14" cy="14" r="11"/><path d="M14 8v7l5 3" stroke-linecap="round"/></svg>
        Último andamento: há anos
      </div>
    </div>
  </div>

  <!-- marcador "autos" na linha do tempo (cenas 2–3) -->
  <div class="autos mini" id="trav" aria-hidden="true" style="left: ${x0}px; top: ${travTop}px">
    <div style="height: 8px"></div><div class="ln" style="width: 58%; height: 8px; background: rgba(15,44,60,.55)"></div><div class="ln" style="width: 60%"></div><div class="ln" style="width: 45%"></div><div class="ln" style="width: 52%"></div>
  </div>

  <!-- CENA 2: o relógio -->
  <div class="layer" id="s2">
    <div class="k" id="k2">Prescrição intercorrente</div>
    <div class="h2" id="t2">O relógio da <em>execução fiscal</em></div>
    <div id="counter"><span class="num" id="yearsv">0</span><span class="unit" id="yearsu">anos</span>
      <div class="lbl" id="yearsl">contados desde a suspensão</div><div class="lbl" id="yearsl2" style="opacity: 0">nova contagem</div></div>
    <div id="track"></div>
    <div class="ms" id="ms0" style="left: ${m0}px"></div><div class="ms" id="ms1" style="left: ${m1}px"></div><div class="ms" id="ms2" style="left: ${m2}px"></div>
    <div id="tl-labels">
      <div class="tlab start" style="left: ${m0l}px">suspensão</div>
      <div class="tlab start" style="left: ${m1l}px">1 ano</div>
      <div class="tlab end" style="left: ${m2r}px">+5 anos</div>
    </div>
    <div class="pill" id="presc">prescrição intercorrente</div>
    <div class="cap" id="c1"><div class="p">Sem localizar o devedor ou bens penhoráveis, a execução fica <b>suspensa por 1 ano</b>.</div><div class="c">LEF, art. 40 · STJ, Tema 566</div></div>
    <div class="cap" id="c2"><div class="p">Findo esse ano, começam a correr <b>5 anos</b> — haja ou não despacho de arquivamento.</div><div class="c">Súmula 314/STJ · STJ, Tema 566</div></div>
    <div class="cap" id="c3"><div class="p">Ouvida a Fazenda, o juiz <b>pode reconhecer a prescrição</b>.</div><div class="c">LEF, art. 40, §4º</div></div>
  </div>

  <!-- CENA 3: pode reiniciar -->
  <div class="layer" id="s3">
    <div class="h2" id="t3">Atenção: o relógio pode <em>reiniciar</em></div>
    <div class="pill" id="rew">◀◀ no curso do prazo</div>
    <div id="ghost"></div>
    <div id="mark"><div class="pin"></div><div class="pill">citação / penhora efetiva</div></div>
    <div class="cap" id="c4"><div class="p">Se, <b>antes de completar o prazo</b>, houver citação ou penhora efetiva, a contagem é interrompida.</div><div class="c">STJ, Tema 566 · REsp 1.340.553/RS</div></div>
    <div class="cap" id="c5"><div class="p">Prescrição não se presume: <b>exige análise dos autos</b>.</div></div>
  </div>

  <!-- CENA 4: marca -->
  <div class="layer" id="s4">
    <div id="flip" data-layout-allow-overlap>
      <div class="face autos flipfront" style="position: absolute; inset: 0">
        <div class="ft">EXECUÇÃO FISCAL</div><div class="ln" style="width: 52%"></div><div class="ln" style="width: 40%"></div><div class="ln" style="width: 46%"></div>
      </div>
      <div class="face back">
        <svg width="150" height="60" viewBox="0 0 150 60" fill="none" stroke="#b97047" stroke-width="3" stroke-linecap="round">
          <path d="M5 15 Q 23 3 41 15 T 77 15 T 113 15 T 145 15" /><path d="M5 30 Q 23 18 41 30 T 77 30 T 113 30 T 145 30" stroke="#e8631c" /><path d="M5 45 Q 23 33 41 45 T 77 45 T 113 45 T 145 45" />
        </svg>
        <div class="brand">Fábio Pedrosa</div>
        <div class="brand-sub">ADVOGADOS · TRIBUTÁRIO</div>
        <div class="oab">OAB/CE nº [PREENCHER]</div>
      </div>
    </div>
    <div class="cta" id="cta"><div>Envie o nº do processo para análise<span id="shine"></span></div></div>
    <div id="n4">Conteúdo informativo. Não constitui promessa de resultado. A ocorrência de prescrição depende da análise individual dos autos.</div>
  </div>

  <audio id="music" src="assets/audio/trilha-provisoria.mp3" data-start="0" data-duration="25" data-track-index="10" data-volume="0.6"></audio>
  <audio id="sfx-whoosh" src="assets/sfx/whoosh.mp3" data-start="2.95" data-track-index="11" data-volume="0.22"></audio>
  <audio id="sfx-flip1" src="assets/sfx/click-soft.mp3" data-start="7.0" data-track-index="12" data-volume="0.22"></audio>
  <audio id="sfx-ping" src="assets/sfx/ping.mp3" data-start="12.4" data-track-index="13" data-volume="0.14"></audio>
  <audio id="sfx-flip2" src="assets/sfx/click-soft.mp3" data-start="14.8" data-track-index="14" data-volume="0.22"></audio>
  <audio id="sfx-mark" src="assets/sfx/whoosh-short.mp3" data-start="14.4" data-track-index="15" data-volume="0.16"></audio>
  <audio id="sfx-chime" src="assets/sfx/chime.mp3" data-start="20.65" data-track-index="16" data-volume="0.16"></audio>
</div>
<script>window.FILM = $film;
  window.__timelines["main"] = gsap.timeline({ paused: true });</script>
<script type="module" src="assets/film.js"></script>
</body>
</html>
""")

for name, L in LAYOUTS.items():
    yr, x0, lineY = L["yrPx"], L["x0"], L["lineY"]
    m = lambda years: x0 + years * yr
    film = {k: L[k] for k in ("W", "H", "hgX", "hgY", "camDist", "x0", "yrPx", "lineY", "travW", "travH", "autosW", "flipCX", "flipCY", "flipW", "ctaW")}
    film["autosCX"] = L["autosL"] + L["autosW"] / 2
    film["autosCY"] = L["autosT"] + L["autosH"] / 2
    v = dict(L)
    v.update(
        trackW=m(6) - x0, m0=m(0), m1=m(1), m2=m(6), m0l=m(0) - 13, m1l=m(1) - 13, m2r=m(6) + 13,
        labY=lineY + 26, pillY=lineY + 80, presRight=L["W"] - m(6) - 13,
        markX=m(3), markTop=lineY, markPillTop=62, ghostW=m(6) - m(3),
        travTop=lineY - 18 - L["travH"],
        flipL=L["flipCX"] - L["flipW"] / 2, flipT=L["flipCY"] - L["flipH"] / 2,
        rewTop=L['rewTop'], rewLeft=L['rewLeft'],
        film=json.dumps(film),
    )
    if "/" in name:  # subprojeto 16:9 compartilha assets/ com o 9:16
        import os, shutil
        d = os.path.dirname(name)
        os.makedirs(d, exist_ok=True)
        if not os.path.islink(f"{d}/assets"):
            os.symlink("../assets", f"{d}/assets")
        for f in ("hyperframes.json", "package.json"):
            shutil.copy(f, f"{d}/{f}")
        open(f"{d}/meta.json", "w").write('{"id": "relogio-execucao-fiscal-16x9", "name": "relogio-execucao-fiscal-16x9"}')
    open(name, "w").write(TEMPLATE.substitute(v))
    print("✓", name)
