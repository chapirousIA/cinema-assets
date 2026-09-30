#!/usr/bin/env node
// Geração de imagens e clipes via Replicate, salvando cada saída com o prompt usado (sidecar .json).
//
//   node tools/replicate-gen.mjs image "prompt" --out <pasta> [--aspect 9:16] [--input '{"k":"v"}']
//   node tools/replicate-gen.mjs video "prompt" --image <arquivo|url> --out <pasta> [--duration 5] [--input '{...}']
//   node tools/replicate-gen.mjs check      (confirma que os modelos configurados existem)
//   node tools/replicate-gen.mjs redo <arquivo.json>   (refaz uma geração a partir do sidecar)
//
// Modelos (ajuste por variável de ambiente; slugs conforme o artigo, confirmar com `check`):
//   REPLICATE_IMAGE_MODEL  (padrão: openai/gpt-image-2.5)
//   REPLICATE_VIDEO_MODEL  (padrão: bytedance/seedance-2.5)
// Regra: se um modelo não existir, o script PARA e avisa. Nunca troca de modelo sozinho.
import Replicate from 'replicate';
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_MODEL = process.env.REPLICATE_IMAGE_MODEL || 'openai/gpt-image-2.5';
const VIDEO_MODEL = process.env.REPLICATE_VIDEO_MODEL || 'bytedance/seedance-2.5';

const [cmd, ...rest] = process.argv.slice(2);
const flags = {}; const pos = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[i + 1]?.startsWith('--') || rest[i + 1] === undefined ? true : rest[++i];
  else pos.push(rest[i]);
}

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN não definido. Configure-o nas variáveis do ambiente (não cole no chat).');
  process.exit(1);
}
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function assertModel(slug) {
  const [owner, name] = slug.split('/');
  try {
    const m = await replicate.models.get(owner, name);
    return m;
  } catch (e) {
    console.error(`✗ Modelo "${slug}" indisponível no Replicate (${e.message.split('\n')[0]}).`);
    console.error('  Não troquei de modelo. Confirme o slug correto em replicate.com e defina a variável de ambiente.');
    process.exit(3);
  }
}

async function save(output, outDir, base, record) {
  fs.mkdirSync(outDir, { recursive: true });
  const items = Array.isArray(output) ? output : [output];
  const files = [];
  for (const [i, item] of items.entries()) {
    const url = typeof item === 'string' ? item : item.url?.().toString?.() ?? String(item);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download falhou ${res.status} ${url}`);
    const ext = (new URL(url).pathname.match(/\.(\w+)$/)?.[1] || (record.kind === 'video' ? 'mp4' : 'png')).toLowerCase();
    const file = path.join(outDir, `${base}${items.length > 1 ? '_' + i : ''}.${ext}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    files.push(file);
  }
  const sidecar = path.join(outDir, `${base}.json`);
  fs.writeFileSync(sidecar, JSON.stringify({ ...record, files: files.map((f) => path.basename(f)), created: new Date().toISOString() }, null, 2));
  files.forEach((f) => console.log('✓', f));
  console.log('  prompt salvo em', sidecar);
}

const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '');

async function run(kind, model, input, outDir, base) {
  const m = await assertModel(model);
  const version = m.latest_version?.id;
  console.log(`→ ${kind} com ${model}${version ? '@' + version.slice(0, 8) : ''}`);
  const output = await replicate.run(model, { input });
  await save(output, outDir, base, { kind, model, version, input });
}

const extra = flags.input ? JSON.parse(flags.input) : {};
const outDir = path.resolve(flags.out || 'assets/generated');

if (cmd === 'check') {
  for (const s of [IMAGE_MODEL, VIDEO_MODEL]) { await assertModel(s); console.log('✓', s); }
} else if (cmd === 'image') {
  const prompt = pos.join(' ');
  if (!prompt) throw new Error('Informe o prompt.');
  await run('image', IMAGE_MODEL, { prompt, ...(flags.aspect && { aspect_ratio: flags.aspect }), ...extra }, outDir, `img_${stamp()}_${slugify(prompt)}`);
} else if (cmd === 'video') {
  const prompt = pos.join(' ');
  if (!prompt || !flags.image) throw new Error('Informe o prompt e --image.');
  const image = /^https?:/.test(flags.image) ? flags.image : fs.readFileSync(flags.image);
  const input = { prompt, image, ...(flags.duration && { duration: Number(flags.duration) }), ...extra };
  const rec = { ...input, image: typeof image === 'string' ? image : path.resolve(flags.image) };
  const m = await assertModel(VIDEO_MODEL);
  console.log(`→ video com ${VIDEO_MODEL}`);
  const output = await replicate.run(VIDEO_MODEL, { input });
  await save(output, outDir, `clip_${stamp()}_${slugify(prompt)}`, { kind: 'video', model: VIDEO_MODEL, version: m.latest_version?.id, input: rec });
} else if (cmd === 'redo') {
  const rec = JSON.parse(fs.readFileSync(pos[0], 'utf8'));
  const input = { ...rec.input };
  if (rec.kind === 'video' && input.image && !/^https?:/.test(input.image)) input.image = fs.readFileSync(input.image);
  await run(rec.kind, rec.model, input, path.dirname(path.resolve(pos[0])), `${rec.kind === 'video' ? 'clip' : 'img'}_${stamp()}_redo`);
} else {
  console.error('Uso: replicate-gen.mjs image|video|check|redo ... (veja o cabeçalho do arquivo)');
  process.exit(1);
}
