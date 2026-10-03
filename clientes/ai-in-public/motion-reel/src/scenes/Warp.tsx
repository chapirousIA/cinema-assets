import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocal } from "../frame";
import { Glow } from "../Global";
import { C, H, W, expoIn, rng, seg } from "../lib";

const CX = W / 2, CY = H / 2;
const R = rng(2026);
const STREAKS = Array.from({ length: 260 }, (_, i) => ({
  a: R() * Math.PI * 2, z0: R(), w: 1.2 + R() * 3.2,
  col: i % 7 === 0 ? C.navy : i % 3 === 0 ? C.ice : C.white,
}));

// z in (0,1]: distance; screen radius = 60/z. Streak length = distance travelled during one frame-ish window (stretched trail).
const pos = (z0: number, t: number) => { const z = ((z0 - t) % 1 + 1) % 1; return 0.02 + z; };

export const Warp: React.FC = () => {
  const f = useLocal();
  const t = (f + 8) / 60;
  // accelerating travel: integral of speed
  const travel = (tt: number) => 0.35 * tt + 1.6 * tt * tt * tt;
  const T = travel(t), Tprev = travel(Math.max(0, t - 0.05));
  const core = expoIn(seg(f, 10, 60));
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {STREAKS.map((s, i) => {
          const z = pos(s.z0, T), zp = Math.min(1.02, z + (T - Tprev) * 1.0 + 0.004);
          const r = 70 / z, rp = 70 / zp;
          if (r > 1600) return null;
          const ca = Math.cos(s.a), sa = Math.sin(s.a);
          const op = Math.min(1, (1 - z) * 1.6) * (s.col === C.navy ? 0.75 : 0.95);
          return <line key={i} x1={CX + ca * rp} y1={CY + sa * rp} x2={CX + ca * r} y2={CY + sa * r} stroke={s.col} strokeWidth={s.w * (0.4 + 1.2 * (1 - z))} strokeLinecap="round" opacity={op} />;
        })}
      </svg>
      <Glow x={CX} y={CY} size={700} opacity={0.5 + 0.5 * core} scale={0.4 + 2.6 * core} />
      <Glow x={CX} y={CY} size={260} opacity={0.9} scale={0.6 + 1.4 * core} />
    </AbsoluteFill>
  );
};
