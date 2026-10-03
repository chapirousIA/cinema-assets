// Suspenseful 24 s score, synthesized from scratch (no samples). Every hit is placed from src/timeline.json,
// the same file the video reads, so sound lands on the exact visual frame.  → public/music.raw.wav (44.1 kHz stereo)
import fs from "node:fs";
const TL = JSON.parse(fs.readFileSync(new URL("../src/timeline.json", import.meta.url)));
const SR = 44100, DUR = 24, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const sendL = new Float32Array(N), sendR = new Float32Array(N); // reverb send
const fr = (frame) => frame / TL.fps; // frame → seconds
let seed = 20260601;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const noise = () => rnd() * 2 - 1;
const TAU = Math.PI * 2;

function add(t0, len, fn, { gain = 1, pan = 0, send = 0 } = {}) {
  const i0 = Math.max(0, Math.round(t0 * SR)), n = Math.round(len * SR);
  const gl = gain * Math.sqrt(0.5 * (1 - pan)), gr = gain * Math.sqrt(0.5 * (1 + pan));
  for (let k = 0; k < n && i0 + k < N; k++) {
    const v = fn(k / SR, k);
    const p = typeof pan === "function" ? pan(k / SR) : null;
    const a = p === null ? gl : gain * Math.sqrt(0.5 * (1 - p)), b = p === null ? gr : gain * Math.sqrt(0.5 * (1 + p));
    L[i0 + k] += v * a; R[i0 + k] += v * b;
    if (send) { sendL[i0 + k] += v * a * send; sendR[i0 + k] += v * b * send; }
  }
}
// simple filters
const onePoleLP = () => { let y = 0; return (x, fc) => { const a = 1 - Math.exp((-TAU * fc) / SR); y += a * (x - y); return y; }; };
const biquadBP = () => { let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, f0, q = 2) => { const w = (TAU * f0) / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w);
    const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }; };
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

// ---------- drone (0–22 s): two detuned saws + sine near 55 Hz, slow filter movement ----------
{ const lp1 = onePoleLP(), lp2 = onePoleLP(); let p1 = 0, p2 = 0, p3 = 0;
  add(0, 22.6, (t) => {
    p1 += 55 / SR; p2 += 55.42 / SR; p3 += 27.5 / SR;
    const fc = 160 + 110 * Math.sin(t * 0.45) + 140 * Math.max(0, (t - 19) / 3);
    const s = lp1(saw(p1), fc) * 0.6 + lp2(saw(p2), fc * 1.1) * 0.6 + Math.sin(TAU * p3) * 0.55;
    let g = Math.min(1, t / 1.2);
    if (t > 3) g *= 0.62; if (t > 19) g *= 1 + 0.6 * Math.min(1, (t - 19) / 2.5);
    if (t > 21.5) g *= Math.max(0, 1 - (t - 21.5) / 1.1);
    return s * g;
  }, { gain: 0.32 }); }

// ---------- clock ticks (0–3 s) ----------
for (let k = 0; k < 6; k++) {
  const bp = biquadBP(); const hi = k % 2 === 0;
  add(0.25 + k * 0.5, 0.06, (t) => bp(noise(), hi ? 3200 : 2400, 6) * Math.exp(-t / 0.008) * 3 + Math.sin(TAU * (hi ? 1900 : 1500) * t) * Math.exp(-t / 0.012) * 0.4,
    { gain: 0.16, pan: hi ? -0.3 : 0.3 });
}

// ---------- riser 2–3 s into the warp, then sub-boom on the title slam ----------
function riser(t0, t1, gain, top = 7000) {
  const bp = biquadBP(), len = t1 - t0; let ph = 0;
  add(t0, len, (t) => { const u = t / len, f0 = 300 * Math.pow(top / 300, u);
    ph += (140 * Math.pow(10, u)) / SR;
    return (bp(noise(), f0, 1.6) * 2.2 + Math.sin(TAU * ph) * 0.25) * u * u * (u > 0.985 ? (1 - u) / 0.015 : 1); }, { gain, send: 0.3 });
}
function boom(t0, gain, len = 2.4) {
  let ph = 0; const lp = onePoleLP();
  add(t0, len, (t) => { const f0 = 34 + 46 * Math.exp(-t / 0.18); ph += f0 / SR;
    return Math.sin(TAU * ph) * env(t, 0.004, 0.75) * 1.1 + lp(noise(), 900) * Math.exp(-t / 0.09) * 1.6; }, { gain, send: 0.45 });
}
riser(2.0, fr(TL.slam), 0.42);
boom(fr(TL.slam), 0.95);

