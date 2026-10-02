// "O relógio da execução fiscal" — lógica compartilhada pelos formatos 9:16 (index.html) e 16:9 (landscape.html).
// Layout vem de window.FILM (definido em cada HTML). Tudo é função do tempo t (determinístico).
import * as THREE from "./vendor/three.module.js";

const F = window.FILM;
const { W, H } = F;
const clamp = (x) => Math.min(1, Math.max(0, x));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------------- linha do tempo (posições em px) ----------------
const X0 = F.x0, YR = F.yrPx, LINE_Y = F.lineY;
const xAt = (years) => X0 + years * YR;
const MARK_YEARS = 3; // marco de citação/penhora efetiva (cena 3), em anos desde a suspensão
const TRAV_CY = LINE_Y - 18 - F.travH / 2;          // centro vertical do marcador "autos"
const TRAV_END_X = X0 + (MARK_YEARS + 2) * YR;      // posição final do marcador (t ≥ 19,8 s)
F.autosToX = X0 - F.autosCX; F.autosToY = TRAV_CY - F.autosCY;
F.travToX = F.flipCX - TRAV_END_X; F.travToY = F.flipCY - TRAV_CY;

// ---------------- estado do relógio em função do tempo ----------------
// anos contados, rotação da ampulheta (0 → π → 2π) e areia nos bulbos A (topo local) e B
export function clock(t) {
  let years = 0, rot = 0, A = 1, B = 0, running = false;
  if (t < 4.0) { years = 0; }
  else if (t < 7.0) { const p = seg(t, 4.0, 7.0); years = p; A = 1 - p; B = p; running = true; }
  else if (t < 7.6) { years = 1; A = 0; B = 1; rot = Math.PI * inOut(seg(t, 7.0, 7.6)); }
  else if (t < 12.4) { const p = seg(t, 7.6, 12.4); years = 1 + 5 * p; A = p; B = 1 - p; rot = Math.PI; running = true; }
  else if (t < 14.6) { years = 6; A = 1; B = 0; rot = Math.PI; }
  else if (t < 15.2) { years = 6; A = 1; B = 0; rot = Math.PI * (1 + inOut(seg(t, 14.6, 15.2))); }
  else { const p = seg(t, 15.3, 19.8); years = 3 * p; A = 1 - 0.6 * p; B = 0.6 * p; rot = 2 * Math.PI; running = p > 0 && p < 1; }
  return { years, rot, A, B, running };
}

// posição (px) do marcador "autos" na linha do tempo
function travelerX(t) {
  const c = clock(t);
  if (t < 14.3) return xAt(c.years); // 0 → 1 ano (suspensão) → 6 anos (+5 de prescrição)
  // cena 3: volta ao marco de interrupção e recomeça a contar dali
  if (t < 15.3) return lerp(xAt(6), xAt(MARK_YEARS), outCubic(seg(t, 14.3, 15.0)));
  return xAt(MARK_YEARS + c.years * (2 / 3)); // anda 2 "anos" de linha enquanto o novo prazo corre
}

// ---------------- 3D: ampulheta ----------------
const canvas = document.getElementById("three-layer");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(W, H, false);
renderer.setPixelRatio(1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
camera.position.set(0, 0.35, F.camDist);
camera.lookAt(0, 0, 0);
camera.setViewOffset(W, H, W / 2 - F.hgX, H / 2 - F.hgY, W, H); // põe a ampulheta em (hgX, hgY) px
scene.add(new THREE.HemisphereLight(0xfff4e8, 0x0b2230, 1.5));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(3, 5, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0xe8631c, 0.9);
rim.position.set(-5, 1, -3);
scene.add(rim);

const flipG = new THREE.Group();
scene.add(flipG);
const hg = new THREE.Group();
flipG.add(hg);
// vidro (perfil torneado)
const prof = [[0.50, -1.25], [0.62, -1.15], [0.74, -0.9], [0.72, -0.7], [0.55, -0.4], [0.25, -0.15], [0.07, 0], [0.25, 0.15], [0.55, 0.4], [0.72, 0.7], [0.74, 0.9], [0.62, 1.15], [0.50, 1.25]]
  .map(([r, y]) => new THREE.Vector2(r, y));
const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 64),
  new THREE.MeshStandardMaterial({ color: 0xdfe9ef, transparent: true, opacity: 0.17, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }));
