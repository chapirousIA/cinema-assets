// Renders still frames (one bundle) for review: node scripts/stills.mjs 30 70 110 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.CHROME, chromiumOptions: { gl: "swangle" } });
const comp = await selectComposition({ serveUrl, id: "Reel", puppeteerInstance: browser });
for (const f of frames) {
  await renderStill({ composition: comp, serveUrl, frame: f, output: `out/stills/f${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser });
  process.stdout.write(f + " ");
}
await browser.close({ silent: true });
console.log("done");