// ---------- 3–19 s: heartbeat sub at 120 BPM, ticking hats, eerie pad ----------
for (let t = 3.0; t < 19.0 - 1e-6; t += 0.5) {
  for (const [dt, g] of [[0, 1], [0.16, 0.55]]) {
    let ph = 0; add(t + dt, 0.3, (u) => { ph += (48 + 22 * Math.exp(-u / 0.05)) / SR; return Math.sin(TAU * ph) * env(u, 0.003, 0.09); }, { gain: 0.5 * g });
  }
}
for (let t = 3.0, k = 0; t < 19.0 - 1e-6; t += 0.25, k++) {
  let y = 0, xp = 0; // one-pole high-pass
  add(t, 0.05, (u) => { const x = noise(); y = 0.86 * (y + x - xp); xp = x; return y * Math.exp(-u / (k % 2 ? 0.012 : 0.02)); },
    { gain: k % 2 ? 0.09 : 0.06, pan: k % 2 ? 0.35 : -0.25 });
}
for (const [hz, pan] of [[880, -0.5], [1046.5, 0.4], [1318.5, 0.1], [659.25, -0.1]]) {
  const lp = onePoleLP(); let ph = 0;
  add(3.0, 16.3, (t) => { const vib = 1 + 0.004 * Math.sin(TAU * 5.2 * t + hz);
    ph += (hz * vib) / SR; let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(TAU * ph * h) / h;
    const sw = 0.55 + 0.45 * Math.sin(t * 0.7 + hz * 0.01);
    return lp(s, 2600) * sw * Math.min(1, t / 2.5) * Math.min(1, (16.3 - t) / 1.2); }, { gain: 0.03, pan, send: 0.6 });
}

// ---------- whooshes on every transition (peak on the cut frame) ----------
TL.scenes.slice(0, -1).forEach((s, i) => {
  const b = fr(s.from + s.dur), kind = TL.transitions[i]; const bp = biquadBP();
  const pre = 0.32, post = 0.28;
  add(b - pre, pre + post, (t) => { const u = t - pre; const e = u < 0 ? Math.pow(1 + u / pre, 2.2) : Math.exp(-u / 0.09);
    const f0 = u < 0 ? 500 + 3500 * (1 + u / pre) : 4000 - 2500 * Math.min(1, u / post);
    return bp(noise(), f0, 1.2) * e * 2.4; }, { gain: kind === "whip" ? 0.34 : 0.26, pan: kind === "whip" ? (t) => -0.8 + 1.6 * Math.min(1, t / (pre + post)) : 0, send: 0.2 });
});

// ---------- terminal: key clicks per typed character, log blips, confirm blip ----------
const T0 = TL.scenes[3].from;
for (let i = 0; i < TL.cmd.length; i++) {
  const frame = T0 + Math.ceil(TL.typeStart + i * TL.typeStep);
  const sp = TL.cmd[i] === " "; const bp = biquadBP(); const pitch = 2600 + rnd() * 1400;
  add(fr(frame), 0.03, (t) => bp(noise(), sp ? 1500 : pitch, 4) * Math.exp(-t / 0.006) * 3 + Math.sin(TAU * 180 * t) * Math.exp(-t / 0.01) * 0.3,
    { gain: (sp ? 0.1 : 0.075) * (0.8 + rnd() * 0.4), pan: (rnd() - 0.5) * 0.4 });
}
TL.logFrames.forEach((lf, i) => add(fr(T0 + lf), 0.07, (t) => Math.sin(TAU * (1250 + i * 80) * t) * env(t, 0.002, 0.02), { gain: 0.06 }));
add(fr(T0 + TL.shippedAt), 0.12, (t) => Math.sin(TAU * 880 * t) * env(t, 0.003, 0.04), { gain: 0.16, send: 0.3 });
add(fr(T0 + TL.shippedAt) + 0.07, 0.25, (t) => Math.sin(TAU * 1320 * t) * env(t, 0.003, 0.08), { gain: 0.16, send: 0.3 });

// ---------- easing: soft tick when each dot arrives ----------
[0, 1, 2, 3, 4, 5].forEach((i) => { const a = fr(TL.scenes[4].from + TL.easingStart + i * TL.easingStagger + TL.easingDur);
  const hz = [1046, 1174, 1318, 1568, 1760, 2093][i];
  add(a, 0.2, (t) => Math.sin(TAU * hz * t) * env(t, 0.002, 0.05), { gain: 0.07, pan: -0.5 + i * 0.2, send: 0.3 }); });
