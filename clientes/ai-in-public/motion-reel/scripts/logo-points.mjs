// Samples ~1,400 points from the logo's opaque pixels (deterministic) → src/logo-points.json (normalised 0..1).
import { PNG } from "pngjs";
import fs from "node:fs";
const png = PNG.sync.read(fs.readFileSync("public/logo-mark.png"));
const { width: w, height: h, data } = png;
const cand = [];
const step = 4;
for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
  if (data[(y * w + x) * 4 + 3] > 160) cand.push([x / w, y / h]);
}
let s = 42; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
const N = 1400;
const pts = cand.slice(0, N).map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]);
fs.writeFileSync("src/logo-points.json", JSON.stringify(pts));
console.log(`${pts.length} points from ${cand.length} candidates`);
