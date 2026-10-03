import { continueRender, delayRender, staticFile } from "remotion";
import TL from "./timeline.json";
export { TL };

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const SAFE = 72;

export const C = {
  blue: "#3D40FE",
  blueDark: "#2A2DE0",
  blueBright: "#4A4DFF",
  white: "#FFFFFF",
  navy: "#0A0B3D",
  light: "#8C8EFF",
  ice: "#C9CAFF",
};

export const F = {
  head: "'Archivo Black', sans-serif",
  serif: "'Instrument Serif', serif",
  mono: "'JetBrains Mono', monospace",
};

// ---------- fonts (local woff2, render waits for them) ----------
const fonts: [string, string, FontFaceDescriptors][] = [
  ["Archivo Black", "fonts/archivo-black-latin-400-normal.woff2", { weight: "400" }],
  ["Instrument Serif", "fonts/instrument-serif-latin-400-italic.woff2", { style: "italic", weight: "400" }],
  ["JetBrains Mono", "fonts/jetbrains-mono-latin-400-normal.woff2", { weight: "400" }],
  ["JetBrains Mono", "fonts/jetbrains-mono-latin-700-normal.woff2", { weight: "700" }],
];
if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  Promise.all(
    fonts.map(([fam, file, d]) => {
      const ff = new FontFace(fam, `url(${staticFile(file)}) format("woff2")`, d);
      return ff.load().then((x) => document.fonts.add(x));
    }),
  ).then(() => continueRender(handle), () => continueRender(handle));
}

// ---------- math ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const expoIn = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const cubicInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const cubicIn = (t: number) => t * t * t;
export const backOut = (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
export const elasticOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
export const bounceOut = (t: number) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

// seeded PRNG (mulberry32) – identical on every render
export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// smooth noise: sum of slow sines (no per-frame jitter)
export const smooth = (t: number, s = 0) =>
  (Math.sin(t * 0.91 + s) + Math.sin(t * 1.73 + s * 2.1) * 0.6 + Math.sin(t * 2.97 + s * 3.7) * 0.35) / 1.95;

export const IMPACTS: number[] = TL.impacts;
export const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const i of IMPACTS) {
    const d = f - i;
    if (d < 0 || d > 20) continue;
    const k = Math.pow(1 - d / 20, 2) * 14;
    x += k * smooth(d * 0.9, i);
    y += k * smooth(d * 0.9, i + 7.3);
  }
  return { x, y };
};

// 4-point sparkle path (concave star)
export const sparklePath = (cx: number, cy: number, r: number, k = 0.14) => {
  const q = r * k;
  return `M ${cx} ${cy - r} Q ${cx + q} ${cy - q} ${cx + r} ${cy} Q ${cx + q} ${cy + q} ${cx} ${cy + r} Q ${cx - q} ${cy + q} ${cx - r} ${cy} Q ${cx - q} ${cy - q} ${cx} ${cy - r} Z`;
};

// soft glow made of a radial gradient (no CSS blur filters)
export const glow = (color = "255,255,255", a = 0.5) =>
  `radial-gradient(circle, rgba(${color},${a}) 0%, rgba(${color},${a * 0.45}) 25%, rgba(${color},${a * 0.12}) 50%, rgba(${color},0) 70%)`;

// scene schedule + event frames live in timeline.json (shared with scripts/music.mjs)
export const SCENES = TL.scenes;
export const TRANS = TL.transitions;
export const PAD = TL.pad;
