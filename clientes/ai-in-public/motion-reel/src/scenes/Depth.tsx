import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocal } from "../frame";
import { Glow } from "../Global";
import { C, F, H, W, expoOut, seg } from "../lib";

const NU = 50, NV = 22; // 1,100 points
const RM = 3.1, RT = 1.25;
const PTS = Array.from({ length: NU * NV }, (_, i) => {
  const u = ((i % NU) / NU) * Math.PI * 2, v = (Math.floor(i / NU) / NV) * Math.PI * 2;
  return { x: (RM + RT * Math.cos(v)) * Math.cos(u), y: RT * Math.sin(v), z: (RM + RT * Math.cos(v)) * Math.sin(u), navy: i % 9 === 0 };
});

export const Depth: React.FC = () => {
  const f = useLocal();
  const t = f / 60;
  const ax = 1.05 + Math.sin(t * 0.8) * 0.15, ay = t * 1.1;
  const ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay);
  const intro = expoOut(seg(f, 0, 30));
  const cam = 9.5 - 1.2 * intro, fov = 620;
  const proj = PTS.map((p) => {
    const x1 = p.x * cb + p.z * sb, z1 = -p.x * sb + p.z * cb;
    const y2 = p.y * ca - z1 * sa, z2 = p.y * sa + z1 * ca;
    const zc = z2 + cam; const k = fov / zc;
    return { sx: W / 2 + x1 * k, sy: H / 2 - 10 + y2 * k, z: zc, navy: p.navy };
  }).sort((a, b) => b.z - a.z);
  return (
    <AbsoluteFill>
      <Glow x={W / 2} y={H / 2} size={1300} opacity={0.55} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: intro }}>
        {proj.map((p, i) => {
          const near = Math.min(1, Math.max(0, (13 - p.z) / 8));
          return <circle key={i} cx={p.sx} cy={p.sy} r={(p.navy ? 3.4 : 2.4) * (0.6 + 1.5 * near)} fill={p.navy ? C.navy : C.white} opacity={0.25 + 0.75 * near} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 160, bottom: 170, fontFamily: F.mono, fontSize: 20, letterSpacing: "0.22em", color: C.ice, opacity: intro }}>
        1,100 POINTS · PERSPECTIVE · NO 3D ENGINE
      </div>
    </AbsoluteFill>
  );
};
