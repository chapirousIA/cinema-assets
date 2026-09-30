// Contrato de cena (lido por motion/scripts/render.mjs):
//   window.__scene = { width, height, fps, duration }
//   window.seek(t)  -> desenha o estado EXATO no tempo t (segundos). Sem relógio real,
//                      sem Math.random() solto, sem requestAnimationFrame dirigindo a animação.
//
// defineScene aceita uma timeline GSAP pausada e/ou uma função render(t) (canvas, SVG, DOM).
export function defineScene({ width = 1920, height = 1080, fps = 30, duration, timeline, render }) {
  if (timeline) timeline.pause(0);
  const dur = duration ?? timeline?.duration();
  if (!dur) throw new Error('defineScene: informe duration ou uma timeline com duração');
  document.documentElement.style.setProperty('--w', width + 'px');
  document.documentElement.style.setProperty('--h', height + 'px');
  window.__scene = { width, height, fps, duration: dur };
  window.seek = async (t) => {
    t = Math.max(0, Math.min(t, dur));
    if (timeline) timeline.seek(t, false);
    if (render) await render(t);
  };
  // Pré-visualização no navegador: ?play toca em tempo real; ?t=2.5 congela num quadro.
  const q = new URLSearchParams(location.search);
  if (q.has('t')) window.seek(Number(q.get('t')));
  else if (q.has('play')) {
    const t0 = performance.now();
    const loop = () => { window.seek(((performance.now() - t0) / 1000) % dur); requestAnimationFrame(loop); };
    loop();
  } else window.seek(0);
  return window.__scene;
}

// Utilitários determinísticos
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
/** progresso 0..1 entre t0 e t1 */
export const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
export const ease = {
  linear: (x) => x,
  outCubic: (x) => 1 - (1 - x) ** 3,
  inOutCubic: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  outExpo: (x) => (x === 1 ? 1 : 1 - 2 ** (-10 * x)),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
};
/** PRNG com semente (mulberry32) — use no lugar de Math.random() */
export function rng(seed = 1) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
