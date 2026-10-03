import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { useLocal } from "../frame";
import { Glow, Logo } from "../Global";
import { C, F, TL, W, cubicInOut, expoOut, rng, seg } from "../lib";
import POINTS from "../logo-points.json";

const CX = W / 2, CY = 520, LS = 420;
const LOCK = TL.logoLock - TL.scenes[10].from; // 150
const R = rng(1290);
const PARTS = (POINTS as number[][]).map(([px, py]) => {
  const a = R() * Math.PI * 2, r0 = 260 + Math.sqrt(R()) * 820;
  const tx = CX - LS / 2 + px * LS, ty = CY - LS / 2 + py * LS;
  const d = R() * 38;
  return { tx, ty, vx: CX + Math.cos(a) * r0 * 1.4 - tx, vy: CY + Math.sin(a) * r0 * 0.8 - ty, d, ice: R() < 0.22, w: 1.6 + R() * 1.6 };
});
const posAt = (p: (typeof PARTS)[number], f: number) => {
  const e = cubicInOut(seg(f, 8 + p.d, LOCK - 2 - (38 - p.d) * 0.25));
  const k = 1 - e, phi = k * Math.PI * 2.2;
  const c = Math.cos(phi), s = Math.sin(phi);
  return { x: p.tx + (p.vx * c - p.vy * s) * k, y: p.ty + (p.vx * s + p.vy * c) * k, e };
};

export const Finale: React.FC = () => {
  const f = useLocal();
  const lock = spring({ frame: f - LOCK, fps: 60, config: { damping: 10, stiffness: 150 } });
  const partOp = 1 - seg(f, LOCK, LOCK + 10);
  const pulse = Math.max(0, 1 - Math.abs(f - LOCK - 3) / 26);
  const shock = seg(f, LOCK, LOCK + 40);
  const slide = cubicInOut(seg(f, LOCK + 22, LOCK + 56));
  const wipe = expoOut(seg(f, LOCK + 44, LOCK + 74));
  const sweep = seg(f, LOCK + 66, LOCK + 100);
  const tag = expoOut(seg(f, LOCK + 74, LOCK + 98));
  const foot = expoOut(seg(f, LOCK + 92, LOCK + 112));
  const logoOp = f < LOCK ? 0 : Math.min(1, (f - LOCK) / 6);
  return (
    <AbsoluteFill>
      <Glow x={CX} y={CY} size={1400} opacity={0.25 + 0.35 * seg(f, 40, LOCK) + 0.5 * pulse} scale={0.8 + 0.6 * pulse} />
      {partOp > 0 ? (
        <svg width={W} height={1080} style={{ position: "absolute", inset: 0, opacity: partOp }}>
          {PARTS.map((p, i) => {
            const a = posAt(p, f), b = posAt(p, f - 1.6);
            if (a.e <= 0 && f < 8 + p.d) {
              // waiting particles drift gently at their start position
            }
            const op = Math.min(1, 0.35 + a.e * 0.8);
            return <line key={i} x1={b.x} y1={b.y} x2={a.x} y2={a.y} stroke={p.ice ? C.ice : C.white} strokeWidth={p.w} strokeLinecap="round" opacity={op} />;
          })}
        </svg>
      ) : null}
      {/* shockwave ring */}
      {shock > 0 && shock < 1 ? (
        <div style={{ position: "absolute", left: CX - 300, top: CY - 300, width: 600, height: 600, borderRadius: "50%", border: "5px solid #fff",
          boxShadow: "0 0 30px rgba(255,255,255,0.8)", transform: `scale(${0.4 + 2.6 * expoOut(shock)})`, opacity: 1 - shock }} />
      ) : null}
      {/* crisp logo: locks, then slides left */}
      <div style={{ position: "absolute", left: CX - LS / 2, top: CY - LS / 2, width: LS, height: LS, opacity: logoOp,
        transform: `translateX(${-500 * slide}px) scale(${(1.14 - 0.14 * lock) * (1 - 0.15 * slide)})`, filter: "drop-shadow(0 0 28px rgba(255,255,255,0.7))" }}>
        <Logo size={LS} />
      </div>
      {/* wordmark wipes in (transform-only mask) */}
      {/* left-to-right wipe: clip window slides right while the text stays put (transform only) */}
      <div style={{ position: "absolute", left: 720, top: CY - 150, width: 880, height: 130, overflow: "hidden", transform: `translateX(${(wipe - 1) * 880}px)` }}>
        <div style={{ transform: `translateX(${(1 - wipe) * 880}px)` }}>
          <div style={{ fontFamily: F.head, fontSize: 104, lineHeight: "130px", color: C.white, whiteSpace: "nowrap", textShadow: "0 0 30px rgba(255,255,255,0.35)" }}>AI IN PUBLIC</div>
          <div style={{ position: "absolute", top: 0, left: -260, width: 200, height: 130, mixBlendMode: "screen", opacity: Math.sin(Math.PI * sweep) * 0.7,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))", transform: `translateX(${sweep * 1100}px) skewX(-18deg)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 724, top: CY - 2, fontFamily: F.serif, fontStyle: "italic", fontSize: 76, color: C.white,
        opacity: tag, transform: `translateY(${(1 - tag) * 26}px)`, textShadow: "0 0 24px rgba(255,255,255,0.3)" }}>
        learning AI, <span style={{ color: C.ice }}>out loud.</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: F.mono, fontSize: 19, letterSpacing: "0.2em", color: C.white,
        opacity: foot * 0.9, transform: `translateY(${(1 - foot) * 16}px)` }}>
        MOTION REEL · 2026 <span style={{ color: C.ice }}>|</span> EVERY FRAME WRITTEN IN CODE <span style={{ color: C.ice }}>|</span> FOLLOW THE BUILD →
      </div>
    </AbsoluteFill>
  );
};