// ---------- network: gentle pulse blips as each signal leaves the input ----------
TL.networkFire.forEach((nf, i) => add(fr(TL.scenes[5].from + nf), 0.25, (t) => Math.sin(TAU * (523 + i * 66) * t) * env(t, 0.004, 0.07), { gain: 0.05, send: 0.5 }));
// ---------- morph resolves into the logo: shimmer ----------
{ const t = fr(TL.scenes[6].from + TL.morphLogoAt); for (const hz of [2093, 2637, 3136, 4186])
  add(t, 1.2, (u) => Math.sin(TAU * hz * u) * env(u, 0.004, 0.3), { gain: 0.03, send: 0.7 }); }

// ---------- kinetic words: hard hits, building ----------
TL.kineticHits.forEach((h, i) => {
  const t0 = fr(h), g = [0.55, 0.65, 0.8, 1.0][i];
  let ph = 0; add(t0, 0.5, (t) => { ph += (45 + 90 * Math.exp(-t / 0.03)) / SR; return Math.sin(TAU * ph) * env(t, 0.002, 0.16); }, { gain: 0.9 * g });
  const bp = biquadBP(); add(t0, 0.25, (t) => bp(noise(), 1800, 0.8) * Math.exp(-t / 0.05) * 2, { gain: 0.35 * g, send: 0.35 });
  const lp = onePoleLP(); let q = 0;
  add(t0, 0.6, (t) => { q += 1 / SR; let s = 0; for (const hz of [110, 164.8, 220]) s += saw(hz * q);
    return lp(s, 900) * env(t, 0.003, 0.18); }, { gain: 0.18 * g, send: 0.3 });
});

// ---------- finale: long riser, logo-lock boom + shimmer, calm resolving chord ----------
const LOCK = fr(TL.logoLock);
riser(fr(TL.scenes[10].from), LOCK, 0.5, 9000);
boom(LOCK, 1.15, 3.2);
for (const hz of [1760, 2217, 2637, 3520, 4434]) add(LOCK, 2.5, (t) => Math.sin(TAU * hz * t) * env(t, 0.005, 0.6) * (1 + 0.3 * Math.sin(TAU * 7 * t)), { gain: 0.035, send: 0.8, pan: (hz % 3) / 3 - 0.3 });
{ const lp = onePoleLP(); let q = 0; const chord = [55, 82.41, 110, 138.59, 164.81, 220];
  add(21.8, 2.2, (t) => { q += 1 / SR; let s = 0; chord.forEach((hz, i) => { s += Math.sin(TAU * hz * q) * (i < 2 ? 0.9 : 0.5) + saw(hz * q * 1.002) * 0.12; });
    return lp(s, 1400) * Math.min(1, t / 0.5) * Math.max(0, 1 - Math.max(0, t - 0.8) / 1.4); }, { gain: 0.22, send: 0.5 });
}

// ---------- reverb (Freeverb-style combs + allpasses) ----------
function verb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map((d) => ({ buf: new Float32Array(d + spread), i: 0, lp: 0 }));
  const aps = [556, 441, 341].map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.buf[c.i]; c.lp = y * 0.6 + c.lp * 0.4; c.buf[c.i] = inp[n] * 0.18 + c.lp * 0.82; c.i = (c.i + 1) % c.buf.length; s += y; }
    for (const a of aps) { const b = a.buf[a.i]; const y = -s + b; a.buf[a.i] = s + b * 0.5; a.i = (a.i + 1) % a.buf.length; s = y; }
    out[n] = s;
  }
  return out;
}
const vL = verb(sendL, 0), vR = verb(sendR, 23);
let peak = 0;
for (let n = 0; n < N; n++) {
  L[n] = Math.tanh((L[n] + vL[n] * 0.35) * 0.9); R[n] = Math.tanh((R[n] + vR[n] * 0.35) * 0.9);
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
// write 16-bit WAV
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
const g = 0.89 / peak;
for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(L[n] * g * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(R[n] * g * 32767), 46 + n * 4); }
fs.writeFileSync("public/music.raw.wav", buf);
console.log("public/music.raw.wav", (N / SR).toFixed(1) + "s", "peak", peak.toFixed(3));
