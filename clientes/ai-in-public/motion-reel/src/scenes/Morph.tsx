import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { useLocal } from "../frame";
import { Glow, Logo } from "../Global";
import { C, H, TL, W, cubicInOut, expoOut, seg } from "../lib";

const CX = W / 2, CY = H / 2 - 20;
const NA = 240;
// radial functions r(θ), unit radius
const circle = () => 1;
const tri = (a: number) => { const n = 3, s = Math.PI / n; const x = ((a + Math.PI / 2) % (2 * s) + 2 * s) % (2 * s) - s; return Math.cos(s) / Math.cos(x); };
const spark = (a: number) => { const x = Math.abs(Math.cos(2 * a)); return 0.16 + 0.84 * Math.pow(x, 3.2); };

const shapePath = (m: number, r: number, cx: number, cy: number, rot = 0) => {
  // m: 0 circle → 1 triangle → 2 sparkle
  const pts: string[] = [];
  for (let i = 0; i < NA; i++) {
    const a = (i / NA) * Math.PI * 2;
    const v = m <= 1 ? circle() + (tri(a) - circle()) * m : tri(a) + (spark(a) - tri(a)) * (m - 1);
    const rr = r * v * (m <= 1 ? 1 - 0.12 * m : 0.88 + 0.32 * (m - 1));
    pts.push(`${(cx + Math.cos(a + rot) * rr).toFixed(1)},${(cy + Math.sin(a + rot) * rr).toFixed(1)}`);
  }
  return "M" + pts.join("L") + "Z";
};

export const Morph: React.FC = () => {
  const f = useLocal();
  const m = cubicInOut(seg(f, 18, 44)) + cubicInOut(seg(f, 56, 82));
  const toLogo = spring({ frame: f - TL.morphLogoAt, fps: 60, config: { damping: 12, stiffness: 140 } });
  const appear = spring({ frame: f, fps: 60, config: { damping: 14, stiffness: 150 } });
  const shapeOp = 1 - seg(f, TL.morphLogoAt, TL.morphLogoAt + 8);
  const pulse = 1 + 0.04 * Math.sin(f / 6);
  return (
    <AbsoluteFill>
      <Glow x={CX} y={CY} size={1100} opacity={0.55 + 0.25 * toLogo} scale={0.9 + 0.2 * toLogo} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={CX} cy={CY} r={300} fill="none" stroke={C.ice} strokeWidth={2} strokeDasharray="6 14" opacity={0.6 * appear} transform={`rotate(${f * 0.6} ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={380} fill="none" stroke={C.light} strokeWidth={2} strokeDasharray="2 18" strokeLinecap="round" opacity={0.7 * appear} transform={`rotate(${-f * 0.4} ${CX} ${CY})`} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + f * 0.018;
          const ox = CX + Math.cos(a) * 340, oy = CY + Math.sin(a) * 340;
          return <path key={i} d={shapePath(m, 22 * appear, ox, oy, -Math.PI / 2 + f * 0.02)} fill={i % 2 ? C.ice : C.white} opacity={0.9 * (1 - 0.6 * toLogo)} />;
        })}
        <g style={{ filter: "drop-shadow(0 0 26px rgba(255,255,255,0.85))" }} opacity={shapeOp}>
          <path d={shapePath(m, 170 * appear * pulse, CX, CY, -Math.PI / 2)} fill={C.white} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: CX - 220, top: CY - 220, width: 440, height: 440, transform: `scale(${0.4 + 0.6 * toLogo})`, opacity: Math.min(1, toLogo * 1.4),
        filter: "drop-shadow(0 0 30px rgba(255,255,255,0.75))" }}>
        <Logo size={440} />
      </div>
    </AbsoluteFill>
  );
};