glass.renderOrder = 2;
hg.add(glass);
// tampas e colunas (terracota)
const capMat = new THREE.MeshStandardMaterial({ color: 0x8f5434, roughness: 0.45, metalness: 0.35 });
for (const y of [-1.33, 1.33]) {
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 48), capMat);
  cap.position.y = y;
  hg.add(cap);
}
for (let i = 0; i < 3; i++) {
  const a = (i / 3) * Math.PI * 2 + 0.4;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12), new THREE.MeshStandardMaterial({ color: 0xb97047, roughness: 0.4, metalness: 0.5 }));
  post.position.set(Math.cos(a) * 0.82, 0, Math.sin(a) * 0.82);
  hg.add(post);
}
// areia
const sandMat = new THREE.MeshStandardMaterial({ color: 0xe0a56a, roughness: 0.9 });
const CONE_R = 0.6, CONE_H = 0.62;
const sandA = new THREE.Mesh(new THREE.ConeGeometry(CONE_R, CONE_H, 48), sandMat);
const sandB = new THREE.Mesh(new THREE.ConeGeometry(CONE_R, CONE_H, 48), sandMat);
sandA.rotation.x = Math.PI; // bulbo A (topo local): ponta para o gargalo (−y)
hg.add(sandA, sandB);
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), sandMat);
hg.add(stream);
// sombra de contato
const sc = document.createElement("canvas"); sc.width = sc.height = 128;
const g2 = sc.getContext("2d"); const rg = g2.createRadialGradient(64, 64, 4, 64, 64, 64);
rg.addColorStop(0, "rgba(0,0,0,0.5)"); rg.addColorStop(1, "rgba(0,0,0,0)"); g2.fillStyle = rg; g2.fillRect(0, 0, 128, 128);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.5;
scene.add(shadow);

function placeSand(mesh, sign, amount, draining) {
  // sign: +1 bulbo A (y local +), −1 bulbo B. draining: bulbo de cima (encosta no gargalo); senão, monte no fundo.
  const s = Math.cbrt(Math.max(0, amount));
  mesh.visible = s > 0.02;
  mesh.scale.setScalar(Math.max(s, 0.001));
  const half = (CONE_H / 2) * s;
  mesh.position.y = draining ? sign * (0.1 + half) : sign * (1.17 - half);
}

function render3D(t) {
  const c = clock(t);
  const aTop = Math.cos(c.rot) > 0; // bulbo A está em cima no mundo?
  placeSand(sandA, +1, c.A, aTop);
  placeSand(sandB, -1, c.B, !aTop);
  // filete: do gargalo até o monte do bulbo de baixo (em coordenadas locais)
  stream.visible = c.running;
  if (c.running) {
    const pile = aTop ? sandB : sandA;
    const sign = aTop ? -1 : 1;
    const top = sign * (1.17 - CONE_H * pile.scale.y); // ponta do monte
    const len = Math.abs(top) - 0.02;
    stream.scale.y = Math.max(len, 0.01);
    stream.position.y = sign * (0.02 + len / 2);
  }
  flipG.rotation.z = c.rot;
  hg.rotation.y = 0.5 + t * 0.22;
  const intro = outCubic(seg(t, 3.35, 4.2));
  flipG.position.y = lerp(-0.6, 0, intro) + Math.sin(t * 1.3) * 0.03;
  flipG.scale.setScalar(lerp(0.85, 1, intro));
  renderer.render(scene, camera);
}

// ---------------- poeira (cena 1) ----------------
const dust = document.getElementById("dust");
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const motes = Array.from({ length: 46 }, () => ({ x: rnd() * W, y: rnd() * H, r: 1.5 + rnd() * 3.5, sp: 8 + rnd() * 22, ph: rnd() * 6.28, op: 0.15 + rnd() * 0.35 }));
dust.innerHTML = motes.map(() => "<i></i>").join("");
const moteEls = [...dust.children];

