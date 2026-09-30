#!/usr/bin/env node
// Cria uma cena nova a partir do molde: npm run motion:new -- <nome> [9x16|16x9|1x1|4x5] [duração]
import fs from 'node:fs';
import path from 'node:path';

const FORMATS = { '9x16': [1080, 1920], '16x9': [1920, 1080], '1x1': [1080, 1080], '4x5': [1080, 1350] };
const [name, fmt = '9x16', dur = '8'] = process.argv.slice(2);
if (!name || !FORMATS[fmt]) {
  console.error('Uso: npm run motion:new -- <nome> [9x16|16x9|1x1|4x5] [duração em s]');
  process.exit(1);
}
const [w, h] = FORMATS[fmt];
const file = path.resolve(new URL('../scenes', import.meta.url).pathname, `${name}.html`);
if (fs.existsSync(file)) { console.error('Já existe: ' + file); process.exit(1); }

fs.writeFileSync(file, `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${name}</title>
<link rel="stylesheet" href="/motion/lib/brand.css">
<style>
  .bg { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 20%, #16405a 0%, var(--navy) 45%, var(--navy-deep) 100%); }
  .title { position: absolute; left: 8%; right: 8%; top: 42%; font: 400 ${Math.round(w / 9)}px/1.02 var(--serif); color: var(--creme); }
  .title em { font-style: italic; color: var(--terracota); }
</style>
</head>
<body>
<div class="stage">
  <div class="bg"></div>
  <div class="title" id="title">Título da <em>cena</em></div>
</div>
<script type="module">
  import { gsap } from '/node_modules/gsap/index.js';
  import { defineScene } from '/motion/lib/scene.js';

  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });
  tl.from('#title', { y: 60, autoAlpha: 0 }, 0.3)
    .to({}, { duration: ${dur} }, 0); // garante a duração total

  defineScene({ width: ${w}, height: ${h}, fps: 30, timeline: tl });
</script>
</body>
</html>
`);
console.log('Criada: ' + path.relative(process.cwd(), file));
