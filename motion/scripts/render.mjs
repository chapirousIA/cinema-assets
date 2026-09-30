#!/usr/bin/env node
// Render determinístico: Playwright chama window.seek(t) quadro a quadro,
// captura PNG e envia por pipe ao ffmpeg (H.264 yuv420p, pronto para redes sociais).
//
// Uso:
//   node motion/scripts/render.mjs <cena.html> [--out arquivo.mp4] [--fps 30]
//        [--scale 1] [--from 0] [--to <dur>] [--audio trilha.mp3] [--crf 16] [--workers N] [--preset slow]
//        [--draft]  (prévia rápida: JPEG + x264 veryfast)
//   node motion/scripts/render.mjs <cena.html> --stills 0,1.5,3,6   (QA: PNGs nos tempos)
//   node motion/scripts/render.mjs <cena.html> --sheet 12            (QA: grade com 12 quadros)
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { startServer } from './serve.mjs';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const args = process.argv.slice(2);
const scene = args.find((a) => !a.startsWith('--') && !isFlagValue(a));
function isFlagValue(a) { const i = args.indexOf(a); return i > 0 && args[i - 1].startsWith('--'); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

if (!scene) { console.error('Uso: render.mjs <cena.html> [--out x.mp4] [--stills 0,1,2]'); process.exit(1); }
const sceneAbs = path.resolve(scene);
if (!fs.existsSync(sceneAbs)) { console.error('Cena não encontrada: ' + sceneAbs); process.exit(1); }
const name = path.basename(sceneAbs, '.html');
const outDir = path.join(ROOT, 'motion/out');
fs.mkdirSync(outDir, { recursive: true });

const server = await startServer(ROOT);
const url = `http://127.0.0.1:${server.address().port}/${path.relative(ROOT, sceneAbs).split(path.sep).join('/')}`;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--font-render-hinting=none'] });

const errors = [];
const scale = Number(opt('scale', 1));
const draft = args.includes('--draft');

async function openPage(viewport) {
  const page = await browser.newPage(viewport ? { viewport, deviceScaleFactor: scale } : {});
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__scene && typeof window.seek === 'function', null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.__ready ?? true); // cenas podem expor Promise __ready (imagens, dados)
  // Captura via CDP: PNG sem perda com compressão rápida (~3x mais rápido que page.screenshot png);
  // --draft troca por JPEG q90 (prévia rápida).
  const cdp = await page.context().newCDPSession(page);
  const shot = draft ? { format: 'jpeg', quality: 90 } : { format: 'png', optimizeForSpeed: true };
  page.capture = async () => Buffer.from((await cdp.send('Page.captureScreenshot', shot)).data, 'base64');
  page.seek = async (t) => {
    await page.evaluate(async (t) => { await window.seek(t); }, t);
    // garante que layout/pintura do quadro terminaram antes da captura
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  return page;
}

const run = (argv) => new Promise((res, rej) => spawn(ffmpegPath, argv, { stdio: 'inherit' })
  .on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c)))));

try {
  const probe = await openPage();
  const meta = await probe.evaluate(() => window.__scene);
  await probe.close();
  const viewport = { width: meta.width, height: meta.height };

  const sheetN = Number(opt('sheet', 0));
  const stills = sheetN
    ? Array.from({ length: sheetN }, (_, i) => +((i + 0.5) * meta.duration / sheetN).toFixed(2)).join(',')
    : opt('stills');
  if (stills) {
    const page = await openPage(viewport);
    const dir = path.join(outDir, `${name}_stills`);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (const [i, t] of stills.split(',').map(Number).entries()) {
      await page.seek(t);
      const f = path.join(dir, `${String(i).padStart(3, '0')}_t${t.toFixed(2)}.png`);
      await page.screenshot({ path: f });
      if (!sheetN) console.log('still', f);
    }
    if (sheetN) {
      const cols = Math.ceil(Math.sqrt(sheetN * meta.height / meta.width));
      const rows = Math.ceil(sheetN / cols);
      const sheet = path.join(outDir, `${name}_sheet.png`);
      await run(['-y', '-loglevel', 'error', '-framerate', '1', '-pattern_type', 'glob', '-i', path.join(dir, '*.png'),
        '-vf', `scale=${Math.round(1920 / cols)}:-1,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', sheet]);
      console.log(`sheet ${sheet}\n(ordem: esquerda→direita, cima→baixo; tempos: ${stills})`);
    }
  } else {
    const fps = Number(opt('fps', meta.fps || 30));
    const from = Number(opt('from', 0));
    const to = Number(opt('to', meta.duration));
    const total = Math.round((to - from) * fps);
    const out = path.resolve(opt('out', path.join(outDir, `${name}.mp4`)));
    const audio = opt('audio');
    const workers = Math.max(1, Math.min(Number(opt('workers', os.availableParallelism?.() ?? 4)), total));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `render-${name}-`));
    const t0 = Date.now();
    let done = 0;

    // Cada worker renderiza um trecho contíguo em uma página própria e codifica seu segmento;
    // como seek(t) é determinístico, a ordem de execução não altera o resultado.
    const chunk = Math.ceil(total / workers);
    const segs = await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const a = w * chunk, b = Math.min(total, a + chunk);
      if (a >= b) return null;
      const seg = path.join(tmp, `seg_${String(w).padStart(3, '0')}.mp4`);
      const page = await openPage(viewport);
      const proc = spawn(ffmpegPath, [
        '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
        '-c:v', 'libx264', '-preset', opt('preset', draft ? 'veryfast' : 'slow'), '-crf', String(opt('crf', 16)), '-pix_fmt', 'yuv420p',
        '-r', String(fps), seg,
      ], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let i = a; i < b; i++) {
        await page.seek(from + i / fps);
        const buf = await page.capture();
        if (!proc.stdin.write(buf)) await new Promise((r) => proc.stdin.once('drain', r));
        if (++done % fps === 0) process.stdout.write(`\r${name}: ${done}/${total} quadros`);
      }
      proc.stdin.end();
      await new Promise((res, rej) => proc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c)))));
      await page.close();
      return seg;
    }));

    const list = path.join(tmp, 'list.txt');
    fs.writeFileSync(list, segs.filter(Boolean).map((f) => `file '${f}'`).join('\n'));
    await run([
      '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
      ...(audio ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
      '-c:v', 'copy', '-movflags', '+faststart', out,
    ]);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`\r${name}: ${total} quadros, ${workers} workers, ${((Date.now() - t0) / 1000).toFixed(1)}s → ${out}`);
  }
  if (errors.length) { console.error('Erros na cena:\n- ' + [...new Set(errors)].join('\n- ')); process.exitCode = 2; }
} finally {
  await browser.close();
  server.close();
}