// ---------------- ondas de fundo ----------------
const svg = document.querySelector("svg.waves");
const waves = Array.from({ length: 11 }, (_, i) => ({ y: (H / 11) * (i + 0.5), amp: 14 + rnd() * 26, fq: 1 + rnd() * 1.2, ph: rnd() * 6.28, sp: 0.2 + rnd() * 0.3, op: 0.06 + rnd() * 0.1, c: i % 4 === 1 ? "#e8631c" : "#b97047" }));
svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
svg.innerHTML = waves.map((w) => `<path fill="none" stroke="${w.c}" stroke-width="1.6"/>`).join("");
const wavePaths = [...svg.querySelectorAll("path")];

const yearsEl = document.getElementById("yearsv");
const unitEl = document.getElementById("yearsu");
const trav = document.getElementById("trav");

function renderAt(t) {
  waves.forEach((w, i) => {
    let d = "";
    for (let x = -20; x <= W + 40; x += 32) {
      const y = w.y + Math.sin((x / W) * Math.PI * 2 * w.fq + w.ph + t * w.sp * 2) * w.amp - t * 5;
      d += (x === -20 ? "M" : "L") + x + " " + y.toFixed(1);
    }
    wavePaths[i].setAttribute("d", d);
    wavePaths[i].setAttribute("opacity", w.op.toFixed(3));
  });
  const dustOn = 1 - seg(t, 2.9, 3.5);
  moteEls.forEach((el, i) => {
    const m = motes[i];
    const y = (m.y - t * m.sp + H) % H;
    const x = m.x + Math.sin(t * 0.8 + m.ph) * 18;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.style.width = el.style.height = m.r.toFixed(1) + "px";
    el.style.opacity = (m.op * dustOn * (0.6 + 0.4 * Math.sin(t * 2 + m.ph))).toFixed(3);
  });
  if (t > 3.2 && t < 20.6) render3D(t);
  const c = clock(t);
  const n = Math.floor(c.years + 1e-6);
  yearsEl.textContent = n;
  unitEl.textContent = n === 1 ? "ano" : "anos";
  // marcador "autos" anda na linha do tempo nas cenas 2–3
  // sempre definido (render em paralelo busca quadros fora de ordem)
  trav.style.left = (travelerX(Math.min(Math.max(t, 3.45), 19.95)) - F.travW / 2).toFixed(1) + "px";
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(window.__hfThreeTime || 0);

// ---------------- variável de abertura (A/B) ----------------
const vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
const hook = vars.hook === "B" ? "B" : "A";
document.getElementById(hook === "A" ? "hookB" : "hookA").remove();

// ---------------- timeline GSAP (2D) ----------------
const gsap = window.gsap;
const tl = window.__timelines["main"]; // criada no HTML (exigência do lint)
const E = "expo.out";
const hookSel = `#hook${hook}`;

tl.set(["#s2", "#s3", "#s4", "#trav", "#flip"], { opacity: 0 }, 0);

// CENA 1 — abertura (0–3,5)
tl.fromTo("#k1", { opacity: 0.35, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0)
  .fromTo(`${hookSel} .w`, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: E, stagger: 0.07 }, 0.05)
  .fromTo("#autos", { opacity: 0.3, y: 70, rotation: -4 }, { opacity: 1, y: 0, rotation: -2, duration: 0.9, ease: "back.out(1.3)" }, 0.1)
  .fromTo("#stamp", { opacity: 0, scale: 1.8 }, { opacity: 0.9, scale: 1, duration: 0.35, ease: "power4.in" }, 1.0)
  .fromTo("#last", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: E }, 1.25)
  .to("#autos", { scale: 1.05, rotation: -1, duration: 1.6, ease: "none" }, 1.3)
  .to(hookSel, { scale: 1.03, transformOrigin: "0% 0%", duration: 2.0, ease: "none" }, 0.9)
  .to(["#k1", hookSel], { opacity: 0, y: -60, duration: 0.3, ease: "power2.in" }, 2.8)
  // autos encolhem e pousam no início da linha do tempo (vira o marcador)
  .to("#autos", { x: F.autosToX, y: F.autosToY, scale: F.travW / F.autosW, rotation: 0, duration: 0.5, ease: "power3.inOut" }, 2.95)
  .set("#autos", { opacity: 0 }, 3.45)
  .set("#trav", { opacity: 1 }, 3.45)
  .set("#s1", { opacity: 0 }, 3.5);

