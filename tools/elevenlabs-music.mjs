#!/usr/bin/env node
// Gera trilha musical no ElevenLabs (endpoint Music). Requer ELEVENLABS_API_KEY no ambiente.
//   node tools/elevenlabs-music.mjs "piano suave, violão limpo, batida calma e constante, sem vocais" --seconds 26 --out assets/audio/trilha-a.mp3
// Dica: gere 2 opções (o artigo entrega o vídeo com duas trilhas para o cliente escolher).
// Se a API responder erro de endpoint/parâmetro, consulte a documentação atual do ElevenLabs antes de ajustar.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const prompt = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')).join(' ');
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY não definido. Configure-o nas variáveis do ambiente.'); process.exit(1); }
if (!prompt) { console.error('Informe o prompt da trilha.'); process.exit(1); }

const seconds = Number(opt('seconds', 30));
const out = path.resolve(opt('out', `assets/audio/trilha_${Date.now()}.mp3`));
const res = await fetch('https://api.elevenlabs.io/v1/music', {
  method: 'POST',
  headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
  body: JSON.stringify({ prompt, music_length_ms: Math.round(seconds * 1000) }),
});
if (!res.ok) { console.error(`✗ ElevenLabs ${res.status}: ${await res.text()}`); process.exit(2); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
fs.writeFileSync(out.replace(/\.\w+$/, '.json'), JSON.stringify({ prompt, seconds, created: new Date().toISOString() }, null, 2));
console.log('✓', out);
