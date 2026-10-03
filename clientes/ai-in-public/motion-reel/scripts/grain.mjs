// Pre-made 256×256 film-grain tile (seeded), shifted per frame in the composition.
import { PNG } from "pngjs";
import fs from "node:fs";
let s = 1234567;
const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const png = new PNG({ width: 256, height: 256 });
for (let i = 0; i < 256 * 256; i++) {
  const v = Math.floor(r() * 255);
  png.data[i * 4] = png.data[i * 4 + 1] = png.data[i * 4 + 2] = v; png.data[i * 4 + 3] = 255;
}
fs.writeFileSync("public/grain.png", PNG.sync.write(png));
console.log("public/grain.png");