// CENA 2 — relógio (3,4–14)
tl.to("#three-wrap", { opacity: 1, duration: 0.4, ease: "none" }, 3.35)
  .set("#s2", { opacity: 1 }, 3.4)
  .fromTo("#k2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 3.45)
  .fromTo("#t2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: E }, 3.5)
  .fromTo("#track", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 3.45)
  .fromTo(".ms", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.12 }, 3.7)
  .fromTo("#counter", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: E }, 3.8)
  .fromTo("#c1", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 4.0)
  .to("#c1", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, 7.0)
  .fromTo("#c2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 7.3)
  .to("#c2", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, 11.9)
  .fromTo("#c3", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 12.2)
  .fromTo("#ms2", { scale: 1 }, { scale: 1.6, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, 12.4)
  .fromTo("#presc", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }, 12.45)
  .fromTo("#counter", { scale: 1 }, { scale: 1.08, transformOrigin: "0% 50%", duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, 12.4);

// CENA 3 — o relógio pode reiniciar (14–20,5)
tl.to(["#t2", "#c3", "#presc"], { opacity: 0, y: -40, duration: 0.3, ease: "power2.in" }, 13.85)
  .set("#s3", { opacity: 1 }, 14.0)
  .fromTo("#t3", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: E }, 14.05)
  .fromTo("#mark", { opacity: 0, y: -160 }, { opacity: 1, y: 0, duration: 0.45, ease: "bounce.out" }, 14.0)
  .fromTo("#ghost", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" }, 14.35)
  .fromTo("#c4", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 14.5)
  .fromTo("#k2", { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, 13.85)
  .fromTo("#yearsl", { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 14.6)
  .fromTo("#yearsl2", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 14.85)
  .to("#c4", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, 17.5)
  .fromTo("#c5", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 17.8);

// saída das cenas 2–3 e CENA 4 — marca (20–25)
tl.to(["#t3", "#c5", "#counter", "#track", ".ms", "#mark", "#ghost", "#tl-labels"], { opacity: 0, y: -40, duration: 0.3, ease: "power2.in", stagger: 0.01 }, 19.85)
  .to("#three-wrap", { opacity: 0, duration: 0.35, ease: "power1.in" }, 19.9)
  .to("#trav", { x: F.travToX, y: F.travToY, scale: F.flipW / F.travW, duration: 0.5, ease: "power3.inOut" }, 19.95)
  .set("#trav", { opacity: 0 }, 20.45)
  .set(["#s2", "#s3"], { opacity: 0 }, 20.45)
  .set("#s4", { opacity: 1 }, 20.45)
  .set("#flip", { opacity: 1, scale: 1, rotationY: 0, transformPerspective: 1800 }, 20.45)
  .to("#flip", { rotationY: 180, duration: 1.0, ease: "power3.inOut" }, 20.85)
  .fromTo("#cta", { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" }, 21.9)
  .fromTo("#n4", { opacity: 0 }, { opacity: 0.92, duration: 0.8, ease: "none" }, 22.4)
  .fromTo("#shine", { x: -160 }, { x: F.ctaW + 40, duration: 0.9, ease: "power2.inOut", repeat: 1, repeatDelay: 0.7 }, 22.7)
  .fromTo("#flip", { y: 0 }, { y: -12, duration: 2.6, ease: "sine.inOut", immediateRender: false }, 22.2);

tl.seek(0);
