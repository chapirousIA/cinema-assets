# AI In Public — Motion Reel (Remotion)

24 s · 1920×1080 · 60 fps (1440 frames). Every frame and every sound is generated in code.

## Run

```bash
npm install
export CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell   # container; omit locally
npm run logo     # (optional) re-draws the placeholder mark → public/logo-mark.png
npm run points   # samples 1,400 particle targets from public/logo-mark.png → src/logo-points.json
npm run grain    # 256×256 film-grain tile → public/grain.png
npm run music    # synthesizes the score (scripts/music.mjs) and masters it to ≈ −14 LUFS → public/music.wav
npm run studio   # preview
npm run render   # → out/ai-in-public-reel.mp4 (H.264 CRF 16, AAC 320k)
node scripts/stills.mjs 30 200 452 1300 && sh scripts/sheet.sh out/sheet.jpg   # review frames
```

Swap in the official logo by replacing `public/logo-mark.png` (transparent PNG) and re-running `npm run points`.

## How it fits together

- `src/timeline.json` — single source of truth for scene ranges, transitions and every sync point
  (title slam, terminal typing/“shipped”, easing arrivals, network pulses, kinetic hits, logo lock).
  Both the video (`src/lib.ts`) and the score (`scripts/music.mjs`) read it, so hits land on their frames.
- `src/Reel.tsx` — scenes overlap by 6 frames on each side of every cut; 12-frame designed transitions
  (zoom-through, white flash, whip-pan with `CameraMotionBlur`, transform-only iris). Camera shake is a
  sum of slow sines, decaying over 20 frames after each impact.
- `src/Global.tsx` — living blue background, HUD, grain tile, vignette, scanlines.
- `src/scenes/*` — 11 scenes. Only transform/opacity are animated (plus SVG geometry); no CSS blur filters;
  glows are pre-made radial gradients/drop-shadows; motion blur via `@remotion/motion-blur` or stretched trails.
- Determinism: no `Math.random`; all randomness comes from seeded PRNGs evaluated once at module load.
