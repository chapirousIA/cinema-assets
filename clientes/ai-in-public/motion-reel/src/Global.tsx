import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, F, H, SAFE, SCENES, TL, TRANS, W, clamp, glow, hash, seg } from "./lib";

// ---------- living blue background ----------
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 60;
  const sx = Math.sin(t * 0.37) * 420 + Math.sin(t * 0.91) * 120;
  const sy = Math.cos(t * 0.29) * 220 + Math.sin(t * 0.73) * 80;
  return (
    <AbsoluteFill style={{ background: C.blue, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 75% 80% at 50% 50%, ${C.blueBright} 0%, ${C.blue} 48%, ${C.blueDark} 100%)` }}
      />
      {/* drifting light spot (pre-softened gradient, moved with transform only) */}
      <div
        style={{
          position: "absolute", left: W / 2 - 700, top: H / 2 - 700, width: 1400, height: 1400,
          background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(201,202,255,0.08) 30%, rgba(255,255,255,0) 62%)",
          transform: `translate(${sx}px, ${sy}px)`,
        }}
      />
      <div
        style={{
          position: "absolute", left: W / 2 - 500, top: H / 2 - 500, width: 1000, height: 1000,
          background: "radial-gradient(circle, rgba(74,77,255,0.55) 0%, rgba(74,77,255,0) 65%)",
          transform: `translate(${-sx * 0.6}px, ${-sy * 0.5}px) scale(${1 + Math.sin(t * 0.5) * 0.08})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- white flash for "flash" transitions ----------
export const FlashOverlay: React.FC = () => {
  const f = useCurrentFrame();
  let a = 0;
  SCENES.forEach((s, i) => {
    if (i >= TRANS.length || TRANS[i] !== "flash") return;
    const b = s.from + s.dur;
    const d = Math.abs(f - b);
    if (d <= 7) a = Math.max(a, Math.pow(1 - d / 7, 1.6) * 0.96);
  });
  if (a <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: a }} />;
};

// ---------- film grain, vignette, scanlines ----------
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const gx = Math.floor(hash(f) * 256), gy = Math.floor(hash(f + 91) * 256);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 72% 70% at 50% 50%, rgba(10,11,61,0) 55%, rgba(10,11,61,0.42) 88%, rgba(10,11,61,0.62) 100%)` }}
      />
      <AbsoluteFill
        style={{ opacity: 0.05, backgroundImage: "repeating-linear-gradient(0deg, rgba(10,11,61,1) 0px, rgba(10,11,61,1) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)" }}
      />
      <div style={{ position: "absolute", left: -256, top: -256, width: W + 512, height: H + 512, opacity: 0.05, transform: `translate(${gx}px, ${gy}px)`,
        backgroundImage: `url(${staticFile("grain.png")})`, backgroundSize: "256px 256px", mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};

// ---------- HUD ----------
const pad2 = (n: number) => String(n).padStart(2, "0");
export const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const scene = [...SCENES].reverse().find((s) => f >= s.from - 3) ?? SCENES[0];
  const sec = Math.floor(f / 60);
  const tc = `00:00:${pad2(sec)}:${pad2(f % 60)}`;
  const intro = seg(f, 4, 26);
  const label: React.CSSProperties = { position: "absolute", fontFamily: F.mono, fontSize: 17, letterSpacing: "0.22em", color: C.white, opacity: 0.88 * intro, whiteSpace: "nowrap" };
  const L = 46, th = 3;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <div key={`${x}${y}`} style={{ position: "absolute", left: x, top: y, width: L, height: L, transform: `scale(${sx}, ${sy}) scale(${0.6 + 0.4 * intro})`, transformOrigin: "0 0", opacity: intro }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: L, height: th, background: C.white, boxShadow: "0 0 10px rgba(255,255,255,0.7)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: th, height: L, background: C.white, boxShadow: "0 0 10px rgba(255,255,255,0.7)" }} />
    </div>
  );
  const prog = f / (TL.frames - 1);
  const recOn = Math.floor(f / 30) % 2 === 0;
  // scene label crossfade around each cut
  const lt = clamp(Math.abs(f - (scene.from - 3)) / 8);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {corner(SAFE, SAFE, 1, 1)}
      {corner(W - SAFE, SAFE, -1, 1)}
      {corner(SAFE, H - SAFE, 1, -1)}
      {corner(W - SAFE, H - SAFE, -1, -1)}
      <div style={{ ...label, left: SAFE + 64, top: SAFE + 10 }}>AI IN PUBLIC · MOTION REEL · 2026</div>
      <div style={{ ...label, right: SAFE + 64, top: SAFE + 10, opacity: 0.88 * intro * (scene.from === 0 ? 1 : lt), transform: `translateY(${(1 - lt) * 6}px)` }}>{scene.label}</div>
      <div style={{ ...label, left: SAFE + 64, bottom: SAFE + 22 }}>
        <span style={{ color: "#fff", opacity: recOn ? 1 : 0.25, textShadow: "0 0 10px rgba(255,255,255,0.9)" }}>●</span> REC&nbsp;&nbsp;{tc}
      </div>
      <div style={{ ...label, right: SAFE + 64, bottom: SAFE + 22 }}>BUILDING IN PUBLIC</div>
      <div style={{ position: "absolute", left: SAFE, top: H - SAFE - 2, width: W - 2 * SAFE, height: 2, background: "rgba(255,255,255,0.18)", opacity: intro }} />
      <div style={{ position: "absolute", left: SAFE, top: H - SAFE - 3, width: W - 2 * SAFE, height: 4, background: C.white, opacity: intro,
        boxShadow: "0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(201,202,255,0.7)", transform: `scaleX(${prog})`, transformOrigin: "0 50%" }} />
    </AbsoluteFill>
  );
};

// soft white glow blob (pre-made gradient)
export const Glow: React.FC<{ x: number; y: number; size: number; opacity?: number; color?: string; scale?: number }> = ({ x, y, size, opacity = 1, color = "255,255,255", scale = 1 }) => (
  <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, background: glow(color, 0.9), opacity, transform: `scale(${scale})` }} />
);

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("logo-mark.png")} style={{ width: size, height: size, ...style }} />
);
